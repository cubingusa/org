from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask import Flask
from app.lib.secrets import get_secret

import google.cloud.logging
import logging
import os
import sys
import datetime

if os.path.exists('.env.dev'):
  load_dotenv('.env.dev')

if os.environ.get('ENV') == 'PROD':
  client = google.cloud.logging.Client()
  client.setup_logging()
else:
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

from app.admin import bp as admin_bp
from app.auth import create_bp as create_auth_bp
from app.cubingusa import bp as cubingusa_bp
from app.nationals import bp as nationals_bp
from app.user import bp as user_bp

app.register_blueprint(admin_bp)
app.register_blueprint(create_auth_bp(oauth))
app.register_blueprint(cubingusa_bp)
app.register_blueprint(nationals_bp)
app.register_blueprint(user_bp)
