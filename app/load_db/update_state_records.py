import collections

from google.cloud import ndb

from app.models.state import State
from app.models.wca.event import Event
from app.models.wca.rank import RankAverage
from app.models.wca.rank import RankSingle


def UpdateStateRecords():
  state_records = []
  for rank_cls in (RankSingle, RankAverage):
    for evt in Event.query().fetch(keys_only=True):
      for state in State.query().fetch(keys_only=True):
        current_time = None
        for rank in (rank_cls.query(ndb.AND(rank_cls.event == evt,
                                           rank_cls.state == state))
                              .order(rank_cls.best).iter()):
          if current_time is None or rank.best == current_time:
            rank.is_state_record = True
            state_records += [rank]
            current_time = rank.best
          else:
            break
  state_record_keys = [obj.key for obj in state_record]
  to_remove = []
  for rank_cls in (RankSingle, RankAverage):
    for record in rank_cls.query(rank_cls.is_state_record == True).iter():
      if record.key not in state_record_keys:
        record.is_state_record = False
        to_remove += [record]
  print('Setting %d state records' % len(state_record_keys))
  print('Removing %d state records')
  ndb.put_multi(state_record_keys)
  ndb.put_multi(to_remove)
