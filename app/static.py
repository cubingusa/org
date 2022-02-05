from flask import Blueprint
from flask import render_template
from flask import redirect

from app.common.common import Common

bp = Blueprint('static', __name__)

@bp.route('/')
def root():
  return render_template('index.html', c=Common())

@bp.route('/about')
def about():
  return render_template('about.html', c=Common())

@bp.route('/about/contact')
def contact():
  return render_template('contact.html', c=Common())

@bp.route('/about/who')
def who():
  return render_template('about_who.html', c=Common())

@bp.route('/about/documents')
def documents():
  # TODO set the right folder.
  return redirect('https://drive.google.com')

@bp.route('/about/donations')
def donations():
  return render_template('donations.html', c=Common())

@bp.route('/about/logo')
def logo():
  return render_template('logo.html', c=Common())

@bp.route('/regional')
def regional():
  return render_template('regional.html', c=Common())

@bp.route('/state_rankings')
def state_rankings():
  return render_template('state_rankings.html', c=Common())

@bp.route('/supported')
def supported():
  return render_template('supported.html', c=Common())

@bp.route('/nationals')
def nats():
  return redirect('/nationals/2019')

@bp.route('/nationals/2018')
def nats2018():
  return render_template('nationals/2018/index.html', c=Common())

@bp.route('/nationals/2018/contact')
def nats2018contact():
  return render_template('nationals/2018/contact.html', c=Common())

@bp.route('/nationals/2018/events')
def nats2018events():
  return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2018#competition-events')

@bp.route('/nationals/2018/schedule')
def nats2018schedule():
  return render_template('nationals/2018/schedule.html', c=Common())

@bp.route('/nationals/2018/unofficial')
def nats2018unofficial():
  return render_template('nationals/2018/unofficial.html', c=Common())

@bp.route('/nationals/2019')
def nats2019():
  return render_template('nationals/2019/index.html', c=Common())

@bp.route('/nationals/2019/contact')
def nats2019contact():
  return render_template('nationals/2019/contact.html', c=Common())

@bp.route('/nationals/2019/events')
def nats2019events():
  return redirect('https://www.worldcubeassociation.org/competitions/CubingUSANationals2019#competition-events')

@bp.route('/nationals/2019/schedule')
def nats2019schedule():
  return render_template('nationals/2019/schedule.html', c=Common())

@bp.route('/nationals/2019/travel')
def nats2019travel():
  return render_template('nationals/2019/travel.html', c=Common())

@bp.route('/nationals/2019/unofficial')
def nats2019unofficial():
  return render_template('nationals/2019/unofficial.html', c=Common())


for (route, template) in [
    ('/about', 'about.html'),
    ('/about/who', 'about_who.html'),
    ('/about/donations', 'donations.html'),
    ('/about/logo', 'logo.html'),
    ('/regional', 'regional.html'),
    ('/supported', 'supported.html'),
    ('/nationals/2018', 'nationals/2018/index.html'),
    ('/nationals/2018/contact', 'nationals/2018/contact.html'),
    ('/nationals/2018/events', 'nationals/2018/events.html'),
    ('/nationals/2018/groups', 'nationals/2018/groups.html'),
    ('/nationals/2018/schedule', 'nationals/2018/schedule.html'),
    ('/nationals/2018/unofficial', 'nationals/2018/unofficial.html'),
    ('/nationals/2019', 'nationals/2019/index.html'),
    ('/nationals/2019/contact', 'nationals/2019/contact.html'),
    ('/nationals/2019/events', 'nationals/2019/events.html'),
    ('/nationals/2019/groups', 'nationals/2019/groups.html'),
    ('/nationals/2019/schedule', 'nationals/2019/schedule.html'),
    ('/nationals/2019/travel', 'nationals/2019/travel.html'),
    ('/nationals/2019/unofficial', 'nationals/2019/unofficial.html')]:
  routing_fn = lambda: render_template(template, c=Common())
  routing_fn.__name__ = route
  bp.add_url_rule(route, view_func=routing_fn)
