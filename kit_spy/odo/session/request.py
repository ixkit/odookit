# -*- coding: utf-8 -*-

from odoo.http import request
 
def get_session(): 
    return request and request.session

def get_param():
    param = request.get_http_params()
    return param

def get_url():
    return request.httprequest.url

def get_debug_param():
    debug_param = request.get_http_params().get('debug', None)
    return debug_param

def get_nospy_param():
    debug_param = request.get_http_params().get('nospy', None)
    return debug_param

# def set_session_value(key,val):
#     session = get_session()
#     session[key] = val

