import datetime
import os
import logging
import requests

from flask import Blueprint, render_template, abort
from google.cloud import ndb

from app.lib import common
from app.models.championship import Championship
from app.models.region import Region
from app.models.state import State
from app.models.user import User

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
    all_championships = Championship.query(Championship.region != None).fetch()
    all_championship_years = sorted(set([championship.year for championship in all_championships
                                         if championship.year <= year]), reverse=True)
    regions_for_dropdown = sorted([(region.key.id(), region.name) for region in regions
                                   if not region.obsolete],
                                  key=lambda x: x[1])

    championships = {championship.region.id() : championship
                     for championship in championships if not championship.is_pbq}
    championship_regions = [championship.region for championship in championships]
    unannounced_championships = [
      ('nw', 'Northwest', 'Lynwood, Washington', 'April 5 - 7'),
      ('hl', 'Heartland', 'Sioux Falls, South Dakota', 'June 7 - 9'),
      ('ro', 'Rocky Mountain', 'Provo, Utah', 'June 20 - 22'),
      ('se', 'Southeast', 'Spartanburg, South Carolina', 'June 28 - 30'),
      ('w', 'Western', 'San Diego, California', 'August 2 - 4'),
      ('s', 'Southern', 'Oklahoma City, Oklahoma', 'August 2 - 4'),
      ('nwe', 'New England', 'Worcester, Massachusetts', 'August 16 - 18'),
      ('gl', 'Great Lakes', 'Louisville, Kentucky', 'October 4 - 6'),
      ('mda', 'Mid-Atlantic', 'Richmond, Virginia', 'October 11 - 14'),
    ]

    return render_template('regional.html',
                           c=common.Common(wca_disclaimer=True),
                           year=year,
                           championship_years=all_championship_years,
                           championships=championships,
                           unannounced_championships=unannounced_championships,
                           championship_regions=regions_for_dropdown)

@bp.route('/state_championships')
def state():
  with client.context():
    year = datetime.date.today().year

    championships = Championship.query(ndb.AND(Championship.year == year,
                                               Championship.state != None)).fetch()
    competitions = ndb.get_multi([c.competition for c in championships])

    states = State.query().fetch()
    all_championships = Championship.query(Championship.state != None).fetch()
    all_championship_years = sorted(set([championship.year for championship in all_championships
                                         if championship.year <= year]), reverse=True)
    championship_states = sorted(set([(championship.state.id(), championship.state.get().name)
                                      for championship in all_championships]),
                                 key=lambda x: x[1])

    championships.sort(key=lambda championship: championship.state.get().name)

    return render_template('state_championships.html',
                           c=common.Common(wca_disclaimer=True),
                           year=year,
                           championship_years=all_championship_years,
                           championships=championships,
                           championship_states=championship_states)

@bp.route('/regional/title_policy')
def title_policy():
  with client.context():
    return render_template('regional_title.html', c=common.Common())

@bp.route('/regional/eligibility/<region>/<year>')
def regional_eligibility(region, year):
  with client.context():
    championship = Championship.get_by_id('%s_%d' % (region, int(year)))
    #if not championship:
    #  abort(404)
    #competition_id = championship.competition.id()
    competition_id = 'CubingUSANationals2023'
    wca_host = os.environ.get('WCA_HOST')
    data = requests.get(wca_host + '/api/v0/competitions/' + competition_id + '/wcif/public')
    if data.status_code != 200:
      abort(data.status_code)
    competition = data.json()
    person_keys = [ndb.Key(User, str(person['wcaUserId'])) for person in competition['persons']]
    users = ndb.get_multi(person_keys)
    if championship.region:
      region = championship.region.get()
      eligible_states = [key.id() for key in State.query(State.region == region.key).fetch(keys_only=True)]
    elif championship.state:
      eligible_states = [championship.state.id()]
    logging.info(eligible_states)
    logging.info(person_keys)
    logging.info(users)
    eligible_users = [user for user in users if user and user.state and (user.state.id() in eligible_states)]
    ineligible_users = [user for user in users if user and user.state and (user.state.id() not in eligible_states)]
    logging.info(eligible_users)
    logging.info(ineligible_users)
    return render_template('regional_eligibility.html',
                           c=common.Common(),
                           eligible_users=eligible_users,
                           ineligible_users=ineligible_users,
                           competition=competition)
