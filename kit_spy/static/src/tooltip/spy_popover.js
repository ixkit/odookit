/** @odoo-module **/
/** patch, 
 * solve the popover postion issue: while target element big, the popover possition outside the window screen... 
 */
export const hookPopover={

    //popover,target
    onUpdate({target,popover}){ 
        
         
        const popData = {
            popoverElt:_getPopoverElt(popover),
            target:target,
        }
        
        if (!popData){
            //close event 
            return ;
        }
        // open event
        popData.invokeCount =0 ; 
        //_adjust_popover_postion(popData);
        setTimeout(_adjust_popover_postion,300,popData);
    } 

}
function _getPopoverElt(popover){
    //v16
    if (popover){
        const id = popover.id; 
        const key = `div [popover-id="${id}"]`;
        const popoverElt = document.querySelector(key);
        return popoverElt;
    }
    //v17
    const popoverElts = document.getElementsByClassName('o_popover');
    
    if (!popoverElts || popoverElts.length<=0){
        return null;
    }
    return popoverElts[0];
   
}
//{popoverElt:x, target:target}
function _adjust_popover_postion(data){
    let {popoverElt, target} = data;
    if (!target ) return ;
   
    
    
    if (!popoverElt){
        popoverElt = _getPopoverElt();
    }
    if (!popoverElt){
        
        data.invokeCount ++; 
        if (data.invokeCount>6){
            return ;
        }
        setTimeout(_adjust_popover_postion,100,data);
        return ;
    }
    const popBox = popoverElt.getBoundingClientRect();
    const targtBox = target.getBoundingClientRect();
    
    const top = popBox.top;
    if (top< 0 ){
        popoverElt.style.top = 0 + 'px';
        
    }
    const window_height = window.innerHeight; 
    if (top  >= window_height ||  popBox.bottom  - window_height > 50  ){
        //popoverElt.style.top = top - popBox.height - popBox.height ;
        let minTop = window_height - popBox.height - 15;
        popoverElt.style.top = minTop + 'px';
        
    }
    // if (popBox.left<0){
    //     popoverElt.style.left = 0;
    // } 
}