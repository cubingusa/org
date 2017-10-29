import webapp2

from src import common
from src.jinja import JINJA_ENVIRONMENT

# A mostly-static handler that renders a given template name.
def NationalsHandler(webapp2.RequestHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('nationals.html')
    
  class Handler(webapp2.RequestHandler):
    def get(self):
      template = JINJA_ENVIRONMENT.get_template(template_path)
      self.response.write(template.render({
          'c': common.Common(self.request.url),
      }))

  return Handler
