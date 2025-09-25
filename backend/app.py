from flask import Flask
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///galvan_auth.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

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
    app.run(debug=True, port=5000)