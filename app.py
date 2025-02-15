from flask import Flask
from backend.database import db
from backend.config import LocalDevelopementConfig
from backend.models import User,Role
from backend.resources import api
from flask_security import Security,SQLAlchemyUserDatastore
from flask_security import hash_password,auth_required


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopementConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security = Security(app,datastore)
    app.app_context().push()

    return app

app = create_app()

with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name='admin',description='Administrator')
    app.security.datastore.find_or_create_role(name='professional',description='Professional')
    app.security.datastore.find_or_create_role(name='customer',description='Customer')
    
    db.session.commit()

    if not app.security.datastore.find_user(email='admin@iitm.ac.in'):
        app.security.datastore.create_user(email='admin@iitm.ac.in',
                                           username='Abhijit',
                                           password = hash_password('P@ssword123'),
                                           roles = ['admin']
                                           )   
    db.session.commit()

from backend.routes import *
if __name__== '__main__':
    app.run()
