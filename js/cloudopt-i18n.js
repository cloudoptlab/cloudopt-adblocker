$(document).ready(function () {
    $("*[i18n]").each(function (i) {
        var i18nOnly = $(this).attr("i18n-only");
        if ($(this).val() != null && $(this).val() != "") {
            if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "value") {
                $(this).val(cloudopt.i18n.get($(this).attr("i18n")))
            }
        }
        if ($(this).html() != null && $(this).html() != "") {
            if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "html") {
                $(this).html(cloudopt.i18n.get($(this).attr("i18n")))
            }
        }
        if ($(this).attr('placeholder') != null && $(this).attr('placeholder') != "") {
            if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "placeholder") {
                $(this).attr('placeholder', cloudopt.i18n.get($(this).attr("i18n")))
            }
        }
    });

});
