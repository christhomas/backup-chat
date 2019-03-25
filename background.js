'use strict';

console.log("Backup Chat is running");

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'web.whatsapp.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {type: "addExportButtons"}, (response) => {
      console.log(response);
    });
  });
});
