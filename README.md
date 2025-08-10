# Redis-AI-Challenge---Beyond-the-Cache
# Redis Pro Chat - A Real-Time Chat Application

This is my submission for the **[DEV.to Redis AI Challenge: Beyond the Cache](https://dev.to/challenges/redis-2025-07-23)**.

This project is a full-featured, real-time chat application built with Node.js, Express, and Socket.IO. It uses Redis as its primary real-time database to power a suite of advanced features, demonstrating how Redis can be used for much more than just caching.

**[Link to My DEV.to Submission Article](https://dev.to/diassynthesis/how-i-built-a-real-time-chat-app-with-redis-and-an-ai-assistant-4n5k)**

---

## Features

* ✅ **Real-Time Messaging:** Instant message delivery to all connected users via Redis Pub/Sub.
* ✅ **User Presence System:** A live "Online Users" list that updates instantly using Redis Sets.
* ✅ **Persistent Message History:** Chat history is saved to and loaded from a Redis List.
* ✅ **Live "Typing..." Indicator:** A classic chat feature to enhance user experience.
* ✅ **AI Chatbot Persona:** Users can talk to an interactive bot by starting a message with `@bot`.
* ✅ **Admin Controls:** Buttons to clear chat history or perform a full server reset for all users.
* ✅ **Polished UI:** A clean, modern interface with a login flow and a multi-panel layout.

---

## Tech Stack

* **Backend:** Node.js, Express.js
* **Real-Time Communication:** Socket.IO
* **Database:** Redis (using the `redis` npm package)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

---

## How It Uses Redis

This project leverages three distinct Redis data structures:

1.  **Redis Pub/Sub:** Used as the high-speed messaging backbone for broadcasting chat messages instantly to all connected clients.
2.  **Redis Lists:** Used as a durable, capped-size database for storing and retrieving the chat history.
3.  **Redis Sets:** Used to efficiently manage the "Online Users" list, automatically handling uniqueness and providing instant user counts.

---

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/[YOUR-REPOSITORY-NAME].git
    cd [YOUR-REPOSITORY-NAME]
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your Redis URL:**
    * Open the `server.js` file.
    * Change the `redisUrl` variable to point to your Redis instance (either a local one or a cloud one).
    ```javascript
    const redisUrl = 'your-redis-connection-string';
    ```

4.  **Run the server:**
    ```bash
    node server.js
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

---

## Live Demo

A live version of this application is deployed here:

**https://youtu.be/JvSZ9KUW_5E**

---

---

## Future Enhancements & To-Do

This project provides a solid foundation for a real-time chat application, but there are many exciting features that could be added in the future to make it even more powerful.

* **Implement Full-Text Search:** The next major feature would be to integrate **RediSearch**. This would allow users to perform fast, complex searches across the entire chat history, making it easy to find old messages and conversations.

* **Integrate a True AI Chatbot:** While the current `@bot` is a fun persona, a future version could integrate with a real Large Language Model (LLM) via an API. This would enable the bot to have intelligent conversations, answer user questions, or even provide real-time chat moderation.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
