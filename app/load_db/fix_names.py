from google.cloud import ndb
from app.models.user import User

def FixNames():
  objs_to_put = []
  for user in User.queyr(User.wca_person != None).iter():
    wca = user.wca_person.get()
    if wca is not None and user.name != wca.name:
      user.name = wca.name
      objs_to_put += [user]
  ndb.put_multi(objs_to_put)
