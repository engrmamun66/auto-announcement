export function chcekPassowrd(pass, conf) {
  if (pass === conf) {
    return false;
  }
  return true;
}

export function changeUser(prop, name) {
  let user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    user[prop] = name;
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    user = JSON.parse(sessionStorage.getItem("currentUser"));
    user[prop] = name;
    sessionStorage.setItem("currentUser", JSON.stringify(user));
  }
}

export function switchLocalToSession() {
  let user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    localStorage.removeItem("currentUser");
    sessionStorage.setItem("currentUser", JSON.stringify(user));
  }
}

export function GET_USER() {
  return JSON.parse(
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
}

export function GET_STORE_ID() {
  return GET_USER().store_id
    ? GET_USER().store_id
    : sessionStorage.getItem("store_id");
}

export function GET_STORE_ID_GEUST() {
  return localStorage.getItem("storeID") || 24;
}

export function GET_OnlineStoreCartToken() {
  return localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token"))
    : "";
}

export function GET_PosCartToken() {
  return sessionStorage.getItem("cartToken")
    ? JSON.parse(sessionStorage.getItem("cartToken"))
    : "";
}

export function isCartDateExist() {
  const startDate = JSON.parse(sessionStorage.getItem("online_cartStartDate"));
  const endDate = JSON.parse(sessionStorage.getItem("online_cartEndDate"));

  return startDate != undefined && endDate != undefined ? true : false;
}

export function getOnlineStoreCartDate() {
  let startDate;
  let endDate;

  if (sessionStorage.getItem("searchWidgetData")) {
    let searchWidgetData = JSON.parse(
      sessionStorage.getItem("searchWidgetData")
    );
    if (searchWidgetData?.rent_start) {
      startDate = searchWidgetData.rent_start;
    }
    if (searchWidgetData?.rent_end) {
      endDate = searchWidgetData?.rent_end;
    }
  }

  if (sessionStorage.getItem("online_cartStartDate"))
    startDate = JSON.parse(sessionStorage.getItem("online_cartStartDate"));
  if (sessionStorage.getItem("online_cartEndDate"))
    endDate = JSON.parse(sessionStorage.getItem("online_cartEndDate"));

  if (startDate && startDate != undefined && endDate && endDate != undefined) {
    return { startDate: startDate, endDate: endDate };
  } else {
    return null;
  }
}

export function removeOnlineStoreCartDate() {
  sessionStorage.removeItem("online_cartStartDate");
  sessionStorage.removeItem("online_cartEndDate");
  sessionStorage.removeItem("online_inagecart_widget_startDate");
  sessionStorage.removeItem("online_inagecart_widget_endDate");
  sessionStorage.removeItem("online_fullfilment_option");
  localStorage.removeItem("deliveryFlow");
  localStorage.removeItem("deliveryFlowLabel");
  sessionStorage.removeItem("searchWidgetData");
}

export function isCartRentalDateExist(name) {
  const startDate = JSON.parse(sessionStorage.getItem(name + "_cartStartDate"));
  const endDate = JSON.parse(sessionStorage.getItem(name + "_cartEndDate"));

  return startDate != undefined && endDate != undefined ? true : false;
}

export function setCartRentalDate(name, start_date, end_date) {
  sessionStorage.setItem(name + "_cartStartDate", JSON.stringify(start_date));
  sessionStorage.setItem(name + "_cartEndDate", JSON.stringify(end_date));
}

export function getCartDate(name) {
  const startDate = JSON.parse(sessionStorage.getItem(name + "_cartStartDate"));
  const endDate = JSON.parse(sessionStorage.getItem(name + "_cartEndDate"));

  if (startDate != undefined && endDate != undefined) {
    return { startDate: startDate, endDate: endDate };
  } else {
    return null;
  }
}

export function removeCartDate(name) {
  sessionStorage.removeItem(name + "_cartStartDate");
  sessionStorage.removeItem(name + "_cartEndDate");
}

export function FORMAT_DATE_TIME(date) {
  let d = new Date(date);
  let y = d.getFullYear();
  let m = (d.getMonth() + 1).toLocaleString();
  let day = d.getDate().toLocaleString();
  let h = d.getHours().toLocaleString();
  let min = d.getMinutes().toLocaleString();

  return (
    (day.length > 1 ? day : "0" + day) +
    "-" +
    (m.length > 1 ? m : "0" + m) +
    "-" +
    y +
    " " +
    (h.length > 1 ? h : "0" + h) +
    ":" +
    (min.length > 1 ? min : "0" + min)
  );
}

export function Format_Year_Month_date(date) {
  let d = new Date(date);
  let y = d.getFullYear();
  let m = (d.getMonth() + 1).toLocaleString();
  let day = d.getDate().toLocaleString();
  let h = d.getHours().toLocaleString();
  let min = d.getMinutes().toLocaleString();

  return (
    y +
    "-" +
    (m.length > 1 ? m : "0" + m) +
    "-" +
    (day.length > 1 ? day : "0" + day) +
    " " +
    (h.length > 1 ? h : "0" + h) +
    ":" +
    (min.length > 1 ? min : "0" + min)
  );
}

export function convertUTCtoLocal(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}

export function FORMAT_DATE(date) {
  let d = new Date(date);
  let y = d.getFullYear();
  let m = (d.getMonth() + 1).toLocaleString();
  let day = d.getDate().toLocaleString();

  return (
    y +
    "-" +
    (m.length > 1 ? m : "0" + m) +
    "-" +
    (day.length > 1 ? day : "0" + day)
  );
}

export function FORMAT_DATE_TIME_PRO(date) {
  let d = new Date(date);
  let y = d.getFullYear();
  let m = (d.getMonth() + 1).toLocaleString();
  let day = d.getDate().toLocaleString();
  let h = d.getHours().toLocaleString();
  let min = d.getMinutes().toLocaleString();
  let ampm = "AM";

  if (parseInt(h) > 12) {
    h = (parseInt(h) - 12).toLocaleString();
    ampm = " PM";
  }

  return (
    (day.length > 1 ? day : "0" + day) +
    "/" +
    (m.length > 1 ? m : "0" + m) +
    "/" +
    y +
    ", " +
    (h.length > 1 ? h : "0" + h) +
    ":" +
    (min.length > 1 ? min : "0" + min) +
    ampm
  );
}

export function GETTIME(d) {
  const now = d ? new Date(d) : new Date();
  const h = now.getHours();
  const hour = ("0" + (h > 12 ? h - 12 : h)).slice(-2);
  const min = ("0" + now.getMinutes()).slice(-2);
  return hour + ":" + min + ":00 " + (h > 12 ? "PM" : "AM");
}

export function calandarDateFormat(d) {
  const now = d ? new Date(d) : new Date();
  const y = now.getFullYear();
  const m = ("0" + (now.getMonth() + 1)).slice(-2);
  const day = ("0" + now.getDate()).slice(-2);
  const h = now.getHours();
  const hour = ("0" + (h > 12 ? h - 12 : h)).slice(-2);
  const min = ("0" + now.getMinutes()).slice(-2);
  return (
    m + "/" + day + "/" + y + " " + hour + ":" + min + (h > 12 ? " PM" : " AM")
  );
}

export function FORMAT_SEARCH(param) {
  let filter = "";
  for (let k in param) {
    if (param[k] && param[k] != "" && param[k] != "null") {
      filter += "&" + k + "=" + param[k];
    }
  }
  return filter;
}

export function FORMATE_ATTR_VALUE(attribute) {
  if (attribute) {
    return attribute
      .map((data) => {
        return data.name;
      })
      .join(", ");
  }
  return "";
}

export function calculatePage(page, limit, total) {
  const data = { page: page, limit: limit, change: true };
  const pn = Math.max(Math.ceil(total / limit), 1);
  if (page == pn) {
    const remain = total - (page - 1) * limit;
    if (remain < 2) {
      data.page = page - 1;
    }
    data.change = false;
    return data;
  }
  return data;
}

export function SORTING(id, sort) {
  if (id) {
    if (sort["order_by"] == id) {
      switch (sort["order"]) {
        case "asc":
          $(`#${id}`).removeClass("la-arrow-up").addClass("la-arrow-down");
          sort["order"] = "desc";
          break;
        case "desc":
          $(`#${id}`).removeClass("la-arrow-down").addClass("la-arrow-up");
          sort["order"] = "asc";
          break;
      }
    } else {
      $(".icon").css("display", "none");
      $(`#${id}`).css("display", "inline");
      sort["order_by"] = id;
      sort["order"] = "asc";
      $(`#${id}`).removeClass("la-arrow-down").addClass("la-arrow-up");
    }
  } else {
    $(".icon").css("display", "none");
  }
  return sort;
}

export function FORMATESORT(sort) {
  if (sort["order_by"]) {
    return `&order_by=${sort["order_by"]}&order=${sort["order"]}`;
  }
  return "";
}

export function FormateStatus(data) {
  return data.split(" ").join("-").toLowerCase();
}

export function FormatPrice(data) {
  // console.log(data)
  const prices = data[0];
  const price = { base: {}, rent: [] };
  if (prices.base.price > 0) {
    price.base["price"] = prices.base.price;
    price.base["rent_type"] = null;
    price.base["rent_duration"] = null;
    price.base["duration"] = null;
    price.base["id"] = prices.base.id;
  }
  if (prices.fixed) {
    let rent = {};
    rent["price"] = prices.fixed.price;
    rent["duration"] = "";
    rent["rent_duration"] = 1;
    rent["rent_type"] = "rent";
    rent["id"] = prices.fixed.id;
    rent["serial"] = 1;
    rent["rent_start"] = prices.fixed.rent_start;
    rent["rent_end"] = prices.fixed.rent_end;
    //  console.log(rent ,  prices.fixed)
    price.rent.push(rent);
  } else {
    let serial = 1;
    for (let c in prices) {
      for (let i = 0; i < prices[c].length; i++) {
        let rent = {};
        rent["price"] = prices[c][i].price;
        rent["duration"] = prices[c][i].duration;
        rent["rent_duration"] = 1;
        rent["rent_type"] = prices[c][i].label;
        rent["serial"] = serial;
        rent["id"] = prices[c][i].id;
        rent["rent_start"] = prices[c][i].rent_start;
        rent["rent_end"] = prices[c][i].rent_end;
        rent["min_date"] = prices[c][i].min_date;
        serial++;
        price.rent.push(rent);
      }
    }
  }
  price.rent.sort((a, b) => {
    return a["serial"] - b["serial"];
  });

  return price;
}

export function AdminFormatPrice(data) {
  // console.log(data)
  const prices = data[0];
  const price = { base: {}, rent: [] };
  if (prices.base.price > 0) {
    price.base["price"] = prices.base.price;
    price.base["rent_type"] = "buy";
    price.base["rent_duration"] = null;
    price.base["duration"] = null;
    price.base["id"] = prices.base.id;
  }
  if (prices.fixed) {
    let rent = {};
    rent["price"] = prices.fixed.price;
    rent["duration"] = "";
    rent["rent_duration"] = 1;
    rent["rent_type"] = "rent";
    rent["id"] = prices.fixed.id;
    rent["serial"] = 1;
    rent["rent_start"] = prices.fixed.rent_start;
    rent["rent_end"] = prices.fixed.rent_end;
    //  console.log(rent ,  prices.fixed)
    price.rent.push(rent);
  } else {
    let serial = 1;
    for (let c in prices) {
      for (let i = 0; i < prices[c].length; i++) {
        let rent = {};
        rent["price"] = prices[c][i].price;
        rent["duration"] = prices[c][i].duration;
        rent["rent_duration"] = 1;
        rent["rent_type"] = prices[c][i].label;
        rent["serial"] = serial;
        rent["id"] = prices[c][i].id;
        rent["rent_start"] = prices[c][i].rent_start;
        rent["rent_end"] = prices[c][i].rent_end;
        rent["min_date"] = prices[c][i].min_date;
        serial++;
        price.rent.push(rent);
      }
    }
  }

  price.rent.sort((a, b) => {
    return a["serial"] - b["serial"];
  });

  return price;
}

export function FormateAttribute(data) {
  if (data && data.length > 0) {
    const att = [];
    for (let a of data) {
      att.push(a.attributes[0].id);
    }
    return att;
  }
  return [];
}

export function convertTime12to24(time12h) {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return hours + ":" + minutes;
}

export function iframe(id, iFram) {
  setTimeout(() => {
    let height = $("#" + id).outerHeight();
    let width = $("#" + id).outerWidth();
    const fram = `<iframe id="tokenframe" name="tokenframe" src="https://fts.cardconnect.com:8443/itoke/ajax-tokenizer.html?css=input{width:${
      width - 30
    }px;height: ${
      height - 12
    }px;padding: .375rem .75rem;font-size: 1rem;line-height: 1.5;border: 1px solid rgb(206, 212, 218);border-radius: 4px;box-shadow: none;outline:none;}" frameborder="0" scrolling="no" width="${
      width + 6
    }" height="${height + 12}" style="position:relative; left:-6px"></iframe>`;
    $(iFram + " iframe").remove();
    $(iFram).append(fram);
  }, 500);
}

export const monthsArray = [
  { text: "-Select Month-", value: null },
  { text: "01 January", value: "01" },
  { text: "02 February", value: "02" },
  { text: "03 March", value: "03" },
  { text: "04 April", value: "04" },
  { text: "05 May", value: "05" },
  { text: "06 June", value: "06" },
  { text: "07 July", value: "07" },
  { text: "08 August ", value: "08" },
  { text: "09 September ", value: "09" },
  { text: "10 October ", value: "10" },
  { text: "11 November", value: "11" },
  { text: "12 December", value: "12" },
];

export function createYearArray() {
  const year = [{ text: "-Select Year-", value: null }];
  const y = new Date().getFullYear();
  for (let i = 0; i < 15; i++) {
    let n = (y + i).toFixed();
    year.push({ text: n, value: n.slice(2) });
  }
  return year;
}

export const shipping = [];

export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function formatTag(text) {
  return text.replace(/(\-[a-z])/g, function ($1) {
    return $1.toUpperCase().replace("-", "");
  });
}

export function formatProductSearch(data) {
  return data.map((r) => {
    const arr = [];
    for (let i = 0; i < r.variant_chain_name.length; i++) {
      arr.push(
        `${r.variant_set_name[r.variant_set_id[i]]}: ${r.variant_chain_name[i]}`
      );
    }
    r["chain"] = r.variant_set_id.includes(1) ? "" : arr.join(" -> ");
    return r;
  });
}

export function formatProductSearchFilter(data) {
  return data
    .filter((item) => item.rent || item.buy || isActiveSubscription())
    .map((r) => {
      const arr = [];
      for (let i = 0; i < r.variant_chain_name.length; i++) {
        arr.push(
          `${r.variant_set_name[r.variant_set_id[i]]}: ${
            r.variant_chain_name[i]
          }`
        );
      }
      r["chain"] = r.variant_set_id.includes(1) ? "" : arr.join(" -> ");
      return r;
    });
}

export function isActiveSubscription() {
  let status = false;
  let contents = localStorage.getItem("rentmy_contents")
    ? JSON.parse(localStorage.getItem("rentmy_contents"))
    : null;
  if (contents?.site_specific?.confg?.customer?.membership) {
    if (contents?.site_specific?.confg?.checkout?.checkout_by == "cart") {
      status = true;
    }
  }
  return status;
}

export function downloadFile(file, fileName) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);
  fileName ? (a.download = fileName) : a.download;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

