import collections
import datetime
import os
import requests

from flask import abort
from flask import Blueprint
from flask import render_template
from flask import redirect
from flask import request
from google.cloud import ndb

from app.lib.common import Common
from app.lib import auth
from app.lib import contact

from app.models.region import Region
from app.models.state import State
from app.models.user import User
from app.models.wca.person import Person
from app.models.wca.rank import RankAverage, RankSingle

bp = Blueprint('nationals', __name__, url_prefix='/nationals')
nac_bp = Blueprint('nac', __name__, url_prefix='/nac')
worlds_bp = Blueprint('worlds', __name__, url_prefix='/worlds')
client = ndb.Client()

events = {
  '333': '3x3x3 Cube',
  '222': '2x2x2 Cube',
  '444': '4x4x4 Cube',
  '555': '5x5x5 Cube',
  '666': '6x6x6 Cube',
  '777': '7x7x7 Cube',
  '333bf': '3x3x3 Blindfolded',
  '333fm': '3x3x3 Fewest Moves',
  '333oh': '3x3x3 One-Handed',
  'clock': 'Clock',
  'minx': 'Megaminx',
  'pyram': 'Pyraminx',
  'skewb': 'Skewb',
  'sq1': 'Square-1',
  '444bf': '4x4x4 Blindfolded',
  '555bf': '5x5x5 Blindfolded',
  '333mbf': '3x3x3 Multi-Blind',
}
@bp.route('/')
def nats():
  with client.context():
    return redirect('/nationals/2023')

@bp.route('/2018')
def nats2018():
  with client.context():
    return render_template('nationals/2018/index.html',
                           c=Common(wca_disclaimer=True))

@bp.route('/2018/contact', methods=['GET', 'POST'])
def nats2018contact():
  with client.context():
    return contact.handle_contact_request('nationals/2018/contact.html',
                                          'Nationals 2018',
                                          'nats-organizers@cubingusa.org')

@bp.route('/2018/events')
def nats2018events():
  with client.context():
    return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2018#competition-events')

@bp.route('/2018/unofficial')
def nats2018unofficial():
  with client.context():
    return render_template('nationals/2018/unofficial.html', c=Common())

@bp.route('/2019')
def nats2019():
  with client.context():
    return render_template('nationals/2019/index.html',
                           c=Common(wca_disclaimer=True))

@bp.route('/2019/contact', methods=['GET', 'POST'])
def nats2019contact():
  with client.context():
    return contact.handle_contact_request('nationals/2019/contact.html',
                                          'Nationals 2019',
                                          'nats-organizers@cubingusa.org')

@bp.route('/2019/events')
def nats2019events():
  with client.context():
    return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2019#competition-events')

@bp.route('/2019/schedule')
def nats2019schedule():
  with client.context():
    return render_template('nationals/2019/schedule.html', c=Common())

@bp.route('/2019/travel')
def nats2019travel():
  with client.context():
    return render_template('nationals/2019/travel.html', c=Common())

@bp.route('/2019/unofficial')
def nats2019unofficial():
  with client.context():
    return render_template('nationals/2019/unofficial.html', c=Common())

@bp.route('/2023')
def nats2023():
  with client.context():
    return render_template('nationals/2023/index.html',
                           c=Common(wca_disclaimer=True))

@bp.route('/2023/contact', methods=['GET', 'POST'])
def nats2023contact():
  with client.context():
    return contact.handle_contact_request('nationals/2023/contact.html',
                                          'Nationals 2023',
                                          'nats-organizers@cubingusa.org')

@bp.route('/2023/events')
def nats2023events():
  with client.context():
    return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2023#competition-events')

@bp.route('/2023/schedule')
def nats2023schedule():
  with client.context():
    return render_template('nationals/2023/schedule.html', c=Common())

@bp.route('/2023/travel')
def nats2023travel():
  with client.context():
    return render_template('nationals/2023/travel.html', c=Common())

