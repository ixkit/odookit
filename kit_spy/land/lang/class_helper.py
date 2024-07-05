# -*- coding: utf-8 -*-

from types import MethodType

"""
 replace a class method with new function dynamic
 @clazz: target class
 @func: could be global function that do not need to consider class style
 @method_name: if special then replace it
"""
def set_class_method(clazz, func, method_name=None, back_orginal=False):
    original_method = None
    if (back_orginal):
        original_method = getattr(clazz,method_name or func.__name__) 
    setattr(clazz, method_name or func.__name__, func)
    return original_method  


"""
    not modify clazz definition only apply on the object instance 
"""
def set_instance_method(target_instance, func, method_name):
    new_method = MethodType(func, target_instance)
    setattr(target_instance, method_name, new_method)