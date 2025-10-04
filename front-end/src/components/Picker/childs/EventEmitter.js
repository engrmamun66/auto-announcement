/**
  Example usage:
  ==============================================
    const RentMyEvent = new RentMyEventEmitter();
    RentMyEvent.on('message', (data) => {
        console.log('Received message:', data);
    });
    RentMyEvent.emit('message', 'Hello, World!'); // Output: Received message: Hello, World!

    RentMyEvent.add_action('message', (data) => {
        console.log('Received message:', data);
    });
    RentMyEvent.do_action('message', 'Hello World!');

    RentMyEvent.addFilter('uppercase', (data) => data.toUpperCase());
    const modifiedData = RentMyEvent.apply_filters('uppercase', 'Some text',);
    console.log(modifiedData); // Output: SOME TEXT
 */
class RentMyEventEmitter {
    constructor() {
        this.events = {};
        this.filters = {};
    }

    /* ---------------------------------- */
    /*            Start Emitting          */
    /* ---------------------------------- */

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName, data, useFilter=true) {
        const eventHandlers = this.events[eventName] || [];
        const allEventHandlers = this.events['*'] || [];

        [...eventHandlers, ...allEventHandlers].forEach(handler => {
            let _data = useFilter ?  this.apply_filters(eventName, data) : data
            handler(_data);
        });
    }

    off(eventName, callback) {
        const eventHandlers = this.events[eventName];
        if (eventHandlers) {
            this.events[eventName] = eventHandlers.filter(handler => handler !== callback);
        }
    }

    off_all(eventName) {
        this.events[eventName] = [];
    }
    /* ----------- End Emitting ----------- */

    /* ---------------------------------- */
    /*          Start Action Hook         */
    /*          (same as Emitting)        */
    /* ---------------------------------- */
    add_action(eventName, callback) {
        this.on(eventName, callback);
    }
    
    do_action(eventName, data, useFilter=true) {
        this.emit(eventName, data, useFilter);
    }
    
    remove_action(eventName, callback) {
        this.off(eventName, callback);
    }

    remove_actions(eventName) {
        this.off_all(eventName);
    }
    /* --------- End Action Hook -------- */


    /* ---------------------------------- */
    /*          Start Filter Hook         */
    /* ---------------------------------- */
    add_filter(filterName, callback) {
        if (!this.filters[filterName]) {
            this.filters[filterName] = [];
        }
        this.filters[filterName].push(callback);
    }

    apply_filters(filterName, data) {
        const filterCallbacks = this.filters[filterName] || [];
        return filterCallbacks.reduce((filteredData, callback) => callback(filteredData), data);
    }

    remove_filter(filterName, callback) {
        const filterCallbacks = this.filters[filterName];
        if (filterCallbacks) {
            this.filters[filterName] = filterCallbacks.filter(handler => handler !== callback);
        }
    }

    remove_filters(filterName) {
        this.filters[filterName] = [];
    }
    /* --------- End Filter Hook -------- */

    clearAll(){
        this.events = {};
        this.filters = {};
    }
}

export const Emitter = new RentMyEventEmitter();

export default Emitter;
