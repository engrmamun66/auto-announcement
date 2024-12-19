
var DOMAIN = 'WILL_SET_WITH_NODE';

const PAGES_ROUTE_PATHS = {
    
    products_list: "/",


    /** ======= Product and Package Details route examples */

    // product_details: "product-details.html={uuid}",
    // package_details: "package-details.html={uuid}",

    // product_details: "product-details/?uid={uuid}",
    // package_details: "package-details/?uid={uuid}",

    // product_details: "product-details/{url}?uid={uuid}",
    // package_details: "package-details/{url}?uid={uuid}",

    // product_details: "product-details/{uuid}",
    // package_details: "package-details/{uuid}",

    // product_details: "product-details/{url}/{uuid}",
    // package_details: "package-details/{url}/{uuid}",

    // product_details: "product-details/{uuid}/{url}",
    // package_details: "package-details/{uuid}/{url}",


    product_details: "product-details/{url}",  // ------- Approved Pattern --- for SEO
    package_details: "package-details/{url}",  // ------- Approved Pattern --- for SEO

    /** ===================== END ========================= */
    
    cart: "cart",
    checkout: "checkout",
    login: "customer-login",
    registration: "customer-registration",
    reset_password: "customer-reset-password",
    customer_profile: "customer-profile",
    customer_change_password: "customer-change-password",
    customer_change_avatar: "customer-change-avatar",
    customer_order_history: "customer-order-history",
    order_details: "customer-order-details",
    order_complete: "order-complete",
}

const stores = {
    vgc: {
        store_id: "982",
        store_id: "3431",
        store_name: "vivian-grace-creations",
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNC0wNy0xMCAwNToxOTozNiIsInN0b3JlX2lkIjozNDMxLCJzdG9yZV91aWQiOiI5NTA4ZGYxODNlZTAxMWVmOGYwZDAyM2QwYzYzNDI2OSIsInN0b3JlX25hbWUiOiJsYWloYnh6OGlxdTgwNCIsInNvdXJjZSI6Im9ubGluZSIsImlzX29ubGluZSI6MSwibG9jYXRpb24iOjM2NzR9.bb7Ojw_P__4ZoRKx0s7faHl7efQMiLPfL4JTQ27bc9s",
    },
    wix: {
        store_id: "3431",
        locationId: "3674",
        store_name: "outhouse",
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwidXNlcl90eXBlX2lkIjoxLCJuYW1lIjoiTW9oc2luIEthYmlyIiwiZW1haWwiOiJtbGVhcGluZ0BsZWFwaW5nbG9naWMuY29tIiwiZGF0ZSI6IjIwMjQtMDctMzAgMTE6NTU6MDAiLCJjb21wYW55X2lkIjozLCJzdG9yZV9pZCI6MzQzMSwic3Vic2NyaXB0aW9uIjp7ImFjY291bnRfdHlwZSI6IkZSRUUiLCJpc01vbnRobHkiOnRydWUsImlzQWN0aXZlIjpmYWxzZSwiY2FyZCI6ZmFsc2UsIm5ld0ludmVudG9yeSI6ZmFsc2V9LCJzb3VyY2UiOiJhZG1pbiIsImxvY2F0aW9uIjozNjc0fQ.y5vwsr6wzDgL9-XC5X5DIUphQRi0XqBn4LM3Gww0fTw",
    },
    teststore09: {
        store_id: "590",
        locationId: "647",
        store_name: "teststore09",
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwidXNlcl90eXBlX2lkIjoxLCJuYW1lIjoiTW9oc2luIEthYmlyIiwiZW1haWwiOiJtbGVhcGluZ0BsZWFwaW5nbG9naWMuY29tIiwiZGF0ZSI6IjIwMjQtMDgtMjkgMDY6MTE6MTQiLCJjb21wYW55X2lkIjozLCJzdG9yZV9pZCI6NTkwLCJzdWJzY3JpcHRpb24iOnsiYWNjb3VudF90eXBlIjoiRVNUQUJMSVNIRUQiLCJpc01vbnRobHkiOnRydWUsImlzQWN0aXZlIjp0cnVlLCJjYXJkIjpmYWxzZSwibmV3SW52ZW50b3J5Ijp0cnVlfSwic291cmNlIjoiYWRtaW4iLCJsb2NhdGlvbiI6NjQ3fQ.SxjXX1OChku8pcSJjz-7a5N1GX6lJ6FHbQQ_QymaLcg",
    },
    teststore17: {
        store_id: "782",
        locationId: "841",
        store_name: "teststore01",
        access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwidXNlcl90eXBlX2lkIjoxLCJuYW1lIjoiTW9oc2luIEthYmlyIiwiZW1haWwiOiJtbGVhcGluZ0BsZWFwaW5nbG9naWMuY29tIiwiZGF0ZSI6IjIwMjQtMDgtMjkgMDY6Mjk6MzEiLCJjb21wYW55X2lkIjozLCJzdG9yZV9pZCI6NzgyLCJzdWJzY3JpcHRpb24iOnsiYWNjb3VudF90eXBlIjoiUFJPIiwiaXNNb250aGx5Ijp0cnVlLCJpc0FjdGl2ZSI6ZmFsc2UsImNhcmQiOmZhbHNlLCJuZXdJbnZlbnRvcnkiOnRydWV9LCJzb3VyY2UiOiJhZG1pbiIsImxvY2F0aW9uIjo4NDF9.3uu2WWWgSZlMHHhYIWtyuTgBkAHZfJZF17s9VNjb4Oo",
    },
}


