# -*- coding: utf-8 -*-
import sys

from .odo.runtime import get_config,set_config

from .odo import start_spy, end_spy, clean_cache
 

   

def module_pre_init_hook(env):  
    start_spy()


def module_post_init_hook(env): 
    clean_cache(env)
    
     
def module_uninstall_hook(env):
    clean_cache(env)
    end_spy()

def set_hook_url_paths(paths=None): 
    hook_url_paths = get_config('hook_url_paths')
    
    if hook_url_paths is None:
        hook_url_paths = []
    if not paths is None:
        hook_url_paths = hook_url_paths + paths
    
    set_config('hook_url_paths',hook_url_paths) 
        
    return True  
