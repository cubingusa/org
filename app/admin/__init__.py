from flask import Blueprint

bp = Blueprint('admin', __name__, url_prefix='/admin')

from app.admin.states import bp as states_bp

bp.register_blueprint(states_bp)
