import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "http://localhost:5001/chatHub";
const MAX_MESSAGES = 100; // Task 4: limit displayed messages

export function useChat() {
  const connectionRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [connectionState, setConnectionState] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);    // P-3
  const [typingUsers, setTypingUsers] = useState([]);    // P-6
  const [currentUser, setCurrentUser] = useState(null);  // { username, role }

  // Add a message to the list, capped at MAX_MESSAGES
  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
  }, []);

  // Build and start the SignalR connection
  const connect = useCallback(async (username, role) => {
    if (connectionRef.current) return; // already connected

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("JoinConfirmed", (uname, urole) => {
      setCurrentUser({ username: uname, role: urole });
    });

    connection.on("ReceiveMessage", (msg) => {
      addMessage(msg);
    });

    connection.on("UserJoined", (uname, urole) => {
      addMessage({
        id: crypto.randomUUID(),
        username: "System",
        role: "system",
        message: `${uname} (${urole}) joined the chat.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        channel: "system",
      });
    });

    connection.on("UserLeft", (uname) => {
      addMessage({
        id: crypto.randomUUID(),
        username: "System",
        role: "system",
        message: `${uname} left the chat.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        channel: "system",
      });
    });

    // P-3: update the online user list
    connection.on("UserListUpdated", (users) => {
      setOnlineUsers(users);
    });

    // P-6: update typing indicator
    connection.on("TypingUsersUpdated", (users) => {
      setTypingUsers(users);
    });

    connection.on("Error", (msg) => {
      console.warn("Server error:", msg);
    });

    connection.onreconnecting(() => setConnectionState("Reconnecting"));
    connection.onreconnected(() => setConnectionState("Connected"));
    connection.onclose(() => {
      setConnectionState("Disconnected");
      setCurrentUser(null);
    });

    try {
      await connection.start();
      setConnectionState("Connected");
      await connection.invoke("JoinChat", username, role);
      connectionRef.current = connection;
    } catch (err) {
      console.error("Connection failed:", err);
      setConnectionState("Disconnected");
    }
  }, [addMessage]);

  // Send a general chat message
  const sendMessage = useCallback(async (message) => {
    if (!connectionRef.current || !message.trim()) return;
    await connectionRef.current.invoke("SendMessage", message);
  }, []);

  // Send an announcement (teachers only)
  const sendAnnouncement = useCallback(async (message) => {
    if (!connectionRef.current || !message.trim()) return;
    await connectionRef.current.invoke("SendAnnouncement", message);
  }, []);

  // P-6: notify server user started typing (debounced stop)
  const notifyTyping = useCallback(async () => {
    if (!connectionRef.current) return;
    await connectionRef.current.invoke("StartTyping");

    // Auto-stop typing after 2s of inactivity
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(async () => {
      if (connectionRef.current) {
        await connectionRef.current.invoke("StopTyping");
      }
    }, 2000);
  }, []);

  // Explicitly stop typing (on send)
  const stopTyping = useCallback(async () => {
    clearTimeout(typingTimerRef.current);
    if (connectionRef.current) {
      await connectionRef.current.invoke("StopTyping");
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimerRef.current);
      connectionRef.current?.stop();
    };
  }, []);

  return {
    connectionState,
    messages,
    onlineUsers,
    typingUsers,
    currentUser,
    connect,
    sendMessage,
    sendAnnouncement,
    notifyTyping,
    stopTyping,
  };
}