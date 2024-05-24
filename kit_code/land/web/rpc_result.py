# -*- coding: utf-8 -*-
import time

def as_result(success, data=None):
    result = {
        "success": success, 
        "ts": int(time.time())
    }
    if not data is None:
        result['data'] = data
    return result

def success(data = None):
    return as_result(True,data)

def error(data = None):
    return as_result(False,data)