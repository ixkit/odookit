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
    //console.log(...args);
   // const {operation,key,value} = args[0];
    
    if (operation === 'add' && 'tooltip' === key){
        if (value.self) return ;
        console.log('🪝🚀, inject tooltipService', key, value); 
        on_hook(value);
    }
    
});
const theToolipService = null;
function on_hook(tooltipService){  
    console.log('🧐 on_hook,tooltipService?', tooltipService)
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
    console.log('🪝🚀, main_components update event',detail);
    const {operation,key,value} = detail;
    
    if (operation === 'add' && "OverlayContainer" === key){ 
        console.log('🪝🚀, inject OverlayContainer,key? value?', key, value); 
        // let popoverContainer = value;
        // hookPoper.hook(popoverContainer);
        // popoverContainer.props.bus.on('UPDATE', hookPoper, hookPoper.onUpdate) 
    }
    
});

const hookPoperV16={

    hook (popoverContainer){
        this.popoverContainer = popoverContainer;
        console.log('🪝🚀, hookPoper->hook,popoverContainer?',this.popoverContainer);
    },
    onUpdate(...args){
        // console.log(...args);   
        console.log('🪝🚀, on popoverContainer eventbus update,popoverContainer? ', this.popoverContainer ); 
        
        const popData = this.getPopData();
        console.log('🪝, getPopData?',popData);
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
        console.log('🪝, try getPopTarget, popoverContainer?',this.popoverContainer);
        const popovers = this.popoverContainer.props.popovers;
        console.log('🪝, try getPopTarget, popovers?',popovers);
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
    
    console.log('🧐 try get popover element, key?, popoverElt?,target?',key,popoverElt , target)
   
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
    console.log('🧐 popBox?,targtBox?',popBox,targtBox);
    const top = popBox.top;
    if (top< 0 ){
        popoverElt.style.top = 0;
        console.log('🧐 🅰️ ✅ _adjust_popper_postion,popoverElt?',popoverElt )
    }
    const window_height = window.innerHeight; 
    if (top  >= window_height ){
        popoverElt.style.top = top - popBox.height - popBox.height/2 ;
        console.log('🧐 🅰️ ✅ _adjust_popper_postion,popoverElt?',popoverElt )
    }
}

