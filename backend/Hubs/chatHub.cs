using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, UserInfo> ConnectedUsers = new();
        private static readonly ConcurrentDictionary<string, bool> TypingUsers = new();

        public async Task JoinChat(string username, string role)
        {
            var user = new UserInfo
            {
                ConnectionId = Context.ConnectionId,
                Username = username,
                Role = role // "student" or "teacher"
            };

            ConnectedUsers[Context.ConnectionId] = user;
            //Notify everyone that this user joined the chat
            await Clients.All.SendAsync("UserJoined", username, role);

            await BroadcastUserList();

            //Give the joining user confirmation that they have joined
            await Clients.Caller.SendAsync("JoinConfirmed", username, role);
        }

        public async Task SendMessage(string message)
        {
            //If the message sent is just blank, do nothing with it
            if (string.IsNullOrWhiteSpace(message)) return;

            //If the user sending a message does not exist in the current session, ignore message
            if (!ConnectedUsers.TryGetValue(Context.ConnectionId, out var user)) return;

            //Clear typing indicator when message is sent
            await StopTyping();

            await Clients.All.SendAsync("ReceiveMessage", new
            {
                id = Guid.NewGuid().ToString(),
                username = user.Username,
                role = user.Role,
                message = message.Trim(),
                timestamp = DateTime.UtcNow.ToString("HH:mm"),
                channel = "general"
            });
        }

        public async Task SendAnnouncement(string message)
        {
            //If the message sent is just blank, do nothing with it
            if (string.IsNullOrWhiteSpace(message)) return;

            //If the user sending a message does not exist in the current session, ignore message
            if (!ConnectedUsers.TryGetValue(Context.ConnectionId, out var user)) return;

            //Only teachers should be able to write announcements
            if (user.Role != "teacher")
            {
                await Clients.Caller.SendAsync("Error", "Only teacher can post announcements");
                return;
            }

            await Clients.All.SendAsync("ReceiveMessage", new
            {
                id = Guid.NewGuid().ToString(),
                username = user.Username,
                role = user.Role,
                message = message.Trim(),
                timestamp = DateTime.UtcNow.ToString("HH:mm"),
                channel = "announcement"
            });
        }

        public async Task StartTyping()
        {
            if (!ConnectedUsers.TryGetValue(Context.ConnectionId, out var user)) return;

            TypingUsers[Context.ConnectionId] = true;
            await BroadcastTypingUsers();
        }

        public async Task StopTyping()
        {
            TypingUsers.TryRemove(Context.ConnectionId, out _);
            await BroadcastTypingUsers();
        }

        private async Task BroadcastTypingUsers()
        {
            var typingUsernames = TypingUsers.Keys
                .Where(cid => ConnectedUsers.ContainsKey(cid))
                .Select(cid => ConnectedUsers[cid].Username)
                .ToList();

            await Clients.All.SendAsync("TypingUsersUpdated", typingUsernames);
        }

        private async Task BroadcastUserList()
        {
            var users = ConnectedUsers.Values
                .Select(u => new { u.Username, u.Role })
                .ToList();
            
            await Clients.All.SendAsync("UserListUpdated", users);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            TypingUsers.TryRemove(Context.ConnectionId, out _);

            if (ConnectedUsers.TryRemove(Context.ConnectionId, out var user))
            {
                await Clients.All.SendAsync("UserLeft", user.Username);
                await BroadcastTypingUsers();
                await BroadcastUserList();
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
    public class UserInfo
    {
        public string ConnectionId { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "student";
    }
}