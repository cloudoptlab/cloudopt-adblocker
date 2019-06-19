/* Common Function */
/**
 * Remove the data according to dx
 *
 * @param dx index
 */
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
}

/**
 * Remove the data according to val
 *
 * @param val value
 */
Array.prototype.removeByValue = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
};

/**
 * Judge the val in the array or not
 *
 * @param val value
 */
Array.prototype.inArray = function (val) {
    for (var i in this) {
        if (typeof this[i] == "string" || typeof this[i] == "number") {
            if (val === this[i]) {
                return true;
            }
        } else {
            if (_.isEqual(val, this[i])) {
                return true;
            }
        }
    }
    return false;
}

String.prototype.startWith = function (str) {
    return this.indexOf(str) == 0;
};

String.prototype.endWith = function (str) {
    var d = this.length - str.length;
    return (d >= 0 && this.lastIndexOf(str) == d)
};


var cloudopt = (function () {

    this.host = "https://www.cloudopt.net/api/v2/";

    this.apikey = "11N9M530M667ZYW9KZHB0100JAX3XRGJ";

    this.storeDriver = chrome.storage.local;

    this.country = "us";

    /**
     * Monitor the page load event and run the callback
     *
     * @param callback    callback function
     */
    function onFinish(callback) {
        if (document.addEventListener) {
            window.addEventListener("load", callback, false);
        } else if (document.attachEvent) {
            window.attachEvent("onload", callback);
        }
    }

    /**
     * Judge the UI language
     * If the language is "zh-CN" so bencome the "cn"
     */
    function getLocation() {
        if (cloudopt.getLanguage() == "zh-CN") {
            return "cn"
        }
        return cloudopt.country.toLowerCase();
    }

    /**
     * Get the UI language
     */
    function getLanguage() {
        return chrome.i18n.getUILanguage();
    }

    /**
     * Get the extension version
     */
    function getVersion() {
        return chrome.runtime.getManifest().version;
    }

    /**
     * Get the extension ID
     */
    function getExtensionId() {
        return chrome.runtime.id;
    }

    /**
     * Get the extension URL
     */
    function getExtUrl() {
        return chrome.runtime.getURL("popup.html").replace("/popup.html", "");
    }


    return {
        host: this.host,
        apikey: this.apikey,
        storeDriver: storeDriver,
        country: country,
        onFinish: onFinish,
        getLocation: getLocation,
        getLanguage: getLanguage,
        getVersion: getVersion,
        getExtensionId: getExtensionId,
        getExtUrl: getExtUrl
    };

})();

cloudopt.message = (function (cloudopt) {

    var messages = [];

    /**
     * Add the monitor
     */
    function addListener() {
        var type = arguments[0] ? arguments[0] : "";
        var callback = arguments[1] ? arguments[1] : function () { };
        var text = arguments[2] ? arguments[2] : "";
        var obj = {
            type: type,
            text: text,
            callback: callback,
        };
        messages[messages.length] = obj;
        cloudopt.logger.debug("Add message listener " + type);
    }

    /**
     * Send message
     */
    function send() {
        var type = arguments[0] ? arguments[0] : "";
        var text = arguments[1] ? arguments[1] : "";
        var callback = arguments[2] ? arguments[2] : function () { };
        cloudopt.logger.debug("Send message: " + type);
        chrome.runtime.sendMessage({
            type: type,
            text: text
        }, function (response) {
            callback(response);
        });
    }

    /**
     * Init the monitor message event
     */
    function init() {
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            cloudopt.logger.debug("Get message " + message.type);
            for (var i = 0; i < messages.length; i++) {
                if (messages[i].type == message.type) {
                    messages[i].callback(message, sender, sendResponse);
                }
            }

        });
    }

    return {
        addListener: addListener,
        send: send,
        init: init
    }

})(cloudopt);

