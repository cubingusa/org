import datetime

from flask import Blueprint, render_template
from google.cloud import ndb

from app.lib import common
from app.models.championship import Championship
from app.models.region import Region
from app.models.state import State

bp = Blueprint('regional', __name__)
client = ndb.Client()

@bp.route('/regional')
def regional():
  with client.context():
    year = datetime.date.today().year

    championships = Championship.query(ndb.AND(Championship.year == year,
                                               Championship.region != None)).fetch()
    competitions = ndb.get_multi([c.competition for c in championships])

    states = State.query().fetch()
    regions = Region.query().order(Region.name).fetch()

    championships.sort(key=lambda championship: championship.competition.get().start_date)
    championship_regions = [championship.region for championship in championships]
    regions_missing_championships = [
        region for region in regions if region.key not in championship_regions]

    return render_template('regional.html',
                           c=common.Common(wca_disclaimer=True),
                           year=year,
                           championships=championships,
                           regions_missing_championships=regions_missing_championships)

@bp.route('/regional/title_policy')
def title_policy():
  with client.context():
    return render_template('regional_title.html', c=common.Common())
