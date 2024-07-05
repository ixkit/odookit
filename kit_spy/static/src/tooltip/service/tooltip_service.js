/** @odoo-module **/
/*
@cloned: addons/web/static/src/core/tooltip/tooltip_service.js

@purpose: update mouseleave envent handler, use this new service replace original service directly 

*/
import { browser } from "@web/core/browser/browser";
import { registry } from "@web/core/registry";
import { Tooltip } from "./tooltip";
import { hasTouch } from "@web/core/browser/feature_detection";

import { whenReady } from "@odoo/owl";

import { hookPopover } from "../spy_popover";

import { jsonrpc } from "@web/core/network/rpc_service";

/**
 * The tooltip service allows to display custom tooltips on every elements with
 * a "data-tooltip" attribute. This attribute can be set on elements for which
 * we prefer a custom tooltip instead of the native one displaying the value of
 * the "title" attribute.
 *
 * Usage:
 *   <button data-tooltip="This is a tooltip">Do something</button>
 *
 * The ideal position of the tooltip can be specified thanks to the attribute
 * "data-tooltip-position":
 *   <button data-tooltip="This is a tooltip" data-tooltip-position="left">Do something</button>
 *
 * The opening delay can be modified with the "data-tooltip-delay" attribute (default: 400):
 *   <button data-tooltip="This is a tooltip" data-tooltip-delay="0">Do something</button>
 *
 * The default behaviour on touch devices to open the tooltip can be modified from "hold-to-show"
 * to "tap-to-show" "with the data-tooltip-touch-tap-to-show" attribute:
 *  <button data-tooltip="This is a tooltip" data-tooltip-touch-tap-to-show="true">Do something</button>
 *
 * For advanced tooltips containing dynamic and/or html content, the
 * "data-tooltip-template" and "data-tooltip-info" attributes can be used.
 * For example, let's suppose the following qweb template:
 *   <t t-name="some_template">
 *     <ul>
 *       <li>info.x</li>
 *       <li>info.y</li>
 *     </ul>
 *   </t>
 * This template can then be used in a tooltip as follows:
 *   <button data-tooltip-template="some_template" data-tooltip-info="info">Do something</button>
 * with "info" being a stringified object with two keys "x" and "y".
 */

const OPEN_DELAY = 400;
const CLOSE_DELAY = 200;
 
function _safe_parse_json_str(val){
    let result = null;
    try {
        result =  JSON.parse(val); 
        return result;
    } catch (error) {
        //console.warn('👽 failed JSON.parse',val)
        try{
            result = JSON.parse(decodeURIComponent(val));
            return result;
        }catch(e){
            console.error('👽 failed JSON.parse(decodeURIComponent(',val)
        } 
        
    } 
    return result;
}

const json2params =(json)=>{
    const qs =  Object.keys(json)
    .map(key => `${key}=${encodeURIComponent(json[key])}`)
    .join('&')
    return qs; 
}

