new Noty({
    text: i18n("manualTips"),
    type: "info",
    theme: "mint",
    timeout: 5000
}).show();

var selectElement = "div,a,p,h1,h2,h3,h4,h5,h6,span,img,ul,li,iframe,table,thead,tbody,tr,td";

var cssName = "";

$(selectElement).removeClass("cloudopt-manual");

$(selectElement).unbind("mousedown");

$(selectElement).hover(function () {
    $(selectElement).removeClass("cloudopt-manual");
    $(this).addClass("cloudopt-manual");
    $(this).unbind("mousedown");
    $(this).bind("mousedown", function (e) {
        if (3 == e.which) {
            location.reload();
        }
        if (1 == e.which) {
            $(selectElement).removeClass("cloudopt-manual");
            $(selectElement).unbind("mousedown");
            var obj = this;
            cssName = getName(obj);
            for (var i = 0; i < 5; i++) {
                if ($(obj).parent()) {
                    obj = $(obj).parent();
                    cssName = getName(obj) + " " + cssName;
                } else {
                    break;
                }
            }

            chrome.runtime.sendMessage({
                type: "open-tab",
                text: "/edit.html?rule=" + encodeURIComponent("easy:" + getHost(window.location.href) + ":" + getPort(window.location.href) + "::" + cssName)
            }, function (response) {

            });
            location.reload();
        }

    });
}, function () {
    $(this).removeClass("cloudopt-manual");
    $(selectElement).removeClass("cloudopt-manual");

});

$(selectElement).mousedown(function (e) {
    if (3 == e.which) {
        location.reload();
    }
});

function getName(obj) {
    var n = "";

    if ($(obj).attr("id")) {
        n = "#" + $(obj).attr("id");
    } else if ($(obj)[0].className) {
        var classNames = $(obj)[0].className.split(" ");
        for (var i = 0; i < classNames.length; i++) {
            n = n + "." + classNames[i];
        }
    } else {
        n = $(obj)[0].tagName.toLowerCase();
    }

    return n;
}