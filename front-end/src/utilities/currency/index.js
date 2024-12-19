import cookie from '@utils/cookie';

const currency = {
    format: function (amount, currencyConfig=null) {
        /**
         * EXAMPLE
         * amount = 10
         * currencyConfig = {
         * "pre":true,"post":false,"symbol":"$","code":"USD","locale":""
         * }
         * return $10
         */
        if(!currencyConfig){
            let cg = localStorage.getItem('rentmy_currency_config');
            if(cg) currencyConfig = JSON.parse(cg);
        }
        if (!amount & !currencyConfig) return
        if (!currencyConfig) return amount
        if (!currencyConfig?.symbol) return amount

        amount = parseFloat(amount)?.toFixed(2);

        if (currencyConfig?.pre && !currencyConfig?.post) {
            return `${currencyConfig?.symbol}${amount}`
        }

        if (!currencyConfig?.pre && currencyConfig?.post) {
            return `${amount}${currencyConfig?.symbol}`
        }

    },
    formatListPrice: function (price, currencyConfig) {
        try {
            const config = currencyConfig;
            const locale = config?.locale ? config.locale : "";

            const othersContent = JSON.parse(localStorage.getItem('rentmy_contents'))?.site_specific?.contents?.others;
            let starting_at = othersContent?.product_list_starting_at || '';
            let buy_now_for = othersContent?.product_list_buy_now_for || '';
            let list_per = othersContent?.product_list_per || '';
            let list_for = othersContent?.product_list_for || '';

            if (price) {
                if (config?.pre == true && config.post == false) {
                    if (price.hourly && price.hourly.length) {
                        const perText = price.hourly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.hourly[0].label)
                            : ` ${list_for} ` + price.hourly[0].duration + " " + formatPriceDuration(price.hourly[0].label);

                        return ({
                            data: price.hourly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.hourly[0].regular_price || price.hourly[0].price)) +
                                perText
                        });
                    }
                    if (price.daily && price.daily.length) {
                        const perText = price.daily[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.daily[0].label)
                            : ` ${list_for} ` + price.daily[0].duration + " " + formatPriceDuration(price.daily[0].label);
                        return ({
                            data: price.daily[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.daily[0].regular_price || price.daily[0].price)) +
                                perText
                        });
                    }
                    if (price.weekly && price.weekly.length) {
                        const perText = price.weekly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
                            : ` ${list_for} ` + price.weekly[0].duration + " " + formatPriceDuration(price.weekly[0].label);
                        return ({
                            data: price.weekly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.weekly[0].regular_price || price.weekly[0].price)) +
                                perText
                        });
                    }
                    if (price.monthly && price.monthly.length) {
                        const perText = price.monthly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
                            : ` ${list_for} ` + price.monthly[0].duration + " " + formatPriceDuration(price.monthly[0].label);
                        return ({
                            data: price.monthly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.monthly[0].regular_price || price.monthly[0].price)) +
                                perText
                        });
                    }
                    if (price.base && (price.base.regular_price || price.base.price)) {
                        return ({
                            data: price.base,
                            price: `${buy_now_for} ` + config.symbol + priceFormat(locale, (price.base.regular_price || price.base.price))
                        });
                    }
                    if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
                        return ({
                            data: price.fixed,
                            price: `${starting_at} ` + config.symbol + priceFormat(locale, (price.fixed.regular_price || price.fixed.price))
                        });
                    }
                } else if (config?.pre == false && config.post == true) {
                    if (price.hourly && price.hourly.length) {
                        return ({
                            data: price.hourly[0],
                            price: `${starting_at} ` + priceFormat(locale, (price.hourly[0].regular_price || price.hourly[0].price)) + " " + config.code
                        });
                    }
                    if (price.daily && price.daily.length) {
                        return ({
                            data: price.daily[0],
                            price: `${starting_at} ` + priceFormat(locale, (price.daily[0].regular_price || price.daily[0].price)) + " " + config.code
                        });
                    }
                    if (price.weekly && price.weekly.length) {
                        const perText = price.weekly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
                            : ` ${list_for} ` + price.weekly[0].duration + " " + formatPriceDuration(price.weekly[0].label);
                        return ({
                            data: price.weekly[0],
                            price: `${starting_at} ` +
                                priceFormat(locale, (price.weekly[0].regular_price || price.weekly[0].price)) +
                                " " + config.code + perText
                        });
                    }
                    if (price.monthly && price.monthly.length) {
                        const perText = price.monthly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
                            : ` ${list_for} ` + price.monthly[0].duration + " " + formatPriceDuration(price.monthly[0].label);
                        return ({
                            data: price.monthly[0],
                            price: `${starting_at} ` + priceFormat(locale, (price.monthly[0].regular_price || price.monthly[0].price)) +
                                " " + config.code + perText
                        });
                    }
                    if (price.base && (price.base.regular_price || price.base.price)) {
                        return ({
                            data: price.base,
                            price: `${buy_now_for} ` + priceFormat(locale, (price.base.regular_price || price.base.price)) + " " + config.code
                        });
                    }
                    if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
                        return ({
                            data: price.fixed,
                            price: `${starting_at} ` + priceFormat(locale, (price.fixed.regular_price || price.fixed.price)) + " " + config.code
                        });
                    }
                } else {
                    if (price.hourly && price.hourly.length) {
                        const perText = price.hourly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.hourly[0].label)
                            : ` ${list_for} ` + price.hourly[0].duration + " " + formatPriceDuration(price.hourly[0].label);
                        return ({
                            data: price.hourly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.hourly[0].regular_price || price.hourly[0].price)) + " " + config.code + perText
                        });
                    }
                    if (price.daily && price.daily.length) {
                        const perText = price.daily[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.daily[0].label)
                            : ` ${list_for} ` + price.daily[0].duration + " " + formatPriceDuration(price.daily[0].label);
                        return ({
                            data: price.daily[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.daily[0].regular_price || price.daily[0].price)) + " " + config.code + perText
                        });
                    }
                    if (price.weekly && price.weekly.length) {
                        const perText = price.weekly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.weekly[0].label)
                            : ` ${list_for} ` + price.weekly[0].duration + " " + formatPriceDuration(price.weekly[0].label);
                        return ({
                            data: price.weekly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.weekly[0].regular_price || price.weekly[0].price)) + " " + config.code + perText
                        });
                    }
                    if (price.monthly && price.monthly.length) {
                        const perText = price.monthly[0].duration === 1
                            ? ` ${list_per} ` + formatPriceDuration(price.monthly[0].label)
                            : ` ${list_for} ` + price.monthly[0].duration + " " + formatPriceDuration(price.monthly[0].label);
                        return ({
                            data: price.monthly[0],
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.monthly[0].regular_price || price.monthly[0].price)) + " " + config.code + perText
                        });
                    }
                    if (price.base && (price.base.regular_price || price.base.price)) {
                        return ({
                            data: price.base,
                            price: `${buy_now_for} ` + config.symbol +
                                priceFormat(locale, (price.base.regular_price || price.base.price)) + " " + config.code
                        });
                    }
                    if (price.fixed && (price.fixed.regular_price || price.fixed.price)) {
                        return ({
                            data: price.fixed,
                            price: `${starting_at} ` + config.symbol +
                                priceFormat(locale, (price.fixed.regular_price || price.fixed.price)) + " " + config.code
                        });
                    }
                }
            }
        } catch (error) {
            console.error()
        }

        return null;
    },
    currencyConvert: function(value) {
        if (value !== undefined) {
          const amount = value;
          const config = JSON.parse(localStorage.getItem('rentmy_currency_config'));
          const locale = config?.locale ? config.locale : "";
          const priceAmount = (locale.length) ?
            new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(Number(amount))) :
            Number(Number(amount)).toFixed(2);
          if (config.pre == true && config.post == false) {
            return config.symbol + priceAmount;
          } else if (config.pre == false && config.post == true) {
            return priceAmount + ' ' + config.code;
          } else {
            return config.symbol + priceAmount + ' ' + config.code;
          }
        }
    }
}

export default currency;



function formatPriceDuration(duration='') {
    const labels = JSON.parse(localStorage.getItem('rentmy_contents'))?.site_specific?.others;
    
    if (!duration) {
      return duration;
    }
    switch (duration.toLowerCase()) {
      case "hour":
        return labels.lbl_hour ? labels.lbl_hour : 'hour';
      case "hours":
        return labels.lbl_hours ? labels.lbl_hours : 'hours';
      case "day":
        return labels.lbl_day ? labels.lbl_day : 'day';
      case "days":
        return labels.lbl_days ? labels.lbl_days : 'days';
      case "week":
        return labels.lbl_week ? labels.lbl_week : 'week';
      case "weeks":
        return labels.lbl_weeks ? labels.lbl_weeks : 'weeks';
      case "month":
        return labels.lbl_month ? labels.lbl_month : 'month';
      case "months":
        return labels.lbl_months ? labels.lbl_months : 'months';
    }
  }

  function priceFormat(locale, amount) {
    return (locale.length) ?
      new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(Number(amount)))
      : Number(Number(amount)).toFixed(2);
  }