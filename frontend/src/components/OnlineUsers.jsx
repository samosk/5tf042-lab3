export default function OnlineUsers({ users, currentUser }) {
  const teachers = users.filter((u) => u.role === "teacher");
  const students = users.filter((u) => u.role === "student");

  const renderUser = (u) => (
    <div key={u.username} className={`online-user ${u.username === currentUser?.username ? "self" : ""}`}>
      <span className="presence-dot" />
      <span className="user-name">
        {u.role === "teacher" ? "🏫 " : "🎓 "}
        {u.username}
        {u.username === currentUser?.username && " (you)"}
      </span>
    </div>
  );

  return (
    <div className="online-panel">
      <h3 className="panel-title">Online — {users.length}</h3>

      {teachers.length > 0 && (
        <div className="user-group">
          <span className="group-label">Teachers</span>
          {teachers.map(renderUser)}
        </div>
      )}

      {students.length > 0 && (
        <div className="user-group">
          <span className="group-label">Students</span>
          {students.map(renderUser)}
        </div>
      )}

      {users.length === 0 && (
        <p className="no-users">No one online yet.</p>
      )}
    </div>
  );
}