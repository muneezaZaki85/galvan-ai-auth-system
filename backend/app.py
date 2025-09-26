from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///galvan_auth.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration with proper expiration
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Access token expires in 1 hour
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Refresh token expires in 30 days
app.config['JWT_ALGORITHM'] = 'HS256'

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {'message': 'Token has expired'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {'message': 'Invalid token'}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {'message': 'Authorization token is required'}, 401

with app.app_context():
    from app.models import User, create_super_admin
    db.create_all()
    create_super_admin()

api = Api(app, version='1.0', title='Galvan Auth API', description='Authentication API with Role-based Access')

from app.auth import auth_ns
from app.admin import admin_ns

api.add_namespace(auth_ns, path='/auth')
api.add_namespace(admin_ns, path='/admin')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)