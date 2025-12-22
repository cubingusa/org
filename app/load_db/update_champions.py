import collections
import datetime
import logging
import os

from google.cloud import ndb

from app.models.champion import Champion
from app.models.championship import Championship
from app.models.eligibility import LockedResidency
from app.models.eligibility import RegionalChampionshipEligibility
from app.models.eligibility import StateChampionshipEligibility
from app.models.state import State
from app.models.user import User
from app.models.wca.continent import Continent
from app.models.wca.country import Country
from app.models.wca.event import Event
from app.models.wca.result import Result
from app.models.wca.result import RoundType


def ComputeEligibleCompetitors(championship, competition, results):
  if championship.national_championship:
    # We don't save this in the datastore because it's easy enough to compute.
    return set([r.person.id() for r in results
                if r.person_country == ndb.Key(Country, 'USA')])
  if championship.nac_championship:
    countries = set([key.id() for key in
                     Country.query(Country.continent ==
                                   ndb.Key(Continent, '_North America')).fetch(keys_only=True)])
    return set([r.person.id() for r in results
                if r.person_country in countries])
  if championship.world_championship:
    return set([r.person.id() for r in results])
  competitors = set([r.person for r in results])
  users = User.query(User.wca_person.IN(competitors)).fetch()
  user_keys = [user.key for user in users]

  valid_state_keys = championship.GetEligibleStateKeys()
  residency_deadline = (championship.residency_deadline or
      datetime.datetime.combine(competition.start_date, datetime.time(0, 0, 0)))

  eligible_competitors = set()
  competitors_to_put = []

  class Resolution:
    ELIGIBLE = 0
    INELIGIBLE = 1
    UNRESOLVED = 2

  for user in users:
    resolution = Resolution.UNRESOLVED
    for locked_residency in user.locked_residencies:
      if locked_residency.year != championship.year:
        continue
      if locked_residency.state in valid_state_keys:
        resolution = Resolution.ELIGIBLE
      else:
        resolution = Resolution.INELIGIBLE
    # If the competitor hasn't already used their eligibility, check their state.
    if resolution == Resolution.UNRESOLVED:
      state = None
      for update in user.updates or []:
        if update.update_time < residency_deadline:
          state = update.state
      if not user.updates:
        state = user.state
      if state and state in valid_state_keys:
        # This competitor is eligible, so save this on their User.
        resolution = Resolution.ELIGIBLE
        locked_residency = LockedResidency()
        locked_residency.year = championship.year
        locked_residency.state = state
        user.locked_residencies.append(locked_residency)
        competitors_to_put.append(user)
      else:
        resolution = Resolution.INELIGIBLE
    if resolution == Resolution.ELIGIBLE:
      eligible_competitors.add(user.wca_person.id())
  ndb.put_multi(competitors_to_put)
  return eligible_competitors


def UpdateChampions():
  champions_to_write = []
  champions_to_delete = []
  final_round_keys = set(r.key for r in RoundType.query(RoundType.final == True).iter())
  all_event_keys = set(e.key for e in Event.query().iter())
  championships_already_computed = set()
  for champion in Champion.query().iter():
    championships_already_computed.add(champion.championship.id())
  for championship in Championship.query().iter():
    if not championship.national_championship and os.environ.get('ENV') == 'DEV':
      # Don't try to compute regional champions on dev, since we don't have
      # location data.
      continue
    competition = championship.competition.get()
    # Only recompute champions from the last 2 weeks, in case there are result updates.
    if (championship.key.id() in championships_already_computed and
        datetime.date.today() - competition.end_date > datetime.timedelta(days=14)):
      continue
    if competition.end_date > datetime.date.today():
      continue
    competition_id = championship.competition.id()
    logging.info('Computing champions for %s' % competition_id)
    results = (Result.query(Result.competition == championship.competition)
                     .order(Result.pos).fetch())
    if not results:
      logging.info('Results are not uploaded yet.  Not computing champions yet.')
      continue
    eligible_competitors = ComputeEligibleCompetitors(championship, competition, results)
    champions = collections.defaultdict(list)
    events_held_with_successes = set()
    for result in results:
      if result.best < 0:
        continue
      if result.round_type not in final_round_keys:
        continue
      this_event = result.event
      # For multi blind, we only recognize pre-2009 champions in 333mbo, since
      # that was the multi-blind event held those years.  For clarity in the
      # champions listings, we list those champions as the 333mbf champions for
      # those years.
      if championship.competition.get().year < 2009:
        if result.event.id() == '333mbo':
          this_event = ndb.Key(Event, '333mbf')
        elif result.event.id() == '333mbf':
          continue
      events_held_with_successes.add(this_event)
      if this_event in champions and champions[this_event][0].pos < result.pos:
        continue
      if result.person.id() not in eligible_competitors:
        continue
      champions[this_event].append(result)
      if result.pos > 1 and len(champions) >= len(events_held_with_successes):
        break
    for event_key in all_event_keys:
      champion_id = Champion.Id(championship.key.id(), event_key.id())
      if event_key in champions:
        champion = Champion.get_by_id(champion_id) or Champion(id=champion_id)
        champion.championship = championship.key
        champion.event = event_key
        champion.champions = [c.key for c in champions[event_key]]
        champions_to_write.append(champion)
      else:
        champions_to_delete.append(ndb.Key(Champion, champion_id))
  ndb.put_multi(champions_to_write)
  ndb.delete_multi(champions_to_delete)
