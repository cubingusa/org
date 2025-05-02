from google.cloud import ndb
from google.cloud import storage

import base64
import json
import requests
from requests.auth import HTTPBasicAuth

from app.lib.secrets import get_secret

client = ndb.Client()

with client.context():
  username = get_secret('WCA_USERNAME').encode('utf-8')
  password = get_secret('WCA_PASSWORD').encode('utf-8')

  auth = HTTPBasicAuth(username, password)
  token = requests.post('https://www.worldcubeassociation.org/oauth/token',
                        {'grant_type': 'password',
                         'client_id': get_secret('WCA_STAFF_APPLICATION_CLIENT_ID'),
                         'client_secret': get_secret('WCA_STAFF_APPLICATION_CLIENT_SECRET'),
                         'username': username,
                         'password': password,
                         'scope': 'public manage_competitions'}).json()
  wcif = requests.get('https://www.worldcubeassociation.org/api/v0/competitions/CubingUSAAllStars2025/wcif', headers=$
  storage_client = storage.Client()
  bucket = storage_client.lookup_bucket('nats2025')
  blob = bucket.get_blob('wcif.json')
  blob.upload_from_string(json.dumps(wcif))
