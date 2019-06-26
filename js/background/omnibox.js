if(chrome.omnibox != undefined){
	chrome.omnibox.setDefaultSuggestion({
	    "description": cloudopt.i18n.get("ominiboxTips"),
	});
	chrome.omnibox.onInputEntered.addListener(function(text) {
	    cloudopt.tab.open("https://www.cloudopt.net/report/" + text);
	});
}
