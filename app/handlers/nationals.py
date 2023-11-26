import datetime

from flask import Blueprint
from flask import render_template
from flask import redirect
from flask import request
from google.cloud import ndb

from app.lib.common import Common
from app.lib import auth
from app.lib import contact
from app.models.wca.person import Person
from app.models.wca.rank import RankAverage, RankSingle

bp = Blueprint('nationals', __name__, url_prefix='/nationals')
nac_bp = Blueprint('nac', __name__, url_prefix='/nac')
worlds_bp = Blueprint('worlds', __name__, url_prefix='/worlds')
client = ndb.Client()

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

@nac_bp.route('/2024/volunteers')
def nac2024volunteers():
  with client.context():
    return render_template('nationals/2024/volunteers.html', c=Common())

@worlds_bp.route('/')
def worlds2025():
  with client.context():
    return render_template('nationals/2025/index.html', c=Common())

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
    # THESE AREN'T REAL DATES
    open_times = [
      datetime.datetime.fromisoformat('2024-09-01T06:00-07:00'),
      datetime.datetime.fromisoformat('2024-09-03T06:00-07:00'),
      datetime.datetime.fromisoformat('2024-09-05T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-09-08T06:00-08:00'),
    ]
    close_times = [
      datetime.datetime.fromisoformat('2024-09-02T06:00-07:00'),
      datetime.datetime.fromisoformat('2024-09-04T06:00-08:00'),
      datetime.datetime.fromisoformat('2024-09-06T06:00-08:00'),
      datetime.datetime.fromisoformat('2025-05-30T06:00-07:00'),
    ]
    prs = {}
    person = None
    if auth.logged_in():
      person = auth.user().wca_person
    if request.args.get('personid'):
      person = ndb.Key(Person, request.args.get('personid'))
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
    return render_template('nationals/2025/qualification.html',
                           c=Common(),
                           qualifications=qualifications,
                           events_by_phase=events_by_phase,
                           maybe_events_by_phase=maybe_events_by_phase,
                           all_events=all_events,
                           all_maybe_events=all_maybe_events,
                           earliest_phase=earliest_phase,
                           open_times=open_times,
                           close_times=close_times)
