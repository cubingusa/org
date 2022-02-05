from dotenv import load_dotenv
from flask import Flask

app = Flask(__name__)
load_dotenv()

from app.static import bp as static_bp

app.register_blueprint(static_bp)
