window.addEventListener('keydown', function(event) {
    function isPrintable(keycode) {
        // https://stackoverflow.com/a/12467610
        return (keycode > 47 && keycode < 58)   || // number keys
        keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91)   || // letter keys
        (keycode > 95 && keycode < 112)  || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)
    }

    if (!isPrintable(event.keyCode)) {
        return;
    }
    
    if (["input", "textarea", "form", "pre"].indexOf(event.target.tagName.toLowerCase()) >= 0) {
        window._co_cloudopt_formChanged = true;
    }
}); 