@bp.route('/2023/qualifying')
def nats2023qualifying():
  with client.context():
    return render_template('nationals/2023/qualifying.html', c=Common())

@bp.route('/2023/volunteers')
def nats2023volunteers():
  with client.context():
    return render_template('nationals/2023/volunteers.html', c=Common())

@bp.route('/2023/unofficial')
def nats2023unofficial():
  with client.context():
    return render_template('nationals/2023/unofficial.html', c=Common())

@nac_bp.route('/')
def nac():
  with client.context():
    return redirect('/nac/2024')

@nac_bp.route('/2024')
def nac2024():
  with client.context():
    return render_template('nationals/2024/index.html', c=Common())

@nac_bp.route('/2024/contact', methods=['GET', 'POST'])
def nac2024contact():
  with client.context():
    return contact.handle_contact_request('nationals/2024/contact.html',
                                          'NAC 2024',
                                          'nac-organizers@cubingusa.org')

@nac_bp.route('/2024/events')
def nac2024events():
  with client.context():
    return redirect('https://www.worldcubeassociation.org/competitions/NAC2024#competition-events')

@nac_bp.route('/2024/schedule')
def nac2024schedule():
  with client.context():
    return render_template('nationals/2024/schedule.html', c=Common())

@nac_bp.route('/2024/travel')
def nac2024travel():
  with client.context():
    return render_template('nationals/2024/travel.html', c=Common())

@nac_bp.route('/2024/qualifying')
def nac2024qualifying():
  with client.context():
    return render_template('nationals/2024/qualifying.html', c=Common())

@nac_bp.route('/2024/unofficial')
def nac2024unofficial():
  with client.context():
    return render_template('nationals/2024/unofficial.html', c=Common())

@nac_bp.route('/2024/volunteers')
def nac2024volunteers():
  with client.context():
    return render_template('nationals/2024/volunteers.html', c=Common())

@nac_bp.route('/2024/finals_projector/<eventId>')
def nac2024projector(eventId):
  with client.context():
    data = requests.get('https://api.worldcubeassociation.org/competitions/NAC2024/wcif/public')
    if data.status_code != 200:
      abort(data.status_code)
    competition = data.json()
    people_by_id = {person['registrantId'] : (person['name'], person['countryIso2']) for person in competition['persons']}
    next_events = {'666': 'minx',
                   'minx': 'sq1',
                   'sq1': '777',
                   'clock': '555',
                   '555': 'pyram',
                   'pyram': '444',
                   '444': 'skewb',
                   'skewb': '333oh',
                   '333oh': '222',
                   '222': '333bf',
                   '333bf': '333'}
    next_event_id = next_events[eventId] if eventId in next_events else None
    next_event_name = events[next_event_id] if next_event_id else None

    for evt in competition['events']:
      if evt['id'] != eventId:
        continue
      semis = evt['rounds'][-2]['results']
      people = {result['ranking'] : people_by_id[result['personId']] for result in semis if result['ranking'] <= 21}
      if eventId == 'minx':
        finalists = [(i+1, people[i+1][0], people[i+1][1].lower()) for i in range(14)] + [
          (17, people[17][0], people[17][1]),
          (16, people[16][0], people[16][1]),
          (19, people[19][0], people[19][1]),
          (18, people[18][0], people[18][1]),
          (21, people[21][0], people[21][1]),
          (20, people[20][0], people[20][1]),
        ]
      elif eventId == '444':
        finalists = [(i+1, people[i+1][0], people[i+1][1].lower()) for i in range(14)] + [
          (17, people[17][0], people[17][1]),
          (20, people[16][0], people[16][1]),
          (19, people[19][0], people[19][1]),
          (21, people[18][0], people[18][1]),
        ]
      else:
        finalists = [(i+1, people[i+1][0], people[i+1][1].lower()) for i in range(20)]
      return render_template('nationals/2024/finals_projector.html',
                             finalists=list(zip(finalists, finalists[1:]))[0::2],
                             event_id=eventId,
                             next_event_id=next_event_id,
                             event_names=events)
    return '', 404


