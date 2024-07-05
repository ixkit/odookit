POST: http://localhost:8120/web/action/load
request: {"id":0,"jsonrpc":"2.0","method":"call","params":{"action_id":609,"additional_context":{}}}

response: {
    "jsonrpc": "2.0",
    "id": 0,
    "result": {
        "id": 609,
        "name": "Base",
        "type": "ir.actions.act_window",
        "xml_id": "anvil_base.action_window_anvil_base_regular",
        "help": false,
        "binding_model_id": false,
        "binding_type": "action",
        "binding_view_types": "list,form",
        "display_name": "Base",
        "view_id": false,
        "domain": false,
        "context": "{}",
        "res_id": 0,
        "res_model": "anvil.base",
        "target": "current",
        "view_mode": "list,kanban,form",
        "mobile_view_mode": "kanban",
        "views": [
            [
                false,
                "list"
            ],
            [
                false,
                "kanban"
            ],
            [
                false,
                "form"
            ]
        ],
        "limit": 80,
        "groups_id": [],
        "search_view_id": false,
        "filter": false
    }
}

POST: http://localhost:8120/web/dataset/call_kw/anvil.base/get_views
request:
{"id":3,"jsonrpc":"2.0","method":"call","params":{"model":"anvil.base","method":"get_views","args":[],"kwargs":{"context":{"lang":"en_US","tz":"Europe/Brussels","uid":2,"allowed_company_ids":[1]},"views":[[false,"list"],[false,"kanban"],[false,"form"],[false,"search"]],"options":{"action_id":609,"load_filters":true,"toolbar":true}}}}

response:
{
    "jsonrpc": "2.0",
    "id": 3,
    "result": {
        "views": {
            "list": {
                "arch": "<tree>\n          <field name=\"name\"/>\n          <field name=\"value\" on_change=\"1\"/>  \n          <field name=\"value2\"/>\n        </tree>",
                "id": 2545,
                "model": "anvil.base",
                "toolbar": {}
            },
            "kanban": {
                "arch": "<kanban string=\"anvil.base\"><templates><t t-name=\"kanban-box\"><div t-attf-class=\"oe_kanban_card oe_kanban_global_click\"><div class=\"o_kanban_card_content\"><field name=\"name\"/></div></div></t></templates></kanban>",
                "id": false,
                "model": "anvil.base",
                "toolbar": {}
            },
            "form": {
                "arch": "<form string=\"AnvilBase\">\n            <sheet style=\"background-color:red\">\n                <!-- <group col=\"2\" string=\"Page Details\">\n                    <group colspan=\"1\" string=\"Page\">\n                       <field name=\"name\"  />\n                        <field name=\"value\"/>\n                        <label for=\"name_slugified\" string=\"URL\"/>\n                        <div>\n                            <span>/value2/</span>\n                            <field name=\"value2\" nolabel=\"1\"  />\n                          \n                        </div>\n                        \n                    </group>\n                 \n                </group> -->\n                <notebook>\n                    <page string=\"View\">\n                        <group> \n                          <div style=\"background-color:red\">\n                            <field name=\"name\"/>\n                          </div>  \n                        </group>\n                    </page>\n                    <page string=\"Value\">\n                       <div style=\"background-color:yellow\">\n                        <field name=\"value\"/>\n                        </div> \n                    </page>\n                </notebook>\n            </sheet>\n        </form>",
                "id": 2554,
                "model": "anvil.base",
                "toolbar": {}
            },
            "search": {
                "arch": "<search string=\"anvil.base\"><field name=\"name\"/></search>",
                "id": false,
                "model": "anvil.base",
                "toolbar": {},
                "filters": []
            }
        },
        "models": {
            "anvil.base": {
                "name": {
                    "change_default": false,
                    "name": "name",
                    "readonly": false,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Name",
                    "translate": false,
                    "trim": true,
                    "type": "char"
                },
                "value": {
                    "change_default": false,
                    "group_operator": "sum",
                    "name": "value",
                    "readonly": false,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Value",
                    "type": "integer"
                },
                "value2": {
                    "change_default": false,
                    "group_operator": "sum",
                    "name": "value2",
                    "readonly": true,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Value2",
                    "type": "float"
                },
                "description": {
                    "change_default": false,
                    "name": "description",
                    "readonly": false,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Description",
                    "translate": false,
                    "type": "text"
                },
                "id": {
                    "change_default": false,
                    "name": "id",
                    "readonly": true,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "ID",
                    "type": "integer"
                },
                "display_name": {
                    "change_default": false,
                    "name": "display_name",
                    "readonly": true,
                    "required": false,
                    "searchable": false,
                    "sortable": false,
                    "store": false,
                    "string": "Display Name",
                    "translate": false,
                    "trim": true,
                    "type": "char"
                },
                "create_uid": {
                    "change_default": false,
                    "context": {},
                    "domain": [],
                    "name": "create_uid",
                    "readonly": true,
                    "relation": "res.users",
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Created by",
                    "type": "many2one"
                },
                "create_date": {
                    "change_default": false,
                    "name": "create_date",
                    "readonly": true,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Created on",
                    "type": "datetime"
                },
                "write_uid": {
                    "change_default": false,
                    "context": {},
                    "domain": [],
                    "name": "write_uid",
                    "readonly": true,
                    "relation": "res.users",
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Last Updated by",
                    "type": "many2one"
                },
                "write_date": {
                    "change_default": false,
                    "name": "write_date",
                    "readonly": true,
                    "required": false,
                    "searchable": true,
                    "sortable": true,
                    "store": true,
                    "string": "Last Updated on",
                    "type": "datetime"
                }
            }
        }
    }
}

POST: 
http://localhost:8120/web/dataset/call_kw/anvil.base/web_read

request:
{"id":5,"jsonrpc":"2.0","method":"call","params":{"model":"anvil.base","method":"web_read","args":[[2]],"kwargs":{"context":{"lang":"en_US","tz":"Europe/Brussels","uid":2,"allowed_company_ids":[1],"bin_size":true,"params":{"id":2,"cids":1,"menu_id":413,"action":609,"model":"anvil.base","view_type":"form"}},"specification":{"name":{},"value":{},"display_name":{}}}}}

response:
{
    "jsonrpc": "2.0",
    "id": 5,
    "result": [
        {
            "id": 2,
            "name": "xxxxxx",
            "value": 0,
            "display_name": "xxxxxx"
        }
    ]
}
