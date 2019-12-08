/* tslint:disable:interface-name */
interface Window {
    _co_cloudopt_formChanged?: boolean
}
/* tslint:enable:interface-name */

window.addEventListener('keydown', (event) => {
    function isPrintable(keyCode: number) {
        // https://stackoverflow.com/a/12467610
        return (keyCode > 47 && keyCode < 58)   || // number keys
        keyCode === 32 || keyCode === 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (keyCode > 64 && keyCode < 91)   || // letter keys
        (keyCode > 95 && keyCode < 112)  || // numpad keys
        (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
        (keyCode > 218 && keyCode < 223)   // [\]' (in order)
    }

    if (!isPrintable(event.keyCode)) {
        return
    }

    /* tslint:disable:no-string-literal */
    if (['input', 'textarea', 'form', 'pre'].indexOf(event.target['tagName'].toLowerCase()) >= 0) {
        window._co_cloudopt_formChanged = true
    }
    /* tslint:enable:no-string-literal */
})
