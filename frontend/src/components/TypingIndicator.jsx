export default function TypingIndicator({ typingUsers, currentUser }) {
  // Don't show your own typing to yourself
  const others = typingUsers.filter((u) => u !== currentUser?.username);

  if (others.length === 0) return <div className="typing-indicator empty" />;

  let label;
  if (others.length === 1) label = `${others[0]} is typing`;
  else if (others.length === 2) label = `${others[0]} and ${others[1]} are typing`;
  else label = `${others[0]} and ${others.length - 1} others are typing`;

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span /><span /><span />
      </span>
      <span className="typing-label">{label}…</span>
    </div>
  );
}