import http from "../http";
const assetURL = RENTMY_GLOBAL?.env?.ASSET_URL || import.meta.env.VITE_ASSET_URL;

const helpers = {
  clone: function (data, { remove = [], add = {}, only = [], nullToEmptyStr = false } = {}) {
    data = JSON.parse(JSON.stringify(data));

    if (typeof data === "object" && Array.isArray(data) === false) {
      // Delete keys
      if (remove?.length && Array.isArray(remove)) {
        remove.forEach((key) => {
          if (data.hasOwnProperty(key)) {
            delete data[key];
          }
        });
      }

      // keep only
      if (only?.length && Array.isArray(only)) {
        const new_data = {};
        only.forEach((key) => {
          if (data.hasOwnProperty(key)) {
            new_data[key] = data[key];
          }
        });
        data = new_data;
      }

      // applyAll
      if (nullToEmptyStr) {
        Object.keys(data).forEach(key => {
          if(data[key] == null){
            data[key] = "";
          }
        })
      }

      return { ...data, ...add };
    } else {
      return data;
    }
  },
  domParser: function (html_content = "") {
    if (!html_content) return;
    let parser = new DOMParser();
    let dom = parser.parseFromString(html_content, "text/html");
    return dom;
  },
  generateImage: function (filename, id = null, _for = "product") {
    if (_for == "product") {
      var product_id = id;
      return `${assetURL}products/${window.RENTMY_GLOBAL?.store_id}/${product_id}/${filename}`;
    } else if (_for == "customer") {
      return `${assetURL}customers/${window.RENTMY_GLOBAL?.store_id}/${customer_profile.image}`;
    }
  },
  getProductImage: function (cart_item, size = "small") {
    if (!cart_item) return;
    let { product } = cart_item;
    if(!product) product = cart_item;
    let image = product?.images?.[0];
    if (size == "small") {
      image = image?.image_small || image?.image_small_free;
    } else {
      image = image?.image_large || image?.image_large_free;
    }
    if (image) {
      image = helpers.generateImage(image, product?.id);
    } else {
      image = RENTMY_GLOBAL?.images?.default_product_image;
    }
    return image;
  },
  createFormData: function (data = {}) {
    const formData = new FormData();
    try {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const value = data[key];
          formData.append(key, value);
        }
      }
      return formData;
    } catch (error) {
      return new FormData();
    }
  },
  formatDate: function (date, format = "YYYY-MM-DD") {
    if (date) return moment(date).format(format);
  },
  formatBuyRent: function (prices) {
    try {
      let data = prices;
      if (data.length > 0) {
        var prices = data[0];
        var obj = {
          buy: { type: false, price: 0, id: null },
          rent: { type: false, price: [] },
        };
        var rent = ["hourly", "daily", "weekly", "monthly"];
        if (prices.base.price > 0) {
          obj.buy["type"] = true;
          obj.buy["price"] = prices.base.price;
          obj.buy["id"] = prices.base.id;
        }
        let ren = [];
        const rentPrices = data[0];

        if (rentPrices.fixed) {
          const fp = {
            type: "",
            price: rentPrices.fixed.price,
            id: rentPrices.fixed.id,
            label: "",
            rent_start: rentPrices.fixed.rent_start,
            rent_end: rentPrices.fixed.rent_end,
          };
          obj.rent["price"].push(fp);
        } else {
          for (let c in rentPrices) {
            for (let i = 0; i < rentPrices[c].length; i++) {
              rentPrices[c][i]["type"] = rentPrices[c][i].label;
              obj.rent["price"].push(rentPrices[c][i]);
            }
          }
        }
        if (obj.rent["price"].length > 0) obj.rent["type"] = true;
        return obj;
      }
      return prices;
    } catch (error) {}
  },
  isLoginPage: function () {
    return window?.RENTMY_GLOBAL?.is_login_page;
  },
  redirect: function (pageKey = "home_url") {
    let redirect_url =
      pageKey == "home_url"
        ? window?.RENTMY_GLOBAL.home_url
        : window?.RENTMY_GLOBAL?.page?.[pageKey];
    this.withURL.setQuery({}, redirect_url);
    windowLocation().reload();
  },
  productSearchRedirect: function (product) {
    let { page } = window?.RENTMY_GLOBAL;
    let full_url = '';
    if (typeof product == "string") {
      full_url = helpers.withURL.setQuery(
        { search: product },
        page.products_list,
        true
      );

    } else if (product?.type == 1) {
      full_url = helpers.withURL.setQuery(
        { uid: product?.uuid },
        page.product_details,
        true
      );
    } else if (product?.type == 2) {
      full_url = helpers.withURL.setQuery(
        { uid: product?.uuid },
        page.package_details,
        true
      );
    }
    if(full_url){
      window.open(full_url, '_self');      
    }
  },
  changeStoreLocation: function (locationObject) {
    let payload = {
      action: "rentmy_cdn_request",
      method: "update_location_id",
      location_id: locationObject.id,
    };
    http.post(RENTMY_GLOBAL.ajax_url, payload).then((response) => {
      if (response?.data?.success) {
        localStorage.setItem(
          "current_location",
          JSON.stringify(locationObject)
        );
        windowLocation().reload();
      }
    });
  },
  listGroupBy: function (array, property) {
    if (!array?.length || !property) return {};
    return array.reduce((result, obj) => {
      const key = obj[property];
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(obj);
      return result;
    }, {});
  },
  /* -------------------------------------------------------------------------- */
  /*                           Device Identify with JS                          */
  /* -------------------------------------------------------------------------- */
  /**
   * How to call this device function
   * Examples:
   * device().type;
   * device().isMobile();
   * device().is('mobile');
   * device().in(['mobile', 'tablet']);
   */
  device: function () {
    const getType = () => {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return "mobile";
      } else if (/iPad/i.test(navigator.userAgent)) {
        return "tablet";
      } else {
        return "desktop";
      }
    };

    function DeviceType() {
      this.type = getType();
    }

    DeviceType.prototype.is = function (deviceType = "") {
      return deviceType ? this.type === deviceType : false;
    };

    DeviceType.prototype.in = function (deviceTypes = []) {
      if (deviceTypes && Array.isArray(deviceTypes) && deviceTypes?.length) {
        return deviceTypes.includes(this.type);
      } else {
        return false;
      }
    };

    DeviceType.prototype.isMobile = function (extra = null) {
      return this.type === "mobile";
    };

    DeviceType.prototype.isTable = function () {
      return this.type === "tablet";
    };

    DeviceType.prototype.isDesktop = function () {
      return this.type === "desktop";
    };

    return new DeviceType();
  },
  /* -------------------------------------------------------------------------- */
  /*                                  With URL                                  */
  /* -------------------------------------------------------------------------- */
  withURL: {
    setQuery: function (params, url = window.location.href, _return = false) {
      try {
        if (!url) url = window.location.href;
        url = url?.replace(/\/$/, "")?.replace(/#$/, "");
        const currentUrl = new URL(url);
        Object.entries(params)?.forEach((param) => {
          currentUrl.searchParams.set(param[0], param[1]);
        });
        if (_return) {
          return currentUrl.href; // fullurl with query params
        } else {
          window.history.pushState({}, "", currentUrl);
        }
      } catch (error) {
        console.warn('setQuery', error);
        return '';
      }
    },
    getQuery: function (param = "", url = window.location.href) {
      try {
        const currentUrl = new URL(url);
        if (param) {
          return currentUrl.searchParams.get(param) || '';
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const paramObj = {};
          for (var value of urlParams.keys()) {
            paramObj[value] = urlParams.get(value);
          }
          return paramObj  || {};
        }
      } catch (error) {
        console.warn('getQuery', error);
        if(param) return undefined;
        else return {};
      }
    },
    hasQuery: function (param = "", url = window.location.href) {
      try {
        const urlParams = new URLSearchParams(new URL(url).search);
        const paramObj = {};
        for (var value of urlParams.keys()) {
          paramObj[value] = urlParams.get(value);
        }
        return param in paramObj;
      } catch (error) {
        console.warn('hasQuery', error);
      }
    },
    deleteQuery: function (param, url = window.location.href) {
      try {
        // url = url?.replace(/\/$/, "")?.replace(/#$/, "");
        // const currentUrl = new URL(url);
        // currentUrl.searchParams.delete(param);
        // window.top.history.pushState({}, "", currentUrl);
      } catch (error) {
        console.warn('deleteQuery', error);
      }
    },
    /**
     * 
     * @param url = 'localhost:3000/product/{url}?uid={uuid}'
     * @param productObj = pass object, that contain placeholder keys or url
     * @returns 'localhost:3000/product/product-url?uid=3D2A4563D2A4563D2A456'
     */
    generateURL: function(url, productObj={}) {
      let regex = /\{([^}]+)\}/g;
      let matches = [];
      let match;
    
      while ((match = regex.exec(url)) !== null) {
        matches.push(match[1]);
      }
      if(matches.length){
        matches.forEach(key => {
          url = url.replace(`{${key}}`, productObj?.[key] || 'undefined')
        })
      }
      return url;      
    },
    parseURLforDetailsPage: function(page_key='product_details') {

      let { getQuery } = helpers.withURL

      let product_pacakge_by_slug = RENTMY_GLOBAL?.product_pacakge_by_slug

      let details_page = RENTMY_GLOBAL.page[page_key].split('?')[0].replace(/\/$/, '')

      let result = {
        view_type: product_pacakge_by_slug ? 'slug' : '',
        key: product_pacakge_by_slug ? 'url' : 'uid',
        value: product_pacakge_by_slug ? getQuery('slug') : getQuery('uid'),
      }

      let urlPath = decodeURI(window.location.pathname).replace(/\/$/, '')
      let urlParts = urlPath.split('/').filter(Boolean)
 
      if(urlParts.length){
        // ====== with url
        if(product_pacakge_by_slug == true){
          if(details_page.endsWith('{url}')){
            result.value = urlParts.at(-1)
          }
          else if(details_page.endsWith('{url}/{uuid}')){
            result.value = urlParts.at(-2)
          }
          
        } else {
          // ====== with uid
          if(details_page.endsWith('{uuid}')){
            result.value = urlParts.at(-1)
          }
          else if(details_page.endsWith('{uuid}/{url}')){
            result.value = urlParts.at(-2)
          }
        }
      }  

      return result; 
      
    },    
    encodeString: function (data='') {
      try {
        return btoa(unescape(encodeURIComponent(data)));
      } catch (error) {
        return data;
      }
    },
    decodeString: function (data='') {
      try {
        return decodeURIComponent(escape(atob(data)))
      } catch (error) {
        return data;
      }
    },
    decodeString: function (data) {
      try {
        return decodeURIComponent(escape(atob(data)));
      } catch (error) {
        return data;
      }
    },
    urlEncoded: function (url) {
      return encodeURIComponent(url);
    },
  },
  toggleLoopItem: function (data, index, key = "isShow") {
    if (!data) return;
    data?.forEach((item, i) => {
      if (i == index) {
        item[key] = !(item[key] ?? false);
      } else {
        item[key] = false;
      }
    });
  },
  /* -------------------------------------------------------------------------- */
  /*                                With Product                                */
  /* -------------------------------------------------------------------------- */
  withProduct: {
    allPriceTypes: ["rent", "hourly", "daily", "weekly", "monthly", "fixed"],
    getRentalTypes: function (prices) {
      const {
        withProduct: { allPriceTypes },
      } = helpers;
      let all_prices = [];
      prices?.forEach((prices) => {
        let priceKeys = Object.keys(prices);
        if (priceKeys?.length) {
          all_prices = [
            ...all_prices,
            ...priceKeys.map((key) =>
              allPriceTypes.includes(key) ? "rent" : key
            ),
          ];
        }
      });
      return Array.from(new Set(all_prices));
    },
    getPrices: function (prices) {
      let formatPrice = { rent: [] };
      prices?.forEach((prices) => {
        let priceKeys = Object.keys(prices);
        priceKeys?.forEach((key) => {
          let value = prices[key];
          if (key == "base") {
            formatPrice.base = value;
          } else if (key == "fixed") {
            if (value) formatPrice.rent.push(value);
          } else {
            Object.keys(value)?.forEach((i) => {
              if (value[i]) formatPrice.rent.push(value[i]);
            });
          }
        });
      });
      return formatPrice;
    },
    calculatePromotionalPercent: function (price, regular_price) {
      let percent = 0;
      let reduced = regular_price - price;
      percent = Math.ceil((reduced / regular_price) * 100);
      return percent + "%";
    },
  },
};
globalThis.cdnHelper = helpers
export default helpers;