export function getSubDomainName(param) {
  const href = windowLocation().href;
  const s = href.indexOf("//") + 2;
  const e = href.indexOf(".rentmy");
  const sub = href.substring(s, e);
  return sub.includes(param);
}

export function checkFileSize(file, limit) {
  let FileSize = file.size / 1024 / 1024;
  if (FileSize > limit) {
    return false;
  }
  return true;
}

export function changeNullToEmpty(data) {
  const obj = {};
  for (let d in data) {
    obj[d] = data[d] == null ? "" : data[d];
  }
  return obj;
}

export function getSubdomain() {
  const domain = windowLocation().host;
  // console.log(domain);
  return domain.split(".")[0];
}

export function getdomain() {
  const domain = windowLocation().host;
  // console.log(domain);
  return domain;
}

export function getStoreName() {
  let store = localStorage.getItem("storeName");
  let online_store = sessionStorage.getItem("online_store");
  let storeName = "";

  if (store != undefined && store != "undefined" && store != null) {
    storeName = JSON.parse(localStorage.getItem("storeName"));
  } else if (
    online_store != undefined &&
    online_store != "undefined" &&
    online_store != null
  ) {
    storeName = JSON.parse(sessionStorage.getItem("online_store")).store.slug;
  }

  return storeName;
}

