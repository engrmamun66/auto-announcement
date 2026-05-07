module.exports = {
    fulfillMisingConfigKeys: function(configObj, configExampleObj) {
        function deepMerge(target, source) {
            for (const key of Object.keys(source)) {
                if (!(key in target)) {
                    target[key] = source[key];
                } else if (
                    source[key] !== null &&
                    typeof source[key] === 'object' &&
                    !Array.isArray(source[key]) &&
                    target[key] !== null &&
                    typeof target[key] === 'object' &&
                    !Array.isArray(target[key])
                ) {
                    deepMerge(target[key], source[key]);
                }
            }
            return target;
        }
        return deepMerge(configObj, configExampleObj);
    }
}