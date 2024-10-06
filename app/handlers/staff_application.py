from flask import Blueprint, render_template, redirect, request
from google.cloud import ndb
import datetime
import logging
import requests
import uuid

from app.cache import cache
from app.lib import auth, common
from app.lib.staff_email import send_email
from app.models.staff_application import ApplicationSettings, SubmittedForm, UserSettings, SavedView, MailTemplate, MailHook, Review
from app.models.user import Roles, User
from app.models.wca.competition import Competition

bp = Blueprint('staff_application', __name__)
client = ndb.Client()

def user_to_frontend(user, wcif, settings, user_settings, public_attributes_only=False):
  admin = is_admin(user, wcif)
  if user_settings:
    props = [{'key': int(k), 'value': v} for k, v in user_settings.properties.items() if v > -1]
  else:
    props = []
  if not admin:
    visible_props = [prop['id'] for prop in settings.details['properties'] if prop['visible']]
    props = [p for p in props if p['key'] in visible_props]
  out = {
    'id': user.key.id(),
    'name': user.name,
    'wcaId': user.wca_person.id() if user.wca_person else '',
    'isAdmin': admin,
    'delegateStatus': user.delegate_status,
  }
  if not public_attributes_only:
    out['email'] = user.email
    out['birthdate'] = user.birthdate.isoformat()
    out['properties'] = props
  return out

def form_to_frontend(form):
  return {
    'formId': form.form_id,
    'submittedAtTs': form.submitted_at.timestamp(),
    'updatedAtTs': form.updated_at.timestamp(),
    'details': form.details
  }

def review_to_frontend(review, wcif, settings, users):
  out = {
    'user': user_to_frontend(users[review.user.id()], wcif, settings, None, public_attributes_only=True),
    'reviewers': [user_to_frontend(users[reviewer.id()], wcif, settings, None) for reviewer in review.reviewers],
    'reviewFormId': review.review_form_id,
    'questions': review.details,
  }
  if review.submitted_at:
    out['submittedAtSeconds'] = review.submitted_at.timestamp()
  if review.deadline:
    out['deadline'] = review.deadline.timestamp()
  return out

def is_admin(user, wcif):
  if not user:
    return False
  if user.HasAnyRole(Roles.AdminRoles()):
    return True
  for person in wcif['persons']:
    if person['wcaUserId'] == int(user.key.id()):
      return 'organizer' in person['roles']
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
    user = auth.user()
    if user and not user.birthdate:
      return redirect('/staff_oauth/login')
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
      settings.details = {
        "isVisible": False,
        "description": "",
        "forms": [],
        "nextFormId": 0,
        "properties": [],
        "nextPropertyId": 0,
      }
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
    out = settings.details
    # TODO: restrict form visibility to ones assigned to you?
    if 'forms' in (settings.review_settings or {}):
      out['reviewForms'] = settings.review_settings['forms']
    else:
      out['reviewForms'] = []
    if 'nextFormId' in (settings.review_settings or {}):
      out['nextReviewFormId'] = settings.review_settings['nextFormId']
    else:
      out['nextReviewFormId'] = 0
    return out