export function getOnlineStoreID() {
  let online_store = sessionStorage.getItem("online_store");
  let storeID = 0;

  if (
    online_store != undefined &&
    online_store != "undefined" &&
    online_store != null
  ) {
    storeID = JSON.parse(sessionStorage.getItem("online_store")).store?.id;
  }

  return storeID ? storeID : null;
}

export function getOriginalUrl() {
  return windowLocation().origin;
}

export function formateConfig(obj, name) {
  const arr = [];
  for (let d in obj) {
    let o = {};
    o["id"] = d;
    o[name] = obj[d];
    arr.push(o);
  }
  return arr;
}

function getType(type) {
  switch (type) {
    case "lower":
      return { l: 97, u: 122 };
    case "upper":
      return { l: 65, u: 90 };
    default:
      return { l: 48, u: 57 };
  }
}

export function encrypt(text, type) {
  const bound = getType(type);
  return text
    .split("")
    .map((m) => {
      let c = m.charCodeAt(0);
      if (c > bound.l - 1 && c < bound.u + 1) {
        if (c + 5 > bound.u) {
          let x = 5 - (bound.u - c);
          m = String.fromCharCode(bound.l + x - 1);
        } else {
          m = String.fromCharCode(c + 5);
        }
      }
      return m;
    })
    .join("");
}

