from dotenv import load_dotenv
from flask import Flask

app = Flask(__name__)
load_dotenv()

from app.cubingusa import bp as cubingusa_bp
from app.nationals import bp as nationals_bp

app.register_blueprint(cubingusa_bp)
app.register_blueprint(nationals_bp)
