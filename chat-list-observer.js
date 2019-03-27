console.log("Chat List Observer Script: Hello from the backup chat extension");

let body = document.querySelectorAll("body")[0];

let added = false;

// To find the node containing the phone number
// document.evaluate("//span[text()='About and phone number']", document, null, XPathResult.ANY_TYPE, null).iterateNext()

var chatListObserver = new MutationObserver((mutationList, observer) => {
    for(let mutation of mutationList){
        if(mutation.type === "childList"){
            let main = app.querySelectorAll("#main");

            if(main.length && added === false){
                added = true;

                let header = main[0].querySelectorAll("header")[0];
                let button = header.querySelectorAll(":scope > div div[role='button']")[0].parentElement;
                let container = button.parentElement;

                // Make a clone of the button you want to modify
                let backup = button.cloneNode(true);
                container.insertBefore(backup, button);

                backup.setAttribute("backup-chat",true);
                backup.addEventListener("click", backupChat);
                backup.style.borderRadius = "100%";
                backup.style.backgroundColor = "#cdcdcd";

                // Remove the original SVG
                let svg = backup.querySelectorAll("svg")[0];
                let wrapper = svg.parentElement;
                wrapper.removeChild(svg);

                // Create a new Icon
                let image = document.createElement("img");
                image.src = chrome.extension.getURL("resources/backup.svg");
                image.alt = "Click here to backup your chat";
                image.style.width = "24px";
                image.style.height = "24px";

                // Insert the new image into the wrapper
                wrapper.appendChild(image);
            }else if (main.length && added === true){
                let backup = main[0].querySelectorAll("header [backup-chat]");

                if(backup.length === 0){
                    added = false;
                }
            }
        }
    }
});

chatListObserver.observe(body,{
    childList: true,
    subtree: true,
});

function backupChat(event) {
    console.log("Backup This Chat", event);

    let messages = app.querySelectorAll("#main .message-in, #main .message-out, #main .tail");
    
    if(messages.length === 0){
        console.log("There is nothing to backup, this is an empty chat");
        return;
    }

    let wrapper = messages[0].parentElement;
    let history = wrapper.parentElement;
    console.log(history);
    
    console.log(history.childList.length);
}