export function dcrypt(text, type) {
  const bound = getType(type);
  return text
    .split("")
    .map((m) => {
      let c = m.charCodeAt(0);
      if (c > bound.l - 1 && c < bound.u + 1) {
        if (c - 5 < bound.l) {
          let x = 5 - (c - bound.l);
          m = String.fromCharCode(bound.u + 1 - x);
        } else {
          m = String.fromCharCode(c - 5);
        }
      }
      return m;
    })
    .join("");
}

export function eLogin(text) {
  return text
    .split("")
    .map((m) => {
      let c = m.charCodeAt(0);
      if (c === 58) {
        m = String.fromCharCode(33);
      } else if (c === 34) {
        m = String.fromCharCode(36);
      } else if (c === 123) {
        m = String.fromCharCode(94);
      } else if (c === 125) {
        m = String.fromCharCode(92);
      } else if (c === 47) {
        m = String.fromCharCode(59);
      } else if (c === 32) {
        m = String.fromCharCode(126);
      } else if (c === 38) {
        m = String.fromCharCode(128);
      }
      return m;
    })
    .join("");
}

export function dLogin(text) {
  return text
    .split("")
    .map((m) => {
      let c = m.charCodeAt(0);
      if (c === 33) {
        m = String.fromCharCode(58);
      } else if (c === 36) {
        m = String.fromCharCode(34);
      } else if (c === 94) {
        m = String.fromCharCode(123);
      } else if (c === 92) {
        m = String.fromCharCode(125);
      } else if (c === 59) {
        m = String.fromCharCode(47);
      } else if (c === 126) {
        m = String.fromCharCode(32);
      } else if (c === 128) {
        m = String.fromCharCode(38);
      }
      return m;
    })
    .join("");
}

export const ErrorMessage = {
  message: "Something wrong Please try again !!!",
};

export function validateCard(cardNo) {
  let isValid = false;
  let cardTypeimg = "";
  let cardName = "";
  const visaRegEx = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
  const mastercardRegEx = /^(?:5[1-5][0-9]{14})$/;
  const amexpRegEx = /^3[47]\d{1,2}(| |-)\d{6}\1\d{6}$/;
  const discovRegEx = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
  if (visaRegEx.test(String(cardNo))) {
    cardTypeimg = "./assets/img/home/credit-card/visa.png";
    isValid = true;
    cardName = "VISA";
  } else if (mastercardRegEx.test(String(cardNo))) {
    isValid = true;
    cardTypeimg = "./assets/img/home/credit-card/mastercard.png";
    cardName = "MASTERCARD";
  } else if (amexpRegEx.test(String(cardNo))) {
    isValid = true;
    cardTypeimg = "./assets/img/home/credit-card/amex.png";
    cardName = "American Express";
  } else if (discovRegEx.test(String(cardNo))) {
    isValid = true;
    cardTypeimg = "./assets/img/home/credit-card/discover.png";
    cardName = "Discover";
  }

  if (isValid) {
    return { status: true, cardImg: cardTypeimg, cardName: cardName };
  } else {
    return { status: false, cardImg: cardTypeimg, cardName: cardName };
  }
}

export function formatValue(actualValue) {
  const len = actualValue.length;
  const grid = getScreenWidth();
  const slide = grid.s;
  const size = len / slide;
  if (len > 0) {
    let obj = {};
    for (let i = 0; i < size; i++) {
      obj[i] = actualValue.slice(i * slide, i * slide + slide);
    }
    return { product: Object.values(obj), grid: grid };
  }
  return null;
}

function getScreenWidth() {
  const w = window.innerWidth;
  // console.log(w);
  switch (true) {
    case w > 992:
      return { s: 4, c: 3 };
    case 767 < w && w <= 992:
      return { s: 3, c: 4 };
    case 500 < w && w <= 767:
      return { s: 2, c: 6 };
    default:
      return { s: 1, c: 12 };
  }
}

export function getBillingInfo(url) {
  if (url.includes("admin")) {
    const data = sessionStorage.getItem("billInfo");
    return data ? JSON.parse(data) : null;
  } else {
    const data = localStorage.getItem("billingInfo");
    return data ? JSON.parse(data) : null;
  }
}

//  For Calender
export function formateCalenderDate(type, date) {
  let fDay;
  const to = date ? new Date(date) : new Date();
  const y = to.getFullYear();
  const m = to.getMonth();
  if (type === "month") {
    fDay = new Date(y, m, 1);
    return formatWeek(fDay, "month");
  } else if (type === "listWeek" || type === "agendaWeek") {
    return formatWeek(to, "week");
  } else {
    return { start_date: FORMAT_DATE(to), end_date: FORMAT_DATE(to) };
  }
}

function formatWeek(fDay, option) {
  let fDate = fDay.getDay();
  let lDay;
  if (fDate !== 0) {
    fDay = new Date(fDay.getTime() - 60 * 60 * 24 * 1000 * fDate);
  }
  if (option === "month") {
    lDay = new Date(fDay.getTime() + 60 * 60 * 24 * 1000 * 41);
  } else {
    lDay = new Date(fDay.getTime() + 60 * 60 * 24 * 1000 * 6);
  }
  return { start_date: FORMAT_DATE(fDay), end_date: FORMAT_DATE(lDay) };
}

