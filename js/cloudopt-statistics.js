cloudopt.statistics = (function(cloudopt) {
    var events = [];
    var counts = {};

    /**
     * Add a count to an event
     *
     * @param event    event name
     * @param count    an integer, defaults to 1
     */
    function countEvent(event, count) {
        if (!events.includes(event)) {
            events.push(event);
        }

        count = parseInt(count);
        if (isNaN(count)) {
            count = 1;
        }

        if (counts[event] === undefined) {
            counts[event] = count;
        } else {
            counts[event] += count;
        }
        cloudopt.logger.debug("Statistics: count " + event + " " + count + " time(s).");
    }

    /**
     * Get the count of an event
     *
     * @param event    event name
     * @param callback    a function that takes the count as a parameter
     */
    function getCount(event, callback) {
        cloudopt.store.get("statistics." + event, function(count) {
            count = parseInt(count);
            if (isNaN(count)) {
                count = 0;
            }
            callback(count);
        });
    }

    /**
     * Save all counts into the store
     */
    function saveAll() {
        cloudopt.store.set("statisticFields", events.join(","));
        for (let i = 0; i < events.length; i++) {
            cloudopt.store.set("statistics." + events[i], counts[events[i]]);
        }
    }

    /**
     * Start the statistic module in background page, to accept event counts
     */
    function start() {
        cloudopt.store.get("statisticFields", function(fields) {
            if (fields) {
                events = fields.split(",");
            }
            for (let i = 0; i < events.length; i++) {
                getCount(events[i], function(count) {
                    counts[events[i]] = count;
                });
            }
        })

        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (changeInfo.status != "loading") {
                saveAll();
            }
        });

        cloudopt.message.addListener("countEvent",function(message, sender, sendResponse){
            countEvent(message.text)
        })
    }    

    return {
        countEvent: countEvent,       
        getCount: getCount,       
        saveAll: saveAll,
        start: start
    }
})(cloudopt);