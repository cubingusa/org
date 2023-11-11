import datetime

from flask import Blueprint, render_template, redirect, request
from google.cloud import ndb

from app.lib import auth
from app.lib import permissions
from app.lib.common import Common
from app.models.state import State
from app.models.user import User, Roles, UserLocationUpdate
from app.models.wca.rank import RankAverage, RankSingle

bp = Blueprint('user', __name__)
client = ndb.Client()

# After updating the user's state, write the RankSingle and RankAverage to the
# datastore again to update their states.
def RewriteRanks(wca_person):
  if not wca_person:
    return
  for rank_class in (RankSingle, RankAverage):
    ranks = rank_class.query(rank_class.person == wca_person.key).fetch()
    for rank in ranks:
      # State records will be recomputed tomorrow; for now, just drop the state record.
      rank.is_state_record = False
    ndb.put_multi(ranks)

def error(msg):
  return render_template('error.html', c=Common(), error=msg)

@bp.route('/edit', methods=['GET', 'POST'])
@bp.route('/edit/<user_id>', methods=['GET', 'POST'])
def edit_user(user_id=-1):
  with client.context():
    me = auth.user()
    if not me:
      return redirect('/')
    if user_id == -1:
      user = me
    else:
      user = User.get_by_id(user_id)
    if not user:
      return error('Unrecognized user ID %d' % user_id)
    if not permissions.CanViewUser(user, me):
      return error('You\'re not authorized to view this user.')

    if request.method == 'GET':
      return render_template('edit_user.html',
                             c=Common(),
                             user=user,
                             all_roles=Roles.AllRoles(),
                             editing_location_enabled=permissions.CanEditLocation(user, me),
                             can_view_roles=permissions.CanViewRoles(user, me),
                             editable_roles=permissions.EditableRoles(user, me),
                             successful=request.args.get('successful', 0))

    city = request.form['city']
    state_id = request.form['state']
    if state_id == 'empty':
      state_id = ''

    if request.form['lat'] and request.form['lng']:
      lat = int(request.form['lat'])
      lng = int(request.form['lng'])
    else:
      lat = 0
      lng = 0
    template_dict = {}

    old_state_id = user.state.id() if user.state else ''
    changed_location = user.city != city or old_state_id != state_id
    user_modified = False
    if permissions.CanEditLocation(user, me) and changed_location:
      if city:
        user.city = city
      else:
        del user.city
      if state_id:
        user.state = ndb.Key(State, state_id)
      else:
        del user.state
      if user.wca_person and old_state_id != state_id:
        wca_person = user.wca_person.get()
        if wca_person:
          wca_person.state = user.state
          wca_person.put()
        RewriteRanks(wca_person)
      user.latitude = lat
      user.longitude = lng
      user_modified = True

      if changed_location:
        # Also save the Update.
        update = UserLocationUpdate()
        update.updater = me.key
        if city:
          update.city = city
        update.update_time = datetime.datetime.now()
        if state_id:
          update.state = ndb.Key(State, state_id)
        user.updates.append(update)

    elif changed_location:
      return error('You\'re not authorized to edit user locations.')

    for role in permissions.EditableRoles(user, me):
      if role in request.form and role not in user.roles:
        user.roles.append(role)
        user_modified = True
      elif role not in request.form and role in user.roles:
        user.roles.remove(role)
        user_modified = True

    if user_modified:
      user.put()

    return redirect(request.path + '?successful=1')
