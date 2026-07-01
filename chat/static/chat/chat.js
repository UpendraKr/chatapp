function loadChat(){
    getMessages();
}


async function sendMessage(){

    let sender=document.getElementById("sender").value;
    let receiver=document.getElementById("receiver").value;
    let message=document.getElementById("message").value;

    if (sender=="" || receiver=="" || message==""){
        console.log("sender || receiver || message is empty");
        return;

    }

    await fetch("/chat/send-message/",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            sender:sender,
            receiver:receiver,
            message:message

        })

    });
    document.getElementById("message").value="";
    getMessages();
}


async function getMessages(){

    let sender=document.getElementById("sender").value;

    let receiver=document.getElementById("receiver").value;

    if (sender=="" || receiver==""){

        return;

    }

    let response = await fetch(

        `/chat/chat-history/?user1=${sender}&user2=${receiver}`

    );

    let data = await response.json();

    let div = document.getElementById("messages");

    div.innerHTML="";

    data.forEach(msg=>{

        let html=document.createElement("div");

        html.classList.add("message");

        if(msg.sender==sender){

            html.classList.add("me");
        }

        html.innerHTML=

        `<b>${msg.sender.toUpperCase()}</b><br>

        <small><i>${msg.message}</i></small>

        <br>

        <small>${msg.created_at}</small>`;

        div.appendChild(html);

    });

}


setInterval(function(){
    console.log("<----------------- Refresh ------------------>")
    if (sender=="" || receiver==""){

        return;

    }
    getMessages();

}, 3000);