/** @odoo-module **/
/*
@ref: addons/web/static/src/core/tooltip/tooltip_service.js
@purpose: hook the popover, add more feature on tooltip
*/

import { registry } from "@web/core/registry";

import {tooltipService as MyTooltipService} from "./service/tooltip_service.js"

// registry.category("services").add("tooltip", tooltipService);
const viewRegistry = registry.category("services");
/*
    const payload = { operation: "add", key, value };
    this.trigger("UPDATE", payload);
*/
//viewRegistry.on("UPDATE", null, function (...args) {
viewRegistry.addEventListener("UPDATE",({ detail: { operation, key,value } }) => {
    //
   // const {operation,key,value} = args[0];
    
    if (operation === 'add' && 'tooltip' === key){
        if (value.self) return ;
        
        on_hook(value);
    }
    
});
const theToolipService = null;
function on_hook(tooltipService){  
    
    theToolipService = tooltipService;
   // tooltipService.start = MyTooltipService.start
}

/** patch, solve the popover postion issue: while target element big, the popover possition outside the window  **/
//registry.category("services").add("popover", popoverService);
// registry.category("main_components")
//             .add("PopoverContainer", { Component: PopoverContainer, props: { bus, popovers } });
const main_components = registry.category("main_components");

// //main_components.on("UPDATE", null, function (...args) 
main_components.addEventListener("UPDATE",(detail)=>{  
    
    const {operation,key,value} = detail;
    
    if (operation === 'add' && "OverlayContainer" === key){ 
        
        // let popoverContainer = value;
        // hookPoper.hook(popoverContainer);
        // popoverContainer.props.bus.on('UPDATE', hookPoper, hookPoper.onUpdate) 
    }
    
});

const hookPoperV16={

    hook (popoverContainer){
        this.popoverContainer = popoverContainer;
        
    },
    onUpdate(...args){
        // 
        
        
        const popData = this.getPopData();
        
        if (!popData){
            //close event 
            return ;
        }
        // open event
        popData.invokeCount =0 ;
        _adjust_popper_postion(popData);
        
    },
    getPopData(){
        if (null == this.popoverContainer) return null ;
        
        const popovers = this.popoverContainer.props.popovers;
        
        if (_.isEmpty(popovers)) return null;
        for (const x in popovers) {
            const target = popovers[x].target;
            return {popover:popovers[x], target:target};
        } 
        return null;
    }

}
//{popover:x, target:target}
function _adjust_popper_postion(data){
    const {popover, target} = data;
    if (!target || !popover) return ;
    const id = popover.id; 
    const key = `div [popover-id="${id}"]`;
    const popoverElt = document.querySelector(key);
    
    
   
    if (!popoverElt){
        data.invokeCount ++; 
        if (data.invokeCount>6){
            return ;
        }
        setTimeout(_adjust_popper_postion,100,data);
        return ;
    }
    const popBox = popoverElt.getBoundingClientRect();
    const targtBox = target.getBoundingClientRect();
    
    const top = popBox.top;
    if (top< 0 ){
        popoverElt.style.top = 0;
        
    }
    const window_height = window.innerHeight; 
    if (top  >= window_height ){
        popoverElt.style.top = top - popBox.height - popBox.height/2 ;
        
    }
}

