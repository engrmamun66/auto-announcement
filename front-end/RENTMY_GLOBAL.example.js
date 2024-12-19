var DOMAIN = 'www.example.com';

var RENTMY_GLOBAL = {
    "env": { // optional
      API_BASE_URL : "",  
      ASSET_URL : "",     
      PAYMENT_DOMAIN : "",
    },
    emDateTimePicker: { // optional
      theme: 'dark',
      colors: { 
        primary_bg: '#1ba608',
      },

      // time picker ui
      timePickerUi: 'standard', // optional
      timePickerButtons: true, // optional

      /* ------------------------------------------- */
      /*                 Details Page                */
      /* ------------------------------------------- */      
      // Start Date config
      detailsPage_startDatePicker_ajdustX: 0,
      detailsPage_startDatePicker_ajdustY: 0,
      detailsPage_startDatePicker_displayIn: 'modal',
      detailsPage_useRangePicker_for_startDate: false,
      
      // End Date config
      detailsPage_endDatePicker_ajdustX: 0,
      detailsPage_endDatePicker_ajdustY: 0,
      detailsPage_endDatePicker_displayIn: 'modal',
      detailsPage_useRangePicker_for_endDate: false,

      /* ------------------------------------------- */
      /*                   Cart Page                 */
      /* ------------------------------------------- */ 
      cartPage_datePicker_ajdusX: 0, // optional
      cartPage_datePicker_ajdusY: 0, // optional
      
      /* ------------------------------------------- */
      /*               In Page Cart Widget           */
      /* ------------------------------------------- */ 
      afterAddtoCart_open_widget: true, // optional
      afterAddtoCart_open_widget_datePicker: false, // optional

    },

    /**
     * optional (to set theme color)
     * emDateTimePicker.colors.primary_bg will replace with '--rentmy-primary-color'
     */
    cssVariableObject: {
      '--rentmy-primary-color': '#01b680',
      '--rentmy-primary-color-hover': '#00cf91',
      '--rentmy-border': '#10c08b',
      '--rentmy-soft-grey': '#ced4da',
      '--rentmy-danger-bg': '#f15d1a',
      // '--rentmy-cart-widget-color': '#ced4da',
    },

    afterOrder: {
      paymentSuccessUrl: '',
      paymentCancelUrl: '',
      justEmit: false,
      forIframe_topMode: false,
    },

    using_in_cli_project: false, // optional
    ajax_url: "", // --------------auto if using in wp
    home_url: "/",
    store_name: "teststore09", //----rentmy-store-config
    store_id: "000000",        //----rentmy-store-config
    locationId: "888888",      //----rentmy-store-config
    access_token: "",          //----rentmy-store-config
    is_login_page: false, // optional
    wp_current_user: "1", // optional
    
    after_add_to_cart_redirecto_cart: true, // optional
    detailsPage_priceLimitShowFirst: 6, // optional
    hide_checkoutPage_createAccount_checkbox: false, // optional
    
    checkout_extraCheckboxText: '', // optional (if passes any text, It will be requred to create order)
    checkout_extraCheckboxText_alertText: '', // If not checked, show this mesage in toaster

    product_pacakge_by_slug: false,
       
    page: {
      cart: "/cart",
      products_list: "/products-list",
      product_details: "/product/{url}?uid={uuid}",
      package_details: "/package/{url}?uid={uuid}",
      checkout: "/rentmy-checkout/",
      login: "/rentmy-customer-login/",              
      registration: "/rentmy-customer-registration/",
      reset_password: "/rentmy-reset-password/",
      customer_profile: "/rentmy-customer-profile/",
      customer_change_password: "/rentmy-customer-change-password/",
      customer_change_avatar: "/rentmy-customer-change-avatar/",
      customer_order_history: "/rentmy-customer-order-history/",
      order_details: "/rentmy-orders/",
      event_management: "/rentmy-event-management/",
      rentmy_dashboard: "/wp-admin/?page=rentmy",
      order_complete: "order-complete.html",
    },
    is_varified_rentmy_event_nonce: false, // optional
}