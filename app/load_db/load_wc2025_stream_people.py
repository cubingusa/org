from google.cloud import ndb
from google.cloud import storage
from googleapiclient.discovery import build

import base64
import json
import requests
from requests.auth import HTTPBasicAuth

from app.lib.secrets import get_secret

client = ndb.Client()

with client.context():
  wca_host = os.environ.get('WCA_HOST')
  data = requests.get'https://api.worldcubeassociation.org/competitions/WC2025/wcif/public')
  competition = data.json()
  id_to_persons = {}
  out = ''
  for person in competition['persons']:
    id_to_persons[person['wcaUserId']] = person
  for room in competition['schedule']['venues'][0]['rooms']:
    if room['name'] != 'Main Hall':
      continue
    for activity in room['activities']:
      for child in activity['childActivities']:
        if 'extensions' in child:
          for ext in child['extensions']:
            if ext['id'] == 'groupifier.ActivityConfig' and 'featuredCompetitorWcaUserIds' in ext['data']:
              for user_id in ext['data']['featuredCompetitorWcaUserIds']:
                person = id_to_persons[user_id]
                out += '%s,%s,%s\n' % (activity['activityCode'], person['name'], person['wcaId'])

  storage_client = storage.Client()
  bucket = storage_client.lookup_bucket('wc2025')
  blob = bucket.get_blob('featured.csv')
  blob.upload_from_string(out)
