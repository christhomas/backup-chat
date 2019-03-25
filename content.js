console.log("Content Script: Hello from the backup chat extension");

let body = document.querySelectorAll("body")[0];

let added = false;

var observer = new MutationObserver((mutationList, observer) => {
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

observer.observe(body,{
    childList: true,
    subtree: true,
});

function backupChat(event) {
    console.log("Backup This Chat", event);
}
