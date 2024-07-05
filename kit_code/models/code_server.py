#-*- coding: utf-8 -*-
import logging 
import threading
import time
import json
import os
import re
import sys 
import html
from array import array
import requests
import odoo
from odoo import models, fields, api, tools
from odoo.modules.module import get_manifest
from os.path import join as opj

from datetime import datetime

from .server_master import ServerMaster
from ..land.jsons import json_dumps
from ..land.lang.pattern import singleton
from ..land.web import rpc_result
from ..shell.sheller import async_run
from ..__support__ import get_module_path

__author__ = odoo.release.author
__version__ = odoo.release.version

_logger = logging.getLogger(__name__) 

def simple_manifest(manifest):
    result ={}
    try:
        
        keys = ["name","version","description","summary","author","website","license","category","depends","application"]
        #keys = ["name","version","category","description"]
        for x in keys:
            val = manifest.get(x)
            if not val is None: 
                result[x] = val
        # buf = json_dumps(result)   
        # buf = html.escape(buf)  
        # _logger.debug(" simple_manifest, buf:%s",buf)
        # return buf
    except Exception as ex:
        _logger.error("Failed simple_manifest, ex:%s",ex)
        pass
    return result

def concise_folder(folder):
    result ={
        'name': folder["name"],
        "path": folder["path"],  
    }
    data = folder.get('data')
    if not data is None:
        result["data"] = data
    return result    

@singleton
class CodeServerCahce():
    
    _cacheSet = {}

    def get(self, key):
        return self._cacheSet.get(key)
    
    def set(self, key, val):
        self._cacheSet[key] = val

# ready to use
theCache = CodeServerCahce()        

