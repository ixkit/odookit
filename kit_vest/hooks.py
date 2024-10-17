"""Hooks for Changing Menu Web_icon"""
 
import base64
import logging

from odoo import api, SUPERUSER_ID
from odoo.modules import get_module_resource

_logger = logging.getLogger(__name__)

def test_pre_init_hook(cr):
    """pre init hook"""

    env = api.Environment(cr, SUPERUSER_ID, {})
    #menu_item = env['ir.ui.menu'].search([('parent_id', '=', False)])

    _logger.debug("pre_init_hook,env:%s,cr:%s",env,cr)



def test_post_init_hook(cr, registry):
    """post init hook"""

    env = api.Environment(cr, SUPERUSER_ID, {})
    #menu_item = env['ir.ui.menu'].search([('parent_id', '=', False)])

    _logger.debug("post_init_hook,env:%s,cr:%s",env,cr)