@bp.route('/staff_api/<competition_id>/settings', methods=['PUT'])
def put_settings(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id) or ApplicationSettings(id=competition_id)
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
    for hook in MailHook.query(ndb.AND(MailHook.competition == form.competition,
                                       MailHook.hook_type == "FormSubmitted",
                                       MailHook.form_id == form_id)):
      settings = ApplicationSettings.get_by_id(competition_id)
      template = hook.template.get()
      if hook.recipient == 'User':
        send_email(user.email, user.name, template, settings, {'applicant': user})
      else:
        send_email(hook.recipient, hook.recipient, template, settings, {'applicant': user})
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
    users_by_id = {user.key.id() : user for user in users}
    user_settings_keys = [ndb.Key(UserSettings, UserSettings.Key(competition_id, int(user.key.id()))) for user in users]
    user_settings = ndb.get_multi(user_settings_keys)
    all_reviews = list(Review.query(Review.competition == ndb.Key(Competition, competition_id)).iter())
    return [
      {
        'user': user_to_frontend(user, wcif, settings, user_settings),
        'forms': [form_to_frontend(form) for form in all_forms if form.user == user.key],
        'reviews': [review_to_frontend(review, wcif, settings, users_by_id) for review in all_reviews if review.user == user.key],
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
    for hook in MailHook.query(ndb.AND(MailHook.competition == ndb.Key(Competition, competition_id),
                                       MailHook.hook_type == "PropertyAssigned",
                                       MailHook.property_id == propertyId,
                                       MailHook.value_id == valueId)):
      settings = ApplicationSettings.get_by_id(competition_id)
      template = hook.template.get()
      if hook.recipient == 'User':
        for user in ndb.get_multi([ndb.Key(User, user_id) for user_id in personIds]):
          if user:
            send_email(user.email, user.name, template, settings, {'applicant': user})
      else:
        send_email(hook.recipient, hook.recipient, template, settings, {'applicant': user})
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

@bp.route('/staff_api/<competition_id>/view/<view_id>', methods=['DELETE'])
def delete_view(competition_id, view_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    ndb.Key(SavedView, SavedView.Key(competition_id, view_id)).delete()
    return {}, 200

@bp.route('/staff_api/<competition_id>/view', methods=['GET'])
def get_views(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    admin = is_admin(user, wcif)
    out = []
    for view in SavedView.query(SavedView.competition == ndb.Key(Competition, competition_id)).iter():
      if admin or view.details['isPublic']:
        out += [{key: view.details[key] for key in ['id', 'title', 'visibleTo', 'isPublic']}]
    return out, 200

def template_to_frontend(template, metadata_only=False):
  out = {
    "id": template.key.id(),
    "title": template.title,
  }
  if not metadata_only:
    out["design"] = template.design
    out["html"] = template.html
    out["subjectLine"] = template.subject_line
  return out

@bp.route('/staff_api/<competition_id>/template_metadata', methods=['GET'])
def get_template_metadata(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    out = [template_to_frontend(template, metadata_only=True) for template in
           MailTemplate.query(MailTemplate.competition == ndb.Key(Competition, competition_id)).iter()]
    return out, 200

@bp.route('/staff_api/<competition_id>/template/<template_id>', methods=['GET'])
def get_template(competition_id, template_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    template = MailTemplate.get_by_id(template_id)
    if template.competition.id() != competition_id:
      return {}, 401
    return template_to_frontend(template, metadata_only=False), 200

@bp.route('/staff_api/<competition_id>/template', methods=['PUT'], defaults={'template_id': None})
@bp.route('/staff_api/<competition_id>/template/<template_id>', methods=['PUT'])
def put_template(competition_id, template_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    req = request.json
    if template_id:
      template = MailTemplate.get_by_id(template_id)
      if template.competition.id() != competition_id:
        return {}, 401
    else:
      template = MailTemplate(id=uuid.uuid4().hex)
      template.competition = ndb.Key(Competition, competition_id)
    template.title = req['title']
    template.subject_line = req['subjectLine']
    template.design = req['design']
    template.html = req['html']
    template.put()
    return template_to_frontend(template), 200

@bp.route('/staff_api/<competition_id>/template/<template_id>', methods=['DELETE'])
def delete_template(competition_id, template_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    template = MailTemplate.get_by_id(template_id)
    if not template:
      return {}, 404
    if template.competition.id() != competition_id:
      return {}, 401
    template.key.delete()
    return {}, 200

@bp.route('/staff_api/<competition_id>/mailer_settings', methods=['GET'])
def get_mailer_settings(competition_id):
  with client.context():
    settings = ApplicationSettings.get_by_id(competition_id)
    if not settings:
      return {}, 404
    return {
      'senderAddress': settings.sender_address,
      'senderName': settings.sender_name,
    }, 200

@bp.route('/staff_api/<competition_id>/mailer_settings', methods=['PUT'])
def put_mailer_settings(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id)
    settings.sender_address = request.json['senderAddress']
    settings.sender_name = request.json['senderName']
    settings.put()
    return {}, 200

@bp.route('/staff_api/<competition_id>/send_email', methods=['POST'])
def post_send_email(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id)
    req = request.json
    template = MailTemplate.get_by_id(req['templateId'])
    if template.competition.id() != competition_id:
      return {}, 401
    users = ndb.get_multi([ndb.Key(User, user_id) for user_id in req['userIds']])
    for user in users:
      if user:
        send_email(user.email, user.name, template, settings, {'applicant': user})
    return {}, 200

def hook_to_frontend(hook):
  out = {
    'id': hook.key.id(),
    'type': hook.hook_type,
    'templateId': hook.template.id()
  }
  if hook.hook_type == 'FormSubmitted':
    out['formId'] = hook.form_id
  if hook.hook_type == 'PropertyAssigned':
    out['propertyId'] = hook.property_id
    out['propertyValue'] = hook.property_value
  out['recipient'] = hook.recipient
  return out

@bp.route('/staff_api/<competition_id>/hook', methods=['GET'])
def get_hooks(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    out = [hook_to_frontend(hook) for hook in
           MailHook.query(MailHook.competition == ndb.Key(Competition, competition_id)).iter()]
    return out, 200

@bp.route('/staff_api/<competition_id>/hook', methods=['PUT'], defaults={'hook_id': None})
@bp.route('/staff_api/<competition_id>/hook/<hook_id>', methods=['PUT'])
def put_hook(competition_id, hook_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    req = request.json
    if hook_id:
      hook = MailHook.get_by_id(hook_id)
      if hook.competition.id() != competition_id:
        return {}, 401
    else:
      hook = MailHook(id=uuid.uuid4().hex)
      hook.competition = ndb.Key(Competition, competition_id)
    hook.template = ndb.Key(MailTemplate, req['templateId'])
    hook.hook_type = req['type']
    hook.recipient = req['recipient']
    if hook.hook_type == 'FormSubmitted':
      hook.form_id = req['formId']
    if hook.hook_type == 'PropertyAssigned':
      hook.property_id = req['propertyId']
      hook.property_value = req['propertyValue']
    hook.put()
    return hook_to_frontend(hook), 200

@bp.route('/staff_api/<competition_id>/hook/<hook_id>', methods=['DELETE'])
def delete_hook(competition_id, hook_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    hook = MailHook.get_by_id(hook_id)
    if not hook:
      return {}, 404
    if hook.competition.id() != competition_id:
      return {}, 401
    hook.key.delete()
    return {}, 200

@bp.route('/staff_api/<competition_id>/review/settings', methods=['PUT'])
def set_review_settings(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id)
    settings.review_settings = request.json
    settings.put()
    return {}, 200

@bp.route('/staff_api/<competition_id>/review/request', methods=['POST'])
def request_review(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not is_admin(user, wcif):
      return {}, 401
    req = request.json
    keys = [ndb.Key(Review, Review.Key(competition_id, req['reviewFormId'], user['id'])) for user in req['users']]
    reviews = ndb.get_multi(keys)
    for idx, user in enumerate(req['users']):
      key = keys[idx]
      review = reviews[idx]
      if not review:
        review = Review(id=key.id())
        review.competition = ndb.Key(Competition, competition_id)
        review.user = ndb.Key(User, str(user['id']))
        review.review_form_id = req['reviewFormId']
        reviews[idx] = review
      review.deadline = datetime.datetime.fromtimestamp(req['deadlineSeconds'])
      for reviewer_id in user['reviewerIds']:
        key = ndb.Key(User, str(reviewer_id))
        # TODO: Uncomment this.
        if key not in review.reviewers: # and key.id() != user['id']:
          review.reviewers += [key]
    ndb.put_multi(reviews)
    return {}, 200

@bp.route('/staff_api/<competition_id>/review/mine', methods=['GET'])
def my_reviews(competition_id):
  with client.context():
    user = auth.user()
    wcif = get_wcif(competition_id)
    if not user:
      return {}, 401
    settings = ApplicationSettings.get_by_id(competition_id)
    reviews = list(Review.query(ndb.AND(Review.reviewers == user.key,
                                        Review.competition == ndb.Key(Competition, competition_id))).iter())
    user_keys = [review.user for review in reviews]
    reviewer_keys = [reviewer for review in reviews for reviewer in review.reviewers]
    person_keys = list(set(user_keys + reviewer_keys))
    users = {user.key.id() : user for user in ndb.get_multi(person_keys)}
    return [review_to_frontend(review, wcif, settings, users) for review in reviews], 200

@bp.route('/staff_api/<competition_id>/review/decline', methods=['POST'])
def decline_review(competition_id):
  with client.context():
    user = auth.user()
    if not user:
      return {}, 401
    req = request.json
    review = Review.get_by_id(Review.Key(competition_id, req['reviewFormId'], req['userId']))
    if review:
      review.reviewers = [r for r in review.reviewers if r.id() != user.key.id()]
      review.declined_reviewers += [user.key]
      review.declined_reviewer_timestamps += [datetime.datetime.now()]
      review.put()
      return {}, 200
    else:
      return {}, 404

@bp.route('/staff_api/<competition_id>/review/submit', methods=['POST'])
def submit_review(competition_id):
  with client.context():
    user = auth.user()
    if not user:
      return {}, 401
    req = request.json
    review = Review.get_by_id(Review.Key(competition_id, req['reviewFormId'], req['user']['id']))
    if not review.submitted_at:
      review.submitted_at = datetime.datetime.now()
      review.submitted_by = user.key
    review.updated_at = datetime.datetime.now()
    review.updated_by = user.key
    review.details = req['questions']
    review.put()
    return {}, 200
