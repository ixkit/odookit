# -*- coding: utf-8 -*-

from . import pattern

from . import timeout

import json
import html

from ...land.trace import Tracer

_logger = Tracer


def is_primitive(x):
    if isinstance(x, (int, float, bool, str, type(None))):
        return True
    else:
        return False


def model_to_print_data(obj):
    fields_dict = {}
    for key in obj.fields_get():
        val = obj[key]
        if (is_primitive(val)):
            val = str(val)
        else:
            try:
                # val = model_to_print_data(val)
                val = str(val)
            except  Exception as ex:
                print(ex)
                val = str(val)
            finally:
                pass

        fields_dict[key] = val

    return fields_dict


def to_str(val):
    try:
        return json.dumps(val)
    except  Exception as ex:
        print(ex)
        pass
    finally:
        return str(val)
 


def _format_template_code(value):
    _logger.debug("👀->👽 ._format_template_code,template_code:{},", value)
    if not value:
        return ""
    if value:
        buf = '<t t-name="web_editor.snippet_options_image_optimization_widgets"><t t-set="filter_label">Filter</t>'
        buf = value
        buf = buf.replace("\"", "&?quote")  # avoid json dump issue in js

        buf = html.escape(buf, True)

        return buf


"""
    UIView 
"""


def view_as_dict(view,deep=True):
    _logger.debug("👀->👽 try view_as_dict, view:{},", view)
    if not view or not view.id:
        return None

    result = {
        "id": view.id,
        "name": html.escape(view.name,True),
        "model": view.model,
        "key": view.key,
        "type": view.type,
        "mode": view.mode,
        "arch_fs": view.arch_fs,
        # "arch_db": view.arch_db, # should use this one ? 
    }
    if not deep:
        return result 
    
    # if view.arch_prev :
    #     result["arch_prev_formatted"] = _format_template_code(view.arch_prev)
    # if view.arch :
    #     result["arch"] = _format_template_code(view.arch) 
        
    # step
    parent_dict = None
    if not view.inherit_id.id is None:
        parent_dict = view_as_dict(view.inherit_id,deep=False)
    if not parent_dict is None:
        result["parent"] = parent_dict
    # step
    children_views = None
    if not view.inherit_children_ids is None:
        children_views = [] 
        for x in view.inherit_children_ids:
            item = view_as_dict(x,deep=False) 
            children_views.append(item)
      

    if not children_views is None:
        # import time
        # mock_item = {
        #     "id": "111-" + str(time.time()),
        #     "name": "xxx", 
        # }
        # children_views.append(mock_item) 
        result["children_views"] = children_views

    _logger.debug("👀->👽  view_as_dict, result:{},", result)
    return result
