from google.appengine.ext import ndb

from src.models.scheduling.person import SchedulePerson
from src.models.scheduling.person import SchedulePersonRoles
from src.models.user import User
from src.models.wca.country import Country
from src.models.wca.event import Event
from src.models.wca.person import Person


def PersonToWcif(person):
  output_dict = {}
  output_dict['name'] = person.name
  output_dict['wcaUserId'] = person.user.id()
  if person.wca_person:
    output_dict['wcaId'] = person.wca_person.id()
  output_dict['countryIso2'] = person.country.get().iso2
  output_dict['registration'] = {
      'eventIds': [e.id() for e in person.registered_events],
  }

  # TODO: output assignments.
  return output_dict

def ImportPerson(person_data, competition, out, people, countries):
  if 'name' not in person_data:
    out.errors.append('Person is missing name.')
    return
  for req_field in ['countryIso2', 'email']:
    if req_field not in person_data:
      out.errors.append('%s is missing %s.' % (person_data['name'], req_field))
      return
  if person_data['countryIso2'] not in countries:
    out.errors.append('Unrecognized country %s for %s.' % (
                          person_data['countryIso2'], person_data['name']))
    return
  person_id = SchedulePerson.Id(competition.key.id(), str(person_data['wcaUserId']))
  if person_id in people:
    person = people.pop(person_id)
  else:
    person = SchedulePerson(id=person_id)
  person.competition = competition.key
  person.name = person_data['name']
  person.user = ndb.Key(User, str(person_data['wcaUserId']))
  person.country = ndb.Key(Country, countries[person_data['countryIso2']])
  person.email = person_data['email']
  if 'wcaId' in person_data and person_data['wcaId']:
    person.wca_person = ndb.Key(Person, person_data['wcaId'])
  else:
    person.wca_person = None
  if not person.roles:
    person.roles = []
  if (('delegate' in person_data['roles'] or 'organizer' in person_data['roles']) and
      SchedulePersonRoles.EDITOR not in person.roles):
    person.roles.append(SchedulePersonRoles.EDITOR)
  if ('registration' in person_data and person_data['registration'] and
      person_data['registration']['status'] == 'accepted'):
    person.registered_events = [
        ndb.Key(Event, event_id) for event_id in person_data['registration']['eventIds']]
  else:
    person.registered_events = []

  out.entities_to_put.append(person)
