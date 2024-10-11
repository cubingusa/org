import logging
import shutil
import os

from absl import app
from absl import flags
from google.cloud import ndb

from app.models.wca.export import get_latest_export

FLAGS = flags.FLAGS

flags.DEFINE_string('export_base', '', 'Base directory of exports.')

client = ndb.Client()

def main(argv):
  with client.context():
    latest_export = get_latest_export()
    logging.info('Saving ' + latest_export)
    exports = sorted([f for f in os.listdir(FLAGS.export_base)
                      if not os.path.isfile(os.path.join(FLAGS.export_base, f))
                      and latest_export not in f])

    for export in exports[:-5]:
      logging.info('Deleting ' + export)
      shutil.rmtree(os.path.join(FLAGS.export_base, export))

if __name__ == '__main__':
  app.run(main)