cloudopt.store = (function (cloudopt) {

    /**
     * Set the chrome.storage.local
     * first param is the key of data
     * second param is the value of data
     * third param is the set the storage data for success callback function
     */
    function set() {
        var key = arguments[0] ? arguments[0] : "";
        var value = arguments[1] ? arguments[1] : "";
        var callback = arguments[2] ? arguments[2] : function () { };
        var temp = {};
        temp[key] = value;
        cloudopt.storeDriver.set(temp, function () {
            callback();
        });
    }

    /**
     * Get the chrome.storage.local data according to the key
     * Will run the callback function when succeed for the get data
     */
    function get() {
        var key = arguments[0] ? arguments[0] : "";
        var callback = arguments[1] ? arguments[1] : function () { };
        cloudopt.storeDriver.get(key, function (item) {
            callback(item[key]);
        });
    }

    /**
     * Get all chrome.storage.local data
     * Will run the callback function when succeed
     */
    function all() {
        var callback = arguments[0] ? arguments[0] : function () { };
        cloudopt.storeDriver.get(null, function (items) {
            callback(items);
        });
    }

    /**
     * Remove the data from storage according to the key
     * Will run the callback funciton when succeed
     */
    function remove() {
        var key = arguments[0] ? arguments[0] : "";
        var callback = arguments[1] ? arguments[1] : function () { };
        cloudopt.storeDriver.remove(key, function () {
            callback();
        });
    }

    /**
     * Clear all data
     */
    function clear() {
        cloudopt.storeDriver.clear();
    }



    return {
        set: set,
        get: get,
        all: all,
        remove: remove,
        clear: clear
    };

})(cloudopt);

cloudopt.utils = (function (cloudopt) {

    /**
     * Get the data of query
     * @param name:the query's param name
    */
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /**
     * Comparing the date
     *
     * @param a   the date
     * @param b   the duration for comparing
     */
    function comparisonDate(a, b) {
        return Math.abs((new Date() - new Date(a)) / (1000 * 60 * 60 * 24)) <= parseInt(b);
    }

    /**
     * Filter and Get host
     * @param website   url
     */
    function getHost(website) {
        website = website.replace("http://", "");
        website = website.replace("https://", "");
        website = website.split("/")[0];
        website = website.split("?")[0];
        website = website.split("#")[0];
        website = website.split("#!")[0];
        website = website.split(":")[0];
        return website;
    }

    /**
     * Get port
     *
     * @param website  url
     */
    function getPort(website) {
        website = website.replace("http://", "");
        website = website.replace("https://", "");
        website = website.split("/")[0];
        website = website.split("?")[0];
        website = website.split("#")[0];
        website = website.split("#!")[0];
        if (website.split(":").length <= 1) {
            return "80";
        }
        website = website.split(":")[1];
        return website;
    }

    /**
     * Judge type of brower
     */
    function getUa() {
        if (navigator.userAgent.indexOf('Firefox') >= 0) {
            return "firefox";
        } else
            if (navigator.userAgent.indexOf('Opera') >= 0) {
                return "opera";
            } else if (navigator.userAgent.indexOf("Edge") >= 0) {
                return "edge";
            } else {
                return "chrome";
            }
    }

    /**
     * Return the whole User-Agent line
     */
    function getRawUa() {
        return navigator.userAgent;
    }
   

    return {
        getQueryString: getQueryString,
        comparisonDate: comparisonDate,
        getHost: getHost,
        getPort: getPort,
        getUa: getUa,
        getRawUa: getRawUa
    };

})(cloudopt);

cloudopt.logger = (function (cloudopt) {

    this.level = 1;

    function setLevel(level) {
        switch (level) {
            case "debug":
                this.level = 0;
                break;
            case "info":
                this.level = 1;
                break;
            case "warn":
                this.level = 2;
                break;
            case "error":
                this.level = 3;
                break;
        }
    }

    /**
     * print the debug message
     *
     * @param text    message
    */
    function debug(text) {
        if (level <= 0) {
            print("debug", text, "#00BCD4");
        }
    }

    /**
     * Print info news
     *
     * @param text message
     */
    function info(text) {
        if (level <= 1) {
            print("info", text, "#3F51B5");
        }
    }

    /**
     * Print warn news on the console
     *
     * @param text    message
     */
    function warn(text) {
        if (level <= 2) {
            print("warn", text, "#E91E63");
        }
    }

    /**
     * Print error on the console
     *
      @param text    message
     */
    function error(text) {
        if (level <= 3) {
            print("error", text, "#E91E63");
        }
    }

    /**
     * Print the news and date on the console
     *
     * @param level    type of message
     * @param text     message
     * @param color    set the string color
     */
    function print(level, text, color) {
        var d = new Date();
        console.log("%c[CLOUDOPT-" + level.toUpperCase() + "]" + d.toLocaleString() + ":" + text, "color:" + color);
    }


    return {
        debug: debug,
        info: info,
        warn: warn,
        error: error
    };

})(cloudopt);


