import webapp2

from src.handlers.archive import ArchiveHandler

app = webapp2.WSGIApplication([
  webapp2.Route('/', handler=webapp2.RedirectHandler,
                defaults={'_uri': 'https://cubingusa.org'}),
  webapp2.Route('/index.php', handler=webapp2.RedirectHandler,
                defaults={'_uri': 'https://cubingusa.org'}),
  webapp2.Route('/faq.php', handler=webapp2.RedirectHandler,
                defaults={'_uri': 'https://cubingusa.org/about/contact'}),
  webapp2.Route('/state.php', handler=webapp2.RedirectHandler,
                defaults={'_uri': 'https://cubingusa.org/state_rankings'}),
  webapp2.Route('/credits.php', handler=webapp2.RedirectHandler,
                defaults={'_uri': 'https://cubingusa.org/about/who'}),
  webapp2.Route('/<path:.*>', handler=ArchiveHandler),
])
