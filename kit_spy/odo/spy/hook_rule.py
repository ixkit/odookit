# -*- coding: utf-8 -*-
import sys
import re

from ..session import request

from ...land.trace import Tracer


def should_hook_current_url():
    runtime_options = sys.modules['runtime_options']
    hook_url_paths = runtime_options.get('hook_url_paths')
    Tracer.debug('🧐 should_hook_current_url,hook_url_paths{}',hook_url_paths,step=False)
    if hook_url_paths is None or len(hook_url_paths) == 0:
        return True
    return allow_spy(hook_url_paths)

def allow_spy(pattern_paths):
    url = request.get_url()
   
    if website_editor_call(url):
        Tracer.debug('->website_editor_call, no spy:' + url)
        return False
    
    Tracer.debug('->allow_spy,url?',url)  
    result = False
    while True:
        for pattern in pattern_paths:
            if ("*" == pattern):
                result = True
                break  
                 
            if re.search(pattern, url):
                result = True
                break
        break
    Tracer.debug('->allow_spy,url? result?',url,result)
    return result

def website_editor_call(url):
    #ignore website editor snippets 
    if 'call_kw/ir.ui.view/render_public_asset' in url:
        return True
    #ignore website editor create new page  
    if 'website/get_new_page_templates' in url:
        return True
    return False
     