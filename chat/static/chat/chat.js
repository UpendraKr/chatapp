
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

async function openConversation(user, itemEl) {
    selectedUser = user;

    // Highlight the selected user in the list
    document.querySelectorAll(".user-item").forEach(el => el.classList.remove("active"));
    if (itemEl) itemEl.classList.add("active");

    // Update chat header
    document.getElementById("chat-user").innerText = user.username;
    const avatar = document.getElementById("chat-avatar");
    avatar.innerText = user.username.charAt(0);
    avatar.classList.add("show");

    // Mobile: switch to conversation view
    document.getElementById("container").classList.add("chat-open");

    await getMessages();
}

function closeConversation() {
    // Mobile: go back to the user list
    document.getElementById("container").classList.remove("chat-open");
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

        const avatar = document.createElement("div");
        avatar.className = "user-avatar";
        avatar.innerText = (user.username || "?").charAt(0);

        const name = document.createElement("div");
        name.className = "user-name";
        name.innerText = user.username;

        item.appendChild(avatar);
        item.appendChild(name);

        item.onclick = function() {
            openConversation(user, item);
        };
        div.appendChild(item);
    });

}

function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // fall back to raw string if unparseable

    const now = new Date();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const sameDay = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (sameDay) return time;
    if (isYesterday) return `Yesterday ${time}`;

    const sameYear = date.getFullYear() === now.getFullYear();
    const dateStr = date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: sameYear ? undefined : "numeric"
    });

    return `${dateStr}, ${time}`;
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
        <span class="msg-text">${msg.message}</span>
        <small class="msg-time">${formatDateTime(msg.created_at)}</small>
    `;

    div.appendChild(html);

    // Scroll to the latest message
    div.scrollTop = div.scrollHeight;
}


async function getMessages(){
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
