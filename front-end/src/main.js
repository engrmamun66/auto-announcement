import './assets/css/module.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import moment from 'moment/moment';
globalThis.windowLocation = windowLocation;
import {  minified_css } from './minified-css';
import { emitter, utils, components } from './import-hub';
import { send_css_in_header, windowLocation, clone, setDatePickerTheme } from './initial_functions';
globalThis.moment = moment;



if (typeof window.RENTMY_GLOBAL === 'undefined') {
    window.RENTMY_GLOBAL = {};
}




const mapAPIKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;



function mapping_images_and_pages(){
    /* -------------------------------------------------------------------------- */
    /*                                Page Mapping                                */
    /* -------------------------------------------------------------------------- */

    
    if(typeof RENTMY_GLOBAL?.page == 'object'){
        if(!DOMAIN.endsWith('/')) DOMAIN += '/';
        Object.keys(RENTMY_GLOBAL.page).forEach(key => {
            let url = RENTMY_GLOBAL.page[key].replace(/^\//, "");  
            if(!url.startsWith('http')) RENTMY_GLOBAL.page[key] = DOMAIN + url;                     
        });  
    }
    if(RENTMY_GLOBAL?.home_url){
        let url = RENTMY_GLOBAL.home_url.replace(/^\//, "");
        if(!url.startsWith('http')) RENTMY_GLOBAL.home_url = DOMAIN + url;
    }
    if(RENTMY_GLOBAL?.afterOrder?.paymentSuccessUrl){
        let url = RENTMY_GLOBAL.afterOrder.paymentSuccessUrl.replace(/^\//, "");
        if(!url.startsWith('http')) RENTMY_GLOBAL.afterOrder.paymentSuccessUrl = DOMAIN + url;
    }
    if(RENTMY_GLOBAL?.afterOrder?.paymentCancelUrl){
        let url = RENTMY_GLOBAL.afterOrder.paymentCancelUrl.replace(/^\//, "");
        if(!url.startsWith('http')) RENTMY_GLOBAL.afterOrder.paymentCancelUrl = DOMAIN + url;
    }
    /* ------------------------------- End Mapping ------------------------------ */



    /* -------------------------------------------------------------------------- */
    /*                               Images Mapping                               */
    /* -------------------------------------------------------------------------- */
    if(!RENTMY_GLOBAL.images) RENTMY_GLOBAL.images = {};
    if(!RENTMY_GLOBAL?.images?.default_profile_image) RENTMY_GLOBAL.images.default_profile_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/profile.png";
    if(!RENTMY_GLOBAL?.images?.default_product_image) RENTMY_GLOBAL.images.default_product_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/product-image-placeholder.jpg";
    if(!RENTMY_GLOBAL?.images?.emptybag_image) RENTMY_GLOBAL.images.emptybag_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/emptybag.png";
    if(!RENTMY_GLOBAL?.images?.forgot_password_image) RENTMY_GLOBAL.images.forgot_password_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/forgot-password.png";
    if(!RENTMY_GLOBAL?.images?.pickup_image) RENTMY_GLOBAL.images.pickup_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/pickup.png";
    if(!RENTMY_GLOBAL?.images?.pickup_white_image) RENTMY_GLOBAL.images.pickup_white_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/pickup-white.png";
    if(!RENTMY_GLOBAL?.images?.shipping_image) RENTMY_GLOBAL.images.shipping_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/shipping.png";
    if(!RENTMY_GLOBAL?.images?.shipping_white_image) RENTMY_GLOBAL.images.shipping_white_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/shipping-white.png";
    if(!RENTMY_GLOBAL?.images?.delivery_image) RENTMY_GLOBAL.images.delivery_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/delivery.png";
    if(!RENTMY_GLOBAL?.images?.delivery_white_image) RENTMY_GLOBAL.images.delivery_white_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/delivery-white.png";
    if(!RENTMY_GLOBAL?.images?.download_pdf_image) RENTMY_GLOBAL.images.download_pdf_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/download-pdf.png";
    if(!RENTMY_GLOBAL?.images?.download_calendar_image) RENTMY_GLOBAL.images.download_calendar_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/download-calendar.png";
    if(!RENTMY_GLOBAL?.images?.check_list_image) RENTMY_GLOBAL.images.check_list_image = "https://s3.us-east-2.amazonaws.com/cdn.rentmy.co/embed/images/icons/check-list.png";
    /* --------------------------- End Images Mapping --------------------------- */
}

if(typeof DOMAIN === 'undefined'){
    window.DOMAIN = 'www.undefined.com/'
    console.warn('Please type var DOMAIN = "www.yourdomain.com"');
}
mapping_images_and_pages();


// With Elementor
utils.domElement.prepareElemetorEditedWidgets();



if(RENTMY_GLOBAL?.skip_css !== true){
    send_css_in_header(minified_css);
    setDatePickerTheme(RENTMY_GLOBAL);

    if(!window?.____cssVarPushed1){
        if(RENTMY_GLOBAL?.cssVariableObject && typeof RENTMY_GLOBAL?.cssVariableObject === 'object' && !Array.isArray(RENTMY_GLOBAL?.cssVariableObject)){
            let cssString = Object.entries(RENTMY_GLOBAL.cssVariableObject).map(entry => entry.join(':')).join(';');
            send_css_in_header(`:root{${cssString}}`, {attrName: 'rentmy-css-vars', position: 'beforeend'});
            window.____cssVarPushed1 = true;
        }
    } 
}


/* -------------------------------------------------------------------------- */
/*                Overwriting RENTMY_GLOBAL, outside of iframe                */
/* -------------------------------------------------------------------------- */
/*
    Outside of iframe, write this code
    ==========================================================================
    window.addEventListener('message', function(e) { 
        if (e.data?.RENTMY_GLOBAL) e.source.postMessage({outside: true, RENTMY_GLOBAL}, e.origin);            
    });

*/
window.parent.postMessage({RENTMY_GLOBAL}, '*');
window.addEventListener('message', function(event) {
    if(event.data?.outside && event.data?.RENTMY_GLOBAL){
        let page = event.data?.RENTMY_GLOBAL?.page ? clone(event.data?.RENTMY_GLOBAL?.page) : null;
        delete event.data?.RENTMY_GLOBAL?.page;
        window.RENTMY_GLOBAL = {...window.RENTMY_GLOBAL, ...event.data?.RENTMY_GLOBAL};
        if(page && (typeof page == 'object')){
            window.RENTMY_GLOBAL.page = {...window.RENTMY_GLOBAL.page, ...page};
        }
        /**
         * ========= Default CSS Variable (copied from "module.css")========
         * =================================================================
            --rentmy-bg-default: #ffffff; -- no need to change now
            --rentmy-primary-color-default: #333333;
            --rentmy-primary-color-hover-default: #333333;
            --rentmy-border-default: #cacaca;
            --rentmy-soft-grey-default: #ced4da;
            --rentmy-danger-bg-default: #f76767;
            
            == NOTE: If you modifie from outside of iframe, pass object as below in "cssVariableObject" key
            cssVariableObject: {
                '--rentmy-primary-color': '#333333',
                '--rentmy-primary-color-hover': '#333333',
                '--rentmy-border': '#cacaca',
                '--rentmy-soft-grey': '#ced4da',
                '--rentmy-danger-bg:': '#f76767',
            },
        */

        if(!window?.____cssVarPushed2){
            if(RENTMY_GLOBAL?.cssVariableObject && typeof RENTMY_GLOBAL?.cssVariableObject === 'object' && !Array.isArray(RENTMY_GLOBAL?.cssVariableObject)){
                setDatePickerTheme(RENTMY_GLOBAL);
                let cssString = Object.entries(RENTMY_GLOBAL.cssVariableObject).map(entry => entry.join(':')).join(';');
                let existingStyleTag = document.querySelector('style[rentmy-css-vars]');
                send_css_in_header(`:root{${cssString}}`, {attrName: 'rentmy-css-vars', position: 'beforeend', existingStyleTag});               
                window.____cssVarPushed2 = true;
            }
        }



        mapping_images_and_pages();
        // console.log('Received Data:', event.data);
        // console.log('Latest RENTMY_GLOBAL:', RENTMY_GLOBAL);
    }
});
/* --------------------------- End overwrite event -------------------------- */
 




/**
  We using global event. That's loading from our plugin
  If for some reason the file is not loaded, thi code will help to avoid fatal error
 */
if(typeof RentMyEvent == 'undefined'){    
    window.RentMyEvent = {
        on: (eventName, callback)=> null,
        emit: (eventName, data, useFilter=true)=> null,
        off: (eventName, callback)=> null,
        off_all: (eventName)=> null,
        add_action: (eventName, callback)=> null,
        do_action: (eventName, data, useFilter=true)=> null,
        remove_action: (eventName, callback)=> null,
        remove_actions: (eventName)=> null,
        add_filter: (filterName, callback)=> null,
        apply_filters: (filterName, data)=> data,
        remove_filter: (filterName, callback)=> null,
        remove_filters: (filterName)=> null,
        clearAll(){}
    };
} 


const app = createApp(App);
app.use(createPinia());

function mountTheApp(){
    // console.log({RENTMY_GLOBAL});    

    
    /* -------------------------------------------------------------------------- */
    /*                               Start Observer                               */
    /* -------------------------------------------------------------------------- */
    let observation_timeout = null;
    const observer = new MutationObserver(function (mutationsList, observer) {
        for(var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                clearTimeout(observation_timeout);
                observation_timeout = setTimeout(() => {
                    emitter.emit('observed', {mutation});
                }, 1000);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    /* ------------------------------ End Observer ------------------------------ */

    if(document.getElementById('appDevLocal')){
        app.mount('#appDevLocal');
    } else {
        let app_div = document.createElement('div');
        app_div.id = 'rentmy-app';
        app_div.style.display = 'none';
        document.body.append(app_div);
        window.RENTMY_GLOBAL = RENTMY_GLOBAL
        window.RENTMY_GLOBAL.rentmy_customer_info = utils.cookie.getCookie('rentmy_customer_info');
        let clientPortalHTML = `
             <div class="alert alert-danger" role="alert">
                <h4>Client Portal Is Not Available!</h4>
            </div>
        `
        app
        .provide('utils', utils)
        .provide('emitter', emitter)
        .provide('services', services)
        .provide('components', components)
        .provide('clientPortalHTML', clientPortalHTML)
        .mount('#rentmy-app')
    }
}

setTimeout(() => { // just for overwrite RENTMY_GLOBAL by 'message' event
    if(RENTMY_GLOBAL?.using_in_cli_project){
        RentMyEvent.on('rentmy_settings_is_ready', (val) => {
            mountTheApp();        
        })
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener("DOMContentLoaded", mountTheApp);
        } else {
            mountTheApp();
        }
    }
}, 200);


    







