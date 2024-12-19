import { emitter } from './import-hub'
export function loadGoogleMapCDN(mapAPIKey) {
    try {
        var head = document.getElementsByTagName('head')[0];
        var s = document.createElement('script');
        s.id = 'RENTMY_GOOGLE_MAP';
        s.src = `https://maps.googleapis.com/maps/api/js?key=${mapAPIKey}&callback=MyCallBack&libraries=places&v=weekly`;
        s.async = true; // Add async attribute
        s.defer = true; // Add defer attribute
        head.appendChild(s);
    } catch (error) {
        console.warn('loadGoogleMapCDN() :: ' + error);
    }
}


let autocomplete;

const address = {
    location: '',
    country: '',
    city: '',
    state: '',
    zipcode: '',
    country_long_name: '',
    country_short_name: ''
}

function initAutocomplete(selector = null, {countryCode="us", emitName='auto_fill_address'}={}) {
    try {
        if (!selector) return;
        let address1Field = selector instanceof HTMLElement ? selector : document.querySelector(selector);

        autocomplete = new google.maps.places.Autocomplete(address1Field, {
            // componentRestrictions: { country: ["us", "ca"] },
            fields: ["address_components", "geometry"],
            types: ["address"],
            componentRestrictions: { country: countryCode.toLowerCase() || 'us' }
        });

        autocomplete.addListener("place_changed", fillInAddress.bind({address1Field, emitName}));
    } catch (error) {
    }
}

function fillInAddress() {
    try {
        let {emitName} = this;
        const place = autocomplete.getPlace();
        Object.keys(address).forEach(key => address[key] = '')

        for (const component of place.address_components) {
            const componentType = component.types[0];

            switch (componentType) {
                case "street_number": {
                    address.location = this.address1Field.value;
                    break;
                }

                case "route": {
                    address.location = this.address1Field.value;
                    break;
                }

                case "postal_code": {
                    address.zipcode = `${component?.long_name}${address?.zipcode || ''}`;
                    break;
                }

                case "postal_code_suffix": {
                    address.zipcode = `${address?.zipcode || ''}`;
                    break;
                }

                case "locality":
                    address.city = component?.long_name || '';
                    break;

                case "postal_town":
                    address.city = component.long_name || '';
                    break;

                case "administrative_area_level_1": {
                    address.state = component.short_name || '';
                    break;
                }

                case "country":
                    address.country_short_name = component.short_name || '';
                    address.country_long_name = component.long_name || '';
                    break;

            }
    }
        Object.keys(address).forEach(key => {
            if(address[key] === 'null' || address[key] == null){
                address[key] = '';
            }
        })      

        address.el = this.address1Field;
        address.emitName = emitName;
        emitter.emit(emitName, address);
    } catch (error) {
        address.el = this.address1Field;
        address.emitName = emitName;
        emitter.emit(emitName, address);
    }
}

function MyCallBack() { /** This is a dummy callback to ignore error */ };
window.MyCallBack = MyCallBack;
export default initAutocomplete;
