import json

# Writes an Event in WCIF format.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.1r8gj6odvsk0
def EventToWcif(event_id, rounds):
  output_dict = {}
  output_dict['id'] = event_id
  output_dict['rounds'] = []
  # The CubingUSA scheduling system does not update any data attached to a Round
  # which is specified in the WCIF standard.  We hold a blob of JSON containing
  # the Round in WCIF format, which we pass through here.
  for r in rounds:
    output_dict['rounds'].append(json.loads(r.wcif))
  # TODO: Include competitor limits.
  # TODO: Include qualification times.

  return output_dict