cloudopt.i18n = (function (cloudopt) {

    /**
     * Get i18n message param
     *
     * @param name   i18n message param
     */
    function get(name) {
        return chrome.i18n.getMessage(name);
    }

    /**
     * Replace message text "##"
     *
     * @param name i18n message param
     * @param text replace text
     */
    function replace(name, text) {
        var text2 = chrome.i18n.getMessage(name);
        return text2.replace("##", text);
    }

    return {
        get: get,
        replace: replace
    };

})(cloudopt);

cloudopt.static = (function (cloudopt) {

    /**
     * Send the event about eventName
     *
     * @param eventName Event
     */
    function send(eventName) {
        cloudopt.config.refresh(function () {
            cloudopt.store.get("cid", function (item) {
                var cid = item;
                if (cid == undefined || cid == null) {
                    cid = guid();
                    cloudopt.store.set("cid", cid);
                }
                if (cloudopt.config.get().dataCollection) {
                    $.ajax({
                        url: "https://www.google-analytics.com/collect",
                        type: "post",
                        timeout: 10000,
                        data: {
                            v: "1",
                            tid: "UA-101903685-1",
                            cid: cid,
                            aip: "1",
                            ds: "add-on",
                            t: "event",
                            ec: "Browser extensions",
                            ea: eventName,
                            el: cloudopt.getVersion(),
                            an: "Browser extensions",
                            av: cloudopt.getVersion(),
                            ul: getLang(),
                            sd: "24-bit",
                            sr: getViewportSize(),
                            vp: "0x0",
                        },
                        async: true,
                        success: function (data) { },
                        error: function (XMLHttpRequest, textStatus, errorThrown) { }
                    });
                }

            });
        });
    }

    /**
     * Return the random number that is string
     */
    function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    /**
     * Return ID
     */
    function guid() {
        return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
    }

    /**
     * Get the navigator language
     */
    function getLang() {
        if (navigator.language) {
            return navigator.language;
        } else {
            return navigator.browserLanguage;
        }

    }

    /**
     * Return view size
     */
    function getViewportSize() {
        var width = window.innerWidth || document.documentElement.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight;
        return width + "x" + height;
    }

    return {
        send: send
    };

})(cloudopt);

