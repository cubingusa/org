# Script run on VM startup.
# This is a wrapper for load_db.sh; most of the logic should be in there.

source env/bin/activate
pip3 install -r requirements.txt

LOGFILE=/logs/$(date +'%Y-%m-%d-%H:%M:%S')

./app/load_db/load_db.sh 2>&1 >$LOGFILE

# Clean up logs that are older than 30d.

find /logs/* -type f -ctime +30 -exec rm {}
