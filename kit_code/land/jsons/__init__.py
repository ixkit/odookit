# -*- coding: utf-8 -*-
import json

from .__smart_json__ import SmartJson

# remove comment 
def load_py_to_json_str(file_name):
    buf = None
    with open(file_name, 'r') as file:
        Lines = file.readlines()
        for line in Lines:
            if line.startswith("#"):
                continue
            else:
                if buf is None:
                    buf = line
                else:
                    buf = buf + line

    return buf


def load_py_json(file_name):
    buf =  load_py_to_json_str(file_name) 
    if not buf is None: 
        data = json.loads(buf)
        return  data
    return None

def load_json(file_name): 
    with open(file_name, 'r') as fcc_file:
        data = json.load(fcc_file)
        return data
    return None
         
def to_json(obj):
    data = json.load(obj)
    return data

def set_to_list(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")



def json_dumps(obj):
    obj
    json_str = json.dumps(obj, default=set_to_list)
    return json_str
