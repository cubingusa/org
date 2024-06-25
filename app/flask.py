import datetime
import os

from authlib.integrations.flask_client import OAuth
from flask import Flask, redirect, request

from app.lib.secrets import get_secret
from app.cache import cache

app = Flask(__name__)
app.secret_key = get_secret('SESSION_SECRET_KEY')
app.permanent_session_lifetime = datetime.timedelta(days=7)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 300

@app.before_request
def before_request():
  if os.environ.get('ENV') == 'PROD' and not request.is_secure:
    url = request.url.replace('http://', 'https://', 1)
    code = 301
    return redirect(url, code=code)

wca_host = os.environ.get('WCA_HOST')
oauth = OAuth(app)
oauth.register(
    name='wca',
    client_id=get_secret('WCA_CLIENT_ID'),
    client_secret=get_secret('WCA_CLIENT_SECRET'),
    access_token_url=wca_host + '/oauth/token',
    access_token_params=None,
    authorize_url=wca_host + '/oauth/authorize',
    authorize_params=None,
    api_base_url=wca_host + '/api/v0/',
    client_kwargs={'scope': 'public email dob'},
)

cache_config = {
  "CACHE_TYPE": "SimpleCache",
  "CACHE_DEFAULT_TIMEOUT": 300,
}
app.config.from_mapping(cache_config)
cache.init_app(app)

from app.handlers.admin import bp as admin_bp
from app.handlers.auth import create_bp as create_auth_bp
from app.handlers.champions_table import bp as champions_table_bp
from app.handlers.nationals import bp as nationals_bp
from app.handlers.nationals import nac_bp
from app.handlers.nationals import worlds_bp
from app.handlers.regional import bp as regional_bp
from app.handlers.state_rankings import bp as state_rankings_bp
from app.handlers.staff_application import bp as staff_application_bp
from app.handlers.static import bp as static_bp
from app.handlers.status import bp as status_bp
from app.handlers.user import bp as user_bp

app.register_blueprint(admin_bp)
app.register_blueprint(create_auth_bp(oauth))
app.register_blueprint(champions_table_bp)
app.register_blueprint(nac_bp)
app.register_blueprint(nationals_bp)
app.register_blueprint(worlds_bp)
app.register_blueprint(regional_bp)
app.register_blueprint(staff_application_bp)
app.register_blueprint(state_rankings_bp)
app.register_blueprint(static_bp)
app.register_blueprint(status_bp)
app.register_blueprint(user_bp)
