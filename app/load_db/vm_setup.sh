set -e

# Commands that should be run to set up a new Compute Engine VM.
# To run this command, first clone the cubingusa repository:
#
# sudo apt install git
# git clone https://github.com/cubingusa/org cubingusa
#
# Then cd into the directory and run this script.
# These commands can also be used to get a local development server working.

export PATH=$PATH:/home/$USER/.local/bin

sudo apt install python3-distutils python3-venv build-essential python3-dev libffi-dev libssl-dev
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
rm get-pip.py

pip install virtualenv
python3 -m venv env
source env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
