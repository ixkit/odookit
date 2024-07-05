/** @odoo-module **/
/*

@cloned addons/web/static/src/core/tooltip/tooltip.js

*/
import { Component } from "@odoo/owl";

export class Tooltip extends Component {}
Tooltip.template = "web.Tooltip";
Tooltip.props = {
    close: Function,
    tooltip: { type: String, optional: true },
    template: { type: String, optional: true },
    info: { optional: true },
};
