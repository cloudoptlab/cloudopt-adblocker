var host = cloudopt.utils.getHost(window.location.href);

var keyword = "";

var insertClass;

$(document).ready(function () {
    cloudopt.config.refresh(function () {

        var config = cloudopt.config.get();
        if (!config.labBookmarkSearch) {
            return;
        }

        if (host == "www.baidu.com") {

            keyword = $("#kw").val();

            insertClass = "#content_left";

            sendSearch();

            $("#kw").bind('input propertychange', function () {

                keyword = $("#kw").val();

                sendSearch();

            });

        } else if (host.startWith("www.google")) {

            keyword = $("#lst-ib").val();

            insertClass = "#res";

            sendSearch();

            $("#lst-ib").bind('input propertychange', function () {

                keyword = $("#lst-ib").val();

                sendSearch();

            });

        } else if (host.endWith(".bing.com")) {

            keyword = $("#sb_form_q").val();

            insertClass = "#b_results";

            sendSearch();

            $("#sb_form_q").bind('input propertychange', function () {

                keyword = $("#sb_form_q").val();

                sendSearch();

            });

        } else if (host.endWith("search.naver.com")) {

            keyword = $("#nx_query").val();

            insertClass = "#sub_pack";

            sendSearch();

            $("#nx_query").bind('input propertychange', function () {

                keyword = $("#nx_query").val();

                sendSearch();

            });

        }

    });


});


function sendSearch() {
    cloudopt.message.send("bookmark-search", keyword, function (response) { });
}

function creatCard(request) {
    var card = "<div id='cloudopt-bookmark'><div class='cloudopt-bookmark-head'>BookMark Search<a id='cloudopt-bookmark-close' href='#'><img class='cloudopt-icon' src='https://cdn.cloudopt.net/extensions/resource/close.png' /></a><a href='https://www.cloudopt.net' target='_blank'><img src='https://cdn.cloudopt.net/extensions/resource/logo.png'></a></div></div>";
    var template = "<div class='cloudopt-bookmark-li'><a href='{{value}}' target='_blank'>{{value}}</a><p>{{value}}</p></div>"
    $("#cloudopt-bookmark").remove();
    $(card).prependTo(insertClass);
    var listSize = 0;
    for (var i = 0; i < request.length; i++) {
        var url = request[i].url;
        if (url != null && url.indexOf("place:") < 0) {
            var html = cloudopt.template.compile(template, DOMPurify.sanitize(request[i].url), DOMPurify.sanitize(request[i].title), DOMPurify.sanitize(request[i].url));
            $(html).appendTo("#cloudopt-bookmark");
            listSize = listSize + 1;
        }
    }
    if (listSize == 0) {
        $("#cloudopt-bookmark").remove();
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.length > 0) {
            creatCard(request);
        } else {
            $("#cloudopt-bookmark").remove();
        }
        if (host.endWith("search.naver.com")) {
            $("#cloudopt-bookmark").css("box-shadow", "none");
        }
        $("#cloudopt-bookmark-close").click(function () {
            $("#cloudopt-bookmark").remove();
        });
    });
