import express from "express";
import { storage } from "./storage";

const app = express();
app.use(express.json());

// Auth
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "piyush@cloudspace.home" && password === "cloudspace") {
    const user = storage.getUserByEmail(email);
    res.json({ ok: true, user });
  } else {
    res.status(401).json({ ok: false, message: "Invalid credentials" });
  }
});

// User
app.get("/api/user", (_req, res) => {
  const user = storage.getUser(1);
  res.json({ data: user });
});

// Dashboard aggregate
app.get("/api/dashboard", (_req, res) => {
  const user = storage.getUser(1);
  const allFiles = storage.getAllFiles();
  const recentFiles = allFiles
    .filter((f) => f.type === "file")
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, 5);

  const now = new Date().toISOString();
  const allEvents = storage.getEvents();
  const upcomingEvents = allEvents
    .filter((e) => e.startAt >= now || e.allDay)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3);

  const convos = storage.getConversations();
  const unreadMessages = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const recentConvos = convos
    .filter((c) => c.lastMessageAt)
    .sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""))
    .slice(0, 2);
  const recentMessages = recentConvos.map((c) => {
    const msgs = storage.getMessages(c.id);
    const lastMsg = msgs[msgs.length - 1];
    return { conversation: c, message: lastMsg };
  });

  const recentActivity = storage.getActivities().slice(0, 4);

  res.json({
    data: {
      recentFiles,
      upcomingEvents,
      unreadMessages,
      recentMessages,
      storageUsed: user?.storageUsed || 0,
      storageQuota: user?.storageQuota || 53687091200,
      recentActivity,
    },
  });
});

// Files
app.get("/api/files", (req, res) => {
  const parentPath = (req.query.path as string) || "/";
  res.json({ data: storage.getFiles(parentPath) });
});

app.get("/api/files/:id", (req, res) => {
  const file = storage.getFile(Number(req.params.id));
  if (!file) return res.status(404).json({ error: "Not found" });
  res.json({ data: file });
});

app.post("/api/files", (req, res) => {
  const file = storage.createFile(req.body);
  res.json({ data: file });
});

app.patch("/api/files/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = storage.getFile(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const updated = storage.updateFile(id, req.body);
  res.json({ data: updated });
});

app.delete("/api/files/:id", (req, res) => {
  storage.deleteFile(Number(req.params.id));
  res.json({ data: { success: true } });
});

// Conversations
app.get("/api/conversations", (_req, res) => {
  const convos = storage.getConversations();
  convos.sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
  res.json({ data: convos });
});
app.get("/api/conversations/:id", (req, res) => {
  const conv = storage.getConversation(Number(req.params.id));
  if (!conv) return res.status(404).json({ error: "Not found" });
  res.json({ data: conv });
});
app.post("/api/conversations", (req, res) => {
  const conv = storage.createConversation(req.body);
  res.json({ data: conv });
});
app.patch("/api/conversations/:id/read", (req, res) => {
  storage.updateConversation(Number(req.params.id), { unreadCount: 0 });
  res.json({ data: { success: true } });
});

// Messages
app.get("/api/conversations/:id/messages", (req, res) => {
  const msgs = storage.getMessages(Number(req.params.id));
  msgs.sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  res.json({ data: msgs });
});
app.post("/api/conversations/:id/messages", (req, res) => {
  const conversationId = Number(req.params.id);
  const { content } = req.body;
  const sentAt = new Date().toISOString();
  const msg = storage.createMessage({
    conversationId,
    senderId: 1,
    senderName: "Piyush Sharma",
    content,
    sentAt,
  });
  storage.updateConversation(conversationId, {
    lastMessage: content,
    lastMessageAt: sentAt,
  });
  res.json({ data: msg });
});

// Events
app.get("/api/events", (_req, res) => res.json({ data: storage.getEvents() }));
app.get("/api/events/:id", (req, res) => {
  const event = storage.getEvent(Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json({ data: event });
});
app.post("/api/events", (req, res) => {
  const event = storage.createEvent(req.body);
  res.json({ data: event });
});
app.patch("/api/events/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = storage.getEvent(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const updated = storage.updateEvent(id, req.body);
  res.json({ data: updated });
});
app.delete("/api/events/:id", (req, res) => {
  storage.deleteEvent(Number(req.params.id));
  res.json({ data: { success: true } });
});

// Notes
app.get("/api/notes", (_req, res) => {
  const allNotes = storage.getNotes();
  allNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ data: allNotes });
});
app.get("/api/notes/:id", (req, res) => {
  const note = storage.getNote(Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json({ data: note });
});
app.post("/api/notes", (req, res) => {
  const note = storage.createNote(req.body);
  res.json({ data: note });
});
app.patch("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = storage.getNote(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const updated = storage.updateNote(id, { ...req.body, updatedAt: new Date().toISOString() });
  res.json({ data: updated });
});
app.delete("/api/notes/:id", (req, res) => {
  storage.deleteNote(Number(req.params.id));
  res.json({ data: { success: true } });
});

// Contacts
app.get("/api/contacts", (_req, res) => res.json({ data: storage.getContacts() }));

// Boards
app.get("/api/boards", (_req, res) => res.json({ data: storage.getBoards() }));
app.get("/api/boards/:id/stacks", (req, res) => {
  res.json({ data: storage.getStacks(Number(req.params.id)) });
});
app.get("/api/boards/:id/cards", (req, res) => {
  res.json({ data: storage.getCards(Number(req.params.id)) });
});

// Emails
app.get("/api/emails", (req, res) => {
  const folder = (req.query.folder as string) || "inbox";
  res.json({ data: storage.getEmails(folder) });
});

// Activities
app.get("/api/activity", (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const all = storage.getActivities();
  res.json({ data: all.slice(0, limit) });
});
app.get("/api/activities", (_req, res) => res.json({ data: storage.getActivities() }));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CloudSpace API server running on http://localhost:${PORT}`);
});