cloudopt.config = (function (cloudopt) {

    var saveConfig = {
        safeCloud: true,
        safeDownload: true,
        safeCoin: true,
        safePrivacy: true,
        safePotential: false,
        adblockActivating: true,
        adblockDisplay: true,
        whiteList: [],
        blackList: [],
        whiteListAds: [],
        labBookmarkSearch: true,
        labSafeTips: true,
        labKeyboard: false,
        memoryOptimize: false,
        dataCollection: true,
        dnsSpeed: true,
        webPrereading: true,
        customRule: [],
        customSubscription: []
    };

    /** Local update time */
    var update_time = new Date().getTime();

    /** 
     * async save config
     */
    function asyncSaveConfig(config) {
        cloudopt.http.put(cloudopt.host + 'adblocker/config', {
            data: JSON.stringify(config)
        }).exec().then(res => {
            for( let e in config ) {
                if (saveConfig.hasOwnProperty(e) ) saveConfig[e] = config[e];
            }
        }, rej => {
            cloudopt.notification.error(cloudopt.i18n.get('updateConfigFailure'))
        })
    }

    /**
     * async refresh config
     */
    function asyncRefreshConfig() {
        cloudopt.http.get(cloudopt.host + 'adblocker/config').resolveAuth().then(res => {
            const _async_update_time = new Date(res.result.update).getTime();
            const _async_config = res.result.config;
            if( _async_update_time >= update_time ) {
                for (let e in _async_config) {
                    if (saveConfig.hasOwnProperty(e)) saveConfig[e] = _async_config[e]
                }
            } else {
                asyncSaveConfig(saveConfig)
            }
        }, rej => {
            /** The user never configured it，Direct configuration */
            if (rej.error === 404) {
                asyncSaveConfig(saveConfig)
            }
        })
    }

    /**
     * async acquire config, Overrides the local configuration directly
     */
    function asyncAcquireConfig() {
        cloudopt.http.get(cloudopt.host + 'adblocker/config').resolveAuth().then(res => {
            const _async_config = res.result.config;
            for (let e in _async_config) {
                if (saveConfig.hasOwnProperty(e)) saveConfig[e] = _async_config[e];
            };
            cloudopt.store.set("config", saveConfig, function () {
                cloudopt.message.send("refresh-config");
            });
        }, rej => {
            /** The user never configured it，Direct configuration */
            if (rej.error === 404) {
                asyncSaveConfig(saveConfig)
            }
        })
    }

    /**
     * Save the config
     */
    function set() {
        var config = arguments[0] ? arguments[0] : function () { };
        var callback = arguments[1] ? arguments[1] : function () { };
        cloudopt.config.refresh(function () {
            cloudopt.store.set("config", config, function () {
                update_time = new Date().getTime();
                refresh();
                callback();
                asyncRefreshConfig()
            });
        });

    }

    /**
     * get the config
     */
    function get() {
        refresh();
        return saveConfig;
    }

    /**
     * Refresh config
     */
    function refresh() {
        var callback = arguments[0] ? arguments[0] : function () { };
        cloudopt.store.get("config", function (item) {
            if (item != undefined && JSON.stringify(item) != "{}") {
                for (var key in saveConfig) {
                    if (item[key] == undefined || item[key] == null) {
                        item[key] = saveConfig[key];
                        set(item);
                    }
                }
                saveConfig = item;
                callback();
            } else {
                cloudopt.config.set(saveConfig);
                callback();
            }
        })
    }

    /**
     * Send the "Daily Activate Units" event
     */
    function activateEquipment() {
        cloudopt.store.get("activate", function (item) {
            var today = new Date();
            today = today.getDate();
            if (item === today) {
                return true;
            }
            cloudopt.static.send("Daily Activate Units");
            cloudopt.store.set("activate", today);
        });

    }

    /**
     * Add whiteList-ads for config
     *
     * @param callback    callback when succeed
     */
    function autoAddWhiteListAds(callback) {
        var fileName = "/whitelist/";
        switch (cloudopt.getLanguage()) {
            case "zh-CN":
                fileName = fileName + "cn"
                break;
        }
        fileName = fileName + ".json";
        $.getJSON(fileName, function (data) {
            var config = cloudopt.config.get();
            $.each(data, function (index, obj) {
                config.whiteListAds[config.whiteListAds.length] = obj.host;
            });
            cloudopt.config.set(config, function () {
                cloudopt.message.send("refresh-config");
                callback();
            });
        });
    }

    /**
     * add list Factory
     * @param { type } 'whiteList' | 'blackList' | 'whiteListAds'
     * @param { tipsMap } { successTips: 'optionTipsAddWhiteListSuccess' | 'optionTipsAddBlackListSuccess' }
     */
    const addListFactory = function (type, tipsMap = { successTips: '' } ) {
        return function(url) {
            const reg = /((https|http|ftp|rtsp|mms):\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/g;
            if (reg.test(url)) {
                const hostUrl = cloudopt.utils.getHost(url);
                const config = cloudopt.config.get();
                if (config[type].some(e => e == hostUrl)) {
                    return function (params) { params.call(arguments, 'optionTipsDontDuplicate') }
                } else {
                    config[type][config[type].length] = hostUrl
                    cloudopt.config.set(config, function () {
                        cloudopt.config.refresh()
                    });
                    return function (params) { params.call(arguments, tipsMap.successTips) }
                }
            } else {
                if (url == "" || url == null) {
                    return function (params) { params.call(arguments, 'optionTipsInputUrlisNull') }
                } else {
                    return function (params) { params.call(arguments, 'optionTipsInputUrlisError') }
                }
            }
        }
    }

    /**
     * Add whiteList
     * @param { url } url
     */
    function fastAddWhiteList(url) {
        cloudopt.config.get().blackList.removeByValue(cloudopt.utils.getHost(url))
        return addListFactory('whiteList', { successTips: 'optionTipsAddWhiteListSuccess'})(url)
    }

    /**
     * Add whiteListAds
     */
    function fastAddWhiteListAds(url) {
        cloudopt.config.get().blackList.removeByValue(cloudopt.utils.getHost(url))
        return addListFactory('whiteListAds', { successTips: 'optionTipsAddWhiteListAdsSuccess'})(url)
    }

    /**
     * Add blackList
     * @param { url } url
     */
    function fastAddBlackList(url) {
        cloudopt.config.get().whiteList.removeByValue(cloudopt.utils.getHost(url))
        return addListFactory('blackList', { successTips: 'optionTipsAddBlackListSuccess'})(url)
    }

    return {
        get: get,
        set: set,
        refresh: refresh,
        activateEquipment: activateEquipment,
        autoAddWhiteListAds: autoAddWhiteListAds,
        fastAddWhiteList: fastAddWhiteList,
        fastAddWhiteListAds: fastAddWhiteListAds,
        fastAddBlackList: fastAddBlackList,
        asyncRefreshConfig: asyncRefreshConfig,
        asyncSaveConfig: asyncSaveConfig,
        asyncAcquireConfig: asyncAcquireConfig
    };

})(cloudopt);

cloudopt.notification = (function (cloudopt) {

    /**
     * chrome notifications Factory
     * @param { iconUrl } iconUrl
     */
    const notyFactory = function (iconUrl) {
        return function (message) {
            if (chrome && chrome.notifications ) {
                chrome.notifications.create('', {
                    type: 'basic',
                    title: 'Cloudopt AdBlocker',
                    message: message,
                    iconUrl: iconUrl
                }, (id) => {
                    setTimeout(() => { chrome.notifications.clear(id, function () { }); }, 6000);
                })
            }
        }
    }

    /**
     * info notifications
     * @param { message }   message
     */
    function info(message) {
        notyFactory('/image/icon/default/icon.png')(message)
    }

    /**
     * success notifications
     * @param { message }   message
     */
    function success(message) {
        notyFactory('/image/icon/green/icon.png')(message)
    }

    /**
     * error notifications
     * @param { message }   message
     */
    function error(message) {
        notyFactory('/image/icon/red/icon.png')(message)
    }

    return {
        info: info,
        success: success,
        error: error
    };

})(cloudopt);

cloudopt.tab = (function (cloudopt) {

    /**
     * Create new tab
     *
     * @param url  The tab url
     */
    function open(url) {
        chrome.tabs.create({
            url: url,
            active: true,
            pinned: false,
        }, function (tab) {

        });
    }

    /**
     * Close all tab that active is true
     */
    function close() {
        chrome.tabs.query({
            active: true
        }, function (tabArray) {
            if (tabArray != undefined && tabArray.length > 0) {
                chrome.tabs.remove(tabArray[0].id, function () { });
            }

        });
    }

    return {
        open: open,
        close: close
    };

})(cloudopt);

cloudopt.grade = (function (cloudopt) {

    this.defaultExpireTime = {
        safeWebsite: 1,
    };

    /** Do not repeat the prompts during this time */
    const noRepeatNotyTime = 1000 * 60 * 5;

    var isCreateNoty = false;

    /**
     * safe tips notification
     *
     * @param  type  'BANK' | 'SHOP' | 'GAME' | 'HOSPITAL'
     */
    const labSafeTipsNoty = ( type ) => {
        const config = cloudopt.config.get();
        if (config.labSafeTips && isCreateNoty === false) {
            switch (type) {
                case "BANK":
                    cloudopt.notification.info(cloudopt.i18n.get('bankSafeTips'))
                    break;
                case "SHOP":
                    cloudopt.notification.info(cloudopt.i18n.get('shopSafeTips'))
                    break;
                case "GAME":
                    cloudopt.notification.info(cloudopt.i18n.get('gameSafeTips'))
                    break;
                case "HOSPITAL":
                    cloudopt.notification.info(cloudopt.i18n.get('hospitalSafeTips'))
                    break;
                default:
                    break;
            };
            setTimeout(() => { isCreateNoty = false }, noRepeatNotyTime)
        };
        isCreateNoty = true
    }

    /**
     * Check the url and get the web data. Such as score ,type, host
     *
     * @param  website  url
     * @param  callback callback function
     */
    function website(website, callback) {
        cloudopt.browserIconChange.normal();
        var cacheSuffix = "_grade_1.0";
        website = cloudopt.utils.getHost(website);
        website = website + cacheSuffix;
        var result = {
            safe: 0,
            type: "",
            date: new Date(),
            score: 0,
            host: ""
        };
        if (website.startsWith("192.") || website.startsWith("localhost") || website.startsWith("127.")) {
            return result;
        }
        result.host = website.replace(cacheSuffix, "");
        cloudopt.store.get(website, function (item) {
            if (item != undefined && JSON.stringify(item) != "{}" && cloudopt.utils.comparisonDate(item.date, defaultExpireTime.safeWebsite)) {
                cloudopt.config.refresh(function () {
                    var config = cloudopt.config.get();
                    if (item.score < 60 && config.safePotential == true) {
                        item.safe = -1;
                    }
                    if (item.score > 30 && config.safePotential == false) {
                        item.safe = 0;
                    }
                    /*if in white list*/
                    if (config.whiteList.indexOf(item.host) > -1 && item.safe < 0) {
                        item.safe = 0;
                    }
                    if (config.whiteListAds.indexOf(item.host) > -1 && item.safe < 0) {
                        item.safe = 0;
                    }
                    /*if in black list*/
                    if (config.blackList.some(e => e === item.host)) {
                        item.safe = -1;
                    }
                    callback(item);
                    if (item.score < 60) cloudopt.browserIconChange.danger();
                    labSafeTipsNoty(item.type)
                });
                return;
            } else {
                cloudopt.store.remove(website);
                cloudopt.http.get(cloudopt.host + 'grade/website/' + website.replace(cacheSuffix, ''),{
                    timeout: 30000
                }).carryApiKey().then(data=>{
                    var config = cloudopt.config.get();
                    if (data.result.score >= 60) {
                        result.safe = 1;
                    } else if (data.result.score < 60 && data.result.score >= 40 && config.safePotential == true) {
                        result.safe = -1;
                    } else if (data.result.score < 40) {
                        result.safe = -2;
                    } else {
                        result.safe = 0;
                    }
                    result.type = data.result.type;
                    result.score = data.result.score;
                    /*if in white list*/
                    if (config.whiteList.indexOf(result.host) > -1 && result.safe == -1) {
                        result.safe = 0;
                    }
                    if (config.whiteListAds.indexOf(result.host) > -1 && result.safe == -1) {
                        result.safe = 0;
                    }
                    if (data.result.host != "") {
                        result.date = new Date().getTime();
                        cloudopt.store.set(website, result);
                    }
                    callback(result);
                    if (result.score < 60) cloudopt.browserIconChange.danger();
                    labSafeTipsNoty(result.type)
                },error=>{
                    result.safe = 0;
                    callback(result);
                    labSafeTipsNoty(result.type)
                })
            }
        });

    }

    return {
        website: website
    };

})(cloudopt);


cloudopt.init = (function (cloudopt) {

    /**
     * First refresh. and moniter the "close-tab" and "open-tab"
     */
    function start() {

        cloudopt.config.refresh();

        cloudopt.message.addListener("close-tab", function (message, sender, sendResponse) {
            cloudopt.tab.close();
            sendResponse("");
        });

        cloudopt.message.addListener("open-tab", function (message, sender, sendResponse) {
            cloudopt.tab.open(message.text);
            sendResponse("");
        });

        cloudopt.message.addListener("grade-website", function (message, sender, sendResponse) {
            cloudopt.grade.website(message.text, sendResponse);
        });

        chrome.tabs.onActivated.addListener(function (activeInfo) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabArray) {
                url = tabArray[tabArray.length - 1].url;
                host = cloudopt.utils.getHost(url);
                // cloudopt.browserIconChange.normal();
                if (tabArray[tabArray.length - 1].url.indexOf("file://") == 0 || tabArray[tabArray.length - 1].url.indexOf("chrome-extension://") == 0 || tabArray[tabArray.length - 1].url.indexOf("chrome://") == 0 || cloudopt.config.get().whiteList.indexOf(host) > -1 || cloudopt.config.get().whiteListAds.indexOf(host) > -1) {
                    cloudopt.browserIconChange.gray();
                    return;
                }
                cloudopt.grade.website(url, function(result) {
                    if (result.score == 0 && result.safe == 0) {
                        cloudopt.browserIconChange.normal()
                    } else if (result.score < 60) {
                        cloudopt.browserIconChange.danger()
                    }
                });
            });
        });

        cloudopt.config.asyncAcquireConfig()

        cloudopt.store.get("location", function (value) {
            if (value != undefined && value != null) {
                cloudopt.logger.debug("Init Cloudopt core , you location is " + value + "(by cache)");
                cloudopt.country = value;
                cloudopt.config.activateEquipment();
            } else {
                cloudopt.http.get(cloudopt.host + 'ip').carryApiKey().then(data=>{
                    try {
                        cloudopt.country = data.result.countryCode.toLowerCase();
                        cloudopt.store.set("location", data.result.countryCode.toLowerCase());
                        cloudopt.config.activateEquipment();
                        cloudopt.logger.debug("Init Cloudopt core , you location is " + cloudopt.country + "(by online)");
                    } catch (error) {
                        cloudopt.country = "us";
                        cloudopt.store.set("location", "us");
                    }
                })
            }
        });
    }

    return {
        start: start
    }
})(cloudopt);

