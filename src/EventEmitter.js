/**
 * Event and filter hook helper.
 * Use `emit()` / `do_action()` for predictable synchronous dispatch.
 * Use `emitAsync()` / `do_action_async()` only when you want to await async handlers.
 */
class EventBusEmitter {
    constructor() {
        this.events = {};
        this.filters = {};
        this.applyable_filters = {};
        this.applyable_events = {};
    }

    getEventHandlers(eventName) {
        const eventHandlers = this.events[eventName] || [];
        const wildcardHandlers = this.events["*"] || [];

        return [...eventHandlers, ...wildcardHandlers];
    }

    getEventPayload(eventName, data, useFilter = false) {
        return useFilter ? this.apply_filters(eventName, data) : data;
    }

    isPromiseLike(value) {
        return value && typeof value.then === "function";
    }

    logEventError(event_error, eventName, data, handler) {
        console.error({ event_error, eventName, data, handler });
    }

    logFilterError(apply_filters_error, filterName, data, callback) {
        console.error({ apply_filters_error, filterName, data, callback });
    }

    /* ---------------------------------- */
    /*            Start Emitting          */
    /* ---------------------------------- */

    // on is as like document.addEventListener(eventName, callback)
    // same as this.add_action
    on(eventName, callback) {
        if (typeof callback !== "function") return null;

        if (this.events[eventName]) {
            this.off(eventName, callback); // stop duplicate registrations
        } else {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
        this.applyable_events[eventName] = callback;

        return callback;
    }

    // same as this.do_action
    emit(eventName, data, useFilter = false) {
        const handlers = this.getEventHandlers(eventName);
        const payload = this.getEventPayload(eventName, data, useFilter);
        let lastResult;

        for (const handler of handlers) {
            try {
                lastResult = handler(payload);

                if (this.isPromiseLike(lastResult)) {
                    lastResult.catch((event_error) => {
                        this.logEventError(event_error, eventName, payload, handler);
                    });
                }
            } catch (event_error) {
                this.logEventError(event_error, eventName, payload, handler);
            }
        }

        return lastResult;
    }

    async emitAsync(eventName, data, useFilter = false) {
        const handlers = this.getEventHandlers(eventName);
        const payload = this.getEventPayload(eventName, data, useFilter);
        let lastResult;

        for (const handler of handlers) {
            try {
                lastResult = await handler(payload);
            } catch (event_error) {
                this.logEventError(event_error, eventName, payload, handler);
            }
        }

        return lastResult;
    }

    off(eventName, callback) {
        const eventHandlers = this.events[eventName];
        if (!eventHandlers) return;

        if (typeof callback !== "function") {
            delete this.events[eventName];
            delete this.applyable_events[eventName];
            return;
        }

        this.events[eventName] = eventHandlers.filter((handler) => handler !== callback);

        if (this.events[eventName].length === 0) {
            delete this.events[eventName];
            delete this.applyable_events[eventName];
            return;
        }

        if (this.applyable_events[eventName] === callback) {
            this.applyable_events[eventName] = this.events[eventName][this.events[eventName].length - 1];
        }
    }

    off_all(eventName) {
        delete this.events[eventName];
        delete this.applyable_events[eventName];
    }
    /* ----------- End Emitting ----------- */

    /* ---------------------------------- */
    /*          Start Action Hook         */
    /*          (same as Emitting)        */
    /* ---------------------------------- */

    // same as this.on
    add_action(eventName, callback) {
        return this.on(eventName, callback);
    }

    // same as this.emit
    do_action(eventName, data, useFilter = false) {
        return this.emit(eventName, data, useFilter);
    }

    async do_action_async(eventName, data, useFilter = false) {
        return this.emitAsync(eventName, data, useFilter);
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
        if (typeof callback !== "function") return null;

        if (this.filters[filterName]) {
            this.remove_filter(filterName, callback); // stop duplicate registrations
        } else {
            this.filters[filterName] = [];
        }

        this.filters[filterName].push(callback);

        return callback;
    }

    apply_filters(filterName, data, extraData = undefined) {
        const filterCallbacks = this.filters[filterName] || [];
        this.applyable_filters[filterName] = data;

        if (data === undefined || data === null) return data;

        let filteredData = data;
        for (const callback of filterCallbacks) {
            try {
                filteredData = callback(filteredData, extraData);
            } catch (apply_filters_error) {
                this.logFilterError(apply_filters_error, filterName, filteredData, callback);
            }
        }

        this.applyable_filters[filterName] = filteredData;
        return filteredData;
    }

    remove_filter(filterName, callback) {
        const filterCallbacks = this.filters[filterName];
        if (!filterCallbacks) return;

        if (typeof callback !== "function") {
            delete this.filters[filterName];
            delete this.applyable_filters[filterName];
            return;
        }

        this.filters[filterName] = filterCallbacks.filter((handler) => handler !== callback);

        if (this.filters[filterName].length === 0) {
            delete this.filters[filterName];
            delete this.applyable_filters[filterName];
        }
    }

    remove_filters(filterName) {
        delete this.filters[filterName];
        delete this.applyable_filters[filterName];
    }
    /* --------- End Filter Hook -------- */

    clearAll() {
        this.events = {};
        this.filters = {};
        this.applyable_filters = {};
        this.applyable_events = {};
    }
}

module.exports = EventBusEmitter

/**
 * Examples
 * ==============================================
 * const customEmitter = new EventBusEmitter();
 *
 * ===== on / emit / off / off_all
 * const messageHandler = (data) => {
 *     console.log("Received message:", data);
 * };
 * EventBus.on("message", messageHandler);
 * EventBus.emit("message", "Hello, World!");
 * EventBus.off("message", messageHandler);
 * EventBus.off_all("message");
 *
 * ===== emitAsync
 * EventBus.on("message_async", async (data) => {
 *     console.log("Async message:", data);
 * });
 * await EventBus.emitAsync("message_async", "Hello from async emit");
 *
 * ===== add_action / do_action / do_action_async / remove_action / remove_actions
 * const actionHandler = (data) => {
 *     console.log("Action payload:", data);
 * };
 * EventBus.add_action("cart:updated", actionHandler);
 * EventBus.do_action("cart:updated", { total: 3 });
 * await EventBus.do_action_async("cart:updated", { total: 4 });
 * EventBus.remove_action("cart:updated", actionHandler);
 * EventBus.remove_actions("cart:updated");
 *
 * ===== add_filter / apply_filters / remove_filter / remove_filters
 * const trimFilter = (value) => String(value).trim();
 * const upperFilter = (value, suffix = "") => `${value.toUpperCase()}${suffix}`;
 * EventBus.add_filter("message:text", trimFilter);
 * EventBus.add_filter("message:text", upperFilter);
 * const modifiedData = EventBus.apply_filters("message:text", " some text ", "!");
 * console.log(modifiedData); // SOME TEXT!
 * EventBus.remove_filter("message:text", upperFilter);
 * EventBus.remove_filters("message:text");
 *
 * ===== clearAll
 * EventBus.clearAll();
 */
