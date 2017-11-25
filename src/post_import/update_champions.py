import collections
import logging

from google.appengine.ext import ndb

from src.models.champion import Champion
from src.models.championship import Championship
from src.models.user import User
from src.models.wca.country import Country
from src.models.wca.event import Event
from src.models.wca.result import Result
from src.models.wca.result import RoundType


def IsEligible(result, championship):
  if championship.national_championship:
    return result.person_country == ndb.Key(Country, 'USA')
  else:
    # TODO: people can move.  Look at the time when the championship was held.
    user = User.query(wca_person == result.person).fetch()
    if not user:
      return False
    if championship.region:
      return user.state.get().region == championship.region
    else:
      return user.state == championship.state


def UpdateChampions():
  all_championships = [c for c in Championship.query().iter()]
  champions_to_write = []
  champions_to_delete = []
  final_round_keys = set(r.key for r in RoundType.query(RoundType.final == True).iter())
  all_event_keys = set(e.key for e in Event.query().iter())
  for championship in all_championships:
    competition_id = championship.competition.id()
    logging.info('Computing champions for %s' % competition_id)
    champions = collections.defaultdict(list)
    events_held_with_successes = set()
    for result in (Result.query(Result.competition == championship.competition)
                         .order(Result.pos).iter()):
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
      if not IsEligible(result, championship):
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
