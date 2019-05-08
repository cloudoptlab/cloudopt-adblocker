function memoryOptimization() {
	let idleSince = {};
	let ticktock = null;
	let currentActivated = 0;
	let suspendedUrls = {};
	let streamTills = {};

	// Notion: Code to send to tabs, MUST NOT invoke directly.
	function getherPageInfo() {
		let links = document.getElementsByTagName("link");
		let favicon = "";
		for (let i = 0; i < links.length; i++) {
			let rel = links[i].getAttribute('rel').toLowerCase();
			if (rel === "icon" || rel === "shortcut icon") {
				favicon = links[i].href;
				break;
			}
		}

		return {
			formChanged: Boolean(window._co_cloudopt_formChanged),
			title: document.title,
			scrollTop: window.scrollY || window.scrollTop || document.getElementsByTagName("html")[0].scrollTop,
			url: window.location.href,
			favicon
		};
	}
	function suspend(params) {
		let suspendUrl = cloudopt.getExtUrl() + "/suspend.html?p=" + params;
		window.location.replace(suspendUrl);
	}
	function windowScroll(pos) {
		if (pos > 0) {
			window.scrollY = window.scrollTop = document.body.scrollTop = document.documentElement.scrollTop = pos;
		}
	}
	// End of code to send to tabs
	const getherPageInfoCode = "(" + getherPageInfo.toString() + ")();";
	const suspendCode = "(" + suspend.toString() + ")";
	const windowScrollCode = "(" + windowScroll.toString() + ")";

	function checkForMemOpt() {
		chrome.tabs.query(
			{
				active: false,
				pinned: false,
				audible: false,
				url: "<all_urls>",
				status: "complete"
			},
			function (tabs) {
				let currentTime = Date.now();
				tabs.filter(function (tab) {
					return idleSince[tab.id] && currentTime - idleSince[tab.id] > 1800000; // Don't hangup a tab that've been activated in last 30min
				}).forEach(function (tab) {
					chrome.tabs.executeScript(tab.id, { code: getherPageInfoCode }, function (results) {
						if (chrome.runtime.lastError) {
							cloudopt.logger.debug(chrome.runtime.lastError.message);
							return;
						}
						if (!results) {
							cloudopt.logger.debug("Error while executing getherPageInfoCode: no result");
							return;
						}

						// Number of reasons not to hang up the tab
						let len = results.filter(function (item) {
							if (!item)
								return false;
							if (item.formChanged) // Form input edited
								return true;
							if (streamTills[tab.id] && currentTime - streamTills[tab.id] < 300000) // Audio/Video requests in last 5min
								return true;
							return false;
						}).length;
						if (len > 0) {
							return;
						}

						let pageInfo = results[0];
						let params = {
							t: pageInfo ? pageInfo.title : "Suspended Page",
							s: pageInfo ? pageInfo.scrollTop : 0,
							u: pageInfo ? pageInfo.url : tab.url,
							i: pageInfo ? pageInfo.favicon : ""
						}

						let code = suspendCode + '("' + btoa(encodeURIComponent(JSON.stringify(params))) + '");';

						chrome.tabs.executeScript(tab.id, { code });
						if (chrome.runtime.lastError) {
							cloudopt.logger.debug(chrome.runtime.lastError.message);
						}
					});
				});
			}
		);
	};

	function preCheckForMemOpt() {
		chrome.system.memory.getInfo(function (info) {
			if (info.availableCapacity / info.capacity < 0.2) {
				checkForMemOpt();
			}
		});
	}

	function saveSuspendUrl(tab) {
		try {
			let paramStr = (new URL(tab.url)).searchParams.get('p');
			let paramObj = JSON.parse(decodeURIComponent(atob(paramStr)));

			suspendedUrls[tab.id] = {
				url: paramObj.u,
				scrollTop: paramObj.s
			};
		} catch (e) {
			// Params are broken, ignore them
			// No operation here
		}
	}

	function enable() {
		chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
			if (changeInfo.status == "complete") {
				if (!tab.active) {
					idleSince[tabId] = Date.now();
					return;
				}
				if (suspendedUrls[tab.id] && suspendedUrls[tab.id].url === tab.url) {
					let code = windowScrollCode + '(' + suspendedUrls[tab.id].scrollTop + ');';
					chrome.tabs.executeScript(tab.id, { code });
					if (chrome.runtime.lastError) {
						cloudopt.logger.debug(chrome.runtime.lastError.message);
					}
					delete suspendedUrls[tab.id];
				}
				if (streamTills[tab.id]) {
					delete streamTills[tab.id];
				}
			}
		});
		chrome.tabs.onActivated.addListener(function (activeInfo) {
			if (activeInfo.tabId === currentActivated) {
				return;
			}
			let lastActivated = currentActivated;
			currentActivated = activeInfo.tabId;

			if (lastActivated) {
				idleSince[lastActivated] = Date.now();
			}

			chrome.tabs.get(currentActivated, function (tab) {
				if (chrome.runtime.lastError) {
					cloudopt.logger.debug(chrome.runtime.lastError.message);
					return;
				}
				if (tab.url.startsWith(cloudopt.getExtUrl() + "/suspend.html")) {
					saveSuspendUrl(tab);
				}
			});
		});
		chrome.tabs.onRemoved.addListener(function (tabId) {
			if (idleSince[tabId]) {
				delete idleSince[tabId];
			}
			if (suspendedUrls[tabId]) {
				delete suspendedUrls[tabId];
			}
			if (streamTills[tabId]) {
				delete streamTills[tabId];
			}
		});
		chrome.webRequest.onHeadersReceived.addListener(function (details) {
			let len = details.responseHeaders.filter(function (item) {
				return item.name.toLowerCase() === "content-type" && (item.value.startsWith("audio") || item.value.startsWith("video") || item.value.indexOf("stream") >= 0);
			}).length;
			if (len > 0) {
				streamTills[details.tabId] = Date.now();
			}
		}, { urls: ["<all_urls>"] }, ["responseHeaders"]);
		ticktock = setInterval(preCheckForMemOpt, 60000);
	}

	function refreshConfig() {
		cloudopt.config.refresh(function () {
			if (cloudopt.config.get().memoryOptimize) {
				if (!ticktock) {
					enable();
				}
			} else {
				if (ticktock) {
					clearInterval(ticktock);
					ticktock = null;
				};
			}
		});
	}

	cloudopt.message.addListener("refresh-config", function (message, sender, sendResponse) {
		refreshConfig();
		sendResponse("");
	});

	refreshConfig();
}

$(function () { memoryOptimization(); });