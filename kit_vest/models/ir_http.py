# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _pre_dispatch(cls, rule, args):
        super()._pre_dispatch(rule, args)

        # add gpt token or login to the session if given
        # for key in ('anvil_template_token', 'auth_login'):
        #     val = request.httprequest.args.get(key)
        #     if val is not None:
        #         request.session[key] = val

        for key in args:
            print("🧐 @anvil_template, Http->_pre_dispatch,key:" + str(key) )
