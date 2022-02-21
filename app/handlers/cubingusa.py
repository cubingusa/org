from flask import Blueprint
from flask import render_template
from flask import redirect
from google.cloud import ndb

from app.lib import contact
from app.lib.common import Common

bp = Blueprint('cubingusa', __name__)
client = ndb.Client()

@bp.route('/')
def root():
  with client.context():
    return render_template('index.html', c=Common())

@bp.route('/about')
def about():
  with client.context():
    return render_template('about.html', c=Common())

@bp.route('/about/contact', methods=['GET', 'POST'])
def contact_handler():
  with client.context():
    return contact.handle_contact_request('contact.html', 'CubingUSA Contact Form', 'info@cubingusa.org')

@bp.route('/about/who')
def who():
  with client.context():
    return render_template('about_who.html', c=Common())

@bp.route('/about/documents')
def documents():
  with client.context():
    return redirect('https://drive.google.com/drive/folders/1UI3peKEn24pBP8CcVZp9KDQTyeNEB7xy?usp=sharing')

@bp.route('/about/donations')
def donations():
  with client.context():
    return render_template('donations.html', c=Common())

@bp.route('/about/logo')
def logo():
  with client.context():
    return render_template('logo.html', c=Common())

@bp.route('/regional')
def regional():
  with client.context():
    return render_template('regional.html', c=Common())

@bp.route('/state_rankings')
def state_rankings():
  with client.context():
    return render_template('state_rankings.html', c=Common())

@bp.route('/supported')
def supported():
    return render_template('supported.html', c=Common())
