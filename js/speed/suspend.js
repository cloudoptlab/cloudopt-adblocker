$(document).ready(function () {

    try {
        let paramStr = cloudopt.utils.getQueryString("p");
        var paramObj = JSON.parse(decodeURIComponent(atob(paramStr)));

        let favicon;
        if (!paramObj.i) {
            favicon = (new URL(paramObj.u)).origin + "/favicon.ico";
        } else if (paramObj.i.startsWith("/")) {
            favicon = (new URL(paramObj.u)).origin + paramObj.i;
        } else {
            favicon = paramObj.i;
        }

        $("<link />", {
            href: favicon,
            rel: "shortcut icon"
        }).appendTo("head");

        document.title = $('text[i18n="memoryOptimizedIcon"]').attr("placeholder") + paramObj.t;

        $("#return").click(function () {
            window.location.replace(paramObj.u);
        });
    } catch (e) {
        // Can't do anything if the params were broken
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message !== "wake-up") {
            return;
        }

        window.location.replace(paramObj.u);
    });

});
