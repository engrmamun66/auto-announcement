<script setup>
import 'vue/dist/vue.esm-bundler.js';
import { ref, inject, onMounted, defineProps, provide, computed } from 'vue';
import { Toaster, emitter } from '@/import-hub';
let globalLoader = inject('globalLoader');
let { wrapper } = defineProps(['wrapper']);
let setWraperIsReady = inject('setWraperIsReady');
import Pagination from '@components/Pagination.vue';
import { createComponentHTML } from "@utils/functions/withComponent";
let { helper, cookie, domElement, http, labelSelector, currency } = inject('utils');
let { Loader } = inject('components');

let submitButton = ref(null)
let loading = ref(false)
provide('submitButton', submitButton);
provide('loading', loading);

const site_specific = JSON.parse( localStorage.getItem("rentmy_contents") )?.site_specific;
const client_portal_activated = site_specific?.confg?.client?.active;
let clientPortalHTML = inject('clientPortalHTML');  


createComponentHTML(wrapper, [
    {
        selector: "[Title]",
        text: `{{ activation_key ? 'RESET PASSWORD' : 'IT HAPPENS TO ALL OF US.' }}`,
    },
    {
        selector: "[SubTitle]",
        text: `{{ activation_key ? 'Enter your New Password' : 'Enter your email to reset your password' }}`,
    },
    {
        selector: "[AlertMessage]",
        attr: { 'v-if': 'message', '@click': 'message=null' },
        text: `{{ message }}`,
    },
    // Model Binding
    {
        selector: "input[Email]",
        attr: { 'v-if': '!activation_key', 'v-model': 'email', name : 'email' },
    },
    {
        selector: "input[Password]",
        attr: { 'v-if': 'activation_key', 'v-model': 'password', 'autocomplete': 'off' },
    },
    {
        selector: "input[ConfirmPassword]",
        attr: { 'v-if': 'activation_key', 'v-model': 'confirm_password', 'autocomplete': 'off' },
    },
    // With Submission
    {
        selector: "form",
        attr: { '@submit.prevent': 'submitForm' },
    },
    {
        selector: "[RentMySubmitBtn]",
        attr: { '@click.prevent': 'submitForm', 'ref': 'submitButton' },
        text: ``,
    },
    {
        selector: "[RentMyReturnBtn]",
        attr: { '@click.prevent': 'globalLoader.show();helper.redirect("login")', 'v-if': '!activation_key' },
    },
    
]);

let template = wrapper.innerHTML
wrapper.innerHTML = '';

let ResetPasswordComponent = {
    template,
    data() {
        return {
            helper,            
            Loader,
            globalLoader,           
            activation_key: null,            
            message: null,  
            email: null,
            password: null,
            confirm_password: null,
        }
    },
    setup(props) {
        let submitButton = inject('submitButton')  
        let loading = inject('loading')  
        return{
            submitButton,
            loading,
        }
    },
    async mounted() {   
        this.activation_key = helper.withURL.getQuery('activation_key') || null;
        setWraperIsReady(wrapper);
        if(!client_portal_activated){
            wrapper.innerHTML = clientPortalHTML;
        }
    },
    methods: {
        sendEmail: async function(payload) {
            let { data } = await http.post('/customers/forgot-password', payload);
            return data;
        },
        resetPassword: async function(activation_key, payload) {
            let { data } = await http.post(`/customers/reset-password/${activation_key}`, payload);
            return data;
        },
        submitForm: function () {
            if(this.loading) return;
            let { activation_key, email, password, confirm_password } = this;
            let payload = {};            
            if(!activation_key){
                /* -------------------------------------------------------------------------- */
                /*                          Sending Activation Email                          */
                /* -------------------------------------------------------------------------- */
                if(!email){
                    this.message = 'Type your email address';
                    return;
                }
                payload.email = email;
                payload.password_reset_link = windowLocation().href;
                payload.source = windowLocation().origin;
             
                this.loading = true;
                this.sendEmail(payload).then(response => {
                    this.loading = false;                   
                    if(response.status == 'OK'){
                        this.message = null;
                        Toaster().success(RentMyEvent.apply_filters('ResetPassword:SendEmailSuccessMsg', response.result.message));
                    } else{
                        this.message = RentMyEvent.apply_filters('ResetPassword:SendEmailErrorMsg', response.result.message);
                    }
                }).catch(error => {
                    this.message = error;
                    this.loading = false;
                    globalLoader.hide();
                })
            } else {
                /* -------------------------------------------------------------------------- */
                /*                              Reseting Password                             */
                /* -------------------------------------------------------------------------- */
                if(password !== confirm_password) this.message = `Password Doesn't matched`; 
                if(!confirm_password) this.message = 'Type confirm passsword';
                if(!password) this.message = 'Type new passsword';
                if(!password || !confirm_password || password !== confirm_password) return;
  
                this.loading = true;
                this.resetPassword(activation_key, { password, confirm_password }).then(response => {          
                    this.loading = false;
                    if(response.status == 'OK'){
                        this.message = null;
                        Toaster().success(RentMyEvent.apply_filters('ResetPassword:SuccessMsg', response.result.message));
                        helper.redirect('login');                       
                    } else{
                        this.message = RentMyEvent.apply_filters('ResetPassword:ErrorMsg', response.result.message);
                    }
                }).catch(error => {
                    this.message = RentMyEvent.apply_filters('ResetPassword:ErrorMsg', error);
                    this.loading = false;
                    globalLoader.hide();
                })
               
            }
        },
    },    
}
</script>

<template>  
    <teleport :to="wrapper">
        <ResetPasswordComponent></ResetPasswordComponent>
    </teleport>
    <template v-if="loading && submitButton">
        <teleport :to="submitButton">
            <Loader></Loader>
        </teleport>
    </template>
</template>
