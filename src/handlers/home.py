import webapp2

from src import common
from src.jinja import JINJA_ENVIRONMENT

class Home(webapp2.RequestHandler):
  def get(self):
    template = JINJA_ENVIRONMENT.get_template('index.html')
    self.response.write(template.render({
        'c': common.Common(),
    }))
