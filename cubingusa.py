import webapp2

from src import handlers

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=handlers.Home, name='home'),
])
