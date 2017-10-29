import datetime
import webapp2

from src import common
from src.models.wca.competition import Competition
from src.jinja import JINJA_ENVIRONMENT

class USCompetitionsHandler(webapp2.RequestHandler):
  def get(self, year='upcoming'):
    template = JINJA_ENVIRONMENT.get_template('competitions_us.html')
    comps = []
    if year == 'upcoming':
      comps = Competition.query(Competition.start_date > datetime.date.today()).iter()
    else:
      comps = Competiiton.query(Competition.year == int(year)).iter()
    self.response.write(template.render({
        'c': common.Common(self.request.url),
        'competitions': comps,
    }))
