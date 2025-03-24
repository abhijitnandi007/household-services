from flask import current_app as app,jsonify,request,render_template
from .database import db
from .models import ServiceRequest,Service
from flask_security import auth_required,roles_required,roles_accepted,current_user,hash_password,verify_password
from flask_login import login_user,logout_user



@app.route('/api/register',methods=['POST'])
def create_user():
    cred = request.get_json()
    if not app.security.datastore.find_user(email=cred["email"]):
        if cred["roles"] == 'customer':
            app.security.datastore.create_user(email=cred["email"] ,
                                            username=cred["username"],
                                            password = hash_password(cred["password"]),
                                            active = True,
                                            roles = [cred["roles"]]
                                            )  
        else:
            service = Service.query.filter_by(name=cred["service_name"]).first()
            app.security.datastore.create_user(email=cred["email"] ,
                                            username=cred["username"],
                                            password = hash_password(cred["password"]),
                                            service_id = service.id,
                                            active = False,
                                            experience = cred["experience"],
                                            specialization = cred["specialization"],
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
def user_login():
    cred = request.get_json()
    user = app.security.datastore.find_user(email=cred["email"])

    if user:
        if  verify_password(cred["password"], user.password):
            login_user(user)        #create a session storage with a cookie
            return jsonify({
                "message": "Login successful",
                "Auth-Token": user.get_auth_token(),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "roles": [role.name for role in user.roles]
                }
            }), 200
        else:
            return jsonify({"message": "Invalid password"}), 401
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/api/logout', methods=['POST'])
@auth_required('token')
def logout():
    logout_user()

    # # Create a response and delete session cookies
    # response = make_response(jsonify({"message": "Logout successful"}))
    # response.set_cookie("session", "", expires=0, path="/")
    # response.set_cookie("remember_token", "", expires=0, path="/")

    return jsonify({"message":"User logged out successfully!"}), 200

@app.route('/',methods = ['GET'])
def home():
    return render_template('index.html')
@app.route('/admin')
@auth_required('token') #authentication
@roles_required('admin') #RBAC/authorization
def admin_home():
    return jsonify({
        "msg":"Inside Admin"
        })

@app.route('/api/home')
@auth_required('token')
@roles_accepted('customer','admin','professional')
def user_home():
    user = current_user
    return jsonify({
        "email" : user.email,
        "username" : user.username,
        "role":user.roles[0].name
    })

# @app.route('/api/pay/<int:id>')       #payment for serivce request
# @auth_required('token')
# @roles_required('customer') 
# def payment(id):
#     service_req = ServiceRequest.query.get(id)
