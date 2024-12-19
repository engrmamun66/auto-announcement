<script setup>
import { provide, inject, ref, computed, onMounted } from 'vue';
import UserProfilePage from '@pages/UserProfile.vue';
import CartPage from '@pages/CartPage.vue';
import InpageCartWidget from '@pages/InpageCartWidget.vue';
import ProductList from '@pages/ProductList.vue';
import ProductDetails from '@pages/ProductDetails.vue';
import PackageDetails from '@pages/PackageDetails.vue';
import LoaderGlobal from '@components/LoaderGlobal.vue';
import UserResetPassword from '@pages/UserResetPassword.vue';
import RentmyEventManagement from '@pages/RentmyEventManagement.vue';
import StoreLocationsWidget from '@pages/StoreLocationsWidget.vue';
import Checkout from '@pages/Checkout.vue';
import OrderComplete from '@pages/OrderComplete.vue';
import CustomerLoginRegisterPage from '@pages/CustomerLoginRegisterPage.vue';
let { Toaster, CartTotal,  ProductSearch } = inject('components');
let { cookie, helper, domElement } = inject('utils');

let emitter = inject('emitter');
let isProductListPage = location.href.includes(window.RENTMY_GLOBAL.page.products_list);
provide('isProductListPage', isProductListPage)
provide('setWraperIsReady', domElement.setWraperIsReady)
let showGlobalLoader = ref(false);
let timeout = null;
let globalLoader = {
    show: (autoOfAfter=null) => {
        if(!RENTMY_GLOBAL?.using_in_cli_project){
            showGlobalLoader.value = true;
            clearTimeout(timeout);
            timeout = setTimeout(()=> {
                showGlobalLoader.value = false;
                RentMyEvent.emit('global_loader:show_hide', true);
            }, autoOfAfter || 12000);
        } else {
            RentMyEvent.emit('global_loader:show_hide', true);
        }
    },
    hide: () => {
        showGlobalLoader.value = false;
        RentMyEvent.emit('global_loader:show_hide', false);
    },
    isShowing: () => showGlobalLoader.value,
};
provide('globalLoader', globalLoader)

const cartTotalSelectors = ref([]);
const rentmySearchWidgets = ref([]);

let resetPageWrapper = ref(null);
let eventPageWrapper = ref(null);
let OrderCompleteWrapper = ref(null);
let StoreLocationsWrappers = ref([]);
let inPageCartWidget = ref(null);

function updateVariables(){

    inPageCartWidget.value = document.querySelector('.RentMyWrapperInpageCartWidget');

    {
        let elements = document.querySelectorAll('.RentMyMiniCart:not([mounted])');
        elements.forEach(function(element){
            element.setAttribute('mounted', 'true')
        })
        cartTotalSelectors.value = [...cartTotalSelectors.value, ...elements];
    }

    {
        let elements = document.querySelectorAll('[rentmy-search-widget]:not([mounted])');
        elements.forEach(function(element){
            element.setAttribute('mounted', 'true')
        })
        rentmySearchWidgets.value = [...rentmySearchWidgets.value, ...elements];
    }
    
    {
        let element = document.querySelector('#RentMyResetPasswordContainer:not([mounted])');
        if(element){
            element.setAttribute('mounted', 'true') 
            resetPageWrapper.value = element;
        }     
    }
    
    {
        let element = document.querySelector('#RentMyEventManagement:not([mounted])');
        if(element){
            element.setAttribute('mounted', 'true') 
            eventPageWrapper.value = element;
        }     
    }
    
    {
        let element = document.querySelector('#RentMyOrderCompleteWrapper:not([mounted])');
        if(element){
            element.setAttribute('mounted', 'true') 
            OrderCompleteWrapper.value = element;
        }     
    }
    

    {
        let elements = document.querySelectorAll('.RentMyLocations:not([mounted])');
        elements.forEach(function(element){
            element.setAttribute('mounted', 'true')
        })
        StoreLocationsWrappers.value = [...StoreLocationsWrappers.value, ...elements];
    }  
    
    domElement.displayWPMenu();
    domElement.autoSetRentmyPageLinks();
    domElement.bindLogoutEvent(globalLoader);
}

onMounted(()=>{
    updateVariables();   
    emitter.on('observed', updateVariables);
})

</script>

<template>
    <Toaster></Toaster>
    <Checkout></Checkout>
    <CartPage></CartPage>
    <ProductList></ProductList>
    <ProductDetails></ProductDetails>
    <PackageDetails></PackageDetails>
    <UserProfilePage></UserProfilePage>
    <LoaderGlobal v-if="showGlobalLoader"></LoaderGlobal>
    
    <template v-if="inPageCartWidget">
        <InpageCartWidget :wrapper="inPageCartWidget"></InpageCartWidget>
    </template>

    <template v-if="resetPageWrapper">
        <UserResetPassword :wrapper="resetPageWrapper"></UserResetPassword>
    </template>

    <template v-if="OrderCompleteWrapper">
        <OrderComplete :wrapper="OrderCompleteWrapper"></OrderComplete>
    </template>

    <template v-if="eventPageWrapper">
        <RentmyEventManagement :wrapper="eventPageWrapper"></RentmyEventManagement>
    </template>

    <!-- Cart Total Component -->
    <template v-if="cartTotalSelectors?.length">
        <template v-for="(wrapper, index) in cartTotalSelectors" :key="index">
            <CartTotal :wrapper="wrapper"></CartTotal>
        </template>
    </template>

    <!-- Rentmy Locations -->
    <template v-if="StoreLocationsWrappers?.length">
        <template v-for="(wrapper, index) in StoreLocationsWrappers" :key="index">
            <StoreLocationsWidget :wrapper="wrapper"></StoreLocationsWidget>
        </template>
    </template>


    <!-- Rentmy Search Widget -->
    <template v-if="rentmySearchWidgets?.length">
        <template v-for="(searchWidget, index) in rentmySearchWidgets" :key="index">
            <!-- <teleport :to="searchWidget"> -->
                <ProductSearch :showBuyRent="false" :wrapper="searchWidget"></ProductSearch>
            <!-- </teleport> -->
        </template>
    </template>

    <!-- Rentmy Customer Login/Registration Page -->  
    <CustomerLoginRegisterPage></CustomerLoginRegisterPage>
    
</template>