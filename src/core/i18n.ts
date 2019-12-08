import $ from 'jquery'

export function get(name: string): string {
    return chrome.i18n.getMessage(name)
}

export function replace(name: string, text: string): string {
    const newText = chrome.i18n.getMessage(name)
    return newText.replace('##', text)
}

export function translateCurrentPage() {
    translateComponent(document.documentElement)
}

export function translateComponent(component: HTMLElement) {
    $(component).find('*[i18n]').each((i, element) => {
        const i18nOnly = $(element).attr('i18n-only')
        if ($(element).val() != null && $(element).val() !== '') {
            if (i18nOnly == null || i18nOnly === '' || i18nOnly === 'value') {
                $(element).val(get($(element).attr('i18n')))
            }
        }
        if ($(element).html() != null && $(element).html() !== '') {
            if (i18nOnly == null || i18nOnly === '' || i18nOnly === 'html') {
                $(element).html(get($(element).attr('i18n')))
            }
        }
        if ($(element).attr('placeholder') != null && $(element).attr('placeholder') !== '') {
            if (i18nOnly == null || i18nOnly === '' || i18nOnly === 'placeholder') {
                $(element).attr('placeholder', get($(element).attr('i18n')))
            }
        }
    })
}
