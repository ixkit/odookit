# -*- coding: utf-8 -*-
from datetime import datetime

from . import runtime
from . import session
from . import spy
 
from ..__support__ import get_support_major_version
 

from ..land.trace import Tracer

_logger = Tracer



def now_times():
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")
    return current_time

def start_spy(): 
    _logger.debug("start_spy 🚀🔥...{}", now_times())
    try: 
        result = spy.hook() 
        _logger.debug("hook result:{}",str(result))
    except  Exception as ex: 
        print(ex)
    finally:
       _logger.debug("start_spy done,{}",now_times(),step=False)

def end_spy():
    _logger.debug("end_spy ...{}", now_times())
    try: 
        result = spy.unhook() 
        _logger.debug("unhook result:{}",str(result))
    except  Exception as ex: 
        print(ex)
    finally:
       _logger.debug("end_spy done,{}",now_times(),step=False)



def clean_cache(env): 
    ver = get_support_major_version()
    if '17' == ver :
        # env.registry.clear_cache('assets')
        # env.registry.clear_cache('templates')
        # env.registry.clear_cache('routing')
        env.registry.clear_all_caches()
        
        return ver
    # 16
    env["ir.qweb"].clear_caches() 
    env["ir.ui.view"].clear_caches() 