"""Local settings and globals."""
import sys
from os.path import normpath, join
from .base import *

# Import secrets -- not needed for this project
#sys.path.append(
#    abspath(join(PROJECT_ROOT, '../secrets/soundcite/stg'))
#)
#from secrets import *

# Set static URL
STATIC_URL = '/static'