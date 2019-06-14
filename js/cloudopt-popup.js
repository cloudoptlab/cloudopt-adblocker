cloudopt.onFinish(function() {
    
    function _checkEvaluateTips(url) {
        const key = "evaluate_tip_"+url;
        cloudopt.store.get(key, function(lastShown) {
            lastShown = parseInt(lastShown);
            if (isNaN(lastShown) || Date.now() - lastShown > 28800000 /* 8 hours */ ) {
                tippy("#popupScoreButton", {
                    content: $("#evaluateTipsTemplate").html(),
                    animation: "scale",
                    arrow: true,
                    placement: "bottom",
                    inertia: true,
                    trigger: "manual",
                    onShown: function() {
                        cloudopt.store.set(key, Date.now());
                    }
                })
                document.getElementById("popupScoreButton")._tippy.show();
            }
        });
    }

    if (cloudopt.utils.getUa() == "firefox") {
        $(".popup .mdl-list__item-avatar.material-icons").css("padding-top", "6px");
    }

    cloudopt.static.send("Open Popup Page");

    var url = "";

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabArray) {
        if (tabArray[tabArray.length - 1].url.indexOf("file://") == 0 || tabArray[tabArray.length - 1].url.indexOf("chrome-extension://") == 0 || tabArray[tabArray.length - 1].url.indexOf("chrome://") == 0) {
            $(".score h1").text("?");
            return;
        }

        url = tabArray[tabArray.length - 1].url;

        cloudopt.grade.website(url, function(result) {

            $(".score h1").text(result.score);

            if (result.score == 0 && result.safe == 0) {

                $(".score h1").text("?");
                $('#popupScoreButton').text(cloudopt.i18n.get("popupEvaluateButton"));
                _checkEvaluateTips(url)

            } else if (result.score < 60) {

                $(".mdl-layout__header").css("background-color", "#e53935");

            }


        });


    });

    $(".score-button").click(function() {
        if (url.startWith("http://") || url.startWith("https://")) {
            cloudopt.tab.open("https://www.cloudopt.net/report/" + cloudopt.utils.getHost(url));
        }
    });

    $("#cleanCache").click(function() {
        switch (cloudopt.utils.getUa()) {
            case "chrome":
                cloudopt.tab.open("chrome://settings/clearBrowserData");
                break;
            default:
                cloudopt.notification.error(cloudopt.i18n.get("optionCleanCacheBrowserNotSupported"));
                break;
        }
    });

    $("#report").click(function() {
        cloudopt.tab.open("https://www.cloudopt.net/support");
    });

    $("#evaluation").click(function() {
        var sUsrAg = navigator.userAgent;

        if (sUsrAg.indexOf("Firefox") > -1) {

            cloudopt.tab.open("https://addons.mozilla.org/zh-CN/firefox/addon/cloudoptlab/");

        } else if (sUsrAg.indexOf("Edge") > -1) {

            cloudopt.tab.open("https://www.microsoft.com/zh-sg/p/cloudopt-adblocker/9n93x97kct07?ocid=badge&cid=msft_web_chart&activetab=pivot%3Aoverviewtab");

        } else if (sUsrAg.indexOf("QQBrowser") > -1) {

            cloudopt.tab.open("http://appcenter.browser.qq.com/search/detail?key=cloudopt&id=cnffkgfknlbnbfhihojeagbmcdcfdcnb%20&title=Cloudopt");

        } else if (sUsrAg.indexOf("Whale") > -1) {

            cloudopt.tab.open("https://store.whale.naver.com/detail/lfnpgnggklcddabibdbkmgknonhedeoi");

        } else {
            cloudopt.tab.open("https://chrome.google.com/webstore/detail/cnffkgfknlbnbfhihojeagbmcdcfdcnb");
        }
    });

    $("#listSafe").click(function() {
        cloudopt.tab.open("option.html");
    });

    $("#listAdblock").click(function() {
        cloudopt.tab.open("option.html?hash=safePotential-label");
    });

    $("#listSync").click(function() {
        cloudopt.tab.open("option.html?hash=lab");
    });

    $("#listFeedBack").click(function() {
        cloudopt.tab.open("https://www.cloudopt.net/support#help");
    });

    $("#addWhiteList").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddWhiteList(currentTab.url)(type => {
                if (type === 'optionTipsDontDuplicate') {
                    cloudopt.notification.info(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsAddWhiteListSuccess') {
                    cloudopt.notification.success(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                    cloudopt.notification.error(cloudopt.i18n.get(type))
                }
            })
        });
    })

    $("#addBlackList").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddBlackList(currentTab.url)(type => {
                if (type === 'optionTipsDontDuplicate') {
                    cloudopt.notification.info(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsAddBlackListSuccess') {
                    cloudopt.notification.success(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                    cloudopt.notification.error(cloudopt.i18n.get(type))
                }
            })
        });
    })

    $("#addWhiteListAds").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddWhiteListAds(currentTab.url)(type => {
                if (type === 'optionTipsDontDuplicate') {
                    cloudopt.notification.info(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsAddWhiteListAdsSuccess') {
                    cloudopt.notification.success(cloudopt.i18n.get(type))
                } else if (type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                    cloudopt.notification.error(cloudopt.i18n.get(type))
                }
            })
        });
    })

});
