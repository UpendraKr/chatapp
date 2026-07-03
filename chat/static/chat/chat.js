
// ***************************** user & token check *****************************
const token = localStorage.getItem("access");
const currentUser = localStorage.getItem("username");
let selectedUser = null;
let socket = null;

if (!token) {
    window.location.href = "/login/";
} else {
    loadUsers();
    document.getElementById("current-user").textContent = currentUser;
    connectSocket();
}

async function loadUsers() {
    const response = await fetch("/chat/users/", {
        headers: {
            Authorization:
                "Bearer " + token
        }
    });
    const users = await response.json();
    renderUsers(users);
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
        
        if (!selectedUser) return;

        const belongsToConversation =
            (data.sender === selectedUser.username && data.receiver === currentUser)
            ||
            (data.sender === currentUser && data.receiver === selectedUser.username);

        if (!belongsToConversation)
            return;

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

async function openConversation(user) {
    selectedUser = user;
    // document.getElementById("chat-user").innerText = user.username;
    await getMessages();
}

async function sendMessage(){
    if (!selectedUser){
        alert("Select a user");
        return;
    }
    let message=document.getElementById("message").value;

    if (message==""){
        console.log("message is empty");
        return;
    }
    socket.send(JSON.stringify({
        receiver: selectedUser.username,
        message: message
    }));
    document.getElementById("message").value="";
}


function renderUsers(users) {

    const div = document.getElementById("user-list");

    div.innerHTML = "";

    users.forEach(user => {
        const item = document.createElement("div");
        item.className = "user-item";
        item.innerText = user.username;
        item.onclick = function() {
            openConversation(user);
        };
        div.appendChild(item);
    });

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
    // let receiver=document.getElementById("receiver").value;
    // if (receiver==""){
    //     return;
    // }
    if (!selectedUser)
        return;
    
    let response = await fetch(
        `/chat/chat-history/?receiver=${selectedUser.username}`,
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