cloudopt.template = (function (cloudopt) {

    /**
     * It is a template engine
     */
    function compile() {
        var template = arguments[0];
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                template = template.replace("{{value}}", arguments[i]);
            }
        }
        return template;

    }

    return {
        compile: compile
    }
})(cloudopt);

cloudopt.browserIconChange = (function (cloudopt) {

    function normal() {
        chrome.browserAction.setIcon({
            path: 'image/icon/default/icon@0,125x.png'
        })
    }

    function gray() {
        chrome.browserAction.setIcon({
            path: 'image/icon/gray/icon@0,125x.png'
        })
    }

    function green() {
        chrome.browserAction.setIcon({
            path: 'image/icon/green/icon@0,125x.png'
        })
    }

    function danger() {
        chrome.browserAction.setIcon({
            path: 'image/icon/red/icon@0,125x.png'
        })
    }

    return {
        normal: normal,
        gray: gray,
        green: green,
        danger: danger
    }
})(cloudopt);

cloudopt.http = (function (cloudopt) {

    const _http_option = {
        /** Whether to allow browser caching */
        cache: true,
        /** What type of content is sent to the server */
        contentType: 'application/json;charset=UTF-8',
        /** parameter */
        data: {},
        /** 'GET' | ''POST' | 'PUT'*/
        method: 'GET'
    }

    class RequestObj {
        constructor(options) {
            this.option = _http_option;
            for (let e in options) {
                this.option[e] = options[e];
            }
        }

        /**
         * HTTP error status code returned by the global processing server
         */
        handleHttpErrorStatus(response) {
            const _status = response.error;
            switch (_status) {
                /** No permission */
                case 401:
                    // todo...
                    break;
                /** access denied */
                case 403:
                    // todo...
                    break;
                /** No resources */
                case 404:
                    // todo...
                    break;
                default: break;
            }
        }

        /**
         * Get jq's ajax encapsulation request
         * @params { isResolveErr: boolean } Whether to allow handleHttpErrorStatus to handle global status code errors
         */
        getAjaxRequest(isResolveErr = true) {
            return new Promise(async (resolve, reject) => {
                try {
                    const _result = await $.ajax(this.option);
                    resolve(_result)
                } catch (error) {
                    const _response = (error && (typeof error.responseText === 'string')) ? JSON.parse(error.responseText) : {}
                    if (isResolveErr) this.handleHttpErrorStatus(_response);
                    reject(_response)
                    cloudopt.logger.debug(error.responseText)
                }
            })
        }

        /**
         * Login status guard, must log in to continue
         */
        resolveAuth(isResolveErr = true) {
            const _url = this.option.url
            const _method = this.option.method
            return new Promise(async (resolve, reject) => {
                try {
                    await cloudopt.http.get(cloudopt.host + "account/auth").exec().then(res => {
                        resolve(new RequestObj({ url: _url, method: _method }).exec())
                    })
                } catch (error) {
                    reject(error)
                    cloudopt.logger.debug(error.responseText)
                }
            })
        }

        /**
         * Carry apiKey
         */
        carryApiKey(isResolveErr = true) {
            this.option.data['apikey'] = cloudopt.apikey;
            return this.getAjaxRequest(isResolveErr)
        }

        /**
         * Normal execution
         */
        exec(isResolveErr = true) {
            return this.getAjaxRequest(isResolveErr)
        }
    };

    function get(url, options = {}) {
        options.url = url;
        options.method = 'GET'
        return new RequestObj(options)
    };

    function put(url, options = {}) {
        options.url = url;
        options.method = 'PUT'
        return new RequestObj(options)
    };

    function post(url, options = {}) {
        options.url = url
        options.method = 'POST'
        return new RequestObj(options)
    };

    function del(url, options = {}) {
        options.url = url
        options.method = 'DELETE'
        return new RequestObj(options)
    };

    return { get: get, put: put, post: post, del: del }
})(cloudopt)