export function checkSameDatetime(is_timeEnable, startDate, endDate) {
  if (is_timeEnable) {
    return startDate === endDate ? true : false;
  } else {
    return false;
  }
}

export function getQtyFromCartList(list, pro, date, duration) {
  if (list) {
    const sum = list
      .filter((d) => {
        return (
          d.product.id === pro.id &&
          // d.product_variant.quantity.id === pro.default_variant.quantity.id &&
          checkDate(d.rent_start, d.rent_end, date, duration)
        );
      })
      .map((q) => q.quantity)
      .reduce((t, i) => t + i, 0);
    return sum;
  }
  return 0;
}

export function getQtyFromProductList(list, date, duration) {
  if (list) {
    const sum = list
      .filter((d) => {
        return checkDateForAvailability(
          d.start_date,
          d.end_date,
          date,
          duration
        );
      })
      .map((q) => q.quantity)
      .reduce((t, i) => t + i, 0);
    return sum;
  }
  return 0;
}

function checkDateForAvailability(s, e, i, d) {
  const cur = i ? new Date(i).getTime() : new Date().getTime();
  const curEnd = cur + 86400000 * (d - 1);
  const st = new Date(s).getTime();
  const end = new Date(e).getTime();
  // console.log({c: new Date(cur), cE: new Date(curEnd), r1: new Date(st), r2:new Date(end)});
  return st <= cur && end >= cur;
}

function checkDate(s, e, i, d) {
  const cur = i ? new Date(i).getTime() : new Date().getTime();
  const curEnd = cur + 86400000 * (d - 1);
  const st = new Date(s).getTime();
  const end = new Date(e).getTime();
  // console.log({c: new Date(cur), cE: new Date(curEnd), r1: new Date(st), r2:new Date(end)});
  return (st <= cur && end >= cur) || (end > cur && st < curEnd);
}

export function formateRentType(d, t) {
  switch (d.toUpperCase()) {
    case "HOURLY":
      return singleOrNot(t) ? "Hour" : "Hours";
    case "DAILY":
      return singleOrNot(t) ? "Day" : "Days";
    case "WEEKLY":
      return singleOrNot(t) ? "Week" : "Weeks";
  }
}

export function singleOrNot(v) {
  if (v) {
    if (typeof v === "string") {
      v = parseInt(v, 10);
    }
    return v > 1 ? false : true;
  }
  return true;
}

export function formatStoreList(data) {
  if (data) {
    return data.map((d) => {
      d["features"] = makeFeatures(d["settings"]).join(", ");
      return d;
    });
  }
  return [];
}

export function makeFeatures(setting) {
  const arr = [];
  for (const key in setting) {
    if (setting[key]) {
      arr.push(formateStoreName(key));
    }
  }
  return arr;
}

function formateStoreName(name) {
  const nameArr = name.replace(/-/g, ",").replace(/_/g, ",").split(",");
  return nameArr.map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
}

export function formatPriceDuration(duration) {
  const labels = JSON.parse(localStorage.getItem("rentmy_contents"))
    .site_specific.others;
  if (!duration) {
    return duration;
  }
  switch (duration.toLowerCase()) {
    case "hour":
      return labels.lbl_hour ? labels.lbl_hour : "hour";
    case "hours":
      return labels.lbl_hours ? labels.lbl_hours : "hours";
    case "day":
      return labels.lbl_day ? labels.lbl_day : "day";
    case "days":
      return labels.lbl_days ? labels.lbl_days : "days";
    case "week":
      return labels.lbl_week ? labels.lbl_week : "week";
    case "weeks":
      return labels.lbl_weeks ? labels.lbl_weeks : "weeks";
    case "month":
      return labels.lbl_month ? labels.lbl_month : "month";
    case "months":
      return labels.lbl_months ? labels.lbl_months : "months";
  }
}
export function getCurrency() {
  const defCurrency = { code: "USD", post: false, pre: true, symbol: "$" };
  try {
    const currency = JSON.parse(localStorage.getItem("currency"));
    return currency ? currency : defCurrency;
  } catch (e) {
    return defCurrency;
  }
}

function priceFormat(locale, amount) {
  return locale.length
    ? new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(Number(amount)))
    : Number(Number(amount)).toFixed(2);
}

