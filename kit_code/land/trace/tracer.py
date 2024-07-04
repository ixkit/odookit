# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@purpose           : logger as Tracer with step feature
#@author            : Artificer@ixkit.com
#@date              : 2024-2-15
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------
import sys
import inspect

from ...land import jsons

from ..lang.timeout import inputimeout

from string import Template
from string import Formatter as StrFormatter

def _wait_input(prompt,timeout):
    result = None
    try: 
       result = inputimeout(prompt=prompt, timeout=timeout)
    except  Exception as ex: 
       pass
    finally:
      return result
 

def _smart_json(val):
    return jsons.SmartJson(val)

def to_dic(obj):
    dic = {}
    for fieldkey in dir(obj):
        fieldvaule = getattr(obj, fieldkey)
        if not fieldkey.startswith("__") and not callable(fieldvaule) and not fieldkey.startswith("_"):
            dic[fieldkey] = fieldvaule
    return dic

#---------------------------------------------------------------------------
#   Tracer classes and functions
#---------------------------------------------------------------------------


class Tracer():
    trace_level = True # True|False, 'None','DEBUG'|'INFO'...

    def __init__(self ):
        pass
    
    @staticmethod
    def set_trace_level(level=None):
        Tracer.trace_level = level

    @staticmethod
    def get_trace_level():
        if Tracer.trace_level is None:
            return None
        if Tracer.trace_level == "None":
            return None
        if Tracer.trace_level == False or Tracer.trace_level == "False":
            return None
        return Tracer.trace_level
    
    @staticmethod
    def smart_json(val):
        return to_dic(val)
    """
        # named
        msg = "xxxx {age} xxxx {name}".format(age=18, name="hangman")
        print(msg)  # xxxx 18 xxxx hangman

        # order 
        msg = "xxxx {1} xxx{0}".format(value1,value2)
        print(msg)  # xxxx [9, 0] xxx(7, 8)

        # mix 
        msg = "xxxx {} XXX {name} xxx {}".format(value2,value1,name="s4")
        print(msg)  # xxxx [9, 0] XXX s4 xxx (7, 8) 
    """    
    @staticmethod
    def debug( msg, *args, sender=None, step=None, wait_second=-1, **kwargs ):
        trace_level = Tracer.get_trace_level()
        if trace_level is None:
            return
                
        line = "line?"
        if sender is None:  
            stack_frame = inspect.stack()[1]
            stack_module = inspect.getmodule(stack_frame[0])
            sender = stack_module.__name__
            line = inspect.getlineno(stack_frame[0])
        Tracer._log(sender,line, msg, *args, **kwargs)
        
        if step == True :  
            prompt = "💡" + msg +' 👉 press any key to continue...'
            if wait_second > 0 :
                # wait limit time for input using inputimeout() function 
                prompt = prompt + " wait second:" + str(wait_second) + "\r\n"
                input_val = _wait_input(prompt=prompt, timeout=wait_second)
                if not input_val is None:
                    print(input_val)   
            else:
                prompt = prompt + "\r\n"
                input_val = str(input(prompt))  
                print(input_val)                
  
 
    @staticmethod
    def _log(sender,line, msg, /, *args, **kwargs):
        prefix = "{},{}:".format(sender,line)
        buf = msg.format(*args, **kwargs)
        buf =  prefix + buf
        print("🔍->" + buf)

  