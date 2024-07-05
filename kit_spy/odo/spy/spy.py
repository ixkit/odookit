# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@purpose           : append spy (tooltip & more) code on html node which was genereate by owl template
#@author            : Artificer@ixkit.com
#@date              : 2024-2-15
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------
import re
import pickle
import sys
import os
import logging
import json
import html 

from odoo.tools import config
from lxml import etree
 
from ..runtime import runtime_options

from ...land.lang.pattern import singleton
from ...land.lang import model_to_print_data,view_as_dict

from ...land.trace import Tracer

from ..session import request as session_request
from .hook_rule import should_hook_current_url

_logger_me = logging.getLogger(__name__)
_logger = Tracer

SPY_TOOLTIP_VIEW  = 'spy.TooltipView'

def get_sys_developer_mode():
    spy = sys.modules['spy']
    debug_data = spy.get('debug')
    return debug_data

def is_spy_mode():
    do_spy = True
    no_spy_case = None
    while True: 
        #runtime_options.config.get("trace") 
        #case 
        debug_data = get_sys_developer_mode()
        if debug_data is None:
            do_spy = False
            no_spy_case = 'developer mode without actived!'
            break
        #case
        if not should_hook_current_url():
            do_spy = False
            no_spy_case = 'not hook url call'
            break 
        #case
        nospy = session_request.get_nospy_param()
        if not nospy is None:
            do_spy = False
            no_spy_case = 'no spy'
            break
                 
        break
        
    return do_spy,no_spy_case
    

 

def _str_pos(value, matched):

    if not matched in value:
        return -1

    index = value.index(matched)
    return index

"""
   <html><body class='a'> xxx </html>
"""
def _insertTracer2Html(html,code):
    middle = "<body"

    index =_str_pos(html,middle)
    if index < 0:
        return html

    left =  html[:index] #<html>
    right = html[index:] # class='a'> xxx </html>

    index = right.index(">")
    index = index + 1;
    right_string = right[:index] + code + right[index:]
    final_string = left + right_string;
    return final_string

 
def _replace_last_str(source, target, replace_with):
    last_occurrence_index = source.rfind(target)
    result = source[:last_occurrence_index] + replace_with + source[last_occurrence_index + len(target):]
    return result


def _format_template_code(value): 
    if True:
        buf = '<t t-name="web_editor.snippet_options_image_optimization_widgets"><t t-set="filter_label">Filter</t>'
        buf = value
        buf = buf.replace("\"","&?quote") #avoid json dump issue in js
        
        buf = html.escape(buf,True) 
      
        return buf
         
def _call_web_layout(template_code):
    
    keys = ['t-call="web.login_layout"',
            't-call="website.layout"',
            't-call="website_sale.checkout_layout"', 
            ]
    for key in keys: 
        if _str_pos(template_code, key )>0:
            return True
    return False

@singleton
class Spy(object):
    def __init__(self):
        pass

    class ConstError(TypeError): pass

    def set(self, key,val):
        return self.__setattr__(key,val)
    
    def get(self,key):
        return self.__dict__.get(key)
    
    def __setattr__(self, key, value):
        # self.__dict__.update()
        # if key in self.__dict__:
        #     raise self.ConstError("constant reassignment error!")
        self.__dict__[key] = value

    def __str__(self):
        val = super().__str__()
        result = f'{val}\n{self.__dict__}'
        return result

    def dump(self, obj): 
        return etree.tostring(obj) 

 
    """
        inject spy code, show the template source meta information: name, file path 
        @template_code String = IrUIView.arc_prev
        @view  IrUIView
    """
    def inject_spy_template(self,template_code, view,ref):
        do_spy, no_spy_case = is_spy_mode()
        if not do_spy:
            _logger_me.info('👀 skip inject_spy_template, case:%s',no_spy_case)
            return template_code 
        
        trace_level = Tracer.get_trace_level()
        if "DEBUG" == trace_level :      
            view_data = model_to_print_data(view)

            _logger.debug("👀->👽 try inject_spy_template,IrUIView:{},ref:{}", view_data,ref)
            _logger.debug("👀->👽 try inject_spy_template,template_code:{},", template_code)          

      
        result = self._inject_spy_template(template_code,view)
        _logger.debug("👀->👽 inject_spy_template result:{}", result)
        return result
    
    def _view_to_tip(self,view,template_code):
 
        view_dict = view_as_dict(view)
        view_dict["template_code"] = _format_template_code(template_code)

        _logger.debug("👀->🔥 view_dict :{}", view_dict) 
        info = {
            "debug": True,
            "class": type(view).__name__,
            "view": view_dict
        }
        info_str = json.dumps(info)
        result = " data-spy='qweb' data-tooltip-info='{}'".format(info_str)
        _logger.debug("👀->🔥 _view_to_tip result:{}", result)
        return result

    def _create_spy_node(self, view, template_code):
         
        if _call_web_layout(template_code):
            return  None
        # if view.key == 'website.snippets':
        #     return None
        # if view.key == 'web_editor.colorpicker':
        #     return None
                
        
        tip_template = "data-tooltip-template='{}'".format(SPY_TOOLTIP_VIEW)
        # hardcode it  
        tip_data = self._view_to_tip(view,template_code)

        tip =  tip_template + " " + tip_data

        tag_id = 'spy->' + view.key
       
        tag_style = ''
        if view.key == 'website.layout':
            tag_style = "height: 100vh; overflow-y: auto;" 
            #tag_style = "border-style: dotted;border-color:red;" 
        # debug_tag = "<div id='{}' {}  style='{}' t-js='true'  o-spy='qweb' ></div>".format(tag_id,tip, tag_style)
        debug_tag = "<div id='{}' {}  style='{}' o-spy='qweb' ></div>".format(tag_id,tip, tag_style)            
                 
        _logger.debug("👀 _create_spy_node,debug_tag:{}", debug_tag, step=False)
        node = etree.fromstring(debug_tag) 
        return node
            
    def _inject_spy_template(self,template_code,view):    
        spy_node = self._create_spy_node(view,template_code)
        if spy_node is None:
            return template_code
        
        etree_view = etree.fromstring(template_code)
        _logger.debug("👀 _inject_spy_template,etree_view fromstring etree_view:{}", etree_view, step=False)

        for node in etree_view:
            if not node.get('o-spy') is None:
                return template_code
            if not node.get('t-name') is None :
                etree_view = node
                break
        for child in etree_view:
            spy_node.append(child)

        for child in etree_view:
            etree_view.remove(child) 
 
        etree_view.append(spy_node) 

        result = etree.tostring(etree_view, encoding='unicode')

        _logger.debug("👀 🚀_inject_spy_template, out new template code:{}", result, step=False)

        return result




#sys.modules['spy'] = Spy()

Spy().config = config
