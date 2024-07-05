# -*- coding: utf-8 -*-

import sys

from odoo.tools import config
 
from  ...land.lang.pattern import singleton

 

@singleton
class RuntimeOptions(object):
    def __init__(self):
        pass

    class ConstError(TypeError): pass

    def __setattr__(self, key, value):
        # self.__dict__.update()
        if key in self.__dict__:
            raise self.ConstError("constant reassignment error!")
        self.__dict__[key] = value
        return True

    def set(self, key,val):
        return self.__setattr__(key,val)
    
    def get(self,key):
        return self.__dict__.get(key)
        
    
sys.modules['runtime_options'] = RuntimeOptions()


RuntimeOptions().config = config