var RENTMY_GLOBAL = {
    // ...stores.vgc,
    // ...stores.wix,
    ...stores.teststore09,
    // ...stores.teststore17,

    env: { // optional
      API_BASE_URL : "",  
      ASSET_URL : "",     
      PAYMENT_DOMAIN : "",
    },
    emDateTimePicker: { // optional
      // theme: 'dark',
      // colors: {
      //   primary_bg: '#1ba608',
      // },

      // time picker ui
      timePickerUi: 'standard', // optional
      timePickerButtons: true, // optional
      
      /* ------------------------------------------- */
      /*                 Details Page                */
      /* ------------------------------------------- */  
     

      // Start Date config
      detailsPage_startDatePicker_ajdustX: -12, //required for wix
      detailsPage_startDatePicker_ajdustY: 8, //required for wix
      detailsPage_startDatePicker_displayIn: 'modal', //required for wix
      detailsPage_useRangePicker_for_startDate: false, //required for wix
      detailsPage_startDate_allowRightSideTimePicker: true, //required for wix

      // End Date config
      detailsPage_endDatePicker_ajdustX: -13, //required for wix
      detailsPage_endDatePicker_ajdustY: -26, //required for wix
      detailsPage_endDatePicker_displayIn: 'modal', //required for wix
      detailsPage_useRangePicker_for_endDate: true, //required for wix
      detailsPage_endDate_allowRightSideTimePicker: true, //required for wix
      
      /* ------------------------------------------- */
      /*                   Cart Page                 */
      /* ------------------------------------------- */ 
      cartPage_datePicker_ajdustX: 0, // optional
      cartPage_datePicker_ajdustY: 0, // optional
      
      /* ------------------------------------------- */
      /*               In Page Cart Widget           */
      /* ------------------------------------------- */ 
      afterAddtoCart_open_widget: true, // optional
      afterAddtoCart_open_widget_datePicker: false,
    },

    afterOrder: {
      paymentSuccessUrl: '',
      paymentCancelUrl: '',
      justEmit: false,
      forIframe_topMode: true,
    },

    using_in_cli_project: "",
    ajax_url: "",
    home_url: "index.html",
    is_login_page: false, // optional
    wp_current_user: "1",
    after_add_to_cart_redirecto_cart: true, // optional    
    detailsPage_priceLimitShowFirst: 3, // optional

    checkout_extraCheckboxText: 'Kindly be aware that majority of our rentals items are not brand new and may exhibit wear and tear from previous events. Items are available for rent/lease in Good/Fair condition', // optional (if passes any text, It will be requred to create order)
    checkout_extraCheckboxText_alertText: '', // If not checked, show this mesage in toaster

    product_pacakge_by_slug: true, // required for node server

    page: {
        ...PAGES_ROUTE_PATHS
    },
    routes: {
        products_list: {
            title: 'Products List',
            file: "index.html",
            path: PAGES_ROUTE_PATHS.products_list,
            query: [],
        },
        product_details: {
            title: 'Product Details',
            file: "product-details.html",
            path: PAGES_ROUTE_PATHS.product_details,
            query: [],
        },
        package_details: {
            title: 'Package Details',
            file: "package-details.html",
            path: PAGES_ROUTE_PATHS.package_details,
            query: ['uid'],
        },
        cart: {
            title: 'Cart',
            file: "cart.html",
            path: PAGES_ROUTE_PATHS.cart,
            query: [],
        },
        checkout: {
            title: 'Checkout',
            file: "checkout.html",
            path: PAGES_ROUTE_PATHS.checkout,
            query: [],
        },
        login: {
            title: 'User Login',
            file: "customer-login.html",
            path: PAGES_ROUTE_PATHS.login,
            query: [],
        },
        registration: {
            title: 'User Registration',
            file: "customer-registration.html",
            path: PAGES_ROUTE_PATHS.registration,
            query: [],
        },
        reset_password: {
            title: 'Reset Password',
            file: "customer-reset-password.html",
            path:PAGES_ROUTE_PATHS.reset_password,
            query: [],
        },
        customer_profile: {
            title: 'Profile',
            file: "customer-profile.html",
            path: PAGES_ROUTE_PATHS.customer_profile,
            query: [],
        },
        customer_change_password: {
            title: 'Update Password',
            file: "customer-change-password.html",
            path: PAGES_ROUTE_PATHS.customer_change_password,
            query: [],
        },
        customer_change_avatar: {
            title: 'Change Avatar',
            file: "customer-change-avatar.html",
            path: PAGES_ROUTE_PATHS.customer_change_avatar,
            query: [],
        },
        customer_order_history: {
            title: 'Order History',
            file: "customer-order-history.html",
            path: PAGES_ROUTE_PATHS.customer_order_history,
            query: [],
        },
        order_details: {
            title: 'Order Details',
            file: "customer-order-details.html",
            path: PAGES_ROUTE_PATHS.order_details,
            query: [],
        },
        order_complete: {
            title: 'Order Complete',
            file: "order-complete.html",
            path: PAGES_ROUTE_PATHS.order_complete,
            query: [],
        },
    },
    "is_varified_rentmy_event_nonce": "",
}

module.exports = RENTMY_GLOBAL