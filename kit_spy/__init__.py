# -*- coding: utf-8 -*-
import os
import sys

from . import land
from . import controllers
from . import models

from .__support__ import get_config_file,setup_tracer

from .land import config
from .land.trace import Tracer

from .odo import runtime

from .hooks import module_pre_init_hook, module_post_init_hook,module_uninstall_hook,set_hook_url_paths

from .odo import start_spy 
  
                                        
def main_init(): 
    config_data = config.load(get_config_file())
    set_hook_url_paths(config_data.get('hook_paths'))
    start_spy()
    

#-- main ---
main_init()