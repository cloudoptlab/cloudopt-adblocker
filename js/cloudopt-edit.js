if (getQueryString("rule") != null) {
    $("#manualInput").val(decodeURIComponent(getQueryString("rule")));
    window.location.hash = "#manualInput";
}

$("#manualAdd").click(function () {
    var value = $("#manualInput").val();
    var rule = new RuleBean();
    if (value.startWith("easy:") && value != null && value.indexOf("::") >= 0) {
        value = value.replace("easy:", "");
        rule.css = [];
        rule.css[0] = value.split("::")[1];
        rule.classify = "advert";
        rule.domain = [];
        rule.matchCase = false;
        rule.popup = false;
        rule.port = ["*"];
        if (getPort(value.split("::")[0]) != "80") {
            rule.port = [];
            rule.port[0] = getPort(value.split("::")[0]);
        }
        rule.thirdParty = false;
        rule.type = [];
        rule.url = "";
        rule.white = false;
        rule.whiteCountry = [];
        rule.host = getHost(value.split("::")[0]);
        refreshConfig(function () {
            try {
                var lock = false;
                for (var i in config.customRule) {
                    if (_.isEqual(config.customRule[i].css, rule.css)) {
                        lock = true;
                        break;
                    }
                }
                if (!lock) {
                    config.customRule[config.customRule.length] = rule;
                    setConfig(config);
                    if ($("#submitToCloudopt").is(':checked')) {
                        submitSampleRule(rule);
                    }
                }
                gaStatic("Add Custom Rule");
                closeTab();
            } catch (e) {
                new Noty({
                    text: i18n("manualSaveTips1"),
                    type: "warning",
                    theme: "mint"
                }).show();
            }
        });
        return;
    } else {
        refreshConfig(function () {
            try {
                config.customRule[config.customRule.length] = JSON3.parse(rule);
                setConfig(config);
                closeTab();
            } catch (e) {
                new Noty({
                    text: i18n("manualSaveTips1"),
                    type: "warning",
                    theme: "mint"
                }).show();
            }
        });
        return;
    }
    new Noty({
        text: i18n("manualSaveTips1"),
        type: "warning",
        theme: "mint"
    }).show();



});
