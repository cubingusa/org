from google.cloud import ndb

from flask import session

from app.models.user import User

client = ndb.Client()

def logged_in():
  return 'wca_account_number' in session

def user():
  if not logged_in():
    return False

  wca_account_number = session['wca_account_number']

  with client.context():
    user = User.get_by_id(wca_account_number)
    return user
