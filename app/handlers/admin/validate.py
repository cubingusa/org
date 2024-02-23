from flask import abort, Blueprint, request
import datetime
from google.cloud import ndb

from app.lib import auth
from app.models.wca.export import get_latest_export

bp = Blueprint('validate', __name__)
client = ndb.Client()

@bp.route('/recent_export')
def update_states():
  with client.context():
    if 'days' in request.args:
      days = int(request.args.get('days'))
    else:
      days = 4
    latest = get_latest_export()
    date_part = latest.split('_')[-1][:8]
    ts = datetime.datetime.strptime(date_part, '%Y%m%d')

    if datetime.datetime.now() - ts > datetime.timedelta(days=days):
      return latest, 500
    return latest, 200
