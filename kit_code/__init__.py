# -*- coding: utf-8 -*-
import os
import sys

from . import land
from . import controllers
from . import models

from .__support__ import *

from .land import config
from .land.trace import Tracer

 

from .hooks import module_pre_init_hook, module_post_init_hook,module_uninstall_hook
 
                                        
def main_init(): 
    config_data = config.load(get_config_file())
   

#-- main ---
main_init()