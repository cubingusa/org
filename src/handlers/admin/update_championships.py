import webapp2

from src.models.championship import Championship
from src.models.wca.competition import Competition

# TODO: make a UI for this.

class UpdateChampionshipsHandler(webapp2.RequestHandler):
  def get(self):
    for comp_id in (
        'US2004',
        'US2006',
        'USOpen2007',
        'USOpen2008',
        'USNationals2009',
        'USNationals2010',
        'USNationals2011',
        'USNationals2012',
        'WC2013',
        'USNationals2014',
        'USNationals2015',
        'USNationals2016',
        'CubingUSANationals2017'):
      comp = Competition.get_by_id(comp_id)
      championship_id = Championship.NationalsId(comp.year)
      championship = Championship.get_by_id(championship_id) or Championship(id=championship_id)
      championship.national_championship = True
      championship.competition = comp.key
      championship.put()
