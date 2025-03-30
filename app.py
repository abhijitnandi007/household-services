from flask import Flask
from backend.database import db
from backend.config import LocalDevelopementConfig
from backend.models import User,Role
from backend.resources import api
from flask_security import Security,SQLAlchemyUserDatastore
from flask_security import hash_password
import bcrypt
from backend.celery_init import celery_init_app
from celery.schedules import crontab
from backend.tasks import daily_reminder
from backend.cache_config import init_cache


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
celery = celery_init_app(app)
celery.autodiscover_tasks()
init_cache(app)

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
                                           roles = ['admin'],
                                           city = "Bolpur",
                                           pincode = 731204
                                           )   
    db.session.commit()

from backend.routes import *

#monthly report on mail
@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    print("Setting up periodic tasks...")
    sender.add_periodic_task(
        crontab(0, 0, day_of_month='1'),       #scheduled monthly report on 1st of every month
        # crontab(),
        email_report.s(),
        name="Send Monthly Reports"
    )

#daily notification on gchat
    sender.add_periodic_task(
        crontab(minute=0, hour=18),             #daily notifications on gchat scheduled at 6pm
        # crontab(minute='*/2'),
        daily_reminder.s(),
        name="daily scheduled messages"
    )

if __name__== '__main__':
    app.run()
