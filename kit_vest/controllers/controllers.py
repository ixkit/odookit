# -*- coding: utf-8 -*-
# from odoo import http


# class AnvilMember(http.Controller):
#     @http.route('/anvil_member/anvil_member', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/anvil_member/anvil_member/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('anvil_member.listing', {
#             'root': '/anvil_member/anvil_member',
#             'objects': http.request.env['anvil_member.anvil_member'].search([]),
#         })

#     @http.route('/anvil_member/anvil_member/objects/<model("anvil_member.anvil_member"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('anvil_member.object', {
#             'object': obj
#         })
