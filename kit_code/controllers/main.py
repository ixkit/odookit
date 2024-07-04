# -*- coding: utf-8 -*-
import json
import logging 
 
from odoo import http
from odoo.tools import date_utils
from odoo.http import request
from odoo import api, SUPERUSER_ID
from werkzeug.wrappers import Request, Response
from urllib.parse import quote

from ..land.web import rpc_result 
from .intent import to_dir_file

_logger = logging.getLogger(__name__)
 

def kws2Dict(**kwargs):
    result = {}
    # Iterating over the Python kwargs dictionary
    for key, value in kwargs.items():
        if key.startswith('amp;'):
            key = key.replace("amp;",'')
        result [key]= value
    return result

def dictToQueryParamsStr(dict):
    result = "" 
    for key, value in dict.items():
        result = result + "&{}={}".format(key,value)
    return result

ROOT = "/code🔨"

def entry(val=None):
    if val is None:
        return ROOT
    return "{}{}".format(ROOT,val)

class Main(http.Controller):
        
    
    @http.route(entry('/api/ping') ,  auth='user',  type='json',website=True )
    def code_server_ping(self, **kwargs):
        headers = {'Content-Type': 'application/json'}
        body = rpc_result.success() 
        return body #Response(json.dumps(body), headers=headers)


    """ 
        "name:"web.Dropdown",
        "url":"/web/static/src/core/dropdown/dropdown.xml",
        "file":"/odoo-17/odoo/addons/web/static/src/core/dropdown/dropdown.xml"
    """
    @http.route(entry(),  auth='user', website=True )
    def code_server(self, **kwargs): 

        params = kws2Dict(**kwargs)

        _logger.debug('/code🔨, input params =%s',params)
        action =  params.get('action')
        if action == 'start':
            return self.start_then_reload_current_page(params)
        #@case
        next_url = params.get('nextUrl')
        _logger.debug('/code🔨, next_url=%s',next_url)
        if not next_url is None:
            started = params.get('started')
            module_name = params.get('moduleName')
            return self.open_file(next_url,module_name,started)
        #@case    
        url = params.get('url')
        file_full_path = params.get('file')
        name = params.get('name')
        
        try:
            dir,file = to_dir_file(url,file_full_path)
        except Exception as ex:
            render_values = {
                'error': 'invalidate parameters'
            }
            return self.render_self_home_page(render_values)

        params ={
           'dir' : dir,
           'file':file,
           'keywords': name
        } 
        # params_str = urlencode(params)
        # _logger.debug('🧐 try ->open_file, urlencode params_str:%s',params_str)  
        """
          http://localhost:3030/folder?dir={}&file={}&keywords={}
        """
        # next_url  = 'http://localhost:3030/folder?{}'.format(params_str) 
        # _logger.debug('🧐 try ->open_file, next_url:%s',next_url)

        next_url = "http://localhost:3030/folder?dir={}&file={}&keywords={}".format(dir,file,name)
        _logger.debug('🧐 try ->open_file, next_url:%s',next_url)  
        next_url = quote(next_url) 
        module_name = name
        return self.open_file(next_url,module_name)
        
    
    def open_file(self,next_url,module_name,started=False): 
         
        _logger.debug('entry->open_file, next_url:%s,',next_url)
         
        
        code_server = self.get_code_server()
        if not code_server.get('status') == 'running':
            if started:
                code_server['status'] = 'running'
                code_server['loading'] = True

        render_values = { 'nextUrl':next_url,
                          'codeServer': code_server,
                          'moduleName': module_name,  
                          }


        _logger.debug('->open_file, render_values:%s',render_values)
          
        return self.render_self_home_page(render_values,True)
    
    def render_self_home_page(self,render_values,need_start=True):
        if need_start:
            next_url = render_values.get('nextUrl')
            start_url = entry("?action=start&nextUrl={}".format(next_url))
            
            render_values['startUrl'] = start_url 

        return request.render('kit_code.home_page',render_values )
    
    def get_code_server(self):
        server_info = request.env['kit.code.server'].fetch_server_info()
        """
        {
            "success": 
            "data":{
                url: 
            }
        } 
        """ 
        if server_info is None or server_info.get('success') is False :
            return {
                'status':'ready'
            }
        #info = server_info.get('data')
        result = {
            'status': 'running',
          #  'url' : info.url,
            'detail': server_info
        }
        return result

   
    def start_then_reload_current_page(self, params):
        _logger.debug('->start_then_reload_current_page, params:%s',params)

        if not params.get("start") is None:
            del params['start']
        
        codeServer = request.env['kit.code.server']
        result = codeServer.ctrl_server('start')
        if result and result.get('success'):  
            next_url =  params.get('nextUrl')
            file = params.get('file')
            keywords = params.get('keywords')
            if file and not file in next_url:
                next_url = "{}&file={}&keywords={}".format(file,keywords)
            next_url = quote(next_url)    
            url = entry("?started=true&nextUrl={}".format(next_url))
            return request.redirect(url)
        else:
            # failed start the reback to original state 
            paramsStr = dictToQueryParamsStr(params)
            url = entry("?{}".format(paramsStr))
            return request.redirect(url)

    