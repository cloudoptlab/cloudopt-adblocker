import * as i18n from '../core/i18n'
import * as tabOp from '../core/tab'

if (chrome.omnibox) {
    chrome.omnibox.setDefaultSuggestion({
        description: i18n.get('ominiboxTips'),
    })
    chrome.omnibox.onInputEntered.addListener((text) => {
        tabOp.open(`https://www.cloudopt.net/report/${text}`)
    })
}
