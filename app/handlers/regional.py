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
from app.models.wca.person import Person

bp = Blueprint('regional', __name__)
client = ndb.Client()

@bp.route('/regional')
def regional():
  with client.context():
    year = 2025

    championships_list = Championship.query(ndb.AND(Championship.year == year,
                                               Championship.region != None)).fetch()
    competitions = ndb.get_multi([c.competition for c in championships_list])

    states = State.query().fetch()
    regions = Region.query().order(Region.name).fetch()
    all_championships = Championship.query(Championship.region != None).fetch()
    all_championship_years = sorted(set([championship.year for championship in all_championships
                                         if championship.year <= year]), reverse=True)
    regions_for_dropdown = sorted([(region.key.id(), region.name) for region in regions
                                   if not region.obsolete],
                                  key=lambda x: x[1])

    championships = [championship for championship in
                     sorted(championships_list, key=lambda c: c.competition.get().start_date)
                     if not championship.is_pbq]
    pbq_championships = {championship.region.id() : championship
                         for championship in championships_list if championship.is_pbq}
    championship_regions = [championship.region for championship in championships]

    return render_template('regional.html',
                           c=common.Common(wca_disclaimer=True),
                           year=year,
                           championship_years=all_championship_years,
                           championships=championships,
                           pbq_championships=pbq_championships,
                           championship_regions=regions_for_dropdown)

@bp.route('/state_championships')
def state():
  with client.context():
    year = datetime.date.today().year

    championships = Championship.query(ndb.AND(Championship.year == year,
                                               Championship.state != None)).fetch()
    pbq_championships = {championship.state.id() : championship
                         for championship in championships if championship.is_pbq}
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
                           pbq_championships=pbq_championships,
                           championship_states=championship_states)

@bp.route('/regional/title_policy')
def title_policy():
  with client.context():
    return render_template('regional_title.html', c=common.Common())

@bp.route('/regional/eligibility/<region>/<year>/pbq', defaults={'pbq': True})
@bp.route('/regional/eligibility/<region>/<year>', defaults={'pbq': False})
def regional_eligibility(region, year, pbq):
  with client.context():
    championship = Championship.get_by_id('%s_%d%s' % (region, int(year), '_pbq' if pbq else ''))
    competition_id = championship.competition.id()
    competition_model = championship.competition.get()
    wca_host = os.environ.get('WCA_HOST')
    data = requests.get(wca_host + '/api/v0/competitions/' + competition_id + '/wcif/public')
    if data.status_code != 200:
      abort(data.status_code)
    competition = data.json()
    person_keys = [ndb.Key(User, str(person['wcaUserId']))
                   for person in competition['persons']
                   if person['registration'] and person['registration']['status'] == 'accepted']
    users = ndb.get_multi(person_keys)
    if championship.region:
      region = championship.region.get()
      eligible_states = [key.id() for key in State.query(State.region == region.key).fetch(keys_only=True)]
    elif championship.state:
      eligible_states = [championship.state.id()]
    residency_deadline = (championship.residency_deadline or
      datetime.datetime.combine(competition_model.start_date, datetime.time(0, 0, 0)))

    eligible_users = []
    ineligible_users = []

    for user in users:
      if not user:
        continue
      locked_state = None
      for locked_residency in user.locked_residencies:
        if locked_residency.year == year:
          locked_state = locked_residency.state
      if locked_state:
        if locked_state.id() in eligible_states:
          eligible_users += [{'user': user, 'state': locked_state}]
        else:
          ineligible_users += [{'user': user, 'state': locked_state}]
        continue
      current_state = None
      for update in user.updates or []:
        if update.update_time < residency_deadline:
          current_state = update.state
      if not user.updates:
        current_state = user.state
      if current_state and current_state.id() in eligible_states:
        eligible_users += [{'user': user, 'state': current_state}]
      else:
        ineligible_users += [{'user': user, 'state': current_state}]

    for user, person in zip(users, competition['persons']):
      if user is None:
        new_user = User()
        new_user.name = person['name']
        if person['wcaId']:
          new_user.wca_person = ndb.Key(Person, person['wcaId'])
        ineligible_users += [{'user': new_user, 'state': None}]
    eligible_users.sort(key=lambda u: u['user'].name if u['user'].wca_person is None else u['user'].wca_person.get().name)
    ineligible_users.sort(key=lambda u: u['user'].name if u['user'].wca_person is None else u['user'].wca_person.get().name)
    return render_template('regional_eligibility.html',
                           c=common.Common(),
                           eligible_users=eligible_users,
                           ineligible_users=ineligible_users,
                           competition=competition)
