#-*- coding: utf-8 -*-

from odoo import models, fields, api
import threading
import time

class Vest(models.Model):
    _name = 'kit.vest'
    _description = 'kit.vest'

    name = fields.Char()
    
    color = fields.Char( defualt="white")

    size = fields.Integer()
    size_folat = fields.Float(compute="_value_pc", store=True)
    description = fields.Text()

    @api.depends('size')
    def _value_pc(self):
        for record in self:
            record.size_folat = float(record.size) / 100
