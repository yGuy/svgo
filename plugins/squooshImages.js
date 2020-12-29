'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'optimizes inlined images: use squoosh to inline smaller versions';

exports.params = {
    encName: 'mozjpeg',
    quality: 50,
};
var compress = require('squoosh-module').compress;

/**
 *
 * @param {Object} item current iteration item
 * @param {Object} params plugin params
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Sebastian Mueller
 */
exports.fn = async function(item, params) {
    if (
        item.isElem('image') &&
        item.hasAttr('xlink:href')
    ) {

        var attr = item.attr('xlink:href');

        var buffer = Buffer.from(attr.value.split(',')[1], 'base64');

        var compressedBuffer = await compress(buffer, params.encName, params);

        var mimeType;
        switch (params.encName) {
            case 'mozjpeg':
                mimeType = 'image/jpeg';
                break;
            case 'oxipng':
                mimeType = 'image/png';
                break;
            case 'webp':
                mimeType = 'image/webp';
                break;
            default:
                mimeType = 'image/jpeg';
                break;
        }


        attr.value = `data:${mimeType};base64,${Buffer.from(compressedBuffer).toString('base64')}`;
        return true;
    }
};