@worlds_bp.route('/person_states')
def person_states():
  with client.context():
    me = auth.user()
    if not me:
      return redirect('/login')
    wca_host = os.environ.get('WCA_HOST')
    data = requests.get(wca_host + '/api/v0/competitions/WC2025/wcif/public')
    if data.status_code != 200:
      abort(data.status_code)
    competition = data.json()
    authorized = False
    for person in competition['persons']:
      if person['wcaUserId'] != me.key.id() and 'organizer' in person['roles']:
        authorized = True
    if not authorized:
      abort(403)
      return
    regions = list(Region.query().iter())
    person_keys = [ndb.Key(User, str(person['wcaUserId'])) for person in competition['persons']
                   if person['registration'] is not None and
                   person['registration']['status'] == 'accepted']
    users = ndb.get_multi(person_keys)
    state_to_region = {state.key.id(): state.region.id() for state in State.query().iter()}
    times = {}
    for person in competition['persons']:
      for best in person['personalBests']:
        if best['type'] == 'average' and best['eventId'] == '333':
          times[person['wcaUserId']] = best['best']
    people_by_region = collections.defaultdict(list)
    for user in users:
      if not user or not user.state:
        continue
      if int(user.key.id()) in times:
        people_by_region[state_to_region[user.state.id()]] += [(user, times[int(user.key.id())])]
    for region, people in people_by_region.items():
      people.sort(key=lambda person: person[1])
    return render_template('nac_teams.html',
                           c=Common(),
                           regions=regions,
                           people=people_by_region)

@worlds_bp.route('/')
def worlds2025():
  with client.context():
    return render_template('nationals/wc2025/index.html', c=Common(wca_disclaimer=True))

@worlds_bp.route('/policies')
def worlds2025policies():
  with client.context():
    return render_template('nationals/wc2025/policies.html', c=Common())

@worlds_bp.route('/qualification')
def worlds2025qualification():
  with client.context():
    qualifications = [
      {
        '333': 800,
        '222': 200,
        'pyram': 300,
        '444': 3100,
        '333oh': 1300,
        'skewb': 350,
        '555': 5500,
        'minx': 4500,
        'sq1': 1000,
        'clock': 550,
        '666': 9500,
        '777': 14500,
        '333bf': 2200,
        '333fm': 2300,
        '333mbf': 670000000,
        '444bf': 13500,
        '555bf': 36000,
      },
      {
        '333': 1000,
        '222': 300,
        'pyram': 450,
        '444': 3800,
        '333oh': 1700,
        'skewb': 500,
        '555': 7000,
        'minx': 6000,
        'sq1': 1500,
        'clock': 800,
        '666': 12000,
        '777': 18500,
        '333bf': 4500,
        '333fm': 2400,
        '333mbf': 720000000,
        '444bf': 18000,
        '555bf': 48000,
      },
      {
        '333': 1300,
        '222': 400,
        'pyram': 700,
        '444': 5000,
        '333oh': 2300,
        'skewb': 800,
        '555': 8500,
        'minx': 8000,
        'sq1': 2400,
        'clock': 1100,
        '666': 13500,
        '777': 21500,
        '333bf': 7500,
        '333fm': 2600,
        '333mbf': 770000000,
        '444bf': 30000,
        '555bf': 60000,
      },
      {
        '333': 6000,
        '222': 3000,
        'pyram': 3000,
        '444': 6000,
        '333oh': 3000,
        'skewb': 3000,
        '555': 9000,
        'minx': 9000,
        'sq1': 2500,
        'clock': 1300,
        '666': 16000,
        '777': 24000,
        '333bf': 12000,
        '333fm': 'Top 50',
        '333mbf': 'Top 50',
        '444bf': 48000,
        '555bf': 60000,
      },
    ]
    open_times = [
      datetime.datetime.fromisoformat('2024-11-08T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-11-22T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-12-13T06:00-08:00'),
      datetime.datetime.fromisoformat('2025-01-03T06:00-08:00'),
    ]
    close_times = [
      datetime.datetime.fromisoformat('2024-11-17T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-12-06T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-12-27T06:00-08:00'),
      datetime.datetime.fromisoformat('2025-01-10T06:00-08:00'),
    ]
    prs = {}
    person = None
    if auth.logged_in():
      person = auth.user().wca_person
    if person:
      ranks_average = RankAverage.query(RankAverage.person == person).fetch()
      ranks_single = RankSingle.query(RankAverage.person == person).fetch()
      prs = dict({
        r.event.id() : r.best for r in ranks_single if 'bf' in r.event.id()
      }, **{
        r.event.id() : r.best for r in ranks_average if 'bf' not in r.event.id()
      })
    events_by_phase = [list() for q in qualifications]
    maybe_events_by_phase = [list() for q in qualifications]
    all_events = set()
    all_maybe_events = set()
    for i, quals in enumerate(qualifications):
      for e, time in quals.items():
        if e in prs:
          pr = prs[e]
          if type(time) is str:
            maybe_events_by_phase[i].append(e)
            all_maybe_events.add(e)
          elif pr < time:
            events_by_phase[i].append(e)
            all_events.add(e)
    earliest_phase = 0
    for i in range(len(qualifications)):
      if len(maybe_events_by_phase[i]) or len(events_by_phase[i]):
        earliest_phase = i + 1
        break
    return render_template('nationals/wc2025/qualification.html',
                           c=Common(),
                           qualifications=qualifications,
                           events_by_phase=events_by_phase,
                           maybe_events_by_phase=maybe_events_by_phase,
                           all_events=all_events,
                           all_maybe_events=all_maybe_events,
                           earliest_phase=earliest_phase,
                           open_times=open_times,
                           close_times=close_times,
                           prs=prs)

