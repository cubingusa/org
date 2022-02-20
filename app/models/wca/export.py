from google.cloud import ndb

client = ndb.Client()

class WcaExport(ndb.Model):
  pass

class LatestWcaExport(ndb.Model):
  export = ndb.KeyProperty(kind=WcaExport)

def get_latest_export():
  with client.context():
    latest = LatestWcaExport.get_by_id('1')
    if latest:
      return latest.export.get()
    return None

def set_latest_export(export_key):
  with client.context():
    latest = LatestWcaExport.get_by_id('1') or LatestWcaExport(id='1')
    old_export = None
    if latest.export:
      old_export = latest.export
    latest.export = export_key
    latest.put()
