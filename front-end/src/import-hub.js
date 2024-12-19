import mitt from 'mitt'
export const emitter = mitt()
// Doc: https://www.npmjs.com/package/mitt

/* -------------------------------------------------------------------------- */
/*                                  Utitilies                                 */
/* -------------------------------------------------------------------------- */
import helper from '@utils/helper';
import http from '@utils/http';
import cookie from '@utils/cookie';
import currency from '@utils/currency'

export const utils = {
    helper,
    http,
    cookie,
    currency,
}

/* -------------------------------------------------------------------------- */
/*                                  toaster                                   */
/* -------------------------------------------------------------------------- */
/**
 >>> Usecase
import { Toaster } from '@/import-hub';
 Toaster().success('Message here')
 Toaster().warning('Message here')
 Toaster().error('Message here')
 */



/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */
import Loader from '@components/Loader.vue'
import toaster from '@components/Toaster.vue'
import Confirmation from '@components/modal/Confirmation.vue';

export const components = {
    Loader,
    Toaster: toaster,    
    Confirmation,
}
