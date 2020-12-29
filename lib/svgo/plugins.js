'use strict';

/**
 * Plugins engine.
 *
 * @module plugins
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Object} plugins plugins object from config
 * @return {Promise<Object>} output data
 */
module.exports = async function(data, info, plugins) {

    for (var group of plugins) {

        switch(group[0].type) {
            case 'perItem':
                data = await perItem(data, info, group);
                break;
            case 'perItemReverse':
                data = await perItem(data, info, group, true);
                break;
            case 'full':
                data = await full(data, info, group);
                break;
        }

    }

    return data;

};

/**
 * Direct or reverse per-item loop.
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Array} plugins plugins list to process
 * @param {Boolean} [reverse] reverse pass?
 * @return {Object} output data
 */
async function perItem(data, info, plugins, reverse) {

    async function monkeys(items) {

        var newContent = [];
        for (var item of items.content) {
            // reverse pass
            if (reverse && item.content) {
                await monkeys(item);
            }

            // main filter
            var filter = true;

            for (var i = 0; filter && i < plugins.length; i++) {
                var plugin = plugins[i];

                if (plugin.active && (await plugin.fn(item, plugin.params, info)) === false) {
                    filter = false;
                }
            }

            // direct pass
            if (!reverse && item.content) {
                await monkeys(item);
            }

            if (filter){
                newContent.push(item);
            }

        }

        items.content = newContent;

        return items;

    }

    return await monkeys(data);

}

/**
 * "Full" plugins.
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Array} plugins plugins list to process
 * @return {Object} output data
 */
async function full(data, info, plugins) {

    for (var plugin of plugins) {
        if (plugin.active) {
            data = await plugin.fn(data, plugin.params, info);
        }
    }

    return data;

}
