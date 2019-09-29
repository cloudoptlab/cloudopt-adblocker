const G2Model = function (id) {
    let currentWeekDay = [];

    calcAWeekDays = function (cb) {
        currentWeekDay.length = 0;
        const cDate = new Date();
        cDate.setDate(cDate.getDate() - 6);
        for (var i = 0; i < 7; i++) {
            var getDate = cDate.getDate();
            currentWeekDay.push(getDate < 10 ? '0' + getDate : getDate.toString());
            cDate.setDate(getDate + 1);
        };
        if (cb) {
            cb(currentWeekDay)
        }
    }

    renderChart = function () {
        var data = [{
            "day": 0,
            "ACME": 0,
            "Compitor": 0
        }, {
            "day": 1,
            "ACME": 162,
            "Compitor": 42
        }, {
            "day": 2,
            "ACME": 0,
            "Compitor": 54
        }, {
            "day": 3,
            "ACME": 15,
            "Compitor": 26
        }, {
            "day": 4,
            "ACME": 40,
            "Compitor": 150
        }, {
            "day": 5,
            "ACME": 200,
            "Compitor": 68
        }, {
            "day": 6,
            "ACME": 51,
            "Compitor": 54
        }, {
            "day": 7,
            "ACME": 23,
            "Compitor": 35
        }, {
            "day": 8,
            "ACME": 23,
            "Compitor": 35
        }];
        var dv = new DataSet.View().source(data);
        dv.transform({
            type: 'fold',
            fields: ['ACME', 'Compitor'],
            key: 'type',
            value: 'value'
        })
        var chart = new G2.Chart({
            container: id,
            width: 413,
            height: 350,
            style: {
                padding: '40px'
            }
        });
        chart.axis('day', {
            tickLine: null,
            label: null,
            line: null,
        });
        chart.source(dv, {
            day: {
                type: 'linear',
                formatter: function (val) {
                    return val < 10 ? '0' + val : val
                },
                range: [-1 / 9, 10 / 9]
            }
        });
        chart.tooltip({
            crosshairs: true
        });
        chart.area().position('day*value').color('type', '#f3f8fd').tooltip(null).shape('smooth');
        chart.line().position('day*value').color('type', (value) => {
            if (value === 'ACME') {
                return "#2993F9"
            }
            return "#68D0B5"
        }).size(1).shape('smooth');
        chart.render();
    }

    return {
        currentWeekDay: currentWeekDay,
        calcAWeekDays: calcAWeekDays,
        renderChart: renderChart
    }

}


