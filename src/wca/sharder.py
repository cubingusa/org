import csv

import cloudstorage as gcs

from src.wca import export

def write_sharded_files(export_zip):
  for (table, model, shards) in export.get_tables():
    write_retry_params = gcs.RetryParams(backoff_factor=1.1)
    gcs_files = [gcs.open(export.fname(table, shard),
                          'w', content_type='text/plain',
                          retry_params=write_retry_params) for shard in range(shards)]
    with export_zip.open('WCA_export_%s.tsv' % table) as table_file:
      reader = csv.DictReader(table_file, delimiter='\t')
      gcs_writers = [csv.DictWriter(f, reader.fieldnames, delimiter='\t') for f in gcs_files]
      for writer in gcs_writers:
        writer.writeheader()
      for row in reader:
        idx = hash(model.GetId(row)) % shards
        gcs_writers[idx].writerow(row)
    for f in gcs_files:
      f.close()
