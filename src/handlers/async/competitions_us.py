import datetime
import webapp2

from src import common
from src.handlers.base import BaseHandler
from src.models.wca.competition import Competition
from src.jinja import JINJA_ENVIRONMENT

class USCompetitionsHandler(BaseHandler):
  def get(self, year):
    template = JINJA_ENVIRONMENT.get_template('competitions_us_table.html')
    comps = []
    if year == 'upcoming':
      comps = (Competition.query(Competition.end_date >= datetime.date.today())
                          .order(Competition.end_date)
                          .fetch())
    else:
      comps = (Competition.query(Competition.year == int(year))
                          .order(Competition.end_date)
                          .fetch())
    self.response.write(template.render({
        'c': common.Common(self),
        'competitions': comps,
    }))
