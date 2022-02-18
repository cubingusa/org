from dotenv import load_dotenv
from flask import Flask
import os

env_file = os.environ.get('ENV_PATH') or '.env'
if not os.path.exists(env_file):
  raise FileNotFoundError('Could not find environment file ' + env_file)

app = Flask(__name__)
load_dotenv(os.environ.get('ENV_PATH') or '.env')

from app.cubingusa import bp as cubingusa_bp
from app.nationals import bp as nationals_bp

app.register_blueprint(cubingusa_bp)
app.register_blueprint(nationals_bp)
