import { useState } from "react";

export default function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  disabled,
  placeholder,
  isAnnouncementChannel,
  isTeacher,
}) {
  const [text, setText] = useState("");

  const canSend = !disabled && text.trim().length > 0;
  // Students cannot type in announcement channel
  const isLocked = isAnnouncementChannel && !isTeacher;

  const handleChange = (e) => {
    setText(e.target.value);
    if (e.target.value.trim()) {
      onTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  const handleSend = async () => {
    if (!canSend || isLocked) return;
    const msg = text.trim();
    setText("");
    onStopTyping?.();
    await onSend(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-area">
      {isLocked ? (
        <div className="locked-notice">
          🔒 Only teachers can post announcements
        </div>
      ) : (
        <div className="input-row">
          <textarea
            className="msg-input"
            rows={1}
            placeholder={placeholder || "Type a message…"}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={500}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!canSend}>
            ↑
          </button>
        </div>
      )}
    </div>
  );
}