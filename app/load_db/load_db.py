import csv

from absl import app
from absl import flags
from absl import logging
from google.cloud import ndb

from app.load_db.update_champions import UpdateChampions
from app.models.user import User
from app.models.wca.competition import Competition
from app.models.wca.continent import Continent
from app.models.wca.country import Country
from app.models.wca.event import Event
from app.models.wca.export import set_latest_export
from app.models.wca.format import Format
from app.models.wca.person import Person
from app.models.wca.rank import RankAverage
from app.models.wca.rank import RankSingle
from app.models.wca.result import Result
from app.models.wca.round import RoundType


FLAGS = flags.FLAGS

flags.DEFINE_string('old_export_id', '', 'ID of the old export.')
flags.DEFINE_string('new_export_id', '', 'ID of the new export.')
flags.DEFINE_string('export_base', '', 'Base directory of exports.')

def get_tables():
  return [('Continents', Continent),
          ('Countries', Country),
          ('Events', Event),
          ('Formats', Format),
          ('RoundTypes', RoundType),
          ('Persons', Person),
          ('RanksSingle', RankSingle),
          ('RanksAverage', RankAverage),
          ('Competitions', Competition),
          ('Results', Result),
         ]


# Ideally this would live in person.py, but that would be a circular dependency
# between Person and User.
def get_modifier(table):
  if table == 'Persons':
    id_to_state = {}
    for user in User.query(User.state != None):
      if user.wca_person:
        id_to_state[user.wca_person.id()] = user.state

      def modify(person):
        if person.key.id() in id_to_state:
          person.state = id_to_state[person.key.id()]
      return modify
  return None


def read_table(path, cls, apply_filter):
  filter_fn = lambda row: True
  if apply_filter:
    filter_fn = cls.Filter()
  out = {}
  try:
    with open(path) as csvfile:
      reader = csv.DictReader(csvfile, dialect='excel-tab')
      for row in reader:
        if filter_fn(row):
          fields_to_write = cls.ColumnsUsed()
          if 'id' in row:
            fields_to_write += ['id']
          to_write = {}
          for field in fields_to_write:
            if field in row:
              to_write[field] = row[field]
          out[cls.GetId(row)] = to_write
  except:
    # This is fine, the file might just not exist.
    pass
  return out


def write_table(path, rows, cls):
  use_id = False
  with open(path, 'r') as csvfile:
    reader = csv.DictReader(csvfile, dialect='excel-tab')
    use_id = 'id' in reader.fieldnames
  with open(path, 'w') as csvfile:
    fields_to_write = cls.ColumnsUsed()
    if use_id:
      fields_to_write += ['id']
    writer = csv.DictWriter(csvfile, dialect='excel-tab', fieldnames=fields_to_write)
    writer.writeheader()
    for row in rows.items():
      writer.writerow({k: v for k, v in row[1].items() if k in fields_to_write})


def process_export(old_export_path, new_export_path):
  for table, cls in get_tables():
    logging.info('Processing ' + table)
    table_suffix = '/WCA_export_' + table + '.tsv'
    old_rows = read_table(old_export_path + table_suffix, cls, False)
    new_rows = read_table(new_export_path + table_suffix, cls, True)
    logging.info('Old: %d' % len(old_rows))
    logging.info('New: %d' % len(new_rows))
    write_table(new_export_path + table_suffix, new_rows, cls)
    modifier = get_modifier(table)

    objects_to_put = []
    keys_to_delete = []
    for key in new_rows:
      row = new_rows[key]
      if key in old_rows and old_rows[key] == row:
        continue
      else:
        obj = cls(id=key)
        obj.ParseFromDict(row)
        if modifier:
          modifier(obj)
        objects_to_put += [obj]
    for key, row in old_rows.items():
      if key in new_rows:
        continue
      else:
        keys_to_delete += [ndb.Key(cls, key)]
    logging.info('Putting %d objects' % len(objects_to_put))
    while objects_to_put:
      batch_size = 500
      subslice = objects_to_put[:batch_size]
      objects_to_put = objects_to_put[batch_size:]
      ndb.put_multi(subslice)
    logging.info('Deleting %d objects' % len(keys_to_delete))
    ndb.delete_multi(keys_to_delete)


def main(argv):
  old_export_path = FLAGS.export_base + FLAGS.old_export_id
  new_export_path = FLAGS.export_base + FLAGS.new_export_id

  logging.info(old_export_path)
  logging.info(new_export_path)

  client = ndb.Client()
  with client.context():
    process_export(old_export_path, new_export_path)
    set_latest_export(FLAGS.new_export_id)
    UpdateChampions()

if __name__ == '__main__':
  app.run(main)
