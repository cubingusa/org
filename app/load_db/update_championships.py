import collections
import logging
import re

from google.cloud import ndb

from app.models.region import Region
from app.models.state import State
from app.models.championship import Championship
from app.models.wca.competition import Competition


def UpdateChampionships():
  competitions_used = set([championship.competition.id() for championship in Championship.query().iter()])
  championships_used = set([championship.key.id() for championship in Championship.query().iter()])
  states = {state.name : state for state in State.query().iter()}
  regions = {region.championship_name : region for region in Region.query().iter()}

  comp_re = re.compile('(CubingUSA )?(.*) Championship (\d\d\d\d)')
  pbq_re = re.compile('(CubingUSA )?(.*) (PBQ|Quiet|FMC) Championship (\d\d\d\d)')

  to_write = []

  for competition in Competition.query().iter():
    if competition.key.id() in competitions_used:
      continue
    pbq_match = pbq_re.match(competition.name)
    area_name = None
    championship = None
    if 'World' in competition.name and 'Championship' in competition.name:
      championship = Championship(id=Championship.WorldChampionshipId(competition.year))
      championship.is_pbq = False
      championship.competition = competition.key
      to_write += [championship]
      continue
    if pbq_match:
      area_name = pbq_match.group(2)
      is_pbq = True
    else:
      regular_match = comp_re.match(competition.name)
      if regular_match:
        area_name = regular_match.group(2)
        is_pbq = False
    if area_name:
      if area_name in states:
        championship = Championship(id=Championship.StateChampionshipId(competition.year, states[area_name], is_pbq))
        championship.state = states[area_name].key
      elif area_name in regions:
        championship = Championship(id=Championship.RegionalsId(competition.year, regions[area_name], is_pbq))
        championship.region = regions[area_name].key
      else:
        logging.info('Failed to match ' + competition.key.id())
        continue
      championship.is_pbq = is_pbq
      championship.competition = competition.key
      if championship.key.id() not in championships_used:
        logging.info('Assigning championship ' + competition.key.id() + ' ' + championship.key.id())
        to_write += [championship]
    else:
      logging.info('Failed to match ' + competition.key.id())
  ndb.put_multi(to_write)
