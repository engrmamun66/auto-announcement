import helper from '../helper';
import http from '../http';
import cookie from '../cookie';
import { Toaster, emitter } from '@/import-hub';
const domElement = {
    getAttributes: function(DOM_element){
        let attrs = {}
        let attributesList = DOM_element?.attributes
        if(attributesList?.length){
            for (let i = 0; i < attributesList?.length; i++) {
                const { name, value } = attributesList[i];  
                attrs[name] = value     
            }
        }
        return attrs
    },
    clearHTML: function(selector/**selector or DOM-Element */){
        if(selector){
            let element
            if(typeof selector == 'string') element = document.querySelector(selector);     
            else element = selector       
            if (element) element.innerHTML = '';
        }
    },
    autoSetRentmyPageLinks: function(){
        let all_a_tag = document.querySelectorAll('a[RentMyPageLink]');
        let { page } = window?.RENTMY_GLOBAL
        if(all_a_tag?.length){
            for(let i=0; i < all_a_tag?.length; i++){
                let a = all_a_tag[i];
                let key = a?.getAttribute('RentMyPageLink');
                let uid = a?.getAttribute('uid');
                if(page?.[key]){
                    if(uid && ['product_details', 'package_details'].includes(key)){
                        let url = helper.withURL.setQuery({ uid }, page?.[key], true);
                        a.setAttribute('href', url);    
                    } else {
                        a.setAttribute('href', page?.[key]);
                    }
                }
            }
        }
    },
    toggleSection: async function (id) {
        const section = document.getElementById(id)
        if(section) {
            if(section.hidden) {
                section.hidden = false
            } else {
                section.hidden = true
            }
        }
    },
    displayWPMenu: function () {
        // Client Portal menu link from wordpress menu
        let isLogin = window.RENTMY_GLOBAL.rentmy_customer_info
        let loginPageLinks = document.querySelectorAll('.RentMy-login-page')
        let clientPortalPageLink = document.querySelectorAll('.RentMy-client-portal-page')

        if(loginPageLinks?.length){
            for(let i=0; i <= loginPageLinks?.length; i++){
                if(isLogin){
                    loginPageLinks[i]?.removeAttribute('show');
                } else {
                    loginPageLinks[i]?.setAttribute('show', true);
                }
            }
        }

        if(clientPortalPageLink?.length){
            for(let i=0; i <= clientPortalPageLink?.length; i++){
                if(isLogin){
                    clientPortalPageLink[i]?.setAttribute('show', true);
                } else {
                    clientPortalPageLink[i]?.removeAttribute('show');
                }
            }
        }    
    },
    prepareElemetorEditedWidgets: function() { 
        /**
            * -- When we want to desing a page with Elementor WYSIWYG Control
            * Normally we are using attributes in HTML content like this <div RentMyProductDetilsInfo>, 
            * But Elementor and WordPress is removing this attrubute when saving, for their sanitization policy.
            * -- So we decide to use this like <div data-rentmyattr="RentMyProductDetilsInfo">, 
            * So, the extra work we need to do is to change each component's attributes before mounting them.
            * Outpur will be like below: 
            * --- from <div data-rentmyattr="RentMyProductDetilsInfo"> 
            * --- to <div data-rentmyattr="RentMyProductDetilsInfo" RentMyProductDetilsInfo="true">
         */
        let elementsWithRentMyAttr = document.querySelectorAll('[data-rentmyattr]');
        elementsWithRentMyAttr.forEach(function (element) {
            let rentMyAttrValue = element.getAttribute('data-rentmyattr');
            element.setAttribute(rentMyAttrValue, '');
            element.removeAttribute('data-rentmyattr');
        });
    },
    userIsAuthenticated: function() {  
        if(!window.RENTMY_GLOBAL.rentmy_customer_info){  
            let message = RentMyEvent.apply_filters('AuthPageAcees:Message', null);
            if(message) Toaster().error(message);
            helper.redirect('login');
            return false;
        } else {
            return true;
        }
    },
    setWraperIsReady: async function(element=null, {time}={time: 10}){        
        setTimeout(() => {
            if(element){
                element?.setAttribute('wrapper-is-ready', true);
            }else{
                let wrapers = document.querySelectorAll('.RentMyWrapper')
                if(wrapers?.length){
                    for(let i=0; i <= wrapers?.length; i++){
                        wrapers[i]?.setAttribute('wrapper-is-ready', true);
                    }
                }
            }
        }, time);

        // Controlling the content that outside of .RentMyWrapper
        let tempHiddens = document.querySelectorAll('[temp-hidden]')
        if(tempHiddens?.length){
            for(let i=0; i <= tempHiddens?.length; i++){
                tempHiddens[i]?.removeAttribute('temp-hidden')
            }
        }        
        
    },
    parseRentMyData(domElement, defaultData={}, allowedKeysArray=[], aliasesKey={}){
        try {
            let RentMyParams = {...defaultData};
            let RentMyData = domElement?.getAttribute('RentMyData');
            if(!RentMyData) return defaultData;
            RentMyData = RentMyData.replace(/\s+/g, ' ').trim();
            RentMyData = RentMyData.replace(/\n+/g, '').trim();
            RentMyData = RentMyData.replace(/\t+/g, '').trim();

            RentMyData?.split(' ')?.forEach(element => {
                let parts = element?.split('=');
                let key = parts?.[0]
                let value = parts?.[1];
                if(key && value){
                    value = value.replace(/\\s/g, ' ');                 
                    if(value.toLowerCase() === 'true') value = true;
                    else if(value.toLowerCase() === 'false') value = false;
                    else if(value.toLowerCase() === 'null') value = null;
                    else if(value.toLowerCase() === 'undefined') value = undefined;
                    else if(/^\d+$/.test(value)) value = Number(value);
                    
                    if(allowedKeysArray?.includes(key)){
                        key = (key in aliasesKey) ? aliasesKey[key] : key;
                        RentMyParams[key] = value
                    }
                }     
            }); 
            return RentMyParams;
        } catch (error) {
            return {};
        } 
    },
    /**
     * Basically, sometimes use can pass [options] attribute from DOM
     * example: <div RentMyAttr option="key=value k2=value2 search=product\sname"></div>
     */
    parseOptions(domElement, attrName='options'){
        try {
            let data = {};
            let options = domElement?.getAttribute(attrName);
            if(!options) return data;
            options = options.replace(/\n+/g, ' ').trim();
            options = options.replace(/\s+/g, ' ').trim();
            options = options.replace(/\t+/g, '').trim();

            options?.split(' ')?.forEach(item => {
                let parts = item?.split('=');
                let key = parts?.[0]
                let value = parts?.[1];
                if(key && value){
                    value = value.replace(/\\s/g, ' ');                 
                    if(value.toLowerCase() === 'true') value = true;
                    else if(value.toLowerCase() === 'false') value = false;
                    else if(value.toLowerCase() === 'null') value = null;
                    else if(value.toLowerCase() === 'undefined') value = undefined;
                    else if(/^\d+$/.test(value)) value = Number(value);
                    data[key] = value;
                }  
            }); 
            return data;
        } catch (error) {
            return {};
        } 
    },
    bindLogoutEvent: async function (globalLoader) {

        async function logoutFromServer() {
            try {
                const data = {action: 'rentmy_cdn_request', method: 'logout'};
                const response = await http.post(window.RENTMY_GLOBAL?.ajax_url, data)
                return response.data
            } catch(error) {
                console.warn('My be this is not wordpress environment')
            }
        }
    
        const LogoutMe = function(logoutBtn) {
            if(!logoutBtn) return
            logoutBtn?.addEventListener('click', async () => {
                globalLoader.show();
                await logoutFromServer(); 
                cookie.deleteCookie('rentmy_customer_info');  
                console.log('HHHHH');            
                const redirect_page = RentMyEvent.apply_filters('logoutRedirectUrl',  RENTMY_GLOBAL?.page?.logout || RENTMY_GLOBAL?.home_url);         
                globalLoader.hide();    
                let logout_message = RentMyEvent.apply_filters('logoutMessage', null);
                if(logout_message) Toaster().success(logout_message);
                helper.withURL.setQuery({}, redirect_page);
                windowLocation().reload();
            })
        }
    
        const rentmyLogoutBtn = 'rentmy_logout_btn'
        const logoutBtn = document.getElementById(rentmyLogoutBtn);
        if(logoutBtn) {
            LogoutMe(logoutBtn);
        }
        
        const logoutBtnList = document.getElementsByClassName(rentmyLogoutBtn);
        if(logoutBtnList?.length){
            for(let i=0; i < logoutBtnList.length; i++){
                let button = logoutBtnList[i];
                // cookie.getCookie('rentmy_customer_info')
                if(button.classList.contains('hide_if_not_logged_in') && !cookie.getCookie('rentmy_customer_info')){
                    button.remove();
                } else {
                    LogoutMe(button)        
                }
            }
        }    
    },
    dropInCart: function(imageElement, cartElement) {
        try {
            const productImage = imageElement;
            const cartIcon = cartElement;
            const productClone = productImage.cloneNode(true);
            productClone.style.zIndex = 1000;
            productClone.style.scale = 1;
            productClone.style.width = '100px';
            imageElement.insertAdjacentElement('beforebegin', productClone)
        
        
            const productImageRect = productImage.getBoundingClientRect();
            const cartIconRect = cartIcon.getBoundingClientRect();
        
            const xOffset = cartIconRect.left - productImageRect.left;
            const yOffset = cartIconRect.top - productImageRect.top;        
            
            productClone.style.position = 'fixed';
            productClone.style.opacity = 1;
            productClone.style.transition = 'transform 0.5s ease-in';
            let xAdjustment = (Math.ceil(productClone.clientWidth / 2))
            let yAdjustment = (Math.ceil(productClone.clientHeight / 2))
            productClone.style.transform = `translate(${xOffset - xAdjustment + 20 }px, ${yOffset + yAdjustment}px)`;
    
            setTimeout(() => {
                productClone.classList.add('dropInCart');
                setTimeout(() => {
                    productClone.remove()
                    emitter.emit('open_minicart')
                }, 300);
            }, 400);      
        } catch (error) {
            
        }
        
    },
}

export default domElement