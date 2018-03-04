import json
import logging
import requests
import urllib

from google.appengine.api import urlfetch
from google.oauth2 import service_account
import googleapiclient.discovery

from src.handlers.admin.admin_base import AdminBaseHandler
from src.models.app_settings import AppSettings
from src.models.user import Roles
from src.models.user import User
from src.models.wca.person import Person


def clean_email(email):
  # Groups API seems to break for @gmail.com addresses with a +, and gets confused
  # about emails with .s (which don't matter for gmail addresses).  Strip both.
  if email.endswith('@gmail.com'):
    address = email[:email.find('@')]
    if '+' in address:
      address = address[:address.find('+')]
    address = address.replace('.', '')
    email = address + '@gmail.com'
  return email


def UpdateMailingList(expected_emails, directory_service, mailing_list):
  current_emails = set()

  for member in service.members().list(groupKey=mailing_list).execute()['members']:
    current_emails.add(clean_email(member['email']))

  emails_to_remove = current_emails - expected_emails
  emails_to_add = expected_emails - current_emails

  for email_to_remove in emails_to_remove:
    service.members().delete(groupKey=mailing_list, memberKey=email_to_remove).execute()
    logging.info('Removing %s from %s' % (email_to_remove, mailing_list))
  for email_to_add in emails_to_add:
    service.members().insert(groupKey=mailing_list, body={'email': email_to_add}).execute()
    logging.info('Adding %s to %s' % (email_to_add, mailing_list))


class UpdateMailingListsHandler(AdminBaseHandler):
  def get(self):
    credentials = service_account.Credentials.from_service_account_info(
                      json.loads(AppSettings.Get().mailing_list_service_account_credentials),
                      scopes=['https://www.googleapis.com/auth/admin.directory.group.member'],
                      subject='adminbot@cubingusa.org')

    directory_service = googleapiclient.discovery.build('admin', 'directory_v1',
                                                        credentials=credentials)

    # First update delegates@cubingusa.org.
    all_delegate_email_addresses = set()
    url_to_fetch = 'https://www.worldcubeassociation.org/api/v0/delegates'
    while url_to_fetch:
      result = urlfetch.fetch(url_to_fetch)
      url_to_fetch = None
      if result.status_code != 200:
        self.request.status = result.status_code
        self.response.write(result.content)
        return

      for delegate in json.loads(result.content):
        if 'USA' in delegate['region']:
          all_delegate_email_addresses.add(clean_email(delegate['email']))

      # Delegates list is paginated; find the next page.
      for link in requests.utils.parse_header_links(result.headers['link']):
        if link['rel'] == 'next':
          url_to_fetch = link['url']
    UpdateMailingList(all_delegate_email_addresses, directory_service, 'delegates@cubingusa.org')

    self.response.write('ok')

  def PermittedRoles(self):
    return Roles.AdminRoles()
