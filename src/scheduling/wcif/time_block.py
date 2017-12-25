# Writes a ScheduleTimeBlock in WCIF format.  A TimeBlock corresponds to an
# Activity in the WCIF spec.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.a8wx47sshf0x
def TimeBlockToWcif(time_block, groups):
  output_dict = {}
  r = time_block.round.get()
  e = r.event.get()
  output_dict['name'] = '%s %s' % (
      e.name, 'Final' if r.is_final else 'Round %d' % r.number)
  # TODO: support activities with more than one attempt.
  output_dict['activityCode'] = '%s-r%d' % (r.event.id(), r.number)
  # TODO: include beginning and ending time.
  # TODO: pending completion of WCIF discussion, add groups as child activities.

  return output_dict
