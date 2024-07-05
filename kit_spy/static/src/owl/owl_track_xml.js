/** @odoo-module **/
 
  
import { extract_caller } from './call_tracer';
import { setup_spy,SpyEvent } from './spy'; 
  
function odooSpy(){
    return globalThis.odooSpy; 
}

////////////////////////////////////////////////////////////
const Utils={
    /*
     at useViewCompiler (http://localhost:8020/web/assets/debug/web.assets_backend.js:56292:41) (/web/static/src/views/view_compiler.js:486)

    */
    _parse_stack_to_meta(val){
 
        var re = /\([^\)]+\)/g
       // re = /\((.+)\)/g
        const list = val.match(re);
        if (!list || list.length<=0){
            return val;
        }
        // take last item
        // (/web/static/src/core/commands/command_service.js:50)
        let line = list[list.length-1];
        line = line.replaceAll("(","");
        line = line.replaceAll(")","");
        return line;
    },

    parse_stack_to_meta(val){
        try{
            const caller = Utils._parse_stack_to_meta(val);
            return {
                file:caller
            }
        }catch(ex){
            console.error('🪝 Failed parse_stack_to_meta,ex?',ex);

        } 
        return {
            file:'undefined'
        }
    }, 
  
}
/*
    track the xml meta information, eg: location 
*/   
const track_xml_meta = function (args={template_name}) {
    //console.trace('🪝🏮 track_xml_meta');
    
    const {template_name} = args;
    const meta_data = odooSpy().xmlMetaData.get(template_name)
    //@case
    if (meta_data){
        
        return meta_data; 
    } 
    //@case  
    
    extract_caller().then(x=>{
        
        if (x){
            const meta = Utils.parse_stack_to_meta(x);
            
            if (meta){ 
            const meta_data={
                templateName :template_name,
                meta : meta
            }
            odooSpy().xmlMetaData.put(template_name,meta_data); 
            odooSpy().trigger(SpyEvent.XmlMetaReady, meta_data);
            }
        } 
    });  
    return null; 
} 
  

///////////////////////////////////////////    
//
//  main entry
//
///////////////////////////////////////////
setup_spy(); 
odooSpy().track_xml_meta = track_xml_meta;
  
const launch_info = `odokit spy🕵️, owl_track_xml loaded done!
`;

