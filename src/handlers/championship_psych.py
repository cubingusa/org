import datetime

from google.appengine.ext import ndb

from src import common
from src import timezones
from src.handlers.base import BaseHandler
from src.jinja import JINJA_ENVIRONMENT
from src.models.championship import Championship
from src.models.scheduling.competition import ScheduleCompetition
from src.models.scheduling.person import SchedulePerson
from src.models.state import State


class ChampionshipPsychHandler(BaseHandler):
  def get(self, region_or_state, year):
    # We should call RegionalsId or StateChampionshipId here, but we don't know
    # yet what kind of championship this is.
    championship_id = '%s_%s' % (region_or_state, year)

    championship = Championship.get_by_id(championship_id)
    if not championship:
      template = JINJA_ENVIRONMENT.get_template('error.html')
      self.response.write(template.render({
          'c': common.Common(self),
          'error': 'Sorry!  We don\'t know about that championship yet.',
      }))
      return

    event_keys = set()
    # This query is ugly because we have two separate representations of
    # competitions in the datastore: ScheduleCompetition (competitions using the
    # scheduling system) and Competition (competitions from the WCA DB export).
    for competitor in SchedulePerson.query(
                          SchedulePerson.competition ==
                          ndb.Key(ScheduleCompetition, championship.competition.id())).iter():
      for event in competitor.registered_events:
        event_keys.add(event)
    events = sorted(ndb.get_multi(event_keys), key=lambda e: e.rank)
    deadline = timezones.ToLocalizedTime(championship.residency_deadline,
                                         championship.residency_timezone)

    states = ndb.get_multi(championship.GetEligibleStateKeys())
    if championship.region:
      championship_title = championship.region.get().championship_name
      state_names = [state.name for state in State.query(State.region == championship.region).iter()]
      state_list = ' and '.join([', '.join(state_names[:-1]), state_names[-1]])
    elif championship.state:
      championship_title = championship.state.get().name + ' State'
      state_list = championship.state.get().name

    template = JINJA_ENVIRONMENT.get_template('championship_psych.html')
    self.response.write(template.render({
        'c': common.Common(self),
        'championship': championship,
        'competition': championship.competition.get(),
        'championship_title': championship_title,
        'state_list': state_list,
        'events': events,
        'deadline': deadline,
        'deadline_passed': championship.residency_deadline < datetime.datetime.now(),
    }))

  def IncludeWcaDisclaimer(self):
    return True
