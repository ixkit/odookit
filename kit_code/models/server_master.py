# -*- coding: utf-8 -*-
# 1 : imports of python lib
from pathlib import Path
import json
import logging
import urllib
import os 
import subprocess
import base64
import sys
import requests
# 2 : imports of odoo
from odoo import _, api, exceptions, fields, http, models, tools
  
from ..shell.sheller import async_run
from ..land.jsons import json_dumps

# 4 : variable declarations
_logger = logging.getLogger(__name__)

def log_it(msg):
    _logger.debug(str(msg))  
 

def get_current_path():
    #dir_path = os.path.dirname(os.path.realpath(__file__))
    dir_path = Path(__file__).resolve().parent
    return dir_path

def get_value(data, key,default=None):
    result = data.get(key)
    if result is None:
        result = default
    return result

def contains_error(buf):   
    if "\"error\":" in buf: 
        return True
    return False
def contains_success(buf):  
    if  "'result': True" in buf: 
        return True
    return False

# duplicate
def _quote_(value):
    #return "\"{}\"".format(value)
    return "\\\"{}\\\"".format(value)
     
def _key_str_value(key,value):
    result =  _quote_(key) +":" + _quote_(value)
    return result 

def _key_obj_value(key,value):

    result =  _quote_(key) +":" + "{ }" if value is None else value
    return result 

# sys.platform => 'darwin', 'linux', 'win32'
def _get_server_exe_name():
    bin_app_fmt = "code-server-{}"
    os = sys.platform
    if 'win32' == os :
        return  bin_app_fmt.format(".exe")
    if 'darwin' == os :
        return bin_app_fmt.format("macos")
    return  bin_app_fmt.format("linux")

def _get_server_path():
    path = get_current_path()
    result = str(path.resolve().parent) + "/vendors/code-server/" + _get_server_exe_name()
    return result

def _get_module_path():
    path = get_current_path()
    result = str(path.resolve().parent) 
    return result

def on_shell_echo(process, msg):
    log_it("------------- on_shell_echo -------------")
     
    log_it(msg)
    ServerMaster.put_proc(str(process.pid), process)


# Class
class ServerMaster():
    
    proc_set ={}
    
    args = None

    _server={}

    @staticmethod
    def put_proc(key,proc): 
       cached_proc = ServerMaster.proc_set.get(key)
       if cached_proc is None:
            ServerMaster.proc_set[key] = proc
   
    @staticmethod
    def get_proc(key):
        cached_proc = ServerMaster.proc_set.get(key)
        return cached_proc
    
    @staticmethod
    def get_proc_set():
        return ServerMaster.proc_set
    
    @staticmethod
    def getTargetServerPath(): 
        return _get_server_path()

    """
    """
    @staticmethod
    def startServer(args): 
        ServerMaster.args = args;   
        port = get_value(args,"port",3030)
        doc_path = _get_module_path()
        server = ServerMaster.getTargetServerPath()
        cmd =  "{} start  --port={}  --space={} --slient=true --focus=README.rst,__manifest__.py ".format(server,port, doc_path)
        log_it(cmd)
        # return json string that print out by RPC server
        async_run(cmd,ServerMaster.on_shell_echo)
        return ServerMaster.warp_server(port)

    # on_echo: procss, message ={stdout,stderr,exitcode}
    @staticmethod
    def on_shell_echo(process, message):
        log_it("------------- on_shell_echo -------------")
         
        log_it(message)
        ServerMaster.put_proc(str(process.pid), process)
        args = ServerMaster.args

        if args is None or args.get('on_echo') is None:
            return True
        
        on_echo = args.get('on_echo')
        on_echo(message=message)
        return True


        
    @staticmethod
    def getServers():
        proc_set = ServerMaster.get_proc_set()
        result =[]
        if len(proc_set) <= 0:
            return result
          
        
        for key in list(proc_set.keys()):    
            try:
                x = proc_set[key]
                exit_code = x.poll()
                if not exit_code is None: 
                    del proc_set[key]
                    continue
                
                item = {
                    "pid": x.pid,
                    "args": x.args, 
                }
                result.append(item)
            except Exception as ex:
                pass
         
        return result 
    
    @staticmethod
    def stopServer(args):
        proc_set = ServerMaster.get_proc_set()
        #Popen.terminate()
        for x in proc_set.values():
            try:
                x.terminate()
            except Exception as ex:
                pass
        
        return True 
                    
    #----------------- biz logic -----------------
    @staticmethod
    def warp_server(port):
        result = {
            "url": "http://localhost:{}".format(port)
        }
        ServerMaster._server = result;
        return  result
            
    @staticmethod
    def get_open_file_url(args):
        dir = args.get("dir")
        file = args.get("file")
        server = ServerMaster._server
        end_point = server.get("url") 
        url = "{}/folder?dir={}&file={}".format(end_point,dir,file)
        return url
       
    @staticmethod
    def get_server_info():
        server = ServerMaster._server  
        headers = {"content-type":"application/json"}
        #url = "http://localhost:3030/api/echo"
        end_point = server.get("url")
        url = "{}/api/info".format(end_point)
        _logger.debug("get_server_info, url:%s",url)
        response = requests.get(url, headers=headers)
        json_response = response.json() 

        buf = json_dumps(json_response)
        _logger.debug('server_is_running response: %s',buf)
        
        return json_response

    @staticmethod
    def post_folders(folders):
        try:
           return ServerMaster._post_folders(folders) 
        except Exception as e:     
            _logger.error('failed post folders,error:%s', e)
            return {}
    @staticmethod
    def _post_folders(folders):
        payload ={
            "folders":folders
        }
        data_buf = json_dumps(payload)
        headers = {"content-type":"application/json"}
        #url = "http://localhost:3030/api/folders"
        end_point = ServerMaster._server.get("url")
        url = "{}/api/folders".format(end_point)
        response = requests.post(url, data=data_buf,headers=headers)
        if response is None:
            return {}
        json_response = response.json()

        buf = json_dumps(json_response)
        _logger.debug('call_post_folders response: %s',buf)
        return json_response