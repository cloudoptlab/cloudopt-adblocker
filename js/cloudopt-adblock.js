cloudopt.adblock = (function(cloudopt) {

    function customSubscription() {
        cloudopt.config.refresh(function() {
            var adblockConfig = getConfig();
            var cloudoptConfig = cloudopt.config.get();
            cloudoptConfig.customSubscription.forEach(function(value, index) {
                cloudopt.logger.info("A custom rule file is being loaded: " + value);
                $.get(value, {}, function(data) {
                    var list = data.split("\n");
                    if (list.length <= 1) {
                        data.split("\r\n");
                    }
                    list.forEach(function(value, index) {
                        if (value.indexOf("!") < 0 && value.indexOf("#%#") < 0) {
                            adblockConfig.rules.push(value);
                        }
                    });
                    adguardApi.configure(adblockConfig, function() {
                        cloudopt.logger.debug('Load the subscription rule file & Finished Adblock re-configuration.');
                    });
                    cloudopt.store.set("latest_filters_updated_at", Date.now());
                }, "text");
            });
        });
    }


    function getConfig() {
        var cloudoptConfig = cloudopt.config.get();
        var configuration = {
            filters: [101],
            whitelist: cloudoptConfig.whiteList.slice(),
            rules: cloudoptConfig.customRule,
            filtersMetadataUrl: 'https://cdn.cloudopt.net/filters/chromium/filters.json',
            filterRulesUrl: 'https://cdn.cloudopt.net/filters/chromium/{filter_id}.txt'
        };

        configuration.whitelist[configuration.whitelist.length] = "*.cloudopt.net";
        if (cloudoptConfig.safePrivacy) {
            configuration.filters[configuration.filters.length] = 3;
            //configuration.filters[configuration.filters.length] = 4;
        }
        cloudopt.logger.debug("Your language is " + cloudopt.getLanguage());
        switch (cloudopt.getLanguage()) {
            case "zh-CN":
                configuration.filters[configuration.filters.length] = 104;
                break;
            case "zh-TW":
                configuration.filters[configuration.filters.length] = 104;
                break;
            case "ru":
                configuration.filters[configuration.filters.length] = 1;
                break;
            case "ja":
                configuration.filters[configuration.filters.length] = 7;
                break;
            case "de":
                configuration.filters[configuration.filters.length] = 6;
                break;
            case "fr":
                configuration.filters[configuration.filters.length] = 16;
                break;
            case "nl":
                configuration.filters[configuration.filters.length] = 8;
                break;
            case "et":
                configuration.filters[configuration.filters.length] = 9;
                break;
            case "tr":
                configuration.filters[configuration.filters.length] = 13;
                break;
            case "ko":
                configuration.filters[configuration.filters.length] = 227;
                break;
        }
        if (!cloudopt.config.get().adblockActivating) {
            configuration.filters = [];
        }
        if (cloudopt.config.get().safeCoin) {
            configuration.filters[configuration.filters.length] = 242;
        }
        if (cloudopt.config.get().saveCloud) {
            configuration.filters[configuration.filters.length] = 208;
            configuration.filters[configuration.filters.length] = 210;
        }
        cloudopt.logger.debug("Final filter list: " + configuration.filters);
        return configuration;
    }

    function refreshConfig() {
        cloudopt.config.refresh(function() {
            var adblockConfig = getConfig();
            if (!cloudopt.config.get().adblockActivating) {
                adblockConfig.filters = [];
            }
            if (cloudopt.config.get().safeCoin) {
                adblockConfig.filters[adblockConfig.filters.length] = 242;
            }
            adguardApi.start(adblockConfig, function() {
                cloudopt.logger.debug('Finished Adblock initialization.');
            });
            adguardApi.configure(adblockConfig, function() {
                cloudopt.logger.debug('Finished Adblock re-configuration.');
            });
            if (!cloudopt.config.get().adblockActivating && !cloudopt.config.get().safeCoin) {
                adguardApi.stop(function() {
                    cloudopt.logger.debug('Stop Adblock.');
                });
            }
            customSubscription();
        });
    }

    function start() {

        cloudopt.logger.debug("Cloudopt adblock start");

        cloudopt.message.addListener("assistant-create-rule", function(message, sender, sendResponse) {
            cloudopt.config.refresh(function() {
                var c = cloudopt.config.get();
                c.customRule[c.customRule.length] = message.ruleText;
                cloudopt.config.set(c, function() {
                    cloudopt.adblock.refreshConfig();
                });
            });
            sendResponse("");
        });

        cloudopt.message.addListener("refresh-config", function(message, sender, sendResponse) {
            refreshConfig();
            sendResponse("");
        });


        adguardApi.onRequestBlocked.addListener(function(details) {
            tabsBlockCount[details.tabId] = parseInt(tabsBlockCount[details.tabId]) + 1;
            cloudopt.statistics.countEvent("adblock");
            cloudopt.statistics.countEvent("adblock-today");
        });

        adguardApi.onFilterDownloadSuccess.addListener(function() {
            cloudopt.store.set("latest_filters_updated_at", Date.now());
        });

        adguardApi.start(getConfig(), function() {
            cloudopt.logger.debug('Finished Adblock initialization.');
            cloudopt.store.get("firstOpenoption2", function(value) {
                if (value == undefined || value == null) {
                    cloudopt.store.get("firstAutoAddWhiteList", function(value) {
                        if (value == undefined || value == null) {
                            cloudopt.store.set("firstAutoAddWhiteList", "true");
                            cloudopt.config.autoAddWhiteList(function() {
                                cloudopt.logger.debug('Add a white list.');
                                refreshConfig();
                            });
                        }
                    });
                }
            });

            customSubscription();
        });
    }


    return {
        getConfig: getConfig,
        refreshConfig: refreshConfig,
        start: start
    }
})(cloudopt);
