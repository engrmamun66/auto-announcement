import mitt from 'mitt'
export const emitter = mitt()
// Doc: https://www.npmjs.com/package/mitt

/* -------------------------------------------------------------------------- */
/*                                  Utitilies                                 */
/* -------------------------------------------------------------------------- */
import domElement from '@utils/domElement';
import helper from '@utils/helper';
import http from '@utils/http';
import cookie from '@utils/cookie';
import labelSelector from '@utils/selectors/label.selector';
import currency from '@utils/currency'

export const utils = {
    domElement,
    helper,
    http,
    cookie,
    labelSelector,
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
import { useToaster } from '@/stores/toaster';
export const Toaster = useToaster


/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */
import Loader from '@components/Loader.vue'
import LoaderGlobal from '@components/LoaderGlobal.vue';
import toaster from '@components/Toaster.vue'
import Pagination from '@components/Pagination.vue'
import CartTotal from '@components/CartTotal.vue'
import ProductSearch from '@components/ProductSearch.vue'
import Confirmation from '@components/modal/Confirmation.vue';
import CustomerLoginModal from '@components/modal/CustomerLoginModal.vue';

export const components = {
    Loader,
    LoaderGlobal,
    Toaster: toaster,
    Pagination,
    CartTotal,
    ProductSearch,
    Confirmation,
    CustomerLoginModal,
}

/* -------------------------------------------------------------------------- */
/*                           Services (From Modules)                          */
/* -------------------------------------------------------------------------- */
import userService from '@modules/user/services/user.service';

export const services = {
    userService,
}