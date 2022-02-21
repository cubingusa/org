from google.cloud import ndb

from app.models.wca.export import get_latest_export

client = ndb.Client()

with client.context():
  export = get_latest_export()
  if export:
    print(export.id.get())
