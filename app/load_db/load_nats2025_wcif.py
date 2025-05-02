from google.cloud import ndb

from app.lib.secrets import get_secret
from requests.auth import HTTPBasicAuth

client = ndb.Client()

with client.context():
  username = get_secret('WCA_USERNAME')
  password = get_secret('WCA_PASSWORD')
  auth = HTTPBasicAuth(username, password)
  wcif = requests.get('https://www.worldcubeassociation.org/api/v0/competitions/CubingUSAAllStars2025/wcif', auth=basic).json()
  storage_client = storage.Client()
  bucket = storage_client.lookup_bucket('nats2025')
  blob = bucket.get_blob('wcif.json')
  blob.upload_from_string(json.dumps(wcif))
