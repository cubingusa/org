from dotenv import load_dotenv
from flask import Flask
import google.cloud.logging
import logging
import os
import sys

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

from app.cubingusa import bp as cubingusa_bp
from app.nationals import bp as nationals_bp

app.register_blueprint(cubingusa_bp)
app.register_blueprint(nationals_bp)
