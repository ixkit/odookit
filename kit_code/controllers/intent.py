# -*- coding: utf-8 -*-
"""
    "url":"/web/static/src/core/dropdown/dropdown.xml",
    "file":"/odoo-17/odoo/addons/web/static/src/core/dropdown/dropdown.xml"
    =>
    dir: /odoo-17/odoo/addons/web
    file: static/src/core/dropdown/dropdown.xml
"""
def to_dir_file(url,full_file_name):
    dir = full_file_name.replace(url,'')
    list = url.split('/' ); 
    module_name = list[1];
    dir = dir + "/" + module_name
    
    r_file_name = None
    for i in range(2,len(list)):
        if r_file_name is None:
            r_file_name = list[i]
        else:
            r_file_name =  r_file_name + "/" + list[i] 
    
    return dir, r_file_name


def _test():
    url = "/web/static/src/core/dropdown/dropdown.xml" 
    file ="/odoo-17/odoo/addons/web/static/src/core/dropdown/dropdown.xml"
     
    #dir: /odoo-17/odoo/addons/web
    #file: static/src/core/dropdown/dropdown.xml

    dir, sfile = to_dir_file(url,file)
    print("\r\n-----------\r\n")
    print("dir:" +dir)
    print("file:" + sfile)

if __name__ == '__main__':
    _test()
