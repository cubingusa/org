from flask import Blueprint
from flask import url_for
from flask import redirect

def create_bp(oauth):
  bp = Blueprint('auth', __name__)

  @bp.route('/login')
  def login():
    redirect_uri = url_for('auth.oauth_callback', _external=True)
    return oauth.wca.authorize_redirect(redirect_uri)

  @bp.route('/oauth_callback')
  def oauth_callback():
    token = oauth.wca.authorize_access_token()
    resp = oauth.wca.get('me')
    resp.raise_for_status()
    # TODO: use resp.json["me"] to build a User object, and save ID in session.
    return redirect('/')

  return bp
