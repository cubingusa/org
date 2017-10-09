import webapp2

from src import common
from src.jinja import JINJA_ENVIRONMENT

# A mostly-static handler that renders a given template name.
def BasicHandler(template_path):
  class Handler(webapp2.RequestHandler):
    def get(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      self.response.write(template.render({
          'c': common.Common(),
      }))

  return Handler
