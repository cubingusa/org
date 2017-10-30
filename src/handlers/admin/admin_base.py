from src.handlers.base import BaseHandler

class AdminBaseHandler(BaseHandler):
  def RequireAuth(self):
    return True
