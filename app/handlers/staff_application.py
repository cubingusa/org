from flask import Blueprint, render_template, redirect, request
from google.cloud import ndb
import datetime
import logging
import requests

from app.cache import cache
from app.lib import auth, common
from app.models.staff_application import ApplicationSettings, SubmittedForm, UserSettings, SavedView
from app.models.user import Roles, User
from app.models.wca.competition import Competition

bp = Blueprint('staff_application', __name__)
client = ndb.Client()

def user_to_frontend(user, wcif, settings, user_settings):
  admin = is_admin(user, wcif)
  if user_settings:
    props = [{'key': int(k), 'value': v} for k, v in user_settings.properties.items() if v > -1]
  else:
    props = []
  if not admin:
    visible_props = [prop['id'] for prop in settings.details['properties'] if prop['visible']]
    props = [p for p in props if p['key'] in visible_props]
  return {
    'id': user.key.id(),
    'name': user.name,
    'wcaId': user.wca_person.id() if user.wca_person else '',
    'email': user.email,
    'isAdmin': admin,
    'birthdate': user.birthdate.isoformat(),
    'delegateStatus': user.delegate_status,
    'properties': props,
  }

def form_to_frontend(form):
  return {
    'formId': form.form_id,
    'submittedAtTs': form.submitted_at.timestamp(),
    'updatedAtTs': form.updated_at.timestamp(),
    'details': form.details
  }

def is_admin(user, wcif):
  if not user:
    return False
  if user.HasAnyRole(Roles.AdminRoles()):
    return True
  for person in wcif.persons:
    if person.wcaUserId == int(user.key.id()):
      return 'organizer' in person.roles
  return False

@cache.memoize(300)
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
      return {}, 401
    wcif = get_wcif(competition_id)
    settings = ApplicationSettings.get_by_id(competition_id)
    user_settings = UserSettings.get_by_id(UserSettings.Key(competition_id, int(user.key.id())))
    return user_to_frontend(user, wcif, settings, user_settings)

@bp.route('/staff_api/<competition_id>/settings', methods=['GET'])
def get_settings(competition_id):
  with client.context():
    settings = ApplicationSettings.get_by_id(competition_id)
    if not settings:
      return {}, 404
    if settings.details is None:
      return {}
    return settings.details

@bp.route('/staff_api/<competition_id>/settings', methods=['PUT'])
def put_settings(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings(id=competition_id)
    settings.details = request.json
    settings.put()
    return {}, 200

@bp.route('/staff_api/<competition_id>/form_submission/<form_id>', methods=['POST'])
def save_form(competition_id, form_id):
  form_id = int(form_id)
  with client.context():
    user = auth.user()
    if not user:
      return {}, 401
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
    return {}, 200

@bp.route('/staff_api/<competition_id>/my_forms', methods=['GET'])
def get_submitted_forms(competition_id):
  with client.context():
    user = auth.user()
    if not user:
      return {}, 401
    all_forms = SubmittedForm.query(ndb.AND(SubmittedForm.competition == ndb.Key(Competition, competition_id),
                                            SubmittedForm.user == user.key))
    return [form_to_frontend(form) for form in all_forms.iter()]

@bp.route('/staff_api/<competition_id>/all_users', methods=['GET'])
def get_all_users(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id)
    all_forms = list(SubmittedForm.query(SubmittedForm.competition == ndb.Key(Competition, competition_id)).iter())
    user_keys = list(set([form.user for form in all_forms]))
    users = ndb.get_multi(user_keys)
    user_settings_keys = [ndb.Key(UserSettings, UserSettings.Key(competition_id, int(user.key.id()))) for user in users]
    user_settings = ndb.get_multi(user_settings_keys)
    return [
      {
        'user': user_to_frontend(user, wcif, settings, user_settings),
        'forms': [form_to_frontend(form) for form in all_forms if form.user == user.key]
      } for user, user_settings in zip(users, user_settings)
    ]

@bp.route('/staff_api/<competition_id>/properties', methods=['POST'])
def post_properties(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    req = request.json
    if not is_admin(user, wcif):
      return {}, 401
    personIds = [int(i) for i in req['personIds']]
    propertyId = req['propertyId']
    valueId = req['valueId']
    user_settings = ndb.get_multi([ndb.Key(UserSettings, UserSettings.Key(competition_id, user_id)) for user_id in personIds])
    all_user_settings = [
      user_settings if user_settings else UserSettings(id=UserSettings.Key(competition_id, user_id))
      for user_settings, user_id in zip(user_settings, personIds)
    ]
    for user_settings, user_id in zip(all_user_settings, personIds):
      if not user_settings.properties:
        user_settings.properties = {}
        user_settings.user = ndb.Key(User, user_id)
        user_settings.competition = ndb.Key(Competition, competition_id)
      props = user_settings.properties
      if propertyId != -1:
        props[propertyId] = valueId
      elif propertyId in props:
        del props[propertyId]
    ndb.put_multi(all_user_settings)
    return {}, 200

@bp.route('/staff_api/<competition_id>/view/<view_id>', methods=['PUT'])
def put_view(competition_id, view_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    req = request.json
    if not is_admin(user, wcif):
      return {}, 401
    view = SavedView(id=SavedView.Key(competition_id, view_id))
    view.competition = ndb.Key(Competition, competition_id)
    view.view_id = view_id
    view.details = req
    view.put()
    return {}, 200

@bp.route('/staff_api/<competition_id>/view/<view_id>', methods=['GET'])
def get_view(competition_id, view_id):
  with client.context():
    maybe_view = SavedView.get_by_id(SavedView.Key(competition_id, view_id))
    if not maybe_view:
      return {}, 404
    if not maybe_view.details['isPublic']:
      user = auth.user()
      wcif = get_wcif(competition_id)
      if not is_admin(user, wcif):
        return {}, 401
    return maybe_view.details, 200

@bp.route('/staff_api/<competition_id>/view', methods=['GET'])
def get_views(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    admin = is_admin(user, wcif)
    out = []
    for view in SavedView.query(SavedView.competition == ndb.Key(Competition, competition_id)).iter():
      if admin or view.details['isPublic']:
        out += [{key: view.details[key] for key in ['id', 'title', 'visibleTo']}]
    return out, 200