cloudopt.onFinish(function () {

    var url = "";
    var g2Model = G2Model('g2mountNode');
    /**
     * Add AllowList
     */
    function addCurrentUrlAllowList(cb) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddWhiteList(currentTab.url)(type => {
                if (cb) cb(type)
            })
        });
    }

    /**
     * Remove AllowList
     */
    function removeCurrentUrlAllowList(cb) {
        cloudopt.config.refresh(function () {
            var cloudoptConfig = cloudopt.config.get()
            var allowList = cloudoptConfig.whiteList;
            var host = cloudopt.utils.getHost(url);
            allowList.removeByValue(host);
            if (cb) {
                cloudopt.config.set(cloudoptConfig);
                cloudopt.message.send("refresh-config");
                cb()
            }
        })
    }

    /**
     * Add BlockList
     */
    function addCurrentUrlBlockList(cb) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddBlackList(currentTab.url)(type => {
                if (cb) cb(type)
            })
        });
    }

    /** 
     * Add whiteListAds
     */
    function addCurrentUrlAllowAdsList(cb) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            cloudopt.config.fastAddWhiteListAds(currentTab.url)(type => {
                if (cb) cb(type)
            })
        });
    }

    /**
     * Remove whiteListAds
     */
    function removeCurrentUrlAllowAdsList(cb) {
        cloudopt.config.refresh(function () {
            var cloudoptConfig = cloudopt.config.get()
            var whiteListAds = cloudoptConfig.whiteListAds;
            var host = cloudopt.utils.getHost(url);
            whiteListAds.removeByValue(host);
            if (cb) {
                cloudopt.config.set(cloudoptConfig);
                cloudopt.message.send("refresh-config");
                cb()
            }
        })
    }

    /**
     * Toggle Switch
     */
    function toggleSwitch(id, b) {
        if (b === true) {
            $(id).prop('checked', true)
        } else if (b === false) {
            $(id).prop('checked', false)
        } else {
            $(id).prop('checked', !$(id).prop('checked'))
        }
    }

    /**
     * Current URL is exist AllowList
     */
    function isHasInAllowList(url, cb) {
        cloudopt.config.refresh(function () {
            var cloudoptConfig = cloudopt.config.get()
            var allowList = cloudoptConfig.whiteList;
            var host = cloudopt.utils.getHost(url);
            if (cb) {
                if (allowList.some(u => u === host)) {
                    cb(true)
                } else {
                    cb(false)
                }
            }
        })
    }

    /**
     * Current URL is exist whiteListAds
     */
    function isHasInWhiteListAds(url, cb) {
        cloudopt.config.refresh(function () {
            var cloudoptConfig = cloudopt.config.get()
            var whiteListAds = cloudoptConfig.whiteListAds;
            var host = cloudopt.utils.getHost(url);
            if (cb) {
                if (whiteListAds.some(u => u === host)) {
                    cb(true)
                } else {
                    cb(false)
                }
            }
        })
    }

    /**
     * Calc url scale count
     */
    function calcUrlScaleCount(url, cb) {
        cloudopt.grade.website(url, function (result) {
            if (cb) {
                cb(result.score, result.safe)
            }
        });
    }

    if (cloudopt.utils.getUa() == "firefox") {
        $(".popup .mdl-list__item-avatar.material-icons").css("padding-top", "6px");
    }

    // 实时安全保护
    $("#safeProtect").click(function () {
        isHasInAllowList(url, function (isHas) {
            if (isHas === true) {
                removeCurrentUrlAllowList(function () {
                    toggleSwitch("#safeProtect-label", true)
                })
            } else {
                addCurrentUrlAllowList(function (type) {
                    if (type === "optionTipsAddWhiteListSuccess") {
                        toggleSwitch("#safeProtect-label", false)
                    }
                })
            }
        })
    })

    // 恶意广告拦截
    $("#adsIntercept").click(function () {
        isHasInWhiteListAds(url, function (isHas) {
            if (isHas === true) {
                removeCurrentUrlAllowAdsList(function () {
                    toggleSwitch("#adsIntercept-label", true)
                })
            } else {
                addCurrentUrlAllowAdsList(function (type) {
                    if (type === "optionTipsAddWhiteListAdsSuccess") {
                        toggleSwitch("#adsIntercept-label", false)
                    }
                })
            }
        })
    })

    // 查看信誉评分
    $("#credibilityScore").click(function () {
        if (url.startWith("http://") || url.startWith("https://")) {
            cloudopt.tab.open("https://www.cloudopt.net/report/" + cloudopt.utils.getHost(url));
        }
    })

    // 手动拦截器
    $("#manualIntercept").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentTab = tabs[0];
            cloudopt.logger.debug('Opening Assistant UI for tab id=' + currentTab.id + ' url=' + currentTab.url);
            var backgroundPage = chrome.extension.getBackgroundPage();
            var adguardApi = backgroundPage.adguardApi;
            adguardApi.openAssistant(currentTab.id);
            window.close()
        });
    })

    // 更多设置
    $("#moreSet").click(function () {
        cloudopt.tab.open("option.html");
    });

    cloudopt.static.send("Open Popup Page");

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabArray) {

        url = tabArray[tabArray.length - 1].url;

        isHasInAllowList(url, function (isHas) {
            toggleSwitch("#safeProtect-label", !isHas)
        })

        isHasInWhiteListAds(url, function (isHas) {
            toggleSwitch("#adsIntercept-label", !isHas)
        })

        calcUrlScaleCount(url, function (score, isSafe) {
            var countNode = $("#credibilityScore .score-count");
            countNode.text(score)

            if (score == 0 && isSafe) {
                countNode.text("?");
            } else if (score < 60) {
                // $(".mdl-layout__header").css("background-color", "#e53935");
            }
        });

        // 计算当前日期
        g2Model.calcAWeekDays(function (dateRange) {
            $(".time-range").html(`
                <ul>${dateRange.reduce(function (pre, cur) {
                return pre + `<li>${cur}</li>`
            }, '')}</ul>
            `)
        })

        // 渲染图表
        g2Model.renderChart()

    });
});
