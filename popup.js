'use strict';

let refresh = document.getElementById("refresh");

refresh.addEventListener("click", (event) => {
  console.log("Refreshing user list");

  
});

function sendMessage(message, response){
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, response);
  });
}
