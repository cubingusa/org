from flask import Blueprint

from app.admin.edit_users import bp as edit_users_bp
from app.admin.states import bp as states_bp

bp = Blueprint('admin', __name__, url_prefix='/admin')
bp.register_blueprint(edit_users_bp)
bp.register_blueprint(states_bp)
