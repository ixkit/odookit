# -*- coding: utf-8 -*-
import os
import sys 
 
from .land import config
from .land.trace import Tracer
 

def get_config_file():
    my_dir = os.path.dirname(os.path.abspath(__file__)) 
    return my_dir + "/__config__.py"

def get_module_path():
    my_dir = os.path.dirname(os.path.abspath(__file__)) 
    return my_dir

def get_mainifset_file():
    my_dir = os.path.dirname(os.path.abspath(__file__)) 
    return my_dir + "/__manifest__.py"

def get_mainifset():
    mainifset_data = config.load(get_mainifset_file())
    return mainifset_data
 

def get_mainifset_version():
    mainifset_data = get_mainifset()
    version = mainifset_data.get('version') 
    first_dot_index = version.index(".")
    big_ver = version[0:first_dot_index]
    return big_ver

 #TODO
def get_support_major_version():
    return '17'

def setup_tracer(level=None):  
    trace_level = level
    while trace_level is None:
        runtime_options  = sys.modules['runtime_options']
        if runtime_options is None:
            break
        trace_level = runtime_options.config.get('trace_level')
        if trace_level is None:
            break   
        break
    Tracer.set_trace_level(trace_level)


#--  
setup_tracer(False) 
#setup_tracer('DEBUG')

 
 
                                        
 