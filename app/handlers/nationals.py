from flask import Blueprint
from flask import render_template
from flask import redirect
from google.cloud import ndb

from app.lib.common import Common
from app.lib import contact

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

