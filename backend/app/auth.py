from flask import request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_db():
    from __main__ import db
    return db


def get_models():
    from app.models import User
    return User


def get_utils():
    from app.utils import generate_otp, send_otp_email, get_otp_expiry
    return generate_otp, send_otp_email, get_otp_expiry


auth_ns = Namespace('auth', description='Authentication operations')

register_model = auth_ns.model('Register', {
    'first_name': fields.String(required=True),
    'last_name': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'mobile_number': fields.String(required=True),
    'profile_picture': fields.String()
})

login_model = auth_ns.model('Login', {
    'email': fields.String(required=True),
    'password': fields.String(required=True)
})

otp_model = auth_ns.model('OTPVerify', {
    'email': fields.String(required=True),
    'otp_code': fields.String(required=True)
})


@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        try:
            data = request.get_json()
            db = get_db()
            User = get_models()
            generate_otp, send_otp_email, get_otp_expiry = get_utils()

            if User.query.filter_by(email=data['email']).first():
                return {'message': 'Email already exists'}, 400

            otp_code = generate_otp()

            user = User(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                mobile_number=data['mobile_number'],
                profile_picture=data.get('profile_picture'),
                otp_code=otp_code,
                otp_expires=get_otp_expiry()
            )
            user.set_password(data['password'])

            db.session.add(user)
            db.session.commit()

            if send_otp_email(data['email'], otp_code):
                return {'message': 'Registration successful. OTP sent to email.'}, 201
            else:
                return {'message': 'Registration successful but email sending failed'}, 201

        except Exception as e:
            return {'message': f'Registration failed: {str(e)}'}, 500


@auth_ns.route('/verify-otp')
class VerifyOTP(Resource):
    @auth_ns.expect(otp_model)
    def post(self):
        try:
            data = request.get_json()
            db = get_db()
            User = get_models()

            user = User.query.filter_by(email=data['email']).first()

            if not user:
                return {'message': 'User not found'}, 404

            if user.is_verified:
                return {'message': 'User already verified'}, 400

            if user.otp_code != data['otp_code']:
                return {'message': 'Invalid OTP'}, 400

            if datetime.utcnow() > user.otp_expires:
                return {'message': 'OTP expired'}, 400

            user.is_verified = True
            user.otp_code = None
            user.otp_expires = None
            db.session.commit()

            return {'message': 'Email verified successfully'}, 200

        except Exception as e:
            return {'message': f'OTP verification failed: {str(e)}'}, 500


@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        try:
            data = request.get_json()
            User = get_models()

            user = User.query.filter_by(email=data['email']).first()

            if not user or not user.check_password(data['password']):
                return {'message': 'Invalid email or password'}, 401

            if not user.is_verified:
                return {'message': 'Email not verified'}, 401

            access_token = create_access_token(identity=user.email)
            refresh_token = create_refresh_token(identity=user.email)

            return {
                'message': 'Login successful',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }, 200

        except Exception as e:
            return {'message': f'Login failed: {str(e)}'}, 500


@auth_ns.route('/refresh')
class RefreshToken(Resource):
    @jwt_required(refresh=True)
    def post(self):
        try:
            current_user = get_jwt_identity()
            access_token = create_access_token(identity=current_user)
            return {'access_token': access_token}, 200
        except Exception as e:
            return {'message': f'Token refresh failed: {str(e)}'}, 500