# -*- coding: utf-8 -*-
"""
    hook the class Session, track the 'debug' state that identify the spy mode
"""

import sys 
from datetime import datetime

from odoo.http import Session

from ...land.trace import Tracer

def _log_spy(spy):
    Tracer.debug("🪝🧐 _log_spy,spy:{}",spy)
    

def _set_debug_mode(val):
    spy = sys.modules['spy']
    if spy is None:
        return False
    if val is None or '' == val:
        # if not spy.get('debug') is None:
        #     del spy.debug
        spy.debug = None
        
        _log_spy(spy)
             
        return True
        
    
    spy.debug = {
                    'value': val,
                    'ts': datetime.timestamp(datetime.now())
                }
    _log_spy(spy)
    return True

#@ref from odoo/http.py
#class SessionUp(collections.abc.MutableMapping):

def __setattr__(self, key, val):
    #print('🪝🧐 __setattr__' + str(key) + "=>" + str(val)) 
    if key in self.__slots__: 
        #super().__setattr__(key, val) 
        super(Session, self).__setattr__(key,val) 
    else:
        self[key] = val

    if 'debug' == key:
        _set_debug_mode(val)
         

def clear(self):
    if not self.__data is None:
        self.__data.clear()
    self.is_dirty = True

    _set_debug_mode(None)

    
    