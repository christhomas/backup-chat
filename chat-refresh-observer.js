console.log("Chat List Observer Script: Hello from the backup chat extension");

let body = document.querySelectorAll("body")[0];

let added = false;

var chatListObserver = new MutationObserver((mutationList, observer) => {
    for(let mutation of mutationList){
        if(mutation.type === "childList"){
            let main = app.querySelectorAll("#main");

            
        }
    }
});

chatListObserver.observe(body,{
    childList: true,
    subtree: true,
});

