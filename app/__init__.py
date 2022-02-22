import datetime
import logging
import os
import sys

from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask import Flask
import google.cloud.logging

from app.lib.secrets import get_secret

if os.path.exists('.env.dev'):
  load_dotenv('.env.dev')

if os.environ.get('ENV') == 'PROD':
  client = google.cloud.logging.Client()
  client.setup_logging()
elif os.environ.get('ENV') == 'DEV' and 'gunicorn' in sys.argv[0]:
  logger = logging.getLogger()
  logger.setLevel(logging.DEBUG)
  handler = logging.StreamHandler(sys.stdout)
  formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s')
  handler.setFormatter(formatter)
  logger.addHandler(handler)


app = Flask(__name__)
app.secret_key = get_secret('SESSION_SECRET_KEY')
app.permanent_session_lifetime = datetime.timedelta(days=7)

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
    client_kwargs={'scope': 'public email'},
)

from app.handlers.admin import bp as admin_bp
from app.handlers.auth import create_bp as create_auth_bp
from app.handlers.champions_table import bp as champions_table_bp
from app.handlers.nationals import bp as nationals_bp
from app.handlers.regional import bp as regional_bp
from app.handlers.state_rankings import bp as state_rankings_bp
from app.handlers.static import bp as static_bp
from app.handlers.user import bp as user_bp

app.register_blueprint(admin_bp)
app.register_blueprint(create_auth_bp(oauth))
app.register_blueprint(champions_table_bp)
app.register_blueprint(nationals_bp)
app.register_blueprint(regional_bp)
app.register_blueprint(state_rankings_bp)
app.register_blueprint(static_bp)
app.register_blueprint(user_bp)
