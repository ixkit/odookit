# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@team              : ixkit
#@author            : Artificer@ixkit.com
#@date              : 2024-3-15
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------
{
    "name": "Odoo Spy🕵️",
    "version": "17.0.1.0.0",
   
    "summary": """ 
        Help you insight into the rendering Templates of the Odoo web page,light up the template snippets,speed up development process🚀
    """,
    
    "description":"Spy the rendering Templates structure",
    'category': 'Extra Tools/ixkit',
    'author': 'ixkit',
    'company': 'ixkit',
    'maintainer': 'ixkit',
    'website': "http://www.ixkit.com/odookit",
    "live_test_url": "http://www.ixkit.com/odookit",
    "license": "OPL-1",
    "price" : 149,
    "currency": "USD",
    "support": "odoo@ixkit.com",
    "depends": [
        'base', 'web', 'website'
    ],
    "data": [ 
    ],
    "assets": {
        
        "kit_spy._assets_extends_owl": [

            "kit_spy/static/src/owl/call_tracer.js",
            "kit_spy/static/src/owl/spy.js",
            "kit_spy/static/src/owl/owl_track_xml.js",
            ("replace", "web/static/lib/owl/owl.js", "kit_spy/static/src/owl/17/owl.js"), 

            "kit_spy/static/src/owl/owl_meta_builder.js", 
            "kit_spy/static/src/owl/owl_override.js",   
                
        ], 
        "web.assets_backend": [ 
          
            ("include", "kit_spy._assets_extends_owl"),  

            "kit_spy/static/jslib/underscore/underscore.js",
            
            "kit_spy/static/src/tooltip/spy_popover.js",            
            "kit_spy/static/src/tooltip/spy_tooltip.v17.js",

            "kit_spy/static/src/tooltip/service/tooltip.js",
            "kit_spy/static/src/tooltip/service/tooltip_service.js", 
          
            "kit_spy/static/src/tooltip/service/spy_tooltip.scss",  
            "kit_spy/static/src/tooltip/xml/spy_tooltip.xml", 
            
            # extends website editor   
            ("before","website/static/src/systray_items/edit_website.js", "kit_spy/static/src/website/systray_items/spy.website.systray.js")  
        ],
        
        'web.assets_frontend_lazy': [

            "kit_spy/static/src/website/spy.snippets.animation.v17.js", 
        ],

        "web.assets_frontend": [
             
            ("include", "kit_spy._assets_extends_owl"), 
           
            "kit_spy/static/src/website/spy.snippets.animation.v17.js",  

            "kit_spy/static/jslib/underscore/underscore.js",

            "kit_spy/static/src/tooltip/spy_popover.js",            
            "kit_spy/static/src/tooltip/spy_tooltip.v17.js",

            "kit_spy/static/src/tooltip/service/tooltip.js",
            "kit_spy/static/src/tooltip/service/tooltip_service.js",
             
            "kit_spy/static/src/tooltip/service/spy_tooltip.scss",  
            "kit_spy/static/src/tooltip/xml/spy_tooltip.xml",
            
        ],
    },
    'images': [ 
        'static/description/banner.png'  
    ],
    'pre_init_hook': 'module_pre_init_hook',
    'post_init_hook': 'module_post_init_hook',
    'uninstall_hook': 'module_uninstall_hook',
    'installable': True,
    'application': True,
    'auto_install': False,
}
