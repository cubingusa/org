import webapp2

from src import handlers

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=handlers.BasicHandler('index.html'), name='home'),
])
