from flask_restful import Api,Resource,reqparse
from .models import *
from flask_security import auth_required,roles_required,roles_accepted,current_user
from flask import jsonify


api = Api()

# Local functions
def roles_list(roles):
    roles_list=[]
    for role in roles:
        roles_list.append(role.name)
    return roles_list

# Function to calculate average rating
def get_professional_rating(professional_id):
    reviews = Review.query.filter_by(professional_id=professional_id).all()
    if not reviews:
        return "No ratings yet"

    total_ratings = sum([review.rating for review in reviews])
    avg_rating = total_ratings / len(reviews)

    return round(avg_rating, 1) 

# Parser for creating service requests
service_req_parser = reqparse.RequestParser()
service_req_parser.add_argument('service_name', required=True)
service_req_parser.add_argument('prof_email', required=True)
service_req_parser.add_argument('remarks')

# Parser for updating/closing service request
update_req_parser = reqparse.RequestParser()
update_req_parser.add_argument('service_status', required=True, choices=('requested', 'assigned', 'closed','completed','rejected'))
update_req_parser.add_argument('rating', type=int)
update_req_parser.add_argument('comments')

class ServicRequestsApi(Resource):
    @auth_required('token')
    @roles_accepted('admin','customer','professional')
    # @roles_required('professional')
    def get(self):
        """Fetch all service requests"""
        # print(request.headers)
        service_req_json = [] 
        if "admin" in roles_list(current_user.roles):
            service_requests = ServiceRequest.query.all()
        elif "customer" in roles_list(current_user.roles):
            service_requests = current_user.service_requests
        else:
            service_requests = current_user.assigned_services
        
        for req in service_requests:
            this_req = {
                "id": req.id,
                "service_id": req.service_id,
                "service_name": req.service.name,
                "price": req.service.base_price,
                "time_required": req.service.time_required,
                "professional_name": req.professional.username,
                "customer_name": req.customer.username,
                "date_of_request": req.date_of_request,
                "date_of_completion": req.date_of_completion,
                "service_status": req.service_status,
                "time_required": req.service.time_required,
                "remarks": req.remarks
            }
            service_req_json.append(this_req)
        
        if service_req_json:
            return service_req_json
        return {"message": "No service requests found!!"}, 404

    @auth_required('token')
    @roles_required('customer')
    def post(self):
        """Book a Service (Create Service Request)"""
        args = service_req_parser.parse_args()
        service = Service.query.filter_by(name=args["service_name"]).first()
        prof = User.query.filter_by(email=args["prof_email"]).first()
        
        if not service:
            return {"message": "Invalid service name"}, 400

        if not prof:
            return {"message": "Professional not found"}, 400
    
        try:
            service_request = ServiceRequest(
                customer_id=current_user.id,
                professional_id=prof.id, 
                service_id=service.id,
                remarks=args["remarks"]
            )
            db.session.add(service_request)
            db.session.commit()
            return {"message": "Service request created successfully!"}, 201
        except Exception as e:
            return {"message": f"Error: {str(e)}"}, 400

    @auth_required('token')
    @roles_accepted('customer', 'professional')
    def put(self, id):
        """Update/Close a Service Request"""
        args = update_req_parser.parse_args()
        service_request = ServiceRequest.query.get(id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        if "professional" in roles_list(current_user.roles):
            if args["service_status"] == "assigned" and service_request.service_status == "requested":
                service_request.service_status = "assigned"
            elif args["service_status"] == "closed":
                service_request.date_of_completion = datetime.now().strftime('%Y-%m-%d %H:%M')
                service_request.service_status = "closed"
            else:
                service_request.service_status =  args["service_status"]
        elif "customer" in roles_list(current_user.roles):
            service_request.service_status = args["service_status"]

            # Creating a review after service completion
            if args.get("rating") and args.get("comments"):
                review = Review(
                    customer_id=current_user.id,
                    professional_id=service_request.professional_id,
                    service_request_id=service_request.id,
                    rating=args["rating"],
                    comments=args["comments"])
                db.session.add(review)
    
        db.session.commit()
        return {"message": "Service request updated successfully!"}, 200

    @auth_required('token')
    @roles_required('customer')
    def delete(self, id):
        """Delete a Service Request"""
        service_request = ServiceRequest.query.get(id)
        if not service_request:
            return {"message": "Service request not found"}, 404
        if service_request.service_status == 'assigned':
            return {"message": "Professional Assigned,Service request can not be  cancelled"}, 404
        db.session.delete(service_request)
        db.session.commit()
        return {"message": "Service request deleted!"}, 200
    #admin creates a services 
# with the following fields
service_parser = reqparse.RequestParser()

service_parser.add_argument('name', type=str, required=True)
service_parser.add_argument('description', type=str, required=True)
service_parser.add_argument('base_price', type=float, required=True)
service_parser.add_argument('time_required', type=int, required=True)

class ServiceApi(Resource):
    @auth_required('token')
    @roles_accepted('admin','customer')
    def get(self):
        # service = []
        service_json = [] 
        
        services = Service.query.all()
        
        for req in services:
            this_req = {}
            this_req["id"] = req.id
            this_req['name'] = req.name
            this_req['description'] = req.description
            this_req['base_price'] = req.base_price
            this_req['time_required'] = req.time_required
    
            service_json.append(this_req)
        
        if service_json:
            return service_json
        
        return {
            "message": "No services found!!"
        },404

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates service"""
        args = service_parser.parse_args()
        try:
            service = Service(name = args["name"],
                            description =args["description"],
                            base_price =args["base_price"],
                            time_required =args["time_required"])
            db.session.add(service)
            db.session.commit()
            return {
                "message" : "service created successfully!"
            },201
        except:
            return {
                "message" : "one or more fields are missing!"
            },400
    
    @auth_required('token')
    @roles_required('admin')
    def put(self,id):
        args = service_parser.parse_args()
        service = Service.query.get(id)
        service.name = args["name"]
        service.description = args["description"]
        service.base_price = args["base_price"]
        service.time_required = args["time_required"]

        db.session.commit()
        return {
            "message" : "service updated successfully!"
        },200
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        service = Service.query.get(id)  
        if service:
            db.session.delete(service)
            db.session.commit()
            return {
                "message" : "service deleted!"
            },200   
        else:
            return {
                "message" : "service not found!"
            },404

class PublicServiceApi(Resource):
    def get(self):
        """Unauthenticated users can only see service names"""
        services = Service.query.all()
        return [{"id": s.id, "name": s.name} for s in services], 200

user_parser = reqparse.RequestParser()
user_parser.add_argument('active',type=bool,required =True)

class UserApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):

        user_json = [] 
        
        users = User.query.all()
        for req in users:
            if req.roles[0].name == "professional":
                this_req = {}
                this_req['id'] = req.id
                this_req['email'] = req.email
                this_req['username'] = req.username
                this_req['service'] = req.service.name
                this_req['rating'] = get_professional_rating(req.id)
                this_req['experience'] = req.experience,
                this_req['specialization'] = req.specialization,
                this_req['active'] = req.active
                this_req['created_at'] = req.created_at,
                this_req['roles'] = [{"name":role.name} for role in req.roles]
                user_json.append(this_req)
            elif req.roles[0].name == "customer":
                this_req = {}
                this_req['id'] = req.id
                this_req['email'] = req.email
                this_req['username'] = req.username
                this_req['active'] = req.active
                this_req['created_at'] = req.created_at,
                this_req['roles'] = [{"name":role.name} for role in req.roles]
                user_json.append(this_req)
            # user_json.append(this_req)
        
        if user_json:
            return user_json
        
        return {
            "message": "No users found!!"
        },404
    @auth_required('token')
    @roles_required('admin')
    def put(self,id):
        args = user_parser.parse_args() 
        user = User.query.get(id)
         
        try:
            user.active = args["active"]
            db.session.commit()
            return {
                "message" : f"user {user.username} has been {'activated' if args['active'] else 'blocked'}"
            },200
        except:
            return {
                "message" : "unable to change user status!"
            },400
    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        user = User.query.get(id)
        try:
            db.session.delete(user)
            db.session.commit()
            return {
                "message" : f"user {user.username} has been removed!"
            },200
        except:
            return {
                "message" : "unable remove {user.username}!"
            },400

#Resource for Professionals listing
class ProfessionalListApi(Resource):
    
    @auth_required('token')
    @roles_accepted('customer', 'admin')
    def get(self,service_name):
        
        professionals = (
    User.query.join(Service, User.service_id == Service.id)
    .filter(Service.name == service_name)
    .all()
)
        professional_list = []
        if "admin" in roles_list(current_user.roles):
            for prof in professionals:
                professional_list.append({
                    "id": prof.id,
                    "email": prof.email,
                    "username": prof.username,
                    "service_name": prof.service.name,
                    "specialization": prof.specialization,
                    "experience": prof.experience,
                    "time_required": prof.service.time_required,
                    "rating": get_professional_rating(prof.id)
                })
        else:
            for prof in professionals:
                if prof.active:
                    professional_list.append({
                        "id": prof.id,
                        "email": prof.email,
                        "username": prof.username,
                        "service_name": prof.service.name,
                        "specialization": prof.specialization,
                        "experience": prof.experience,
                        "time_required": prof.service.time_required,
                        "rating": get_professional_rating(prof.id)
                    })

        if professional_list:
            return jsonify(professional_list)
        
        return {"message": "No professionals found for this service"}, 404

api.add_resource(ServicRequestsApi,'/api/service-request/get','/api/service-request/create','/api/service-request/update/<int:id>','/api/service-request/delete/<int:id>')
api.add_resource(ServiceApi,'/api/service','/api/service/update/<int:id>','/api/service/delete/<int:id>')
api.add_resource(UserApi,'/api/users','/api/users/update/<int:id>','/api/users/delete/<int:id>')
api.add_resource(PublicServiceApi,'/api/public/service/get')
api.add_resource(ProfessionalListApi, '/api/professionals/<string:service_name>')

