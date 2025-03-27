from celery import shared_task
from .models import *
from .utils import format_report
# from .mail import send_email
import datetime
import csv
import time
# import requests
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