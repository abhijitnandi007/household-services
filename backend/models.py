# app/models.py
from .database import db

from flask_security import UserMixin, RoleMixin
from datetime import datetime
# from flask_security.models import fsqla_v3 as fsqla

# fsqla.FsModels.set_db_info(db)


class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    username = db.Column(db.String(30),nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean, default=True,nullable =False)
    created_at = db.Column(db.DateTime, default=datetime.now())
    fs_uniquifier = db.Column(db.String(65), unique = True, nullable = False)
    roles = db.relationship('Role',secondary='user_roles',backref=db.backref('users', lazy='dynamic')) # secondary refers to the relationship table between two tables

    service_requests = db.relationship('ServiceRequest',foreign_keys='ServiceRequest.customer_id' ,back_populates='customer')
    assigned_services = db.relationship('ServiceRequest',foreign_keys='ServiceRequest.professional_id' ,back_populates='professional')

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)

    service_requests = db.relationship('ServiceRequest', back_populates='service')

class ServiceRequest(db.Model): #relational table between user and service
    __tablename__ = 'service_requests'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable until assigned
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    date_of_request = db.Column(db.DateTime, default=datetime.now())
    date_of_completion = db.Column(db.DateTime, nullable=True) # null until completed
    service_status = db.Column(db.String(20), default='requested')  # requested, assigned, closed
    remarks = db.Column(db.Text, nullable=True)

    # Relationships
    customer = db.relationship('User', foreign_keys=[customer_id], back_populates='service_requests')
    professional = db.relationship('User', foreign_keys=[professional_id], back_populates='assigned_services')
    service = db.relationship('Service', back_populates='service_requests')

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_requests.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Scale: 1-5
    comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now())

    # Relationships
    customer = db.relationship('User', foreign_keys=[customer_id])
    professional = db.relationship('User', foreign_keys=[professional_id])
    service_request = db.relationship('ServiceRequest')