import json
import urllib
import webapp2

from google.appengine.api import mail
from google.appengine.api import urlfetch

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.app_settings import AppSettings

def ContactHandler(contact_email, template_path, subject_prefix):
  class Handler(BaseHandler):
    def get(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      self.response.write(template.render({
          'c': common.Common(self),
          'result': 'success' if self.request.get('success') else '',
      }))

    def post(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      app_settings = AppSettings.Get()
      if app_settings.recaptcha_secret_key:
        payload = {
            'secret': app_settings.recaptcha_secret_key,
            'response': self.request.get('g-recaptcha-response'),
            'remoteip': self.request.remote_addr,
        }
        fetch = urlfetch.fetch(
            url='https://www.google.com/recaptcha/api/siteverify',
            payload=urllib.urlencode(payload),
            method=urlfetch.POST)
        result = json.loads(fetch.content)
        if not result['success']:
          self.response.write(template.render({
              'c': common.Common(self),
              'result': 'failure',
          }))
          return
      subject = '[%s] Contact form -- %s' % (
          subject_prefix,
          self.user.name if self.user else self.request.get('from-address'))
      if self.request.get('wcaid'):
        body = 'WCA ID: %s\n%s' % (self.request.get('wcaid'),
                                   self.request.get('contact-message'))
      else:
        body = self.request.get('contact-message')
      mail.send_mail(sender=contact_email,
                     to=contact_email,
                     cc=self.request.get('from-address'),
                     subject=subject,
                     body=body)
      self.redirect(self.request.url + '?success=1')

  return Handler
