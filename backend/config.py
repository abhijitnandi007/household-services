class Config():
    DEBUG = False

class LocalDevelopementConfig(Config):

    SQLALCHEMY_DATABASE_URI = "sqlite:///rootservice.sqlite3"
    DEBUG = True

    SECRET_KEY = 'not-my-secret-key'
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'salty'
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHETICATION_HEADER = 'Authentication-Token'
    
