/** @odoo-module **/
//@ref addons/web/static/lib/owl/owl.js

import { setup_spy } from './spy';   

const TAG_CREATE_BLOCK = 'createBlock(`';
const TAG_CREATE_BLOCK_CLOSE = '`);';

 

class DynamcFunctionBuilder{
   
    constructor(name,context) {
        this.name = name;
        this.context = context;
    }
    extract_fun_body(code){
        console.log('🪝🧐 try _extract_fun_body code?',code);
        const markIndex = code.indexOf('{') + 1;
        const len = code.length;
        code = code.substring(markIndex,len-1);
        console.log('🪝🧐 _extract_fun_body code?',code);
        return code;
    }
    /*
    test code:
    let buf = `let block1 = createBlock(\`aaa\`);
 
        let block2 = createBlock(\`bbb\`);
        let block3 = createBlock(\`cccc
        
        
        ccc2
        \`);

        let a =111 ;

        let x = (`aaa `); //this case also match the close tag but no open tag
        //end
    `
    original function code:
    let block1905 = createBlock(`<div><pre style="background-color: #e9ecef;">{
    'editForm': {
        'file': [
            {
                'key': 'file',
                'components': [
                {'key': 'webcam', 'defaultValue': True},
                {'key': 'storage', 'defaultValue': 'base64'}
                ]
            }
            ]
    }
    }</pre></div>`,hookData);

    */
    _trace_list(list, tag='_trace_list'){
        console.log(`🪝🧐 length: ${list.length}`); 
        for (let index = 0; index < list.length; index++) {
            let buf = list[index];
            console.log(`🪝🧐 ${tag}:  [${index}]=${buf}`);  
        }
    }
 
    inject_block(xmlstr){
        if (globalThis.owlMetaBuilder.ignoredHtmlTag(xmlstr)){
            return ` createBlock( \`${xmlstr}\` );` ;
        }
        return ` createBlock( owlMetaBuilder.injectIfNeeds(\`${xmlstr}\`,context) );` 
    }

    rewrite_template_function_code(code,report={}){
        
        const segments = code.split(TAG_CREATE_BLOCK);
        
        let rewrited = false;
    
        if (!segments || segments.length <=0) {
          
            return null;
        }
      
        let go = true;
        let index = 0;
        let piece_code_list = [];
        let prefix = segments[index]; 
        let suffix = segments[index+1];
        do{
           
            let sub_segs = suffix.split(TAG_CREATE_BLOCK_CLOSE);
            //this._trace_list(sub_segs,'sub');
            let xmlstr = sub_segs[0];
            console.log('🪝 xmlstr:',xmlstr,this);
            let piece_code = prefix + this.inject_block(xmlstr); 
            console.log('🪝 piece_code:',piece_code,this);       
            piece_code_list.push(piece_code);
            rewrited = true;

            suffix = null;
            if ( sub_segs.length>0 ){
                prefix = sub_segs[1];
                suffix = segments[index+2]; 
            }  
            index = index + 1;
            go = index < segments.length  &&  suffix
            if (!go){
                if (sub_segs.length >0){
                    let at = 1;
                    do{ // append left code also append close mark
                        piece_code = sub_segs[at] ;
                        if (at + 1 < sub_segs.length){
                            piece_code =  piece_code + TAG_CREATE_BLOCK_CLOSE
                        }
                        piece_code_list.push(piece_code);
                        at = at + 1;
                        
                    }while(at < sub_segs.length)
                }
                 
            }
        }while(go); 
        
        report.rewrited = true;
        
        return piece_code_list.join('');
    }    
    _rebuild_template_function(fun, report={}){
        //return new Function("app, bdom, helpers", code); 
        const block_code = fun.toString();
        console.log(`🪝 rebuild_template_function, block_code?`,block_code);
        if (!block_code.includes(TAG_CREATE_BLOCK)){
            return fun;
        }        
        let code = this.extract_fun_body(block_code); 
       
        if (!code.includes(TAG_CREATE_BLOCK)){
            return fun;
        }
        //@step rebuild it  
        code = this.rewrite_template_function_code(code); 
           
        //@step 
        let log_line = `console.log('🪝🦅🔥🤣 -> createBlock for:${this.name}, globalThis?', globalThis );\r\n`; 
        const context_str = JSON.stringify(this.context);
        let context_line = `let context = ${context_str};\r\n`;
        let context_log_line = `console.log('🪝🦅🔥🤣 ->context:',context,context.templateName);\r\n`;
        let builder_line = `let owlMetaBuilder = globalThis.owlMetaBuilder;\r\n\r\n`;
        code = '\r\n' + log_line + context_line + context_log_line + builder_line + code; 
       
        try{
            console.log('🪝🧐 try create new Function with new code?',code); 
            const result =  new Function("app, bdom, helpers", code);
            report.changed = true;
            return result;
        }catch(ex){
            console.trace(ex);
            console.error(`🪝 Failed rebuild_template_function! ex:${ex}, for:${this.name},new code?`,code);
            console.log(`🪝 Failed rebuild_template_function for ${this.name},old code?`,block_code);
        } 
        return fun;
        
    } 
    rebuild_template_function(fun, report={}){
        try{
            return this._rebuild_template_function(fun,report);
        }catch(ex){
            console.error("🪝 Failed rebuild_template_function", ex);
            console.trace(ex);
        }
        return null;
    }
    
} 



