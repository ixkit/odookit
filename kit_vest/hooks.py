"""Hooks for Changing Menu Web_icon"""
# -*- coding: utf-8 -*-
#############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2021-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Cybrosys Techno Solutions(<https://www.cybrosys.com>)
#
#    You can modify it under the terms of the GNU LESSER
#    GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3) for more details.
#
#    You should have received a copy of the GNU LESSER GENERAL PUBLIC LICENSE
#    (LGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
#############################################################################
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
