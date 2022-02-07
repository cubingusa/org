from flask import Blueprint
from flask import render_template
from flask import redirect

from app.lib import contact
from app.common.common import Common

bp = Blueprint('cubingusa', __name__)

@bp.route('/')
def root():
  return render_template('index.html', c=Common())

@bp.route('/about')
def about():
  return render_template('about.html', c=Common())

@bp.route('/about/contact', methods=['GET', 'POST'])
def contact_handler():
  return contact.handle_contact_request('contact.html', 'CubingUSA Contact Form', 'info@cubingusa.org')

@bp.route('/about/who')
def who():
  return render_template('about_who.html', c=Common())

@bp.route('/about/documents')
def documents():
  return redirect('https://drive.google.com/drive/folders/1UI3peKEn24pBP8CcVZp9KDQTyeNEB7xy?usp=sharing')

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
