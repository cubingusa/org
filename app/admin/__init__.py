from flask import Blueprint

from app.admin.states import bp as states_bp

bp = Blueprint('admin', __name__, url_prefix='/admin')
bp.register_blueprint(states_bp)
