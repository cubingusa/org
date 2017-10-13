import datetime
import webapp2

from src import common
from src import competitions
from src.jinja import JINJA_ENVIRONMENT

class USCompetitionsHandler(webapp2.RequestHandler):
  def get(self, year='upcoming'):
    template = JINJA_ENVIRONMENT.get_template('competitions_us.html')
    comps = []
    if year in competitions.competitions:
      comps = competitions.competitions[year]
    self.response.write(template.render({
        'c': common.Common(self.request.url),
        'competitions': comps,
    }))
