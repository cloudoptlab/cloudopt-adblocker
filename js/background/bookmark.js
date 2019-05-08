cloudopt.message.addListener("bookmark-search",function(message, sender, sendResponse){
    sendResponse(search(message.text));
});

function search(text) {
    try{
        chrome.bookmarks.search(text, function(results){
            chrome.tabs.query({active:true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, results);
            });
           
        });
    }catch (e){

    }


}

