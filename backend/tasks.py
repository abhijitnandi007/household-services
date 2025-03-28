from celery import shared_task
from .models import *
from .utils import format_report
from .mail import send_email
import datetime
import csv
import requests
import json

@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report():
    service_request = ServiceRequest.query.all()
    csv_file_name = f"service_{datetime.datetime.now().strftime('%f')}.csv"
    with open(f'static/downloads/{csv_file_name}', 'w', newline = "") as csvfile:
        sr_no = 1
        service_csv = csv.writer(csvfile, delimiter = ',')
        service_csv.writerow(['Sr No.','Service_Name','Requested_By','Date_Of_Request','Serviced_By','Date_of_Completion','Service_Status','Amount','Remarks'])
        for sr in service_request:
            this_req = [sr_no,sr.service.name,sr.customer.username,sr.date_of_request,
                          sr.professional.username,sr.date_of_completion,sr.service_status,sr.remarks] 
            service_csv.writerow(this_req)
            sr_no += 1
    return csv_file_name


@shared_task(ignore_results = False, name = "monthly_email_reports")
def email_report():
    """ sending monthly email reports to all the user"""
    customers = User.query.join(User.roles).filter(Role.name=="customer").all()

    for user in customers:
        this_user = {}
        this_user['username'] = user.username
        this_user['email'] = user.email
        service_req = []
        for req in user.service_requests:
            if req.service_status !='rejected' :
                this_req={}
                this_req = {
                    "service_name": req.service.name,
                    "professional_name": req.professional.username,
                    "date_of_request": req.date_of_request,
                    "date_of_completion": req.date_of_completion,
                    "time_required": req.service.time_required,
                    "price": req.service.base_price,
                }
                service_req.append(this_req)
        this_user['service_requests'] = service_req

        message = format_report('templates/email_body.html',this_user)
        send_email(to_address=user.email,subject = "Root Serive - Monthly Service Report",message = message)
    return "Monthly Reports Sent!"

@shared_task(ignore_results=False, name="daily_reminders")
def daily_reminder():
    """Sending daily Reminders"""
    professionals = User.query.join(User.roles).filter(Role.name == "professional").all()

    for prof in professionals:
        pending_requests = [
            req for req in prof.assigned_services if req.service_status == "requested"
        ]
        if pending_requests:
            text = f"Hey, {prof.username}, You have pending request, please visit https://127.0.0.1:5000"
            response = requests.post("https://chat.googleapis.com/v1/spaces/AAAATNrnmzc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=jmVvs3e4UUxuMcsOrcQueRoq_yBRC-jKYvkVtunUe5o",json={"text":text})
    return "user notified @ gchat!"

