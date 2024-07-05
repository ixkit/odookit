/** @odoo-module **/

class BoxData{
    constructor() {
        this.bucket ={}
    } 
    put(key,val){
        this.bucket[key]=val;
    }
    get(key){
        return this.bucket[key];
    }
    remove(key){
       delete this.bucket[key];
    }
}

class MyEventBus extends EventTarget {
    trigger(name, payload) {
        this.dispatchEvent(new CustomEvent(name, { detail: payload }));
    }
}
class Spy extends MyEventBus{
    constructor(){
        super();
    }  
}

export const SpyEvent = {
    XmlMetaReady: 'XmlMetaReady' 
};
 

export const setup_spy = function(){ 

    if (!globalThis.odooSpy){
        const spy = new Spy();  
        spy.templateMetaData = new BoxData();
        spy.xmlMetaData = new BoxData(); 
        spy.missMetaData = new BoxData(); 

        globalThis.odooSpy = spy;
    }
 
} 

export function odooSpy(){
    return globalThis.odooSpy; 
} 