export function formatListPrice(
  price,
  starting_at,
  buy_now_for,
  list_per,
  list_for
) {
  const config = getCurrency();
  const locale = config?.locale ? config.locale : "";

  if (price) {
    if (config.pre == true && config.post == false) {
      if (price.hourly && price.hourly.length) {
        const perText =
          price.hourly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.hourly[0].label)
            : ` ${list_for} ` +
              price.hourly[0].duration +
              " " +
              formatPriceDuration(price.hourly[0].label);

        return {
          data: price.hourly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.hourly[0].regular_price || price.hourly[0].price
            ) +
            perText,
        };
      }
      if (price.daily && price.daily.length) {
        const perText =
          price.daily[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.daily[0].label)
            : ` ${list_for} ` +
              price.daily[0].duration +
              " " +
              formatPriceDuration(price.daily[0].label);
        return {
          data: price.daily[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.daily[0].regular_price || price.daily[0].price
            ) +
            perText,
        };
      }
      if (price.weekly && price.weekly.length) {
        const perText =
          price.weekly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
            : ` ${list_for} ` +
              price.weekly[0].duration +
              " " +
              formatPriceDuration(price.weekly[0].label);
        return {
          data: price.weekly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.weekly[0].regular_price || price.weekly[0].price
            ) +
            perText,
        };
      }
      if (price.monthly && price.monthly.length) {
        const perText =
          price.monthly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
            : ` ${list_for} ` +
              price.monthly[0].duration +
              " " +
              formatPriceDuration(price.monthly[0].label);
        return {
          data: price.monthly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.monthly[0].regular_price || price.monthly[0].price
            ) +
            perText,
        };
      }
      if (price.base && (price.base.regular_price || price.base.price)) {
        return {
          data: price.base,
          price:
            `${buy_now_for} ` +
            config.symbol +
            priceFormat(locale, price.base.regular_price || price.base.price),
        };
      }
      if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
        return {
          data: price.fixed,
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(locale, price.fixed.regular_price || price.fixed.price),
        };
      }
    } else if (config.pre == false && config.post == true) {
      if (price.hourly && price.hourly.length) {
        return {
          data: price.hourly[0],
          price:
            `${starting_at} ` +
            priceFormat(
              locale,
              price.hourly[0].regular_price || price.hourly[0].price
            ) +
            " " +
            config.code,
        };
      }
      if (price.daily && price.daily.length) {
        return {
          data: price.daily[0],
          price:
            `${starting_at} ` +
            priceFormat(
              locale,
              price.daily[0].regular_price || price.daily[0].price
            ) +
            " " +
            config.code,
        };
      }
      if (price.weekly && price.weekly.length) {
        const perText =
          price.weekly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
            : ` ${list_for} ` +
              price.weekly[0].duration +
              " " +
              formatPriceDuration(price.weekly[0].label);
        return {
          data: price.weekly[0],
          price:
            `${starting_at} ` +
            priceFormat(
              locale,
              price.weekly[0].regular_price || price.weekly[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.monthly && price.monthly.length) {
        const perText =
          price.monthly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
            : ` ${list_for} ` +
              price.monthly[0].duration +
              " " +
              formatPriceDuration(price.monthly[0].label);
        return {
          data: price.monthly[0],
          price:
            `${starting_at} ` +
            priceFormat(
              locale,
              price.monthly[0].regular_price || price.monthly[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.base && (price.base.regular_price || price.base.price)) {
        return {
          data: price.base,
          price:
            `${buy_now_for} ` +
            priceFormat(locale, price.base.regular_price || price.base.price) +
            " " +
            config.code,
        };
      }
      if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
        return {
          data: price.fixed,
          price:
            `${starting_at} ` +
            priceFormat(
              locale,
              price.fixed.regular_price || price.fixed.price
            ) +
            " " +
            config.code,
        };
      }
    } else {
      if (price.hourly && price.hourly.length) {
        const perText =
          price.hourly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.hourly[0].label)
            : ` ${list_for} ` +
              price.hourly[0].duration +
              " " +
              formatPriceDuration(price.hourly[0].label);
        return {
          data: price.hourly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.hourly[0].regular_price || price.hourly[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.daily && price.daily.length) {
        const perText =
          price.daily[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.daily[0].label)
            : ` ${list_for} ` +
              price.daily[0].duration +
              " " +
              formatPriceDuration(price.daily[0].label);
        return {
          data: price.daily[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.daily[0].regular_price || price.daily[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.weekly && price.weekly.length) {
        const perText =
          price.weekly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
            : ` ${list_for} ` +
              price.weekly[0].duration +
              " " +
              formatPriceDuration(price.weekly[0].label);
        return {
          data: price.weekly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.weekly[0].regular_price || price.weekly[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.monthly && price.monthly.length) {
        const perText =
          price.monthly[0].duration === 1
            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
            : ` ${list_for} ` +
              price.monthly[0].duration +
              " " +
              formatPriceDuration(price.monthly[0].label);
        return {
          data: price.monthly[0],
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.monthly[0].regular_price || price.monthly[0].price
            ) +
            " " +
            config.code +
            perText,
        };
      }
      if (price.base && (price.base.regular_price || price.base.price)) {
        return {
          data: price.base,
          price:
            `${buy_now_for} ` +
            config.symbol +
            priceFormat(locale, price.base.regular_price || price.base.price) +
            " " +
            config.code,
        };
      }
      if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
        return {
          data: price.fixed,
          price:
            `${starting_at} ` +
            config.symbol +
            priceFormat(
              locale,
              price.fixed.regular_price || price.fixed.price
            ) +
            " " +
            config.code,
        };
      }
    }
  }
  return null;
}

export function getShipMethod(data, id) {
  const d = data.find((f) => f.id == id);
  switch (d.name.toLowerCase()) {
    case "fedex":
      return 4;
    case "ups":
      return 5;
  }
}

export function getShipId(data, id) {
  let name = "";
  switch (id) {
    case 4:
      name = "fedex";
      break;
    case 5:
      name = "ups";
      break;
  }
  const d = data.find((f) => f.name.toLowerCase() == name);
  return d ? d.id : 0;
}

export function forPickUp(inS, id, from) {
  const data = {
    instore: inS,
    pickup: id,
  };
  if (from) {
    sessionStorage.setItem("inStore", JSON.stringify(data));
  } else {
    localStorage.setItem("inStore", JSON.stringify(data));
  }
}

export function formatSlideValue(actualValue) {
  const len = actualValue.length;
  const grid = getScreenWidthForSlide();
  const slide = grid.s * 2;
  const size = len / slide;
  if (len > 0) {
    let obj = {};
    for (let i = 0; i < size; i++) {
      obj[i] = actualValue.slice(i * slide, i * slide + slide);
    }
    return { type: Object.values(obj), grid };
  }
}

function getScreenWidthForSlide() {
  const w = window.innerWidth;
  switch (true) {
    case w > 1200:
      return { s: 4, c: 3 };
    case 992 < w && w <= 1200:
      return { s: 3, c: 4 };
    case 767 < w && w <= 992:
      return { s: 2, c: 6 };
    default:
      return { s: 1, c: 12 };
  }
}

export function getRentalPriceType(pType) {
  let type = "";
  if (pType === 2) {
    type = "fixed";
  } else if (pType === 3) {
    type = "flat";
  } else if (pType === 4) {
    type = "flex";
  }
  return type;
}

export function getRentalPriceTypeId(pType) {
  let type;
  if (pType === "fixed") {
    type = 2;
  } else if (pType === "flat") {
    type = 3;
  } else if (pType === "flex") {
    type = 4;
  }
  return type;
}

export function getStartDate() {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    (Number(date.getMonth()) + 1) +
    "-" +
    date.getDate()
  );
}

export function FORMATE_DATE(day) {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    (Number(date.getMonth()) + 1) +
    "-" +
    (Number(date.getDate()) + day)
  );
}

export function getEndDate(day) {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    (Number(date.getMonth()) + 1) +
    "-" +
    (Number(date.getDate()) + day)
  );
}

export function preventInputAlphabets(event) {
  const keyCode = event.keyCode;

  const excludedKeys = [8, 37, 39, 46];

  if (
    !(
      (keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 96 && keyCode <= 105) ||
      excludedKeys.includes(keyCode)
    )
  ) {
    event.preventDefault();
  }
}

export function getCustomerViewObjName() {
  const loc_id = parseInt(localStorage.getItem("location_id"));
  const terminal_id = parseInt(localStorage.getItem("terminal_id"));
  let customer_view_obj_name = "customer_view";

  if (!isNaN(loc_id)) {
    customer_view_obj_name = customer_view_obj_name + "_" + loc_id;
  }

  if (!isNaN(terminal_id)) {
    customer_view_obj_name = customer_view_obj_name + "_" + terminal_id;
  }

  return customer_view_obj_name;
}

export function getLocationAndTerminal() {
  const loc_id = parseInt(localStorage.getItem("location_id"));
  const terminal_id = parseInt(localStorage.getItem("terminal_id"));
  let location_terminal = "";

  if (!isNaN(loc_id)) {
    location_terminal = location_terminal + loc_id;
  }

  if (!isNaN(terminal_id)) {
    location_terminal = location_terminal + "_" + terminal_id;
  }

  return location_terminal;
}

export function getSubscriptionPlan() {
  let subs_plan;
  const user = localStorage.getItem("currentUser")
    ? JSON.parse(localStorage.getItem("currentUser"))
    : {};

  if (user != null && user.subscription.hasOwnProperty("newInventory")) {
    subs_plan = user.subscription.newInventory;
  } else {
    subs_plan = false;
  }

  return subs_plan;
}

export function getPosSignature() {
  let is_Pos_signature = false;
  let signatureObj = JSON.parse(localStorage.getItem("rentmy_contents"))
    .site_specific.confg;

  if (signatureObj.hasOwnProperty("signature")) {
    is_Pos_signature =
      signatureObj.hasOwnProperty("pos") && signatureObj.pos == 1
        ? true
        : false;
  } else {
    is_Pos_signature = false;
  }

  return is_Pos_signature;
}

export const ASSETS_CONDITION = [
  { text: "In Stock", value: 1, color: "#3498db" },
  { text: "Rented Out", value: 2, color: "#e67e22" },
  { text: "Sold", value: 3, color: "#2ecc71" },
  { text: "Damaged", value: 4, color: "#c0392b" },
  { text: "In Service", value: 5, color: "#e74c3c" },
  { text: "In Transit", value: 6, color: "#e74D3c" },
  { text: "Deleted", value: 7, color: "#e74c3D" },
  { text: "Retired", value: 8, color: "#e74c3E" },
];
export const ASSETS_RETURN_CONDITION = [
  { text: "New", value: 1, color: "#3498db" },
  { text: "Good", value: 2, color: "#e67e22" },
  { text: "Fair", value: 3, color: "#2ecc71" },
  { text: "Poor", value: 4, color: "#c0392b" },
  { text: "Need Service", value: 5, color: "#e74c3c" },
  { text: "Damaged", value: 6, color: "#e74D3c" },
  { text: "Missing", value: 7, color: "#e74c3D" },
];

export const ASSETS_STATUS = [
  { text: "Available ", value: 1, color: "#f39c12" },
  { text: "Unavailable ", value: 2, color: "#2980b9" },
  { text: "Deleted ", value: 3, color: "#c0392b" },
];

export const ASSETS_STATUS_CONDITION = [
  {
    text: "Available - In Stock",
    value: 1,
    current_condition: 1,
    current_status: 1,
  },
  {
    text: "Unavailable - Rented Out",
    value: 2,
    current_condition: 2,
    current_status: 2,
  },
  {
    text: "Unavailable - Sold",
    value: 3,
    current_condition: 3,
    current_status: 2,
  },
  {
    text: "Unavailable - Damaged",
    value: 4,
    current_condition: 4,
    current_status: 2,
  },
  {
    text: "Unavailable - In Service",
    value: 5,
    current_condition: 5,
    current_status: 2,
  },
  {
    text: "Unavailable - In Transit",
    value: 6,
    current_condition: 6,
    current_status: 2,
  },
  {
    text: "Unavailable - Deleted",
    value: 7,
    current_condition: 7,
    current_status: 2,
  },
  {
    text: "Unavailable - Retired",
    value: 8,
    current_condition: 8,
    current_status: 2,
  },
];

export const Payment_status = [
  {
    id: 1,
    label: "Paid",
  },
  {
    id: 2,
    label: "Unpaid",
  },
  {
    id: 3,
    label: "Partial Paid",
  },
];

export const Time_format_list = [
  {
    label: 'MM/DD/YYYY eg: "01/18/2020"',
    value: "MM/DD/YYYY",
  },
  {
    label: 'DD/MM/YYYY eg: "18/01/2020"',
    value: "DD/MM/YYYY",
  },
  {
    label: 'DD month YYYY eg: "18 Jan 2016"',
    value: "DD MMM YYYY",
  },
  {
    label: 'YYYY-MM-DD eg: "2020-01-18"',
    value: "YYYY-MM-DD",
  },
];

export function formatPromoText(currentPrice, regularPrice, formatText) {
  let percent = Math.round(100 - (100 * +currentPrice) / +regularPrice);
  const currency = JSON.parse(localStorage.getItem("currency"));
  formatText = formatText.replace(
    "%amount%",
    (currency?.symbol || "$") + currentPrice
  );
  formatText = formatText.replace("%percent%", "" + percent + "%");
  return formatText;
}

export function datePipe__(value, type) {
  const contents = localStorage.getItem('rentmy_contents') ? JSON.parse(localStorage.getItem('rentmy_contents')) : null;
  const format = contents
    ? contents.site_specific.confg.hasOwnProperty('date_format')
      ? contents.site_specific.confg.date_format
      : 'DD MMM YYYY'
    : 'DD MMM YYYY';
  const is_time = contents
    ? contents.site_specific.confg.hasOwnProperty('show_start_time')
      ? contents.site_specific.confg.show_start_time
      : false
    : false;
  let lblToday = contents.site_specific?.product_details?.lbl_today || 'Today';
  let lblTomorrow = contents.site_specific?.product_details?.lbl_tomorrow || 'Tomorrow';
  let lblYesterday = contents.site_specific?.others?.lbl_yesterday || 'Yesterday';
  let lbldays = contents.site_specific?.others?.lbl_days || 'days';
  let lblday = contents.site_specific?.others?.lbl_day || 'day';
  if (value) {
    const momentDate = moment(value);
    if (type === 'only_date') {
      if (moment(value).isValid()) return momentDate.format(format);
      else return value;
    }
    if (type === 'rental') {
      if (is_time) {
        return momentDate.format(format + " hh:mm A");
      }
    } else {
      const today = moment();
      const yesterday = moment().subtract(1, lbldays);
      const tomorrow = moment().add(1, lbldays);
      if (today.isSame(momentDate, lblday)) {
        return lblToday + momentDate.format(" hh:mm A");
      } else if (yesterday.isSame(momentDate, lblday)) {
        return lblYesterday + momentDate.format(" hh:mm A");
      } else if (tomorrow.isSame(momentDate, lblday)) {
        return lblTomorrow + momentDate.format(" hh:mm A");
      } else {
        return momentDate.format(format + (is_time ? " hh:mm A" : ""));
      }
    }
    return momentDate.format(format);
  } else {
    return '';
  }

}

export function datePipe(value, type) {
  const contents = localStorage.getItem("rentmy_contents")
    ? JSON.parse(localStorage.getItem("rentmy_contents"))
    : null;
  const format = contents
    ? contents.site_specific.confg.hasOwnProperty("date_format")
      ? contents.site_specific.confg.date_format
      : "DD MMM YYYY"
    : "DD MMM YYYY";

  const is_start_time = Boolean(contents?.site_specific?.confg?.show_start_time);
  const is_end_time = Boolean(contents?.site_specific?.confg?.show_end_time);
  const is_time = is_start_time || is_end_time;


  let lblToday = contents.site_specific?.product_details?.lbl_today || 'Today';
  let lblTomorrow = contents.site_specific?.product_details?.lbl_tomorrow || 'Tomorrow';
  let lblYesterday = contents.site_specific?.others?.lbl_yesterday || 'Yesterday';
  let lbldays = contents.site_specific?.others?.lbl_days || 'days';
  let lblday = contents.site_specific?.others?.lbl_day || 'day';

  const today = moment();
  const yesterday = moment().subtract(1, lbldays);
  const tomorrow = moment().add(1, lbldays);

  let result = '';

  if (value) {
    const momentDate = moment(value);
    if (type === "start") {
        
        if (today.isSame(momentDate, lblday)) {
          result = lblToday + (is_start_time ? momentDate.format(" hh:mm A") : '');
        } else if (yesterday.isSame(momentDate, lblday)) {
          result = lblYesterday + (is_start_time ? momentDate.format(" hh:mm A") : '');
        } else if (tomorrow.isSame(momentDate, lblday)) {
          result = lblTomorrow + (is_start_time ? momentDate.format(" hh:mm A") : '');
        } else {
          result = momentDate.format(format + (is_start_time ? " hh:mm A" : ""));
        } 

        return result;

    } 
    else if (type === "end") {      
        
        if (today.isSame(momentDate, lblday)) {
          result = lblToday + (is_end_time ? momentDate.format(" hh:mm A") : '');
        } else if (yesterday.isSame(momentDate, lblday)) {
          result = lblYesterday + (is_end_time ? momentDate.format(" hh:mm A") : '');
        } else if (tomorrow.isSame(momentDate, lblday)) {
          result = lblTomorrow + (is_end_time ? momentDate.format(" hh:mm A") : '');
        } else {
          result = momentDate.format(format + (is_end_time ? " hh:mm A" : ""));
        }
        return result;
    } 
    else if (type === "rental") { 
        return momentDate.format(!is_time ? format : (format + " hh:mm A") );
    } 
    else {
      result = momentDate.format(format);
    }   
  }
}

export function getOrderStatus(statusId) {
  switch (statusId) {
    case "1":
      return "Archived";
    case "2":
      return "Pending";
    case "3":
      return "Processing";
    case "4":
      return "Order prep";
    case "4-1":
      return "Delivery prep";
    case "4-2":
      return "Shipping prep";
    case "4-3":
      return "Pickup prep";
    case "5":
      return "With customer";
    case "6":
      return "Returned";
    case "7":
      return "Fulfillment";
    case "6-1":
      return "Out for delivery";
    case "6-2":
      return "Shipped";
    case "6-3":
      return "Awaiting pickup";
    case "11":
      return "Completed";
    case "12":
      return "Paid Other";
    case "18":
      return "Canceled";
    default:
      return "";
  }
}
