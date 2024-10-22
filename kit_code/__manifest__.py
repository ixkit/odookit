# -*- coding: utf-8 -*-
#
#           ixkit - odoo code🔨 
#
#@team              : ixkit
#@author            : Artificer@ixkit.com
#@date              : 2024-4-25
#@version           : 1.1.0 
#
#-----------------------------------------------------------------------

{
    "name": "Odoo Code🔨",
    "version": "18.0",
    "module_version": "1.1.0",
    "summary": """ 
        Help you build Odoo application online, super speed development process🚀
    """, 
    "description":"Odoo Code🔨 build application in new way!",   
    'category': 'Extra Tools/ixkit',
    'author': 'ixkit',
    'company': 'ixkit',
    'maintainer': 'ixkit',
    'website': "http://www.ixkit.com/odookit",
    "live_test_url": "http://www.ixkit.com/odookit",
    "license": "OPL-1",
    "support": "odoo@ixkit.com",
    "depends": [
        'base', 'web'
    ],
    "data": [ 
        'security/ir.model.access.csv',

        'views/code_server/forms.xml',
        'views/code_server/lists.xml',
        'views/code_server/actions.xml', 
        'views/code_server/menus.xml', 
        
        'views/console/console.xml',  

        'views/page/web.xml',
        'views/page/effect.xml',
    ],
    
    'assets': {
        'web.assets_backend': [ 
            'kit_code/static/src/xml/code_dashboard.xml',
            'kit_code/static/src/js/code_dashboard.js',
            'kit_code/static/src/css/code_dashboard.css', 
            'kit_code/static/image/**/*',

            'kit_code/static/jslib/termynal/**/*',
            'kit_code/static/jslib/jsontable/**/*',
            
            'kit_code/static/src/js/effect.js',
        ],
        'web.assets_frontend': [
           
        ],
    },
    'images': [
       'static/description/banner.png',  
    ],
      
    'pre_init_hook': 'module_pre_init_hook',
    'post_init_hook': 'module_post_init_hook',
    'uninstall_hook': 'module_uninstall_hook',
    'installable': True,
    'application': True,
    'auto_install': False,
}
