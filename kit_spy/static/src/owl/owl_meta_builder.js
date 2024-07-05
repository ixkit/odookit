/** @odoo-module **/

//@ref addons/web/static/lib/owl/owl.js

function isJsonObject(strData) {
    return strData instanceof Object && strData.constructor === Object
}

function insertAtIndex(str, substring, index) {
    return str.slice(0, index) + substring + str.slice(index);
}

function getStyleIndex(str){
     
    let beginTagIndex = str.indexOf('<');
    let endTagIndex = str.indexOf('>');
    let tag = str.substring(0,endTagIndex);
   if (tag.indexOf('style=') >0){
        return -1;
    }
    let blankIndex = tag.indexOf(' ');
    if (blankIndex > 0){
        tag =  tag.substring(0, blankIndex);
        return blankIndex;
    }
     
    return endTagIndex  ;
}
 

function wrapTipName(){ 
    let spy_template ='spy.owlTooltipView';
    
    let result = ` data-tooltip-template=\"${spy_template}\"  `
    
    return result ;
}
  
function is_popover(template_name){
    const pop = 'web.PopoverWowl';
    return pop === template_name;
}

function is_tooltip(template_name){ 
    const list =['spy.owlTooltipView','web.Tooltip','views.ViewButtonTooltip']; 

    for (let index = 0; index < list.length; index++) {
        const item = list[index];
        if (item === template_name){
            return true;
        }
    }
    return false;
}

function is_tooltip_elt(elt){
    const att_key = 'data-tooltip-template';
    return elt.getAttribute(att_key) != null;
}

/* 
    meta_data ={
        templateName:name,

        meta:{
            name,
            url,
            file,
        } //  meta is string, it was encodeURIComponent 
    }

<div 
    
    data-template-name="web.CheckBox"  
    data-tooltip-template="spy.owlTooltipView"  
    data-tooltip-info="{" debug":true,"view":{"name":"web.CheckBox","class":"sub template","type":"owl","meta":"null"}}" 
    data-spy="owl" 
    >
    <input type="checkbox" class="form-check-input" id="module_account_inter_company_rules">
    <label class="form-check-label" for="module_account_inter_company_rules"></label>
</div>
*/

// json data to html element attribute 
function dump_json_to_attribute_str(data){
    let result = '';
    for (const key in data) {
        let val = data[key];
        if (isJsonObject(val)){
            val = encodeURIComponent(JSON.stringify(val));
        }
        result = result + ` ${key}= \"${val}\"`;
    }
    return result;
}

const SPY_TOOLTIP_VIEW = "spy.owlTooltipView";
 

function _metaData_to_tooltip(meta_data,options={ tooltip_template:SPY_TOOLTIP_VIEW,only_info:false} ) {

    const {templateName, meta} = meta_data;
    const { tooltip_template,only_info } = options;

    const meta_str = encodeURIComponent(JSON.stringify(meta)); 
    const name = templateName;

    const tip ={
        "data-spy":'owl',
        "data-template-name": name,
        "data-tooltip-template": tooltip_template,
        "data-template-meta": meta_str,
        "data-tooltip-info":{
            "debug": true,
            "view": {
              "name": name,
              "class": "sub template",
              "type": "owl",
              "meta": meta_str
            }
          }

        }
    if (only_info){
        return tip["data-tooltip-info"];
    }  
    return tip;
}

function _metaData_to_tooltip_attt_str(meta_data,options={ tooltip_template:SPY_TOOLTIP_VIEW,only_info:false} ) {
    const tip = _metaData_to_tooltip(meta_data,options);
    let result = dump_json_to_attribute_str(tip);
    return result;
}

 
class OwlMetaBuilder{

    static isTraceMode(){ 
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const trace = urlParams.get('debug');
        return trace
    }
    
    static ignoredHtmlTag(str){
        let igoreInject = false;
        const att_key = 'data-tooltip-template';
        if (str.indexOf(att_key) >= 0){
            //ignore the tooltip avoid recursive tip ~
            return true;
        }
        str = str.trim();
        do {
            const ignoreList = [  "<i","<li","<select","<option","<ul","<small","<span","<br","<td","<thead","<h4","<h3","<h2","<h1","<p"];
            
             for (const item of ignoreList) {
                if (str.indexOf(item) == 0){
                    igoreInject = true;
                    break;
                }
             }
            if (igoreInject) break;
        }while(false); 
        return igoreInject;
    }    
    /*
        meta_data ={
            templateName:name,

            meta:{
                name,
                url,
                file,
            }   
        }
    */
    static injectIfNeeds(str,meta_data,resultState = {}){
        try{
            return OwlMetaBuilder._injectIfNeeds(str,meta_data,resultState);
        }catch(ex){
            console.error('🪝 Failed injectIfNeeds,ex',ex);
            console.error('🪝 Failed injectIfNeeds,str? meta_data?',str,meta_data);
        }

    }
    static _injectIfNeeds(str,meta_data,resultState = {}){
        
        if (! OwlMetaBuilder.isTraceMode()) return str; 
        
        if (!meta_data) return str;

        let igoreInject = OwlMetaBuilder.ignoredHtmlTag(str); 
        
        resultState.igoreInject = igoreInject;

        if (igoreInject) {
            return str;
        } 
 

        const {templateName, meta} = meta_data;
        

        if (is_popover(templateName)) return str;
            
        if (is_tooltip(templateName))  return str;

        


        let insertAt = getStyleIndex(str);
        if (insertAt > 0 ){   
            let style = ''; 
            if (false){
                style = " style =\"border-color:blue; border-style: dotted;border-width:1px;\""; 
            }  
            const tooltip_attr = _metaData_to_tooltip_attt_str(meta_data) ;
            
            const html = ` ${tooltip_attr}  ${style} `;

            str = insertAtIndex(str,html, insertAt);
            
        } 
        return str;
    }
    
    static metaData_to_tooltip_info_str (meta_data,options={ tooltip_template:SPY_TOOLTIP_VIEW,only_info:true} ){
       const tip = _metaData_to_tooltip(meta_data,options);
       const result = encodeURIComponent(JSON.stringify(tip));
       return result;
    } 
} 

///////////////////////////////////////////    
//
//  main entry
//
///////////////////////////////////////////


globalThis.owlMetaBuilder = OwlMetaBuilder;
 


  