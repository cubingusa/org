import json
import urllib
import webapp2

from google.appengine.api import mail
from google.appengine.api import urlfetch

from src import common
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.app_settings import AppSettings

class ContactHandler(BaseHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('contact.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'successful': self.request.get('success'),
    }))

  def post(self):
    template = JINJA_ENVIRONMENT.get_template('contact.html')
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
      print result
      if not result['success']:
        self.response.write(template.render({
            'c': common.Common(self),
            'unsuccessful': True,
        }))
        return
    contact_email = app_settings.contact_email
    subject = '[CubingUSA] Contact form -- %s' % (
        self.user.name if self.user else self.request.get('from-address'))
    mail.send_mail(sender=contact_email,
                   to=contact_email,
                   cc=self.request.get('from-address'),
                   subject=subject,
                   body=self.request.get('contact-message'))
    self.redirect(webapp2.uri_for('contact') + '?success=1')
