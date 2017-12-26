from src.scheduling.wcif.extensions import AddExtension

# Writes a ScheduleTimeBlock in WCIF format.  A TimeBlock corresponds to an
# Activity in the WCIF spec.
# https://docs.google.com/document/d/1hnzAZizTH0XyGkSYe-PxFL5xpKVWl_cvSdTzlT_kAs8/edit?ts=5a3fd252#heading=h.a8wx47sshf0x
def TimeBlockToWcif(time_block, groups):
  output_dict = {}
  r = time_block.round.get()
  e = r.event.get()
  output_dict['name'] = '%s %s' % (
      e.name, 'Final' if r.is_final else 'Round %d' % r.number)
  activity_code = '%s-r%d' % (r.event.id(), r.number)
  if time_block.attempt:
    activity_code = '%s-a%d' % (activity_code, time_block.attempt)
  output_dict['activityCode'] = activity_code
  # TODO: include beginning and ending time.
  # TODO: pending completion of WCIF discussion, add groups as child activities.

  extension_dict = {}
  extension_dict['datastoreId'] = time_block.key.id()
  extension_dict['staffOnly'] = time_block.staff_only
  AddExtension('ScheduleTimeBlock', extension_dict, output_dict)

  return output_dict