function extend_owl_app(){ 
         
        function is_str(val){
            return  typeof val === "string"
        }
        function _to_meta(meta_str){
            meta_str = decodeURIComponent(meta_str);
            const meta = JSON.parse(meta_str);
            return meta;
        }        
        function _mock_meta_data(name,meta={}){ 
            const meta_data ={
                templateName: name,
                meta:meta
            }
            return meta_data;
        }
        function _fetch_meta_data(name,template, meta_key='t-meta', needRemove=true ) { 
            
            const meta_str = template.getAttribute(meta_key); 
            if (!meta_str){  
                let meta_data =  odooSpy().templateMetaData.get(name);
                if (!meta_data){
                    meta_data = odooSpy().xmlMetaData.get(name);
                }
                return meta_data;
            }
            //@step 
            const meta = _to_meta(meta_str); 
            const meta_data ={
                templateName: name,
                meta: meta
            }
            odooSpy().templateMetaData.put(name,meta_data); 

            if (needRemove){
                template.removeAttribute(meta_key);
            }
            return meta_data;
        }

        // entry 
        const AppClass = globalThis.owl.App;
        const old_compileTemplate = AppClass.prototype._compileTemplate;
        
        AppClass.prototype._compileTemplate = function _withMeta_compileTemplate(name, template) {
           
            console.log('🪝🧐 try _compileTemplate,name? template?',name,template);
            let context = null;
            do{ 
                if (is_str(template)){
                    console.log(`🪝🧐  ${name} is string, not fetch meta, template?`,template );
                    break;
                }
                context = _fetch_meta_data(name,template) 

            }while(false); 
            console.log('🪝🧐 apply with: name? template? context?',name,template,context);
            if (!context){
                context = odooSpy().xmlMetaData.get(name);
                console.log('🪝🧐 odooSpy().xmlMetaData.get: name? context?',name, context);
                if (!context){
                    odooSpy().missMetaData.put(name,template);
                    //this._listenSpyEvent();
                }
            }
            //@step get the original dynamic function code 
            const fun = old_compileTemplate.apply(this,[name,template]); 
            
            //@step 
            if (!context){
              context = _mock_meta_data(name);
            } 
            if (!context){
                return fun;
            }
            
            console.log('🪝🧐 try DynamcFunctionBuilder,name? old_fun? ',name,fun.toString());
            //@step rebuild it append handle meta information code 
            const functionBuilder = new DynamcFunctionBuilder(name,context);
            const report ={};
            let fun_withMeta  = functionBuilder.rebuild_template_function(fun,report);
            if (fun_withMeta && report.changed){ 
                console.log('🪝🧐🚀 apply new function with meta, name? fun? ',name,fun_withMeta.toString());
                console.log('🪝🧐🚀 apply new function with meta, name? old-fun? ',name,fun.toString());

                return fun_withMeta;
            }
            //@step no update, use 
            console.log('🪝 not rebuild, continue old function, name? fun? ',name,fun.toString());
            return fun; 
        };

        AppClass.prototype._listenSpyEvent = function _listenSpyEvent(){
            
            if (this.spylistenSpyEvent){
                return ;
            }
            
            globalThis.odooSpy.on(SpyEvent.XmlMetaReady, this, this._onSpyEvent);
            this.spylistenSpyEvent = 1;
        }
        AppClass.prototype._onSpyEvent = function _onSpyEvent(meta_data){
            console.log('🪝 _onSpyEvent: data?',meta_data);
            let {templateName,meta}  = meta_data;
            const targets = document.querySelectorAll(`[data-template-name=${templateName}]`);
            for (let index = 0; index < targets.length; index++) {
                const item = targets[index];
                console.log(`🪝 _onSpyEvent, [${templateName}] find target item?`,item); 
                const tooltip_info = globalThis.owlMetaBuilder.metaData_to_tooltip_info_str(meta_data);
                
                if (tooltip_info){
                    item.setAttribute('data-tooltip-info',tooltip_info);
                    console.log(`🪝 _onSpyEvent, update target item?`,item);
                } 
                
            }
        }
}

  
function odooSpy(){
    return globalThis.odooSpy; 
}

function odoo_debuger(){
    const odoo = globalThis.odoo;
    odoo.loader.bus.addEventListener("module-started", (e) => {
        console.log('🪝 module-started',e);
    });
}

///////////////////////////////////////////    
//
//  main entry
//
///////////////////////////////////////////
setup_spy(); 
extend_owl_app(); 

odoo_debuger();

const launch_info = `odokit spy is starting ... 🔥💥🔨
- Trace template
- Trace data streaming
Use odokit spy to speed coding! 🚀
`;
console.log(launch_info)
