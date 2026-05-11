import { useState } from 'react'
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

  return (
    <div className="app-layout">
      /*Sidebar*/
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
          </button>
        </nav>
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
  )
}

export default App
