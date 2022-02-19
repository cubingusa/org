import os

from flask import redirect
from flask import render_template
from flask import request
from google.cloud import recaptchaenterprise_v1
from google.cloud.recaptchaenterprise_v1 import Assessment
from mailjet_rest import Client

from app.common.common import Common
from app.common.secrets import get_secret

def create_assessment(token):
  client = recaptchaenterprise_v1.RecaptchaEnterpriseServiceClient()

  # Set the properties of the event to be tracked.
  event = recaptchaenterprise_v1.Event()
  event.site_key = get_secret('RECAPTCHA_SECRET_KEY')
  if not event.site_key:
    return 1.0
  event.token = token

  assessment = recaptchaenterprise_v1.Assessment()
  assessment.event = event

  # Build the assessment request.
  request = recaptchaenterprise_v1.CreateAssessmentRequest()
  request.assessment = assessment
  if os.environ.get('ENV') == 'PROD':
    request.parent = 'projects/' + os.environ.get('GOOGLE_CLOUD_PROJECT')
  else:
    request.parent = 'projects/cubingusa-org'

  response = client.create_assessment(request)

  # Check if the token is valid.
  if not response.token_properties.valid:
    print('Invalid token: ' + str(response.token_properties.invalid_reason))
    return 0.0

  return response.risk_analysis.score

def handle_contact_request(template, subject_base, recipient):
  if request.method == 'GET':
    return render_template(template,
                           c=Common(),
                           result=('success' if 'success' in request.args else ''))
  if get_secret('RECAPTCHA_SECRET_KEY'):
    score = create_assessment(request.form['g-recaptcha-response'])
    if score < 0.5:
      return render_template(template, c=Common(), result='failure')
  if get_secret('MAILJET_API_KEY') and get_secret('MAILJET_API_SECRET'):
    mailjet = Client(auth=(get_secret('MAILJET_API_KEY'), get_secret('MAILJET_API_SECRET')),
                     version='v3.1')
    subject = '[' + subject_base + '] Contact form submission by ' + request.form['name']
    if request.form['wcaid']:
      subject += ' (' + request.form['wcaid'] + ')'
    data = {
      'Messages': [
        {
          'From': {
            'Email': 'info@cubingusa.org',
            'Name': 'CubingUSA Contact Form',
          },
          'To': [
            {
              'Email': recipient,
            },
            {
              'Email': request.form['from-address'],
              'Name': request.form['name'],
            },
          ],
          'Subject': subject,
          'TextPart': request.form['contact-message'],
        }
      ]
    }
    result = mailjet.send.create(data=data)
  return redirect(request.root_path + request.path + '?success=1')
