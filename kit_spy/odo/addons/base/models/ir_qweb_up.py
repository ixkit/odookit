# -*- coding: utf-8 -*-
#
#           ixkit - odoo spy 
#
#@purpose : jnject new logic replace exist methods, append template meta information (name,url,file, db row_id, etc), render by qweb
#@author            : Artificer@ixkit.com
#@date              : 2024-2-15
#@version           : 1.0.0 
#
#-----------------------------------------------------------------------
import sys 
from lxml import etree 


#class IrQWeb(models.AbstractModel):

   
def _load(self, ref):
    """
    Load the template referenced by ``ref``.

    :returns: The loaded template (as string or etree) and its
        identifier
    :rtype: Tuple[Union[etree, str], Optional[str, int]]
    """
    IrUIView = self.env['ir.ui.view'].sudo()
    view = IrUIView._get(ref)
    template = IrUIView._read_template(view.id)
    #@@ inject spy code
    template = sys.modules['spy'].inject_spy_template(template,view,ref)
    #@@ end    
    etree_view = etree.fromstring(template)

    xmlid = view.key or ref
    if isinstance(ref, int):
        domain = [('model', '=', 'ir.ui.view'), ('res_id', '=', view.id)]
        model_data = self.env['ir.model.data'].sudo().search_read(domain, ['module', 'name'], limit=1)
        if model_data:
            xmlid = f"{model_data[0]['module']}.{model_data[0]['name']}"

    # QWeb's ``_read_template`` will check if one of the first children of
    # what we send to it has a "t-name" attribute having ``ref`` as value
    # to consider it has found it. As it'll never be the case when working
    # with view ids or children view or children primary views, force it here.
    if view.inherit_id is not None:
        for node in etree_view:
            if node.get('t-name') == str(ref) or node.get('t-name') == str(view.key):
                node.attrib.pop('name', None)
                node.attrib.pop('id', None)
                etree_view = node
                break
    etree_view.set('t-name', str(xmlid))
    return (etree_view, view.id)
