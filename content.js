console.log("Content Script: Hello from the backup chat extension");

let state = {
    dropdown: null,
    selectedChat: null,
    closeButton: null,
    key: "backup-chat",
};

setTimeout(() => {
    let popup = document.querySelectorAll(".app-wrapper-web > span");
    popup.forEach((element) => monitorElement(element));

    processChatList("#pane-side");
}, 5000);

function monitorElement(element)
{
    var observer = new MutationObserver((mutationList, observer) => {
        for(var mutation of mutationList){
            if(mutation.type === "childList"){
                console.log({add: mutation.addedNodes, rem: mutation.removedNodes, dropdown: state.dropdown});

                if(mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeName === "DIV"){
                    console.log("Backup Chat(monitorElement): Chat Dropdown menu has opened");
                    state.dropdown = mutation.addedNodes[0];
                    let menu = state.dropdown.querySelectorAll("ul");
    
                    if(menu.length !== 1){
                        throw "Backup Chat(monitorElement): The menu was not found";
                    }
    
                    addExportToMenu(menu[0]);
                }

                if(mutation.removedNodes.length > 0 && mutation.removedNodes[0] == state.dropdown){
                    console.log("Backup Chat(monitorElement): Chat Dropdown menu has closed");
                    state.dropdown = null
                }
            }
        }
    });

    observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
    });
}

function processChatList(selector)
{
    // First get the root of the normal chat list
    let panel = document.querySelectorAll(selector);

    if(panel.length !== 1){
        throw `Backup Chat(processChatList): Found an unusual number of panels, should be 1, found: ${panel.length}`;
    }
    panel = panel[0];

    let root = getChatListRoot(panel);
    let children = getChildNodes(root);
    
    root.addEventListener("click", (event) => {
        if(event.target.getAttribute("data-icon") === "down"){
            if(state.selectedChat){
                state.selectedChat.removeAttribute(state.key);
            }

            state.closeButton = event.target;

            children.forEach((c) => {
                if(c.contains(state.closeButton)){
                    state.selectedChat = c;
                    state.selectedChat.setAttribute(state.key, true);
                }
            });
        }
    });
}

function addExportToMenu(menu)
{
    let item = menu.querySelectorAll("li")[0];
    let copy = item.cloneNode(true);

    copy.addEventListener("mouseover", () => { copy.classList.add("_1exov") });
    copy.addEventListener("mouseout", () => { copy.classList.remove("_1exov") });
    copy.addEventListener("click", backupChat);
    copy.style = "opacity: 1;";

    let text = copy.querySelectorAll("div")[0];
    text.title = "Backup Chat";
    text.innerHTML = "Backup Chat";

    menu.appendChild(copy);
}

function backupChat(event)
{
    console.log("Backup Chat: ", event);

    document.body.click();

    if(state.selectedChat && state.selectedChat.getAttribute(state.key) == "true"){
        state.closeButton.click();
        state.selectedChat.click();
    }
}

// chrome.runtime.onMessage.addListener((event, sender, sendResponse) => {
//     console.log(event);

//     let message = {};

//     switch(event.type){
//         case "getChatList": 
//             message.type = event.type;
//             message.response = [];
//             a = 0;

//             scrollEntireList("#pane-side", (capture) => {
//                 message.response.push({found: a++})
//                 console.log("found item");
//             });

//             break;

//         case "addExportButtons":
            
//             break;

//         default:
//             message.error = "Must request a event type";
//             break;
//     }

//     message.timestamp = new Date().getTime();

//     sendResponse(message);

//     return true; 
// });

// function scrollEntireList(selector, callback)
// {
//     // First get the root of the normal chat list
//     let panel = document.querySelectorAll(selector);

//     if(panel.length !== 1){
//         throw `Backup Chat(scrollEntireList): Found an unusual number of panels, should be 1, found: ${panel.length}`;
//     }
//     panel = panel[0];

//     let root = getChatListRoot(panel);

//     let children = getChildNodes(root);

//     var observer = new MutationObserver((mutationList, observer) => {
//         for(var mutation of mutationList){
//             switch(mutation.type){
//                 case "childList":
//                     children.forEach((c) => processChatItem(c));
//                     break;
//             }
//         }
//     });

//     let scrollIncrement = 50;
//     panel.scollTop = 0;

//     scrollPanel = () => {
//         let oldScroll = panel.scrollTop;
//         panel.scrollTop += scrollIncrement;

//         if(oldScroll !== panel.scrollTop){
//             console.log("Scroll was detected, ", oldScroll, panel.scrollTop);
//             setTimeout(scrollPanel, 500);
//         }else{
//             console.log("No more scrolling, stop observing");
//             observer.disconnect();
//         }
//     };

//     observer.observe(root, {
//         attributes: true,
//         childList: true,
//         subtree: true,
//     });

//     scrollPanel();
// }

function getChatListRoot(panel)
{
    let images = getChatIcon(panel);

    if(typeof(images) === "undefined"){
        console.log("Could not find images");
    }

    let ancestors = [];
    let first = null;
    let second = null;

    images.forEach(element => {
        if(first === null){
            first = element;
        }else if(second === null){
            second = element;
        }

        if(first !== null && second !== null){
            let range = new Range();
            range.setStart(first, 0);
            range.setEnd(second, 0);
            ancestors.push(range.commonAncestorContainer);
            first = second;
            second = null;
        }
    });

    ancestors = [...new Set(ancestors)];
    ancestors = ancestors.filter((a) => {
        let status = true;
        images.forEach(element => {
            if(status === true) status = a.contains(element);
        })

        return status;
    });

    if(ancestors.length > 1){
        throw "Backup Chat(getChatListRoot): This is unusual, but we have multiple matching ancestors";
    }

    if(ancestors.length === 0){
        throw "Backup Chat(getChatListRoot): There was no ancestors found, very unusual";
    }

    return ancestors.shift();
}

function getChildNodes(element) {
    return element.querySelectorAll(":scope > *");
}

// function processChatItem(element) {
//     let tabIndex = getChildNodes(element)[0];
//     let wrapper = getChildNodes(tabIndex)[0];
//     let parent = getChildNodes(wrapper);

//     if(parent.length !== 2){
//         throw "Backup Chat(processChatItem): The parent node should have left and right nodes only";
//     }

//     let icon = getChatIcon(parent[0])[0];
//     let name = getChatName(parent[1]);

//     return {icon, name};
// }

function getChatIcon(element) {
    return element.querySelectorAll([
        "img", "[data-icon='default-user'] svg", "[data-icon='default-group'] svg"
    ].join(","));
}

// function getChatName(element) {
//     let parent = getChildNodes(element);

//     if(parent.length !== 2){
//         throw "Backup Chat(getChatName): The parent node should have top and bottom nodes only";
//     }

//     let top = parent[0];
//     let title = getChildNodes(top)[0];
//     let titleNode = title.querySelectorAll(":scope [title]");
    
//     if(titleNode.length !== 1){
//         throw "Backup Chat(getChatName): The title node did not have the correct number of elements";
//     }

//     return titleNode[0].title;
// }