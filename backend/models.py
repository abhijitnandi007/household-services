# app/models.py
from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id', ondelete="CASCADE"))

class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    username = db.Column(db.String(30), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.String, default=datetime.now().strftime('%Y-%m-%d %H:%M'))
    fs_uniquifier = db.Column(db.String(65), unique=True, nullable=False)
    
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

    experience = db.Column(db.Integer, default=0)
    specialization = db.Column(db.String(255))

    service_id = db.Column(db.Integer, db.ForeignKey('services.id', 
    ), nullable=True)
    service = db.relationship('Service', backref="professionals")

    # Cascade delete service requests & reviews when the user is deleted
    service_requests = db.relationship(
        'ServiceRequest', foreign_keys='ServiceRequest.customer_id',
        back_populates='customer', cascade="all, delete-orphan"
    )
    assigned_services = db.relationship(
        'ServiceRequest', foreign_keys='ServiceRequest.professional_id',
        back_populates='professional', cascade="all, delete-orphan"
    )

    customer_reviews = db.relationship(
        'Review', foreign_keys='Review.customer_id',
        back_populates='customer', cascade="all, delete-orphan"
    )
    professional_reviews = db.relationship(
        'Review', foreign_keys='Review.professional_id',
        back_populates='professional', cascade="all, delete-orphan"
    )

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)

    # Cascade delete service requests when a service is deleted
    service_requests = db.relationship('ServiceRequest', back_populates='service', cascade="all, delete-orphan")

class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id', ondelete="CASCADE"), nullable=False)

    date_of_request = db.Column(db.String, default=datetime.now().strftime('%Y-%m-%d %H:%M'))
    date_of_completion = db.Column(db.String, nullable=False, default='To be Updated Soon')
    service_status = db.Column(db.String(20), default='requested')  # requested, assigned, closed,rejected
    remarks = db.Column(db.Text, nullable=True)

    customer = db.relationship('User', foreign_keys=[customer_id], back_populates='service_requests')
    professional = db.relationship('User', foreign_keys=[professional_id], back_populates='assigned_services')
    service = db.relationship('Service', back_populates='service_requests')

    # Cascade delete reviews when a service request is deleted
    reviews = db.relationship('Review', back_populates='service_request', cascade="all, delete-orphan")

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_requests.id', ondelete="CASCADE"), nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.String, default=datetime.now().strftime('%Y-%m-%d %H:%M'))

    customer = db.relationship('User', foreign_keys=[customer_id], back_populates='customer_reviews')
    professional = db.relationship('User', foreign_keys=[professional_id], back_populates='professional_reviews')
    service_request = db.relationship('ServiceRequest', back_populates='reviews')
