import logging
import re

from mailjet_rest import Client
from app.lib.secrets import get_secret
from app.models.user import User

def send_email(user_email, user_name, template, settings, substitutions):
  if not template:
    logging.info('Template is not defined.')
    return
  if not get_secret('MAILJET_API_KEY') or not get_secret('MAILJET_API_SECRET'):
    logging.info('Mailjet API keys not available, not sending email to ' + user_email)
    return
  if not settings.sender_address or not settings.sender_name:
    logging.info('No sender info provided, returning.')
    return
  mailjet = Client(auth=(get_secret('MAILJET_API_KEY'), get_secret('MAILJET_API_SECRET')),
                   version='v3.1')
  html = template.html
  subject = template.subject_line
  for key, obj in substitutions.items():
    if isinstance(obj, User):
      html = re.sub('{{' + key + '.name}}', obj.name, html)
      subject = re.sub('{{' + key + '.name}}', obj.name, subject)

  data = {
    'Messages': [
      {
        'From': {
          'Email': settings.sender_address,
          'Name': settings.sender_name,
        },
        'To': [
          {
            # TODO: don't hard-code my email.
            # 'Email': 'tim@cubingusa.org' or user_email,
            'Email': user_email,
            'Name': user_name,
          },
        ],
        'Subject': subject,
        'HtmlPart': html,
      }
    ]
  }
  return mailjet.send.create(data=data)
