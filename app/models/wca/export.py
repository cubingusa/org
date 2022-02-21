from google.cloud import ndb

class WcaExport(ndb.Model):
  pass

class LatestWcaExport(ndb.Model):
  export = ndb.KeyProperty(kind=WcaExport)

def get_latest_export():
  latest = LatestWcaExport.get_by_id('1')
  if latest:
    return latest.export.get()
  return None

def set_latest_export(export_id):
  latest = LatestWcaExport.get_by_id('1') or LatestWcaExport(id='1')
  if latest.export:
    latest.export.delete()
  latest.export = ndb.Key(WcaExport, export_id)
  latest.put()
  new_export = WcaExport(id=export_id)
  new_export.put()
