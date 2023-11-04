import os

from flask import redirect
from flask import render_template
from flask import request
from google.cloud import recaptchaenterprise_v1
from google.cloud.recaptchaenterprise_v1 import Assessment
from mailjet_rest import Client

from app.lib import auth
from app.lib.common import Common
from app.lib.secrets import get_secret

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

  try:
    response = client.create_assessment(request)

    # Check if the token is valid.
    if not response.token_properties.valid:
      print('Invalid token: ' + str(response.token_properties.invalid_reason))
      return 0.0

    return response.risk_analysis.score
  except e:
    print('Error fetching assessment.')
    print(e)
    return 0.0

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
    user = auth.user()
    if user:
      name = user.name
      email = user.email
      wca_id = user.wca_person.id()
      validated = True
    else:
      name = request.form['name']
      email = request.form['from-address']
      wca_id = None
      validated = False
    subject = '[' + subject_base + '] Contact form submission by ' + name
    if wca_id:
      subject += ' (' + wca_id + ')'
    body = request.form['contact-message']
    body += '\n\n------------------------------\n\n'
    if validated:
      body += 'Sent from a signed-in user\n'
    else:
      body += 'Sent from a signed-out user\n'
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
              'Email': email,
              'Name': name,
            },
          ],
          'Subject': subject,
          'TextPart': body,
        }
      ]
    }
    print(data)
    result = mailjet.send.create(data=data)
  return redirect(request.root_path + request.path + '?success=1')
