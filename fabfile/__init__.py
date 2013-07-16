import os
from os.path import dirname, abspath, join
from datetime import date
import shutil
import fnmatch
import re
from fabric.api import env, local, lcd
from fabric.decorators import task
from fabric.operations import prompt
from fabric.utils import puts, abort, warn

today = date.today()

CONFIG = {
    'name': 'soundcite',
    'version': '', # FILLED IN FROM USER INPUT DURING stage
    'date': today,
    'year': today.year,
    'author': 'Tyler J. Fisher and Northwestern University Knight Lab'
}

env.local_project_path = dirname(dirname(abspath(__file__)))
env.local_sites_path = dirname(env.local_project_path)
env.local_build_path = join(env.local_project_path, 'build')

# Path to cdn deployment
env.cdn_path = abspath(join(
    env.local_sites_path, 'cdn.knightlab.com', 'app', 'libs', CONFIG['name']))

# Banner for the top of CSS and JS files (see CONFIG above)
BANNER = """
/* %(name)s - v%(version)s - %(date)s
 * Copyright (c) %(year)s %(author)s 
 */
""".lstrip()

def _get_tags():
    """Get list of current tags from the repo"""
    tags = os.popen('cd %(local_project_path)s;git tag' % env).read().strip()
    if tags:
        return [x.strip() for x in tags.split('\n')]
    return []
    
def _get_version_tag():
    """Get a new version tag from the user"""
    tags = _get_tags()
    puts('This project has the following tags:')
    puts(tags)
        
    while True:
        version = prompt("Enter a new version number: ").strip()
        
        if not re.match(r'^[0-9]+\.[0-9]+.[0-9]+$', version):
            warn('Invalid version number, must be in the format:' \
                ' major.minor.revision')
        elif version in tags:
            warn('Invalid version number, tag already exists')
        else:
            break
    
    return version
   
def _check_cdn():
    """Check for the cdn repository"""
    if not os.path.exists(env.cdn_path):
        abort('Could not find %(cdn_path)s.' % env)
        
def _clean(dir_path):
    """Delete directory contents."""
    path = os.path.abspath(dir_path)
    puts('Clean %s...' % path)

    if os.path.exists(path):    
        if os.path.isdir(path):
            for item in [join(path, x) for x in os.listdir(path)]:
                if os.path.isfile(item):
                    os.unlink(item)
                else:
                    shutil.rmtree(item)
        else:
            abort('%s is not a directory' % path)
    else:
        warn('%s does not exist' % path)

def _copy(src, dst):
    """Copy everything in src to dst except files starting with dot."""
    src = os.path.abspath(src)
    dst = os.path.abspath(dst)
    puts('Copy %s to %s...' % (src, dst))
    
    if not os.path.exists(src):
        abort('%s does not exist' % src)
        
    if os.path.exists(dst):
        if os.listdir(dst):
            abort('%s is not empty' % dst)
        shutil.rmtree(dst)
        
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.*'))
 
def _minify(src, dst=None):
    """Minify js in src and output to dst with .min.js extension"""
    src = os.path.abspath(src)
    dst = os.path.abspath(dst or src)
    puts('Minify %s to %s...' % (src, dst))
    
    if not os.path.exists(src):
        abort('%s does not exist' % src)
    
    if not os.path.exists(dst):
        os.makedirs(dst)
    
    for f in fnmatch.filter(os.listdir(src), '*.js'):
        (base, ext) = os.path.splitext(f)       
        local('slimit -m %s > %s' % \
            (join(src, f), join(dst, base+'.min'+ext)))
    
def _banner(path):
    """
    Place banner at top of js and css files in-place.    
    
    @path: directory or file path
    """
    banner = BANNER % CONFIG
    
    path = os.path.abspath(path)
       
    if not os.path.exists(path):    
        abort('%s does not exist' % path)
    
    if os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for f in files:
                if re.match('.*((\.css)|(\.js))$', f):
                    with open(join(root, f), 'r+') as fd:
                        s = fd.read()
                        fd.seek(0)
                        fd.write(banner+s)
    else:
        with open(path, 'r+') as fd:
            s = fd.read()
            fd.seek()
            fs.write(banner+s)
 
def _build():
    """
    Build
    """
    _clean(env.local_build_path)
    _copy(join(env.local_project_path, 'soundcite'), env.local_build_path)
    _minify(join(env.local_build_path, 'js'))
    _banner(env.local_build_path)

 
#
# tasks
#

@task
def stage():
    """
    Build then copy as version to local cdn repository
    """
    CONFIG['version'] = _get_version_tag()
      
    cdn_path = join(env.cdn_path, CONFIG['version'])
    _check_cdn()
    _build()
    _clean(cdn_path)
    _copy(env.local_build_path, cdn_path)
    
    # Tag and push tag
    with lcd(env.local_project_path):
        local('git tag %(version)s' % CONFIG)
        local('git push origin %(version)s' % CONFIG)
            
    
@task
def stage_latest(version=''):
    """
    Copy version to local cdn repository
    """
    if not version:
        tags = _get_tags()
        puts('This project has the following tags:')
        puts(tags)
        
        while True:
            version = prompt("Which version to stage as 'latest'? ").strip()
        
            if not version in tags:
                warn('You must enter an existing version')
            else:
                break
     
    # Make sure version has been staged
    version_cdn_path = join(env.cdn_path, version)
    if not os.path.exists(version_cdn_path):
        abort("Version '%s' has not been staged" % version)
      
    # Stage version as latest           
    latest_cdn_path = join(env.cdn_path, 'latest')
    _clean(latest_cdn_path)
    _copy(version_cdn_path, latest_cdn_path)

    
@task
def serve(port='8000'):
    """Run SimpleHTTPServer"""
    with lcd(join(env.local_project_path)):
        local('python -m SimpleHTTPServer %s' % port)
          
    
 
           
