from flask import current_app as app,jsonify,request
from .database import db
from flask_security import auth_required,roles_required,current_user,hash_password,verify_password




@app.route('/api/register',methods=['POST'])
def create_user():
    cred = request.get_json()
    if not app.security.datastore.find_user(email=cred["email"]):
        app.security.datastore.create_user(email=cred["email"] ,
                                           username=cred["username"],
                                           password = hash_password(cred["password"]),
                                           roles = [cred["roles"]]
                                           )  
        db.session.commit() 
        return jsonify({
            "message":"user created successfully"
        }),201
    return jsonify({
            "message":"user already exists!"
        }),400

@app.route('/api/login',methods=['POST'])
def login_user():
    cred = request.get_json()
    user = app.security.datastore.find_user(email=cred["email"])

    if not user:
        return jsonify({"message": "User not found"}), 404
    if not verify_password(cred["password"], user.password):
        return jsonify({"message": "Invalid password"}), 401
    
    token = user.get_auth_token()

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "roles": [role.name for role in user.roles]
        }
    }), 200


@app.route('/',methods = ['GET'])
def home():
    return "<h1> this is home </home>"
@app.route('/admin')
@auth_required('token') #authentication
@roles_required('admin') #RBAC/authorization
def admin_home():
    return jsonify({
        "msg":"Inside Admin"
        })

@app.route('/user')
@auth_required('token')
@roles_required('customer')
def user_home():
    user = current_user
    return jsonify({
        "username" : user.username
    })