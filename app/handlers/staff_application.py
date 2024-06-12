from flask import Blueprint, render_template, redirect, abort, request
from google.cloud import ndb
import datetime
import logging
import requests

from app.lib import auth, common
from app.models.staff_application import ApplicationSettings, SubmittedForm
from app.models.user import Roles, User
from app.models.wca.competition import Competition

bp = Blueprint('staff_application', __name__)
client = ndb.Client()

def is_admin(user, wcif):
  if not user:
    return False
  if user.HasAnyRole(Roles.AdminRoles()):
    return True
  for person in wcif.persons:
    if person.wcaUserId == int(user.key.id()):
      return 'delegate' in person.roles or 'organizer' in person.roles or 'trainee-delegate' in person.roles
  return False

def get_wcif(competition_id):
  # TODO: switch this to env.WCA_HOST.
  data = requests.get('https://api.worldcubeassociation.org/competitions/' + competition_id + '/wcif/public')
  if data.status_code != 200:
    logging.error(data)
    raise Exception('Failed to load competition WCIF.')
  return data.json()


@bp.route('/staff/<competition_id>', defaults={'path': ''})
@bp.route('/staff/<competition_id>/<path:path>')
def apply(competition_id, path):
  with client.context():
    settings = ApplicationSettings.get_by_id(competition_id)
    if not settings:
      return redirect('/')
    return render_template('staff_application.html',
                           c=common.Common())

@bp.route('/staff_api/<competition_id>/enable')
def enable(competition_id):
  with client.context():
    user = auth.user()
    if not user:
      return redirect('/')
    if not user.HasAnyRole(Roles.AdminRoles()):
      return redirect('/')
    existing_settings = ApplicationSettings.get_by_id(competition_id)
    if not existing_settings:
      settings = ApplicationSettings(id=competition_id)
      settings.put()
    return redirect('/staff/%s' % competition_id)

@bp.route('/staff_api/<competition_id>/wcif')
def api_wcif(competition_id):
  with client.context():
    return get_wcif(competition_id)

@bp.route('/staff_api/<competition_id>/me')
def me_wcif(competition_id):
  with client.context():
    user = auth.user()
    if not user:
      abort(401)
    return {
      'id': user.key.id(),
      'name': user.name,
      'email': user.email,
      'is_admin': is_admin(user, get_wcif(competition_id))
    }

@bp.route('/staff_api/<competition_id>/settings', methods=['GET'])
def get_settings(competition_id):
  with client.context():
    settings = ApplicationSettings.get_by_id(competition_id)
    if not settings:
      abort(404)
    if settings.details is None:
      return {}
    return settings.details

@bp.route('/staff_api/<competition_id>/settings', methods=['PUT'])
def put_settings(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      abort(401)
    settings = ApplicationSettings(id=competition_id)
    settings.details = request.json
    settings.put()
    return '', 200

@bp.route('/staff_api/<competition_id>/form_submission/<form_id>', methods=['POST'])
def save_form(competition_id, form_id):
  form_id = int(form_id)
  with client.context():
    user = auth.user()
    if user is None:
      abort(401)
    key = SubmittedForm.Key(competition_id, form_id, user.key.id())
    form = SubmittedForm.get_by_id(key)
    if not form:
      form = SubmittedForm(id=key)
      form.user = user.key
      form.competition = ndb.Key(Competition, competition_id)
      form.form_id = form_id
      form.submitted_at = datetime.datetime.now()
    form.updated_at = datetime.datetime.now()
    form.details = request.json
    form.put()
    return '', 200

@bp.route('/staff_api/<competition_id>/my_forms', methods=['GET'])
def get_submitted_forms(competition_id):
  with client.context():
    user = auth.user()
    if user is None:
      abort(401)
    all_forms = SubmittedForm.query(ndb.AND(SubmittedForm.competition == ndb.Key(Competition, competition_id),
                                            SubmittedForm.user == user.key))
    return [{
      'formId': form.form_id,
      'submittedAtTs': form.submitted_at.timestamp(),
      'updatedAtTs': form.updated_at.timestamp(),
      'details': form.details
    } for form in all_forms.iter()]
