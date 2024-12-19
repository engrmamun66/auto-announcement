import mitt from 'mitt'
export const emitter = mitt()
// Doc: https://www.npmjs.com/package/mitt

/* -------------------------------------------------------------------------- */
/*                                  Utitilies                                 */
/* -------------------------------------------------------------------------- */
import helper from '@utils/helper';
import http from '@utils/http';
import cookie from '@utils/cookie';

export const utils = {
    helper,
    http,
    cookie,
}
