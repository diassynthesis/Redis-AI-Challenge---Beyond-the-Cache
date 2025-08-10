const socket = io({
    autoConnect: false
});

// --- Get all elements ---
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const statusArea = document.getElementById('status-area');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatButton = chatForm.querySelector('button');
const messages = document.getElementById('messages');
const userCountSpan = document.getElementById('user-count');
const onlineUsersList = document.getElementById('online-users-list');
const typingIndicator = document.getElementById('typing-indicator');
const clearChatBtn = document.getElementById('clear-chat-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const resetBtn = document.getElementById('reset-btn');

let localUser = '';

// --- Login Flow ---
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
      localUser = username;
      socket.connect();
      socket.on('connect', () => {
          socket.emit('set username', username);
          loginContainer.style.display = 'none';
          chatContainer.style.display = 'flex';
          statusArea.style.display = 'flex';
      });
  }
});

// --- Button Listeners ---
disconnectBtn.addEventListener('click', () => {
    socket.disconnect();
    loginContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    statusArea.style.display = 'none';
});

clearChatBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear the entire chat history for everyone?')) {
      socket.emit('clear chat');
  }
});

resetBtn.addEventListener('click', () => {
    if (confirm('DANGER: This will reset ALL chat history and disconnect ALL users. Are you sure?')) {
        socket.emit('admin reset');
    }
});

// --- Socket Listeners From Server ---
socket.on('user set', (confirmedUser) => {
  localUser = confirmedUser;
  chatInput.disabled = false;
  chatButton.disabled = false;
  chatInput.placeholder = `Message as ${localUser}`;
  chatInput.focus();
});

socket.on('initial setup', (payload) => {
  messages.innerHTML = '';
  payload.history.forEach(messageObject => { addMessage(messageObject, 'received'); });
  addMessage({ user: 'Server Bot', text: payload.welcomeText }, 'server');
});

socket.on('chat message', (messageObject) => { addMessage(messageObject, 'received'); });

socket.on('chat cleared', () => {
  messages.innerHTML = '';
  addMessage({ user: 'Server Bot', text: 'Chat history has been cleared.' }, 'server');
});

socket.on('server reset', () => {
    alert('The server has been reset by an admin. You will be disconnected.');
    loginContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    statusArea.style.display = 'none';
});

socket.on('user count update', (count) => { userCountSpan.textContent = count; });
socket.on('online users update', (usernames) => { onlineUsersList.innerHTML = ''; usernames.forEach(name => { const item = document.createElement('li'); item.textContent = name; onlineUsersList.appendChild(item); }); });

// --- Typing Indicator Logic ---
let typingTimer;
chatInput.addEventListener('input', () => {
  clearTimeout(typingTimer);
  socket.emit('typing', true);
  typingTimer = setTimeout(() => { socket.emit('typing', false); }, 1500);
});

const typingUsers = new Map();
// --- THE FIX: Corrected isTicking to isTyping ---
socket.on('user typing', ({ user, isTyping }) => {
  if (isTyping) {
    typingUsers.set(user, true);
  } else {
    typingUsers.delete(user);
  }
  const users = Array.from(typingUsers.keys());
  if (users.length > 0) {
      let text = `${users.slice(0, 2).join(' and ')} is typing...`;
      if (users.length > 2) {
          text = 'Several people are typing...';
      }
      typingIndicator.textContent = text;
  } else {
      typingIndicator.textContent = '';
  }
});

// --- Sending a Message ---
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit('chat message', chatInput.value);
    addMessage({ user: localUser, text: chatInput.value }, 'sent');
    chatInput.value = '';
    socket.emit('typing', false);
    clearTimeout(typingTimer);
  }
});

// --- Helper function ---
function addMessage(messageObject, type) {
  const item = document.createElement('li');
  const userElement = document.createElement('div');
  userElement.className = 'user';
  userElement.textContent = messageObject.user;
  const textElement = document.createElement('div');
  textElement.className = 'text';
  textElement.textContent = messageObject.text;
  if (messageObject.user === "Server Bot") { item.className = 'server'; } else { item.className = type; }
  if (type !== 'sent' && messageObject.user !== "Server Bot") { item.appendChild(userElement); }
  item.appendChild(textElement);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}