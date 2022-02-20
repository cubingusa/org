from google.cloud import ndb

from app.models.region import Region

# Cache mapping of state names.
states_by_name = {}

client = ndb.Client()

class State(ndb.Model):
  name = ndb.StringProperty()
  region = ndb.KeyProperty(kind=Region)
  is_state = ndb.BooleanProperty()

  @staticmethod
  def get_state(state_name):
    global states_by_name
    if state_name in states_by_name:
      return states_by_name[state_name]
    with client.context():
      # Check if this is the state ID (two-letter abbreviation)
      maybe_state = State.get_by_id(state_name.replace('.', '').replace(' ', '').lower())
      if not maybe_state:
        # Or maybe it's the name.
        maybe_state = State.query(State.name == state_name).get()
      if maybe_state:
        states_by_name[state_name] = maybe_state
      return maybe_state