@worlds_bp.route('/schedule')
def worlds2025schedule():
  with client.context():
    return render_template('nationals/wc2025/schedule.html', c=Common())

@worlds_bp.route('/travel')
def worlds2025travel():
  with client.context():
    return render_template('nationals/wc2025/travel.html', c=Common())

@worlds_bp.route('/volunteers')
def worlds2025volunteers():
  with client.context():
    return render_template('nationals/wc2025/volunteers.html', c=Common())

@worlds_bp.route('/contact', methods=['GET', 'POST'])
def worlds2025contact():
  with client.context():
    return contact.handle_contact_request('nationals/wc2025/contact.html',
                                          'Worlds 2025',
                                          'worlds-organizers@cubingusa.org')

@worlds_bp.route('/events')
def worlds2025events():
  with client.context():
    return redirect('https://www.worldcubeassociation.org/competitions/WC2025#competition-events')

@bp.route('/2025')
def nats2025():
  with client.context():
    return render_template('nationals/2025/index.html',
                           c=Common(wca_disclaimer=True))

@bp.route('/2025/contact', methods=['GET', 'POST'])
def nats2025contact():
  with client.context():
    return contact.handle_contact_request('nationals/2025/contact.html',
                                          'Nationals 2025',
                                          'nats-organizers@cubingusa.org')

@bp.route('/2025/schedule')
def nats2025schedule():
  with client.context():
    return render_template('nationals/2025/events.html', c=Common())

@bp.route('/2025/travel')
def nats2025travel():
  with client.context():
    return render_template('nationals/2025/travel.html', c=Common())

@bp.route('/2025/registration')
def nats2025qualifying():
  with client.context():
    return render_template('nationals/2025/registration.html', c=Common())

@bp.route('/2025/volunteers')
def nats2025volunteers():
  with client.context():
    return render_template('nationals/2025/volunteers.html', c=Common())

@bp.route('/2025/spectators')
def nats2025spectators():
  with client.context():
    return render_template('nationals/2025/spectators.html', c=Common())
