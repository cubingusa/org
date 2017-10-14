import webapp2

from src import handlers

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=handlers.BasicHandler('index.html'), name='home'),
  webapp2.Route('/competitions/us', handler=handlers.BasicHandler('index.html'), name='competitions_us'),
  webapp2.Route('/nationals', handler=handlers.BasicHandler('nationals.html'), name='competitions_nationals'),
  webapp2.Route('/regional', handler=handlers.BasicHandler('index.html'), name='competitions_regional'),
  webapp2.Route('/organizers', handler=handlers.BasicHandler('index.html'), name='organizers'),
  webapp2.Route('/about', handler=handlers.BasicHandler('about.html'), name='about'),
  webapp2.Route('/about/why', handler=handlers.BasicHandler('index.html'), name='about_why'),
  webapp2.Route('/about/who', handler=handlers.BasicHandler('about_who.html'), name='about_who'),
  webapp2.Route('/about/donations', handler=handlers.BasicHandler('donations.html'), name='about_donations'),
  webapp2.Route('/contact', handler=handlers.BasicHandler('index.html'), name='contact'),
])
