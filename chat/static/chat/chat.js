
// ***************************** user & token check *****************************
const token = localStorage.getItem("access");
const currentUser = localStorage.getItem("username");
let socket = null;

if (!token) {
    window.location.href = "/login/";
} else {
    document.getElementById("current-user").textContent = currentUser;
    connectSocket();
}

//  ******************* socket connection *******************
function connectSocket() {

    socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/?token=${token}`);
    socket.onopen = function () {
        console.log("✅ WebSocket Connected");
        // socket.send("Hello Server");
    };

    socket.onclose = function () {
        console.log("❌ WebSocket Closed");
    };

    socket.onerror = function (error) {
        console.error(error);
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("Received:", data);
        // getMessages();
        appendMessage(data);
    };

}

function logout(){
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    window.location.href = "/login/";
}

function loadChat(){
    getMessages();
}


async function sendMessage(){
    let receiver=document.getElementById("receiver").value;
    let message=document.getElementById("message").value;

    if (receiver=="" || message==""){
        console.log("receiver || message is empty");
        return;
    }
    socket.send(JSON.stringify({
        receiver: receiver,
        message: message
    }));
    document.getElementById("message").value="";
}


function appendMessage(msg) {

    let div = document.getElementById("messages");
    let html = document.createElement("div");
    html.classList.add("message");
    if (msg.sender === currentUser) {
        html.classList.add("me");
    }

    html.innerHTML = `
        <b>${msg.sender.toUpperCase()}</b><br>
        <small><i>${msg.message}</i></small><br>
        <small>${msg.created_at}</small>
    `;

    div.appendChild(html);

    // Scroll to the latest message
    div.scrollTop = div.scrollHeight;
}


async function getMessages(){
    let receiver=document.getElementById("receiver").value;
    if (receiver==""){
        return;
    }

    let response = await fetch(
        `/chat/chat-history/?receiver=${receiver}`,
        {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access")
            }
        }
    );
    let data = await response.json();
    let div = document.getElementById("messages");
    div.innerHTML = "";
    data.forEach(msg => {
        appendMessage(msg);
    });
}
