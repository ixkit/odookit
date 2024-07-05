# -*- coding: utf-8 -*-
import json
import logging
 

from odoo import http
from odoo.tools import date_utils
from odoo.http import request
from odoo import api, SUPERUSER_ID

from odoo.addons.web.controllers.utils import ensure_db

from ..odo import clean_cache

_logger = logging.getLogger(__name__)


def cleanQWebCache(env): 
    if True:
        new_cr =  env.registry.cursor()
        env = api.Environment(new_cr, SUPERUSER_ID, {})
    #env["ir.qweb"].clear_caches()
    clean_cache(env)    

class Main(http.Controller):
        

    @http.route(
        "/api/v1/spy/reset",
        type="http",
        auth="none",
        csrf=False,
    )
    def reset(self, **kwargs):
        ensure_db()    
        cleanQWebCache(http.request.env)
        data = {
            "success" : True
        }
        return request.make_json_response(data, status=200) 
    
     