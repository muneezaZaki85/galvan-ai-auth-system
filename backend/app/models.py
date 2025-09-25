from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

try:
    from app import db
except ImportError:
    from __main__ import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profile_picture = db.Column(db.String(200), nullable=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    mobile_number = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), default='user')
    is_verified = db.Column(db.Boolean, default=False)
    otp_code = db.Column(db.String(6), nullable=True)
    otp_expires = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'profile_picture': self.profile_picture,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'mobile_number': self.mobile_number,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat()
        }


def create_super_admin():
    super_admin = User.query.filter_by(email=os.getenv('SUPER_ADMIN_EMAIL')).first()
    if not super_admin:
        super_admin = User(
            first_name='Super',
            last_name='Admin',
            email=os.getenv('SUPER_ADMIN_EMAIL'),
            mobile_number='0000000000',
            role='super_admin',
            is_verified=True
        )
        super_admin.set_password(os.getenv('SUPER_ADMIN_PASSWORD'))
        db.session.add(super_admin)
        db.session.commit()
        print('Super Admin created successfully!')