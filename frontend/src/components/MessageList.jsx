import { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUser, activeChannel }) {
  const bottomRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter messages: show system messages in both channels, channel-specific otherwise
  const filtered = messages.filter(
    (m) => m.channel === "system" || m.channel === activeChannel
  );

  return (
    <div className="message-list">
      {filtered.length === 0 && (
        <div className="empty-state">
          <span>No messages yet. Say something!</span>
        </div>
      )}
      {filtered.map((msg) => {
        const isOwn = msg.username === currentUser?.username;
        const isSystem = msg.channel === "system";
        const isAnnouncement = msg.channel === "announcement";

        return (
          <div
            key={msg.id}
            className={[
              "message",
              isOwn ? "own" : "",
              isSystem ? "system" : "",
              isAnnouncement ? "announcement" : "",
            ]
              .filter(Boolean)
              .join(" ")} >
            {!isSystem && (
              <div className="msg-header">
                <span className={`msg-author role-${msg.role}`}>
                  {msg.role === "teacher" ? "🏫 " : ""}
                  {msg.username}
                </span>
                <span className="msg-time">{msg.timestamp}</span>
              </div>
            )}
            <div className="msg-body">
              {isAnnouncement && <span className="announce-badge">📢 Announcement</span>}
              {msg.message}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}