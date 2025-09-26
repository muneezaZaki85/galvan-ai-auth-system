from flask import request, current_app
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from .models import User
from .utils import generate_otp, send_otp_email, get_otp_expiry

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

refresh_response = auth_ns.model('RefreshResponse', {
    'message': fields.String(description='Success message'),
    'access_token': fields.String(description='New access token')
})

login_response = auth_ns.model('LoginResponse', {
    'message': fields.String(description='Success message'),
    'access_token': fields.String(description='Access token'),
    'refresh_token': fields.String(description='Refresh token'),
    'user': fields.Raw(description='User data'),
    'expires_in': fields.Integer(description='Token expiry in seconds')
})


@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        try:
            data = request.get_json()
            db = current_app.extensions['sqlalchemy']

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
            db = current_app.extensions['sqlalchemy']

            user = User.query.filter_by(email=current_user_email).first()

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
    @auth_ns.marshal_with(login_response)
    def post(self):
        try:
            data = request.get_json()

            user = User.query.filter_by(email=data['email']).first()

            if not user or not user.check_password(data['password']):
                return {'message': 'Invalid email or password'}, 401

            if not user.is_verified:
                return {'message': 'Email not verified'}, 401

            access_token = create_access_token(identity=user.email, fresh=True)
            refresh_token = create_refresh_token(identity=user.email)

            return {
                'message': 'Login successful',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
                'expires_in': 3600
            }, 200

        except Exception as e:
            return {'message': f'Login failed: {str(e)}'}, 500


@auth_ns.route('/refresh')
class RefreshToken(Resource):
    @jwt_required(refresh=True)
    @auth_ns.marshal_with(refresh_response)
    @auth_ns.doc(
        security='refreshAuth',
        description='Refresh access token using refresh token. Send refresh token in Authorization header as "Bearer <refresh_token>"'
    )
    def post(self):
        try:
            current_user_email = get_jwt_identity()

            user = User.query.filter_by(email=current_user_email).first()
            if not user:
                return {'message': 'User not found'}, 404

            if not user.is_verified:
                return {'message': 'User account not verified'}, 401

            new_access_token = create_access_token(identity=current_user_email, fresh=False)

            return {
                'message': 'Token refreshed successfully',
                'access_token': new_access_token
            }, 200

        except Exception as e:
            return {'message': f'Token refresh failed: {str(e)}'}, 500


@auth_ns.route('/logout')
class Logout(Resource):
    @jwt_required()
    @auth_ns.doc(security='apikey')
    def post(self):
        return {'message': 'Successfully logged out'}, 200


@auth_ns.route('/profile')
class Profile(Resource):
    @jwt_required()
    @auth_ns.doc(security='apikey')
    def get(self):
        try:
            current_user_email = get_jwt_identity()

            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return {'message': 'User not found'}, 404

            return {'user': user.to_dict()}, 200

        except Exception as e:
            return {'message': f'Failed to get profile: {str(e)}'}, 500