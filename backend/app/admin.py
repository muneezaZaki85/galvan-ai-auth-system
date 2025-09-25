from flask import request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_db():
    from __main__ import db
    return db


def get_models():
    from app.models import User
    return User


admin_ns = Namespace('admin', description='Admin operations')

user_model = admin_ns.model('CreateUser', {
    'first_name': fields.String(required=True),
    'last_name': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'mobile_number': fields.String(required=True),
    'profile_picture': fields.String()
})

update_user_model = admin_ns.model('UpdateUser', {
    'first_name': fields.String(),
    'last_name': fields.String(),
    'email': fields.String(),
    'mobile_number': fields.String(),
    'profile_picture': fields.String()
})


def require_super_admin():
    current_user_email = get_jwt_identity()
    User = get_models()
    user = User.query.filter_by(email=current_user_email).first()
    if not user or user.role != 'super_admin':
        return {'message': 'Super admin access required'}, 403
    return None


@admin_ns.route('/users')
class UserList(Resource):
    @jwt_required()
    def get(self):
        auth_error = require_super_admin()
        if auth_error:
            return auth_error

        try:
            User = get_models()
            users = User.query.filter_by(role='user').all()
            return {
                'users': [user.to_dict() for user in users],
                'total': len(users)
            }, 200
        except Exception as e:
            return {'message': f'Failed to fetch users: {str(e)}'}, 500

    @jwt_required()
    @admin_ns.expect(user_model)
    def post(self):
        auth_error = require_super_admin()
        if auth_error:
            return auth_error

        try:
            data = request.get_json()
            db = get_db()
            User = get_models()

            if User.query.filter_by(email=data['email']).first():
                return {'message': 'Email already exists'}, 400

            user = User(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                mobile_number=data['mobile_number'],
                profile_picture=data.get('profile_picture'),
                role='user',
                is_verified=True
            )
            user.set_password(data['password'])

            db.session.add(user)
            db.session.commit()

            return {
                'message': 'User created successfully',
                'user': user.to_dict()
            }, 201

        except Exception as e:
            return {'message': f'User creation failed: {str(e)}'}, 500


@admin_ns.route('/users/<int:user_id>')
class UserDetail(Resource):
    @jwt_required()
    def get(self, user_id):
        auth_error = require_super_admin()
        if auth_error:
            return auth_error

        try:
            User = get_models()
            user = User.query.filter_by(id=user_id, role='user').first()
            if not user:
                return {'message': 'User not found'}, 404

            return {'user': user.to_dict()}, 200

        except Exception as e:
            return {'message': f'Failed to fetch user: {str(e)}'}, 500

    @jwt_required()
    @admin_ns.expect(update_user_model)
    def put(self, user_id):
        auth_error = require_super_admin()
        if auth_error:
            return auth_error

        try:
            db = get_db()
            User = get_models()
            user = User.query.filter_by(id=user_id, role='user').first()
            if not user:
                return {'message': 'User not found'}, 404

            data = request.get_json()

            if 'email' in data and data['email'] != user.email:
                if User.query.filter_by(email=data['email']).first():
                    return {'message': 'Email already exists'}, 400

            for key, value in data.items():
                if hasattr(user, key):
                    setattr(user, key, value)

            db.session.commit()

            return {
                'message': 'User updated successfully',
                'user': user.to_dict()
            }, 200

        except Exception as e:
            return {'message': f'User update failed: {str(e)}'}, 500

    @jwt_required()
    def delete(self, user_id):
        auth_error = require_super_admin()
        if auth_error:
            return auth_error

        try:
            db = get_db()
            User = get_models()
            user = User.query.filter_by(id=user_id, role='user').first()
            if not user:
                return {'message': 'User not found'}, 404

            db.session.delete(user)
            db.session.commit()

            return {'message': 'User deleted successfully'}, 200

        except Exception as e:
            return {'message': f'User deletion failed: {str(e)}'}, 500