import os
import requests

from flask import Blueprint, request, abort, render_template
from google.cloud import ndb

from app.lib import auth
from app.lib.common import Common
from app.models.status import GroupStatus
from app.models.wca.competition import Competition

bp = Blueprint('status', __name__, url_prefix='/status')
client = ndb.Client()

def comp_data(competition_id):
  wca_host = os.environ.get('WCA_HOST')
  data = requests.get(wca_host + '/api/v0/competitions/' + competition_id + '/wcif/public')
  if data.status_code != 200:
    abort(data.status_code)
  return data.json()

def is_admin(data):
  me = auth.user()
  for person in data['persons']:
    if person['wcaUserId'] == me.key.id():
      return 'delegate' in person.roles or 'organizer' in person.roles
  return False

def load_status(competition_id):
  return {status.group_id : status for status in GroupStatus.query(GroupStatus.competition_id == ndb.Key(Competition, competition_id)).fetch()}


@bp.route('/<competition_id>')
def comp_status(competition_id):
  with client.context():
    status = load_status(competition_id)
    data = comp_data(competition_id)
    return render_template('status/index.html', c=Common(), status=status, data=data)

@bp.route('/<competition_id>/admin')
def comp_admin(competition_id):
  with client.context():
    data = comp_data(competition_id)
    if not is_admin(data):
      return redirect('/login')
    status = load_status(competition_id)
    return render_template('status/admin.html', c=Common(), status=status, data=data)

@bp.route('/<competition_id>/ready/<group_id>')
def ready(competition_id, group_id):
  with client.context():
    group_id = int(group_id)
    data = comp_data(competition_id)
    if not is_admin(data):
      abort(401)
    status = load_status(competition_id)

    status_id = GroupStatus.Id(competition_id, group_id)
    status_obj = None
    if status_id in status:
      status_obj = status[status_id]
    else:
      status_obj = GroupStatus(id=status_id)
      status_obj.competition_id = competition_id
      status_obj.group_id = group_id
    status_obj.ready_time = datetime.datetime.now()
    status_obj.ready_set_by = auth.user().key
    status_obj.put()
    return 'ok', 200

@bp.route('/<competition_id>/call/<group_id>')
def call(competition_id, group_id):
  with client.context():
    group_id = int(group_id)
    data = comp_data(competition_id)
    if not is_admin(data):
      abort(401)
    status = load_status(competition_id)

    status_id = GroupStatus.Id(competition_id, group_id)
    status_obj = None
    if status_id in status:
      status_obj = status[status_id]
    else:
      status_obj = GroupStatus(id=status_id)
      status_obj.competition_id = competition_id
      status_obj.group_id = group_id
    status_obj.call_time = datetime.datetime.now()
    status_obj.called_by = auth.user().key
    status_obj.put()
    return 'ok', 200
