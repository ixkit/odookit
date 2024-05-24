#-*- coding: utf-8 -*-
import logging
from odoo import models, fields, api
import threading
import time
import json


class Notifyer(models.AbstractModel):
    _inherit = "bus.bus"   

    @api.model 
    def push(self,data, channel="eventChannel"): 
        message = {
            "data": data,
            "channel": channel
        }
        self._sendone(channel, "notification", message)
         