const _openCodeServerPage= async (metaStr)=>{ 
    
    const meta = JSON.parse(metaStr);
    if (!meta) return
    const params = json2params(meta);  
    const keep = true ?  'modal=false,alwaysRaised=yes' : ''
    const tab = window.open(`./code🔨/?${params}`, keep)
}
const openCodeServerPage= async (metaStr)=>{ 
    
    try{
        _openCodeServerPage(metaStr)
    }catch(ex){
        console.error(ex);
    }
} 
const codeServerHander ={
    start(){
        const onClickEditCode=(elt)=>{
            console.debug('🧐 onClickEditCode',this,elt,arguments);
            if (!elt) return ;
            if (typeof elt === "string") {
                const list = document.getElementsByName(elt);
                if (!list || list.length<1){
                    return ;
                }
                elt = list[0];
            }
            const elts = elt.childNodes;
            if (!elts || elts.length<1){
                return ;
            }
            let metaElt = null;
            for (let index = 0; index < elts.length; index++) {
                const item = elts[index];
                if (item.getAttribute('name')=== 'view-meta'){
                    metaElt = item; break;
                }
            } 
            const metaStr = metaElt.innerText;
           
            openCodeServerPage(metaStr)
          
        }

        function setupCodeServerListener(){
            console.debug('🧐 setupCodeServerListener',this);
            let codeServerListener = globalThis.codeServerListener
            if (!codeServerListener){
                codeServerListener = (e)=>{
                    onClickEditCode(e)
                }
                globalThis.codeServerListener = codeServerListener;
            }
            
        }

        setupCodeServerListener();
    },
    setCodeServer(val){
        globalThis.codeServer = val;
    },
    getCodeServer(){
        return globalThis.codeServer
    },
    refreshCodeServerInfo(){
        //ping code server  
        const fetchServerInfo=()=>{
            console.debug('🧐 fetchServerInfo that?',);
            const result = jsonrpc('/code🔨/api/ping', {
            }).then(function (data) {
                console.debug('🧐 fetchServerInfo response data?',data);
                codeServerHander.setCodeServer(data)
            }).catch((x)=>{
                console.debug('❌ fetchServerInfo error?',x);
                codeServerHander.setCodeServer(null)
             }); 
        }
        try{
            fetchServerInfo();   
        }catch(ex){}
        
    }
}
export const tooltipService = {
    dependencies: ["popover"],
    start(env, {popover}) { 
        
        let openTooltipTimeout;
        let closeTooltip;
        let target = null;
        let touchPressed;
        let mouseEntered;
        const elementsWithTooltips = new Map();

        const focused_elts = new Map();
        function _clean_all_focused(){
            console.log('🧐 _clean_all_focused');
            for (var [key, value] of focused_elts.entries()) {
                _toggle_elt_focus_effect(value,false);
            } 
            focused_elts.clear();
        }
        function _put_focused_elt(key,elt){
            focused_elts.set(key,elt);
        }
        /**
         * Closes the currently opened tooltip if any, or prevent it from opening.
         */
        function cleanup() {
            browser.clearTimeout(openTooltipTimeout);
            if (closeTooltip) {
                try{
                    closeTooltip();
                }catch(ex) {
                    console.error('failed closeTooltip',ex);
                } 
            }
            //@step manully 
            _clean_all_focused();
        }

        /**
         * Checks that the target is in the DOM and we're hovering the target.
         * @returns {boolean}
         */
        function shouldCleanup() {
            if (!target) {
                return false;
            }
            if (!document.body.contains(target)) {
                return true; // target is no longer in the DOM
            }
            if (hasTouch() && !mouseEntered) {
                return !touchPressed;
            }
            return false;
        }
        
        //@step 
       
        codeServerHander.refreshCodeServerInfo()


        /**
         * Checks whether there is a tooltip registered on the event target, and
         * if there is, creates a timeout to open the corresponding tooltip
         * after a delay.
         *
         * @param {HTMLElement} el the element on which to add the tooltip
         * @param {object} param1
         * @param {string} [param1.tooltip] the string to add as a tooltip, if
         *  no tooltip template is specified
         * @param {string} [param1.template] the name of the template to use for
         *  tooltip, if any
         * @param {object} [param1.info] info for the tooltip template
         * @param {'top'|'bottom'|'left'|'right'} param1.position
         * @param {number} [param1.delay] delay after which the popover should
         *  open
         */
        function openTooltip(el, { tooltip = "", template, info, position, delay = OPEN_DELAY }) {
            target = el;
            console.debug('🧐 openTooltip, target?',target );
            cleanup();
            //@@ by Robin
            if (!tooltip && !template) {
                return;
            }     
           

            openTooltipTimeout = browser.setTimeout(() => {
                // verify that the element is still in the DOM
                if (target.isConnected) {
                    console.log('🧐popover.add apply on target?',target )
                    closeTooltip = popover.add(
                        target,
                        Tooltip,
                        { tooltip, template, info },
                        { position }
                    );
                    // Prevent title from showing on a parent at the same time
                    target.title = ""; 
                   
                    console.log('🧐 execute openTooltipTimeout,popover? closeTooltip?',popover,closeTooltip )
                    hookPopover.onUpdate({target,popover})
                }
            }, delay);
        }
        function _fuzzMeta(metaData){  
            return metaData;
        }
        function _parse_meta_data(view){
            

            if (!view){return null}
            const meta = view.meta; 
            if (!meta || meta === undefined   ){ 
                return null
            }
            if ( typeof(meta) !== 'string'){
                return meta;
            }
            // string ?
            try{ 
                const metaData = _safe_parse_json_str(meta);
                return _fuzzMeta(metaData)
            }catch(ex){
                console.error('🔥 faield _parse_meta_data,ex? ',ex,meta)
            }
            
            return null; 
        }
        function _fetch_meta_data(name){
             
            if (!name){
                return {};
            } 
            let  result = _fetch_meta_from_xmlMeta(name);
           
            return result;
        }
        function _fetch_meta_from_xmlMeta(name){
            if (!name){
                return null;
            }
            if (!globalThis.odooSpy){
                return null;
            }
            const meta_data = globalThis.odooSpy.xmlMetaData.get(name);
            if (!meta_data) return null;
            return meta_data.meta;

        }
        /**
         * Checks whether there is a tooltip registered on the element, and
         * if there is, creates a timeout to open the corresponding tooltip
         * after a delay.
         *
         * @param {HTMLElement} el
         */
        function openElementsTooltip(el) {
            if (elementsWithTooltips.has(el)) {
                openTooltip(el, elementsWithTooltips.get(el));
            } else if (el.matches("[data-tooltip], [data-tooltip-template]")) {
                const dataset = el.dataset;
                const params = {
                    tooltip: dataset.tooltip,
                    template: dataset.tooltipTemplate,
                    position: dataset.tooltipPosition,
                };
                //@@
                if (!params.position){
                   //params.position = 'top'
                }
                if (dataset.tooltipInfo) {
                    console.debug('try json parse:',dataset.tooltipInfo)
                    
                    params.info = _safe_parse_json_str(dataset.tooltipInfo);
                    
                    console.debug('after json parse, params.info:',params.info)
                    //@step format 
                    if (!params.info){
                        return ;
                    }
                    const view = (params.info && params.info.view) ? params.info.view : null;
                    if (view){
                        //guide to code 
                        view.openCode = !!codeServerHander.getCodeServer();

                        if (view.arch_prev_formatted){
                            const val = params.info.view.arch_prev_formatted; 
                            view.arch_prev = val.replaceAll('&?quote',"\""); 
                        } 
                        if (view.template_code){
                            const val = view.template_code; 
                            view.template_code = val.replaceAll('&?quote',"\""); 
                        }
                        
                        if (view.meta){
                            const val = _parse_meta_data(view);
                            if (val ){
                                if (!val){
                                    view.meta = _fetch_meta_data(view.name);
                                }else{
                                    view.meta = val;
                                }
                                
                            }
                        }else{
                            view.meta = _fetch_meta_data(view.name);
                        }
                        //@step 
                        console.debug('view.meta:',view)
                        if (view.meta){
                            const data = {... view.meta, ...{name:view.name}};
                            view.metaString = JSON.stringify(data);
                        } 
                    }
                  
                }
                if (dataset.tooltipDelay) {
                    params.delay = parseInt(dataset.tooltipDelay, 10);
                }
                openTooltip(el, params);
            }
        }
        function _toggle_elt_focus_effect(elt,focused){
            const cssName = " focusBox"
            if (focused){
                elt.className =  elt.className + cssName;  
                console.log("✅ focused",elt)
                return ;
            }
            
            elt.className = elt.className.replaceAll(cssName,'')
            console.log("❌ lost focus",elt)
        }
        function _hook_layout(){
            var coll = document.getElementsByClassName("spy-collapsible");
            var i;

            for (i = 0; i < coll.length; i++) {
                if (coll[i].getAttribute('hooked')){
                    continue;
                }
                coll[i].addEventListener("click", function() {
                    console.log('⚡️ click !' + (new Date()).getTime());
                    this.classList.toggle("spy-active");
                    var content = this.nextElementSibling;
                    if (content.style.maxHeight){
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                    } 
                });
                coll[i].setAttribute('hooked',true)
            }
        } 
        function is_tooltip(elt){
            var coll = elt.getElementsByClassName("o-tooltip");
            return coll.length >0
        }
        /**
         * Checks whether there is a tooltip registered on the event target, and
         * if there is, creates a timeout to open the corresponding tooltip
         * after a delay.
         *
         * @param {MouseEvent} ev a "mouseenter" event
         */
        function onMouseenter(ev) {
            if (is_tooltip(ev.target)){
                return ;
            }
            mouseEntered = true;
            openElementsTooltip(ev.target);
            //@step
            const elt = ev.target; 
            if (elt.dataset.spy){ 
                _toggle_elt_focus_effect(elt,true); 
                _put_focused_elt(elt,elt); 
              //  _hook_layout(); 
            }
            
        }

        function onMouseleave(ev) {
           
            if (target === ev.target) { 
                mouseEntered = false;
                //@step modify logic, not close the tooltip for user interaction   
                if (target.dataset.spy){  
                    console.log('🏆 onMouseleave，not clean immediately',target.dataset)
                    return;
                } 
                //original 
                cleanup();
            }
        }
        // animation
        function onMouseMove(e){
            window.requestAnimationFrame(function(){
                transformElement(e.target, e.clientX, e.clientY);
              });
        } 
        const multiple = 20;
        function transformElement(element, x, y) {
            let box = element.getBoundingClientRect();
            let calcX = -(y - box.y - (box.height / 2)) / multiple;
            let calcY = (x - box.x - (box.width / 2)) / multiple;
            
            element.style.transform  = "rotateX("+ calcX +"deg) "
                                  + "rotateY("+ calcY +"deg)";
          }
        /**
         * Checks whether there is a tooltip registered on the event target, and
         * if there is, creates a timeout to open the corresponding tooltip
         * after a delay.
         *
         * @param {TouchEvent} ev a "touchstart" event
         */
        function onTouchStart(ev) {
            touchPressed = true;
            openElementsTooltip(ev.target);
        }

        whenReady(() => {
            // Regularly check that the target is still in the DOM and if not, close the tooltip
            browser.setInterval(() => {
                if (shouldCleanup()) {
                    cleanup();
                }
            }, CLOSE_DELAY);

            if (hasTouch()) {
                document.body.addEventListener("touchstart", onTouchStart);

                document.body.addEventListener("touchend", (ev) => {
                    if (ev.target.matches("[data-tooltip], [data-tooltip-template]")) {
                        if (!ev.target.dataset.tooltipTouchTapToShow) {
                            touchPressed = false;
                        }
                    }
                });

                document.body.addEventListener("touchcancel", (ev) => {
                    if (ev.target.matches("[data-tooltip], [data-tooltip-template]")) {
                        if (!ev.target.dataset.tooltipTouchTapToShow) {
                            touchPressed = false;
                        }
                    }
                });

              //@@??  return;
            }

            // Listen (using event delegation) to "mouseenter" events to open the tooltip if any
            document.body.addEventListener("mouseenter", onMouseenter, { capture: true });
            // Listen (using event delegation) to "mouseleave" events to close the tooltip if any
            document.body.addEventListener("mouseleave", onMouseleave, { capture: true });
            //
            //document.body.addEventListener("mousemove", onMouseMove, { capture: true });
            
        });

        return {
            add(el, params) {
                elementsWithTooltips.set(el, params);
                return () => {
                    elementsWithTooltips.delete(el);
                    if (target === el) {
                        cleanup();
                    }
                };
            },
        };
    },


};

codeServerHander.start();

registry.category("services").add("tooltip", tooltipService,{force:true});
