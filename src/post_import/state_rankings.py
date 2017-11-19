from google.appengine.ext import ndb

from src.models.user import User
from src.models.wca.rank import RankAverage
from src.models.wca.rank import RankSingle


# Add a state field to RankSingle and RankAverage, for faster computation of
# state rankings.
def PopulateStateRankings():
  person_id_to_state_key = {}
  for user in User.query().iter():
    if not user.wca_person or not user.state:
      continue
    person_id_to_state_key[user.wca_person.id()] = user.state

  ranks_to_put = []
  for rank_class in [RankAverage, RankSingle]:
    for rank in rank_class.query().iter():
      if rank.person.id() in person_id_to_state_key:
        rank.state = person_id_to_state_key[rank.person.id()]
      else:
        rank.state = None
      ranks_to_put.append(rank)

  ndb.put_multi(ranks_to_put)  
