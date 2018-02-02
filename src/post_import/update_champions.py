import collections
import datetime
import logging
import pytz

from google.appengine.ext import ndb

from src.models.champion import Champion
from src.models.championship import Championship
from src.models.eligibility import RegionalChampionshipEligibility
from src.models.eligibility import StateChampionshipEligibility
from src.models.state import State
from src.models.user import User
from src.models.wca.country import Country
from src.models.wca.event import Event
from src.models.wca.result import Result
from src.models.wca.result import RoundType


def ComputeEligibleCompetitors(championship, competition, results):
  if championship.national_championship:
    # We don't save this in the datastore because it's easy enough to compute.
    return set([r.person.id() for r in results
                if r.person_country == ndb.Key(Country, 'USA')])
  competitors = set([r.person for r in results])
  users = User.query(User.wca_person.IN(competitors)).fetch()
  user_keys = [user.key for user in users]

  # Load the saved eligibilities, so that one person can't be eligible for two
  # championships of the same type.
  if championship.region:
    eligibility_class = RegionalChampionshipEligibility
    eligibilities = RegionalChampionshipEligibility.query(
                        ndb.AND(RegionalChampionshipEligibility.user.IN(user_keys),
                                RegionalChampionshipEligibility.year ==
                                competition.year)).fetch()
    matches = lambda eligibility: eligibility.region == championship.region
    valid_state_keys = (State.query(State.region == championship.region)
                             .fetch(keys_only=True))
  else:
    eligibility_class = StateChampionshipEligibility
    eligibilities = StateChampionshipEligibility.query(
                        ndb.AND(StateChampionshipEligibility.user.IN(user_keys),
                                StateChampionshipEligibility.year ==
                                competition.year)).fetch()
    matches = lambda eligibility: eligibility.state == championship.state
    valid_state_keys = [championship.state]

  eligibilities_by_user = {eligibility.user.id() : eligibility
                           for eligibility in eligibilities}

  # Here we don't know the competition timezone, so use 9:00 AM in New York.
  # TODO: can we figure out what time zone a competition is being held in?
  location_update_deadline = (datetime.datetime.combine(
      competition.start_date, datetime.time(9, 0, 0)))

  eligible_competitors = set()
  eligibilities = []

  for user in users:
    if user.key.id() in eligibilities_by_user:
      eligibility = eligibilities_by_user[user.key.id()]
      # If this competitor was already eligible for a championship this year,
      # they can't also be eligible for this one.
      if matches(eligibility):
        eligible_competitors.add(user.wca_person.id())
    # Next, check if the person has a state, and that state is eligible to win
    # this championship.
    state = None
    for update in user.updates:
      if update.update_time < location_update_deadline:
        state = update.state
    if state and state in valid_state_keys:
      eligible_competitors.add(user.wca_person.id())
      eligibility_id = eligibility_class.Id(user.key.id(), competition.year)
      eligibility = (eligibility_class.get_by_id(eligibility_id) or
                     eligibility_class(id=eligibility_id))
      eligibility.user = user.key
      eligibility.year = competition.year
      if championship.region:
        eligibility.region = championship.region
      else:
        eligibility.state = championship.state
      eligibilities.append(eligibility)
  ndb.put_multi(eligibilities)
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
