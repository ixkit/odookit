/** @odoo-module **/
import {  
    annotateTraceback,
} from "@web/core/errors/error_utils";
 
function _match_in_list(val, list){
    for (let index = 0; index < list.length; index++) {
        const item = list[index];
        if (val.indexOf(item)> -1 ){
            return true; 
        }
    }
    return false;
}
/*
    at Spy.track_xml_meta (http://localhost:8120/web/assets/debug/web.assets_web.js:42447:5) (/kit_spy/static/src/owl/owl_extend_xml.js:71)
    at xml (http://localhost:8120/web/assets/debug/web.assets_web.js:10887:32) (/kit_spy/static/src/owl/17/owl.js:3302)
    at Object.fn (http://localhost:8120/web/assets/debug/web.assets_web.js:80699:28) (/web/static/src/views/fields/field.js:19)
*/
export  async function extract_caller( calleeList =['at Spy.track_xml_meta'],jumpIndex=2){ 
    try{
        CALLER_STACK_PRINT;
    }catch(ex){ 
        try{ 
            let traceback = await  annotateTraceback(ex); 
            //console.trace(`🪝->extract_caller,traceback?`, traceback); 
            const list = traceback.split('\n');   
            let calle_line_number = -1;
            for (let index = 0; index <list.length; index++) {
                const line = list[index]; 
                if (_match_in_list(line,calleeList)){
                    calle_line_number = index; 
                    break;
                }
            }
            if (-1 == calle_line_number ){
                return null;
            }
            const result = list[calle_line_number + jumpIndex];
            

            return result;
        }catch(ex){
            console.error(ex);
        }
    } 
    return null;
}
 