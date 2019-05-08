$(function() {
    cloudopt.config.refresh(function() {
        var config = cloudopt.config.get();
        if (config.labKeyboard && window.frames.length == parent.frames.length) {
            jqKeyboard.init();
            $("input[type='password']").focus(function() {
                if (!$("#jq-keyboard").hasClass("show")) {
                    $("#jq-keyboard").addClass("show");
                }
            });
        }

    });

});
