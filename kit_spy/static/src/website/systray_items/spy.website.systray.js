/** @odoo-module **/
/*
@ref: odoo/addons/website/static/src/systray_items/edit_website.js
@purpose: hook the EditWebsiteSystray
*/

import { registry } from "@web/core/registry";
 
/*
    registry.category("website_systray").add("EditWebsite", systrayItem, { sequence: 7 });
*/
const website_systray = registry.category("website_systray");

website_systray.addEventListener("UPDATE",( ...args) => {
//website_systray.addEventListener("UPDATE",({ detail: { operation, key,value } }) => {    
    // 
    const detail = args[0].detail
    
    const {operation,key,value} = detail;
    
    if (operation === 'add' && 'EditWebsite' === key){ 
        
        on_hook_edit(value);
        return;
    }
    if (operation === 'add' && 'NewContent' === key){ 
        
        on_hook_new_content(value);
    }
});

function get_request_param(key){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const result = urlParams.get(key)
    return result
}

function rebuild_request_url(url, key,value){ 
    if (value == null){
        url.searchParams.delete(key);
    }else{
        url.searchParams.set(key, value);
    } 
    return url;
}

function update_request_param(key,value){
    let url = new URL( window.location) 
    url = rebuild_request_url(url,key,value); 
    window.history.replaceState(null, null, url);
}

function disableSpyIfNeeds(nextAction){
   
    const nospy = get_request_param('nospy')
    if (nospy){
        return false;
    }
    
    let url = new URL( window.location)
    url.searchParams.set('nospy', '1');
    url.searchParams.set('next', nextAction);
    
    window.location.replace(url);
    return true
}

 
let theNewTray = null;

function on_hook_edit(systrayItem){
    const theSystrayClass = systrayItem.Component; //EditWebsiteSystray
    const _startEdit = theSystrayClass.prototype.startEdit; 
    theSystrayClass.prototype.startEdit = function(){
        if (disableSpyIfNeeds('edit')){
            return ;
        }
        _startEdit.apply(this,arguments);
    }

    const _setup = theSystrayClass.prototype.setup;
    theSystrayClass.prototype.setup = function(){
        _setup.apply(this,arguments);
         
        const nextAction = get_request_param('next')
        
        if (nextAction == 'edit'){
            this.startEdit(); 
            update_request_param('next',null);
            return ;
        } 
        
        this.handleNewContent();
    }
    theSystrayClass.prototype.handleNewContent = function(){
        const newContentSystray = theNewTray; 
        if (!newContentSystray){
            return ;
        }
        const nextAction = get_request_param('next')
        
        if (nextAction == 'new'){
            newContentSystray.onClick(); 
            update_request_param('next',null);
        } 
    }
}

/*

registry.category("website_systray").add("NewContent", systrayItem, { sequence: 10 });

*/

function on_hook_new_content(systrayItem){
    const theSystrayClass = systrayItem.Component; //NewContentSystray
    const _onClick = theSystrayClass.prototype.onClick; 
    theSystrayClass.prototype.onClick = function(){
        if (disableSpyIfNeeds('new')){
            return ;
        }
        
        _onClick.apply(this,arguments);
    }

    const _setup = theSystrayClass.prototype.setup;
    theSystrayClass.prototype.setup = function(){
        _setup.apply(this,arguments);

        theNewTray = this;   
        return; 
        const nextAction = get_request_param('next')
        alert('newcontent->'+ nextAction);
        if (nextAction == 'new'){
            this.onClick(); 
            update_request_param('next',null);
        } 
    }

}