# 
class CodeServer(models.Model):
    _name = 'kit.code.server'
    _description = 'kit code server'

    name = fields.Char(default="",required=True)

    ts = fields.Datetime( string="Time",required=True)
    message = fields.Text( string="Message")
    message_type = fields.Char()

    _order = "ts desc"
 

    def on_echo(self,**kw):
        message = kw['message']
        if message is None or message == "":
            return 
         
        _logger.debug("on_echo:%s",message)

        value ={  
            "message":json.dumps(message),
            "ts": datetime.now(), 
        }
        # if self.env.user._is_public():
        #self.ensure_one()
        #self.env['kit.code.server'].sudo().create(value)
        with self.pool.cursor() as new_cr:
            self = self.with_env(self.env(cr=new_cr))
            self.env['kit.code.server'].sudo().create(value)
            self.env["bus.bus"].push( value)


    def write(self, vals): 
        write_res = super(CodeServer, self).write(vals) 
        return write_res
    
    def _echo_server_op(self,op):
        if "start" == op:
            op = "🚀 Start"        
        if "stop" == op:
            op = "❌ Stop"    
        msg = {"stdout":[op + " Code Server..."]}
        self.on_echo(message = msg)

    def _get_server_handler(self):
        return theCache.get('server_handler')
    
    def _set_server_handler(self,val):
        theCache.set('server_handler',val)

    # op = 'start'|'stop'
    @api.model
    def ctrl_server(self,op):
        #raise Warning(('Test action!'))
        args = {
            "on_echo": self.on_echo
        }

        result = rpc_result.error( {'msg':"Invalidate operation:{}".format(op)})
         
        success = None 
        while True:  
            if "start" == op:
                server_handler = ServerMaster.startServer(args)  
                success = not server_handler is None
                if success:
                    self._set_server_handler(server_handler) 
                    #self._start_submit_space_info()  
                    result = rpc_result.success(server_handler)
                break
            if "stop" == op:
                success = ServerMaster.stopServer(args) 
                self._set_server_handler(None)
                result = rpc_result.success()
                break
            break

        if success is None:
            result = rpc_result.error( {'msg':"Invalidate operation:{}".format(op)})            
            return result
        
        self._echo_server_op(op); 
        return result

       
    def _start_submit_space_info(self): 
        thread = threading.Thread(target=self._try_submit_odoo_space_info)
        thread.start()
        #thread.join();
        return thread
    
    def _try_submit_odoo_space_info(self, timeout=30):
        time.sleep(timeout) # second
        go = True
        wait_count = 0 
        wait_unit = 3  
        while(go):
            _logger.debug("_try_submit_odoo_space_info,loop:%s", wait_count)           
            server_running = self._server_is_running() 
            if server_running:
                go = False
                break
            # not running yet then wait it 
            time.sleep(wait_unit) # second
            wait_count = wait_count + 1
            if  wait_count * wait_unit > timeout :
                go = False
             
        server_running = self._server_is_running()
        _logger.debug("_try_submit_odoo_space_info,server_running:%s", server_running)
        if server_running :
            self.push_space_to_code_server()
        else:
          _logger.warn("❌ server is NOT running  ")  
 
    @api.model
    def fetch_server_info(self):
        server_handler = self._get_server_handler()
        if server_handler is None:
            return rpc_result.error()
        
        servers = ServerMaster.getServers()
        if len(servers)<1:
            return rpc_result.error()
        
        return rpc_result.success(server_handler) 

    

    def _server_is_running(self):
        servers = ServerMaster.getServers()
        if servers  is None or len(servers)<1:
            return False
        
        server_info = ServerMaster.get_server_info()
        if server_info is None:
            return False
        if server_info.get('success'):
            return True
        return False

    """
    @copy: from server.py
    @purpose: output odoo runtime environment information
    """
    @api.model
    def report_configuration(self):
        """ Log the server version and some configuration values.

        This function assumes the configuration has been initialized.
        """
        result = {}
        result["version"] = __version__ 
        result["release"] = vars(odoo.release)  
        result["addons"] = self.get_addons_modules() #odoo.addons.__path__

        config = tools.config
        _logger.debug("Odoo version %s", __version__)
        if os.path.isfile(config.rcfile):
            _logger.debug("Using configuration file at " + config.rcfile)
        _logger.info('addons paths: %s', odoo.addons.__path__)
        if config.get('upgrade_path'):
            _logger.debug('upgrade path: %s', config['upgrade_path'])
        host = config['db_host'] or os.environ.get('PGHOST', 'default')
        port = config['db_port'] or os.environ.get('PGPORT', 'default')
        user = config['db_user'] or os.environ.get('PGUSER', 'default')
        _logger.debug('database: %s@%s:%s', user, host, port)

        #json_config = json.dumps(config.options, indent = 4)  
        result["config"] = config.options
  
         
        return result

    def get_addons_modules(self):  
        #app=odoo.http.root
        mod2path = {}
        for addons_path in odoo.addons.__path__:
            addons_item = {}
            for module in os.listdir(addons_path):
                manifest = get_manifest(module)
                module_path = opj(addons_path, module)
                if (manifest
                        #and (manifest['installable'])
                        and os.path.isdir(module_path)):
                    addons_item[module] = module_path

            mod2path[addons_path] = addons_item      
        return mod2path
    

    def addons_to_folders(self):  
        #app=odoo.http.root
        folders = []
        for addons_path in odoo.addons.__path__:
            folder = {
                    "name":addons_path,
                    "path": addons_path 
                }
            items = []
            for module in os.listdir(addons_path):
                manifest = get_manifest(module)
                module_path = opj(addons_path, module)
                if (manifest
                        and (manifest['installable'])
                        and os.path.isdir(module_path)):
                    
                    subFolder ={
                        "name" : module,
                        "path" : module_path,
                        "data" : simple_manifest(manifest)
                    }
                    items.append(subFolder)

            if len(items)>0:    
                folder["items"] = items 

            folders.append(folder)   
        return folders
    
    """
    let params = {
            folders:[
               {
                name:"group-name" + ts,
                path: "group-path" + ts,
                data: {},
                items:[ {
                    name:"item-name" + ts,
                    path: 'item-path' + ts,
                    data:{}
                }]
               }
            ] 
        }
    """
    @api.model
    def push_space_to_code_server(self):
        _logger.debug("try push_space_to_code_server")
        folders = self.addons_to_folders()
        for x in folders:
            self.post_addons_folder(x)
  

    # split one big post task to mullti-tasks avoid Big Data issue on Node server
    def post_addons_folder(self,folder): 
        simple_folder = concise_folder(folder)
        
        folder_rep = self.call_post_folders([simple_folder])
        if not folder_rep.get('success'):
            return False
        one = folder_rep.get("data")[0]
        folder_id = one.get("id")

        items = folder.get('items')
        if items is None:
            return 
        
        
        count = 0
        folders =[]
        for item in items:
            simple_folder = concise_folder(item)
            simple_folder['parentId'] = folder_id
            folders.append(simple_folder)
            count = count + 1
            if count >30:
                self.call_post_folders(folders)
                # reset
                count = 0 
                folders =[]
        if len(folders) > 0:
            self.call_post_folders(folders)

    def call_post_folders(self,folders):
        return ServerMaster.post_folders(folders)
    
    def _get_cached_addons(self):
        addons_modules = theCache.get("addons_modules")
        if addons_modules is None:
            addons_modules = self.get_addons_modules()
            theCache.set("addons_modules",addons_modules) 
        return addons_modules
   

 
    """
    const intent = {  
          "module" : "kit_code",
          "file" : "__manifest__.py",
          "lineNo": 1
        }
    """
    @api.model
    def get_home_link(self):
        dir = get_module_path()
        server = ServerMaster._server
        end_point = server.get("url") 
        file  =  "__manifest__.py"
        url = "{}/folder?dir={}&file={}".format(end_point,dir,file)  
        result = {
            'navigateTo': url
        }   
        return result 
    """
        name:web.NavBar.DropdownItem
        class:sub template
        type:owl
        url:/web/static/src/webclient/navbar/navbar.xml
        file:/odoo-17/odoo/addons/web/static/src/webclient/navbar/navbar.xml
    """ 
    @api.model
    def get_editable_file(self,intent):
        if (intent is None):
            intent = {
                "name":"CodeDashboard",
                "url" : "",
                "file" : "full path",
                "lineNo": 99
            }
        file_name = intent["file"]
        addons_modules = self._get_cached_addons()
        module_dir = None
        module_name = None
        
        for addons in addons_modules:
            if file_name.startswith(addons + os.sep):
                modules = addons_modules[addons]
                for module in modules:
                    module_path = modules[module]
                    if file_name.startswith(module_path + os.sep):
                        module_dir = module_path
                        module_name = module
                        break
        if module_dir is None:
            return {"status":False,"error":"No matched module!"}
        
        module ={
                "name":module_name,
                "path":module_dir
            }
        
        short_file_name = file_name.replace(module_dir + os.sep,"") 
        args ={
            "dir":module_dir,
            "file": short_file_name
        }

        navigate_to_url = ServerMaster.get_open_file_url(args)
        result ={
            "module":module,
            "file":short_file_name,
            "navigateTo": navigate_to_url
        }

        return result