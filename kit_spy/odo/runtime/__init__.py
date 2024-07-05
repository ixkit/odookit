# -*- coding: utf-8 -*-
import sys
from . import runtime_options
from . import sys_register
from ...land.trace import Tracer
 
    
def get_config(key):
    if runtime_options.config.get(key):
        return runtime_options.config[key]
    return None

def set_config(key,val):
    sys.modules['runtime_options'].set(key,val)
    return True
  

sys_register.register_instance('tracer',Tracer)