from flask import Blueprint, render_template, redirect
from google.cloud import ndb

from app.lib import auth, common
from app.models.staff_application import ApplicationSettings
from app.models.user import Roles, User

bp = Blueprint('staff_application', __name__)
client = ndb.Client()

@bp.route('/staff/<competition_id>/enable')
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

@bp.route('/staff/<competition_id>', defaults={'path': ''})
@bp.route('/staff/<competition_id>/<path:path>')
def apply(competition_id, path):
  with client.context():
    settings = ApplicationSettings.get_by_id(competition_id)
    if not settings:
      return redirect('/')
    return render_template('staff_application.html',
                           c=common.Common())
