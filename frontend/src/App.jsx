import { useState } from 'react'
import { useChat } from './useChat'
import JoinScreen from "./components/JoinScreen"
import MessageList from "./components/MessageList"
import MessageInput from "./components/MessageInput"
import OnlineUsers from "./components/OnlineUsers"
import TypingIndicator from "./components/TypingIndicator"
import './App.css'

function App() {
  const {
    connectionState,
    messages,
    onlineUsers,
    typingUsers,
    currentUser,
    connect,
    sendMessage,
    sendAnnouncement,
    notifyTyping,
    stopTyping
  } = useChat();

  const [activeChannel, setActiveChannel] = useState("general");

  const isConnected = connectionState === "Connected";
  const isTeacher = currentUser?.role === "teacher";

  //If there is no user, show the join screen
  if (!currentUser)
  {
    return <JoinScreen onJoin={connect} />
  }

  const handleSend = async (msg) => {
    if (activeChannel === "announcement") {
      await sendAnnouncement(msg);
    } else {
      await sendMessage(msg);
    }
  };

  return (
    <div className="app-layout">
      {/*Sidebar*/}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">◈</span>
          <span className="logo-text">CourseChat</span>
        </div>

        <nav className="channel-nav">
          <span className="nav-label">Channels</span>
          <button className={'channel-btn ${activeChannel === "general" ? "active" : ""}'}
            onClick={() => setActiveChannel("general")}>
            # general
          </button>
          <button className={'channel-btn ${activeChannel === "announcement" ? "active" : ""}'}
            onClick={() => setActiveChannel("announcement")}>
            # announcements
            {!isTeacher && <span className="read-only-tag">read-only</span>}
          </button>
        </nav>

        {/* Online Users (P-3) */}
        <OnlineUsers users={onlineUsers} currentUser={currentUser} />

        {/* Connection status */}
        <div className={'conn-status ${connectionState.toLowerCase()}'}>
          <span className="conn-dot"/>
          {connectionState}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <span className="channel-title">
            {activeChannel === "general" ? "# general" : "# announcements"}
          </span>
          <span className="user-badge">
            {isTeacher ? "🏫" : "🎓"} {currentUser.username}
          </span>
        </header>

        <MessageList
          messages = {messages}
          currentUser = {currentUser}
          activeChannel = {activeChannel}
        />

        {/* Typing Indicator (P-6) */}
        <TypingIndicator typingUsers={typingUsers} currentUser={currentUser} />

        <MessageInput
          onSend = {handleSend}
          onTyping = {notifyTyping}
          onStopTyping = {stopTyping}
          disabled = {!isConnected}
          placeholder = {
            activeChannel === "announcement" ? "Post an announcement..." : "Type a message... (Enter to send)"
          }
          isAnnouncementChannel = {activeChannel === "annoucement"}
          isTeacher = {isTeacher}
        />
      </main>
    </div>
  );
}

export default App
