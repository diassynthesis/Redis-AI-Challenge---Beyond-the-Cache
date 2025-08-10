// Import necessary libraries
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { createClient } = require('redis');
const path = require('path');

// --- Basic Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const userNicknames = new Map();

// --- IMPORTANT: Redis Configuration ---
const redisUrl = 'redis://default:xb3nujDp9C24bsxAsmgmHR7OySwPrBlS@redis-10501.c257.us-east-1-3.ec2.redns.redis-cloud.com:10501'; // 👈 Make sure this is your correct URL

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// --- Main Application Logic ---
async function main() {
  try {
    const publisher = createClient({ url: redisUrl });
    const subscriber = publisher.duplicate();
    
    await publisher.connect();
    await subscriber.connect();
    
    console.log('✅ Connected to Redis successfully!');

    async function updateOnlineUsers() {
        const userSocketIds = await publisher.sMembers('online_users');
        const usernames = userSocketIds.map(id => userNicknames.get(id) || 'Joining...').filter(u => u !== 'Joining...');
        io.emit('online users update', usernames);
        const userCount = await publisher.sCard('online_users');
        io.emit('user count update', userCount);
    }

    await subscriber.subscribe('chat_messages', (message) => {
      io.emit('chat message', JSON.parse(message));
    });

    io.on('connection', async (socket) => {
      console.log(`👋 A user connected: ${socket.id}`);

      socket.on('set username', async (username) => {
        try {
            userNicknames.set(socket.id, username);
            await publisher.sAdd('online_users', socket.id);
            await updateOnlineUsers();
            
            console.log(`User ${socket.id} set their name to: ${username}`);
            
            socket.emit('user set', username); 

            const history = await publisher.lRange('chat_history', 0, 99);
            const parsedHistory = history.map(item => JSON.parse(item));
            
            const setupPayload = {
                history: parsedHistory.reverse(),
                welcomeText: `🎉 Welcome to the Chat, ${username} Please be respectful.!`
            };
            socket.emit('initial setup', setupPayload);

        } catch (err) {
            console.error('An error occurred during user setup:', err);
        }
      });

      socket.on('chat message', async (msg) => {
        const user = userNicknames.get(socket.id) || 'Anonymous';
		
		// --- THE AI BOT FEATURE ---
        if (msg.toLowerCase().startsWith('@bot')) {
            console.log(`🤖 AI Bot summoned by ${user}`);
            const botMessage = {
                user: 'AI Bot',
                text: `Hello, ${user}. Thank you for talking to me. This project demonstrates how Redis can power complex applications!`
            };
            // Simulate "thinking" with a short delay
            setTimeout(() => {
                io.emit('chat message', botMessage);
            }, 1200); // 1.2-second delay
            return; // Stop processing the original message
        }
		
        const messageObject = { user, text: msg };
        const messageJson = JSON.stringify(messageObject);
        await publisher.lPush('chat_history', messageJson);
        await publisher.lTrim('chat_history', 0, 99);
        await publisher.publish('chat_messages', messageJson);
      });
      
      socket.on('clear chat', async () => {
        await publisher.del('chat_history');
        io.emit('chat cleared');
        console.log(`Chat history cleared by ${userNicknames.get(socket.id)}`);
      });

      // --- THE FIX: More robust reset logic ---
      socket.on('admin reset', async () => {
        console.log(`🚨 Server reset initiated by ${userNicknames.get(socket.id)}`);
        await publisher.del('chat_history');
        await publisher.del('online_users');
        
        // 1. Notify all clients that the reset is happening.
        io.emit('server reset');
        
        // 2. After a short delay, disconnect everyone.
        setTimeout(() => {
            io.sockets.sockets.forEach(sock => {
                sock.disconnect(true);
            });
        }, 1000); // 1-second delay
      });

      socket.on('typing', (isTyping) => {
        const user = userNicknames.get(socket.id) || 'Anonymous';
        socket.broadcast.emit('user typing', { user, isTyping });
      });

      socket.on('disconnect', async () => {
        const user = userNicknames.get(socket.id) || 'Anonymous';
        if (user) {
            console.log(`❌ ${user} disconnected: ${socket.id}`);
            await publisher.sRem('online_users', socket.id);
            userNicknames.delete(socket.id);
            await updateOnlineUsers();
            socket.broadcast.emit('user typing', { user, isTyping: false });
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to connect to Redis or start the server:', err);
  }
}

main();