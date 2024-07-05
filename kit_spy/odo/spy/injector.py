# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@purpose           : inject new method |replace exist method on target class
#@author            : Artificer@ixkit.com
#@date              : 2024-2-15
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------
 
from odoo.addons.base.models.ir_qweb import IrQWeb
from odoo.addons.base.models.assetsbundle import XMLAsset

from ..addons.base.models import ir_qweb_up
from ..addons.base.models import assetsbundle_up


from ...land.lang.pattern import singleton
from ...land.lang import class_helper

from odoo.http import Session
from ..root.http_up import __setattr__,clear

@singleton
class Injector(object):

    def __init__(self):
       self._reset()
 
    def _reset(self):
        self.qweb_load = None
        self.asset_fetch_content = None
        self.session__setattr__ = None
        self.session_clear = None

    def hook(self):
        if (not self.qweb_load is None):
            return True
        
        self.qweb_load = class_helper.set_class_method(IrQWeb,ir_qweb_up._load,back_orginal=True)
        
        self.asset_fetch_content = class_helper.set_class_method(XMLAsset,assetsbundle_up._fetch_content,back_orginal=True)

        self.session__setattr__ = class_helper.set_class_method(Session,__setattr__,back_orginal=True)  
        self.session_clear = class_helper.set_class_method(Session,clear,back_orginal=True)  

        return True
    
    def unhook(self):
        if (not self.qweb_load is None):
            class_helper.set_class_method(IrQWeb,self.qweb_load)
        
        if (not self.asset_fetch_content is None):
            class_helper.set_class_method(XMLAsset,self.asset_fetch_content)

        if (not self.session__setattr__ is None):
            class_helper.set_class_method(Session,self.session__setattr__)

        if (not self.session_clear is None):
            class_helper.set_class_method(Session,self.session_clear)
        
        self._reset()
        
        return True