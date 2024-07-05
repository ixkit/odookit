# -*- coding: utf-8 -*-

import sys
import os
import logging
from odoo.tools import config
 
 
_logger = logging.getLogger(__name__)


def register_instance(name,value):
    sys.modules[name] = value
    _logger.debug('register_instance, infrastructure name:%s, value:%s',name,value)

def unregister_instance(name):
    del sys.modules[name]
    _logger.debug('unregister_instance, infrastructure name:%s',name)