from flask_restful import Api,Resource,reqparse
from .models import *
from flask_security import auth_required,roles_required,roles_accepted,current_user

api = Api()

def roles_list(roles):
    roles_list=[]
    for role in roles:
        roles_list.append(role.name)
    return roles_list

#customer creates a service request 
# with the following fields
service_req_parser = reqparse.RequestParser()

service_req_parser.add_argument('service_name')
service_req_parser.add_argument('remarks')

class ServicRequestsApi(Resource):
    @auth_required('token')
    @roles_accepted('admin','customer','professional')
    def get(self):
        service_requests = []
        service_req_json = [] 
        if "admin" in roles_list(current_user.roles):
            service_requests = ServiceRequest.query.all()
        elif "customer" in roles_list(current_user.roles):
            service_requests = current_user.service_requests
        else:
            service_requests = current_user.assigned_services
        for req in service_requests:
            this_req = {}
            this_req["id"] = req.id
            this_req['service_id'] = req.service_id
            this_req['service_name'] = req.service.name
            this_req['price'] = req.service.base_price
            this_req['time_required'] = req.service.time_required
            this_req['professional_id'] = req.professional_id
            this_req['customer_id'] = req.customer_id
            this_req['service_name'] = req.service.name
            this_req['price'] = req.service.base_price
            this_req['date_of_request'] = req.date_of_request
            this_req['date_of_request'] = req.date_of_request.strftime('%Y-%m-%d %H:%M:%S') if req.date_of_request else None
            this_req['date_of_completion'] = req.date_of_completion.strftime('%Y-%m-%d %H:%M:%S') if req.date_of_completion else None
            this_req['service_status'] = req.service_status
            this_req['remarks'] = req.remarks
            service_req_json.append(this_req)
        
        if service_req_json:
            return service_req_json
        
        return {
            "message": "No service requests found!!"
        },404

    @auth_required('token')
    @roles_required('customer')
    def post(self):
        args = service_req_parser.parse_args()
        service_name = args["service_name"]
        service = Service.query.filter_by(name=service_name).first()
        print(service.id)
        try:
            service_request = ServiceRequest(customer_id = current_user.id,
                                            service_id = service.id,
                                            remarks = args["remarks"])
            db.session.add(service_request)
            db.session.commit()
            return {
                "message" : "Service request created successfully!"
            },201
        except:
            return {
                "message" : "Missing one or more required fields of service request!"
            },400

#admin creates a services 
# with the following fields
parser = reqparse.RequestParser()

parser.add_argument('name')
parser.add_argument('description')
parser.add_argument('base_price')
parser.add_argument('time_required')

class ServiceApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Admin creates service"""
        args = parser.parse_args()
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
            }

                
api.add_resource(ServicRequestsApi,'/api/service-request')
api.add_resource(ServiceApi,'/api/service')




