
export function windowLocation(){
    return window.location;
    let {location: topLocation} = window.top
    if(topLocation?.origin && topLocation?.href && topLocation?.reload && topLocation?.host){
        return window?.top?.location;
    } else {
        return window.location;
    }
}

export function clone (data, { remove = [], add = {}, only = [] } = {}) {
    data = JSON.parse(JSON.stringify(data));

    if (typeof data === "object" && Array.isArray(data) === false) {
      // Delete keys
      if (remove?.length && Array.isArray(remove)) {
        remove.forEach((key) => {
          if (data.hasOwnProperty(key)) {
            delete data[key];
          }
        });
      }

      // keep only
      if (only?.length && Array.isArray(only)) {
        const new_data = {};
        only.forEach((key) => {
          if (data.hasOwnProperty(key)) {
            new_data[key] = data[key];
          }
        });
        data = new_data;
      }

      return { ...data, ...add };
    } else {
      return data;
    }
}

export function send_css_in_header(minified_css, {attrName = 'rentmy-cdn-css', position="afterbegin", existingStyleTag=null}={}) {
    function addStyleToHead() {
        try {
            var head = document.getElementsByTagName('head')?.[0];
            if(head){
                var s = document.createElement('style');
                s.setAttribute('type', 'text/css');
                s.setAttribute(attrName, true);

                if(existingStyleTag) s = existingStyleTag;
                
                if (s.styleSheet) {   // IE
                    s.styleSheet.cssText = minified_css;
                } else {                // the world
                    s.appendChild(document.createTextNode(minified_css));
                }
                head.insertAdjacentElement(position, s);
            }
        } catch (error) {
            console.warn('send_css_in_header() :: ' + error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addStyleToHead);
    } else {
        addStyleToHead();
    }
}

function isHexColor(color){
  if(!color) return false;
  if(!(typeof color == 'string')) return false;
  return /^([#0-9a-fA-F]){7}$/g.test(color);
}

export function setDatePickerTheme(RENTMY_GLOBAL){
  let primaryColor = RENTMY_GLOBAL?.cssVariableObject?.['--rentmy-primary-color'];
  if(primaryColor){
    if(isHexColor(primaryColor)){
      if(!RENTMY_GLOBAL?.emDateTimePicker) RENTMY_GLOBAL.emDateTimePicker = {};
      if(!RENTMY_GLOBAL?.emDateTimePicker?.colors) RENTMY_GLOBAL.emDateTimePicker.colors = {};
      RENTMY_GLOBAL.emDateTimePicker.colors.primary_bg = primaryColor;
    }else{
      console.log('%c Hello RentMy Devs', 'color:Red;font-size:20px');
      console.log(`%c --rentmy-primary-color value should be a HEX color(e.g. #333333), otherwise datepicker theme color will not change according to you primary color. You've passed: (${primaryColor})`, 'color:Red;font-size:13px')
    }
  }

}
 
