from flask import Blueprint

from app.handlers.admin.edit_championships import bp as edit_championships_bp
from app.handlers.admin.edit_users import bp as edit_users_bp
from app.handlers.admin.states import bp as states_bp

bp = Blueprint('admin', __name__, url_prefix='/admin')
bp.register_blueprint(edit_championships_bp)
bp.register_blueprint(edit_users_bp)
bp.register_blueprint(states_bp)
