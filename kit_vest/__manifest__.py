# -*- coding: utf-8 -*-
{
    'name': "Kit Vest",
    'summary': """
        Rebranding, put 🎽 to 🏃
        """,

    'description': """
        * rebrand website builder information on bottom layout
        * hide database management & login with odoo account
        * disable auth_oath provider, please disable it from setting panel
    """,

    'author': "ixkit",
    'website': "http://www.ixkit.com/odookit", 
   
   'category': 'Extra Tools/ixkit',
    'version': '18.0.0.1.0', 
    'license': 'LGPL-3',
    # module type
    'auto_install': False,
    'installable': True,
    'application': True,

    # any module necessary for this one to work correctly
    'depends': ['base','web','website'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',

        'views/vest/views.xml',
        'views/vest/actions.xml',
        # 'views/vest/menus.xml', 
        
        'views/web/webclient_templates->rebrand.xml',
        'views/web/webclient_templates->login_security_db.xml',

    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/rows.xml',
    ],
    #'images': ['static/description/banner.gif'],
    # 'pre_init_hook': 'test_pre_init_hook',
    # 'post_init_hook': 'test_post_init_hook',
}
