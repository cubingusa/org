import collections
import datetime
import json
import logging
import re

from google.cloud import ndb
from mailjet_rest import Client
import requests

from app.lib.secrets import get_secret
from app.models.championship import Championship
from app.models.user import User
from app.models.wca.competition import Competition


def EmailChampionshipOrganizers():
  if get_secret('MAILJET_API_KEY') and get_secret('MAILJET_API_SECRET'):
    mailjet = Client(auth=(get_secret('MAILJET_API_KEY'), get_secret('MAILJET_API_SECRET')),
                     version='v3.1')
  else:
    logging.error('Could not load mailjet API')
    return
  all_championships = list(Championship.query().iter())
  all_championship_competitions = ndb.get_multi([c.competition for c in all_championships])
  for comp, championship in zip(all_championship_competitions, all_championships):
    if not comp:
      continue
    if comp.start_date < datetime.date.today() or comp.start_date > datetime.date.today() + datetime.timedelta(days=14):
      continue
    if championship.organizer_email_sent is not None:
      continue
    if championship.national_championship:
      continue
    logging.info('Fetching ' + comp.key.id())
    data = requests.get('https://api.worldcubeassociation.org/competitions/' + comp.key.id() + '/wcif/public')
    if data.status_code != 200:
      logging.error('Got error loading WCIF')
      logging.error(data.status_code)
      logging.error(data.text)
      continue
    competition = data.json()
    to_send_keys = []
    for person in competition['persons']:
      if 'delegate' in person['roles'] or 'organizer' in person['roles'] or 'trainee-delegate' in person['roles']:
        to_send_keys += [ndb.Key(User, str(person['wcaUserId']))]
    emails = [{
      'Email': user.email,
      'Name': user.name,
    } for user in ndb.get_multi(to_send_keys) if user]
    if emails:
      if championship.region:
        championship_type = 'regional'
        eligibility_website = 'https://cubingusa.org/regional/eligibility/%s/%d%s' % (championship.region.id(), championship.year, '/pbq' if championship.is_pbq else '')
        champions_website = 'https://cubingusa.org/regional'
      elif championship.state:
        championship_type = 'state'
        eligibility_website = 'https://cubingusa.org/regional/eligibility/%s/%d%s' % (championship.state.id(), championship.year, '/pbq' if championship.is_pbq else '')
        champions_website = 'https://cubingusa.org/state_championships'
      subject = '[%s] Championship Eligibility' % comp.name
      body = 'You are receiving this email as a listed organizer or delegate of %s. This competition is recognized as a CubingUSA %s championship.\n\n' % (comp.name, championship_type)
      body += 'We encourage you to request that competitors who wish to be eligible for %s championships to log onto the CubingUSA website, visit https://cubingusa.org/edit, and select their home state. Please ask them to do this before the competition starts.\n\n' % championship_type
      body += 'You can check the list of competitors who are eligible to win a title at %s. Please take a look at the list and see if there are any discrepancies you are aware of. After the competition, the top competitor in each event will be listed at %s.\n\n' % (eligibility_website, champions_website)
      body += 'If you run into any issues with the process of determining champions, please contact Tim Reynolds (tim@cubingusa.org).\n\n'
      body += 'This is an automated email. If this is an outdated email address for you, please log in to the CubingUSA website (https://cubingusa.org/login); this will automatically update the email address we have on file for you.'
      data = {
        'Messages': [
          {
            'From': {
              'Email': 'webmaster@cubingusa.org',
              'Name': 'CubingUSA Webmaster',
            },
            'To': [
              {
                'Email': 'tim@cubingusa.org',
                'Name': 'Tim Reynolds',
              },
            ] + emails,
            'Subject': subject,
            'TextPart': body,
            'Headers': [
              'Reply-To': 'tim@cubingusa.org',
            ],
          }
        ]
      }
      logging.info(json.dumps(data))
      result = mailjet.send.create(data=data)
      championship.organizer_email_sent = datetime.datetime.now()
      championship.put()
    else:
      data = {
        'Messages': [
          {
            'From': {
              'Email': 'tim@cubingusa.org',
              'Name': 'Tim Reynolds',
            },
            'To': [
              {
                'Email': 'tim@cubingusa.org',
                'Name': 'Tim Reynolds',
              },
            ],
            'Subject': 'No known emails for ' + comp.name,
            'TextPart': 'No known emails for ' + comp.name,
          }
        ]
      }
      logging.info(json.dumps(data))
      result = mailjet.send.create(data=data)
