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

            //Give the joining user confirmation that they have joined
            await Clients.Caller.SendAsync("JoinConfirmed", username, role);
        }

        public async Task SendMessage(string message)
        {
            //If the message sent is just blank, do nothing with it
            if(string.IsNullOrWhiteSpace(message)) return;

            //If the user sending a message does not exist in the current session, ignore message
            if(!ConnectedUsers.TryGetValue(Context.ConnectionId, out var user)) return;

            await Clients.All.SendAsync("RecieveMessage", new
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
            if(string.IsNullOrWhiteSpace(message)) return;

            //If the user sending a message does not exist in the current session, ignore message
            if(!ConnectedUsers.TryGetValue(Context.ConnectionId, out var user)) return;

            //Only teachers should be able to write announcements
            if (user.Role != "teacher")
            {
                await Clients.Caller.SendAsync("Error", "Only teacher can post announcements");
                return;
            }

            await Clients.All.SendAsync("RecieveMessage", new
            {
                id = Guid.NewGuid().ToString(),
                username = user.Username,
                role = user.Role,
                message = message.Trim(),
                timestamp = DateTime.UtcNow.ToString("HH:mm"),
                channel = "announcement"
            });
        }
    }
    public class UserInfo
    {
        public string ConnectionId { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = "student";
    }
}