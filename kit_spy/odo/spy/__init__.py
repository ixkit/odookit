# -*- coding: utf-8 -*-

from . import spy

from . import injector

from ..runtime.sys_register import register_instance,unregister_instance
 

def _install_infrastructure():     
    register_instance("spy", spy.Spy()) 
    register_instance("injector", injector.Injector())

def _uninstall_infrastructure():     
    unregister_instance("spy")
    unregister_instance("injector")


def hook():
    _install_infrastructure()
    return injector.Injector().hook()

def unhook():
    _uninstall_infrastructure()
    return injector.Injector().unhook()