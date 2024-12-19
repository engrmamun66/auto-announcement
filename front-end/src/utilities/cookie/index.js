  
function setCookie(cname, cvalue, exdays=1) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    if(typeof cvalue == 'object') cvalue = JSON.stringify(cvalue);
    document.cookie = cname + "=" + cvalue + ";" + expires + `;path=/;`;
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
  
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookieName) === 0) {
        let result = cookie.substring(cookieName.length, cookie.length);
        try {
            return JSON.parse(result);
        } catch (error) {
            console.warn(result);
            console.warn(error);
            return result;
        }
      }
    }
    return null;
  }


function checkCookie(cname) {
    var user = getCookie(cname);
    if (user != "") {
        return true;
    } else {
        return false;
    }
}

function deleteCookie(cname) {
    let cvalue = '';
    let d = new Date();
    d.setTime(d.getTime() - 9999999);
    var expires = "expires="+ d.toUTCString();   
    document.cookie = cname + "=" + cvalue + ";" + expires + `;path=/;`;
}

function deleteKey(cookieName, key, exdays=1) {
    let object = getCookie(cookieName);
    if(key in object){
        delete object[key];
    }
    setCookie(cookieName, object, exdays);
}

function updateKey(cookieName, key, value, exdays=1) {
    let object = getCookie(cookieName);
    object[key] = value;
    setCookie(cookieName, object, exdays);
}

export default {
    setCookie,
    getCookie,
    checkCookie,
    deleteCookie,
    deleteKey,
    updateKey,
}