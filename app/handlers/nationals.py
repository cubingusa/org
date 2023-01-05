from flask import Blueprint
from flask import render_template
from flask import redirect
from google.cloud import ndb

from app.lib.common import Common
from app.lib import contact

bp = Blueprint('nationals', __name__, url_prefix='/nationals')
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
