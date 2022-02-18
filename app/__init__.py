from dotenv import load_dotenv
from flask import Flask
import google.cloud.logging
import logging
import os
import sys

env_file = os.environ.get('ENV_FILE') or '.env'
if not os.path.exists(env_file):
  raise FileNotFoundError('Could not find environment file ' + env_file)

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
load_dotenv(env_file)

from app.cubingusa import bp as cubingusa_bp
from app.nationals import bp as nationals_bp

app.register_blueprint(cubingusa_bp)
app.register_blueprint(nationals_bp)
