from flask import Blueprint
from flask import render_template
from flask import redirect

from app.common.common import Common
from app.lib import contact

bp = Blueprint('nationals', __name__, url_prefix='/nationals')

@bp.route('/')
def nats():
  return redirect('/nationals/2019')

@bp.route('/2018')
def nats2018():
  return render_template('nationals/2018/index.html', c=Common())

@bp.route('/2018/contact', methods=['GET', 'POST'])
def nats2018contact():
  return contact.handle_contact_request('nationals/2018/contact.html',
                                        'Nationals 2018',
                                        'nats-organizers@cubingusa.org')

@bp.route('/2018/events')
def nats2018events():
  return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2018#competition-events')

@bp.route('/2018/schedule')
def nats2018schedule():
  return render_template('nationals/2018/schedule.html', c=Common())

@bp.route('/2018/unofficial')
def nats2018unofficial():
  return render_template('nationals/2018/unofficial.html', c=Common())

@bp.route('/2019')
def nats2019():
  return render_template('nationals/2019/index.html', c=Common())

@bp.route('/2019/contact', methods=['GET', 'POST'])
def nats2019contact():
  return contact.handle_contact_request('nationals/2019/contact.html',
                                        'Nationals 2019',
                                        'tim@cubingusa.org')

@bp.route('/2019/events')
def nats2019events():
  return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2019#competition-events')

@bp.route('/2019/schedule')
def nats2019schedule():
  return render_template('nationals/2019/schedule.html', c=Common())

@bp.route('/2019/travel')
def nats2019travel():
  return render_template('nationals/2019/travel.html', c=Common())

@bp.route('/2019/unofficial')
def nats2019unofficial():
  return render_template('nationals/2019/unofficial.html', c=Common())
