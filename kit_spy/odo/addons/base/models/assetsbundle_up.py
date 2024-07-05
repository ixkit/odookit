# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@purpose           : inject new logic code make asset pass meta information ( url,file name etc) to js layer
#@author            : Artificer@ixkit.com
#@date              : 2024-3-4
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------

from contextlib import closing
from collections import OrderedDict
from datetime import datetime
from lxml import etree
from subprocess import Popen, PIPE
import base64
import copy
import hashlib
import io
import itertools
import json
import logging
import os
import re
import textwrap
import uuid

import sys
 

from odoo import release, SUPERUSER_ID, _
from odoo.http import request
from odoo.modules.module import get_resource_path
from odoo.tools import (func, misc, transpile_javascript,
    is_odoo_module, SourceMapGenerator, profiler,
    apply_inheritance_specs)
from odoo.tools.misc import file_open, html_escape as escape
from odoo.tools.pycompat import to_text

from odoo.addons.base.models.assetsbundle import WebAsset, XMLAsset, AssetError,AssetNotFound

_logger = logging.getLogger(__name__)

EXTENSIONS = (".js", ".css", ".scss", ".sass", ".less", ".xml")

"""
    class Asset{
        self._filename = filename
        self.url = url
    }
"""
def _to_meta_json_str(asset): 
    meta = {
        "url" : asset.url,
        "file" : asset._filename,
        "asset_time": datetime.now().timestamp()
       # "content": content
    } 
    result = json.dumps(meta)
    return result

def _mark_json_str(val):
    result = val.replace("{", "[")
    result = result.replace("}", "]")
    return result

def _to_meta_str(asset): 
    meta = {
        "url" : asset.url,
        "file" : asset._filename,
       # "content": content
    } 
    result = "\"{}\"=\"{}\"".format("url",asset.url)
    result = result + ";\"{}\"=\"{}\"".format("file",asset._filename)
    return result

def _super_fetch_content(self):
    """ Fetch content from file or database"""
    try:
        self.stat()
        if self._filename:
            with closing(file_open(self._filename, 'rb', filter_ext=EXTENSIONS)) as fp:
                return fp.read().decode('utf-8')
        else:
            return self._ir_attach.raw.decode()
    except UnicodeDecodeError:
        raise AssetError('%s is not utf-8 encoded.' % self.name)
    except IOError:
        raise AssetNotFound('File %s does not exist.' % self.name)
    except:
        raise AssetError('Could not get content for %s.' % self.name)


#class MyXMLAsset(XMLAsset):


def _fetch_content(self): 
    """  
    _content = None
    _filename = None
    _ir_attach = None
    _id = None   
    """
    tracer = sys.modules['tracer']
 
    try:  
        tracer.debug("🧐👽 try _fetch_content, self:{}", self, step=False)
        #content = super()._fetch_content() 
        content = _super_fetch_content(self) 
    except AssetError as e:
        _logger.error("Error when _fetch_content,self:%s",self, exc_info=True)
        return f'<error data-asset-bundle={self.bundle.name!r} data-asset-version={self.bundle.version!r}>{json.dumps(to_text(e))}</error>'

    parser = etree.XMLParser(ns_clean=True, recover=True, remove_comments=True)
    root = etree.parse(io.BytesIO(content.encode('utf-8')), parser=parser).getroot() 
    
    #@@ original logic 
    # if root.tag in ('templates', 'template'):
    #     return ''.join(etree.tostring(el, encoding='unicode') for el in root)
    # return etree.tostring(root, encoding='unicode')
    
    """
        apply new logic, pass the meta information
    """
    if root.tag in ('templates', 'template'):
        buf = ""
        for el in root:
            if 't-name' in el.attrib:
                meta =  _to_meta_json_str(self)
                el.attrib['t-meta']= meta
                
            buf = buf + etree.tostring(el, encoding='unicode')
        tracer.debug("🧐 XMLAsset->_fetch_content,template?? buf:{}", buf ,step=False)    
        return buf

    result =  etree.tostring(root, encoding='unicode')
    tracer.debug("🧐👽 XMLAsset->_fetch_content,no template?  result:{}", result ,step=False)
    return result
