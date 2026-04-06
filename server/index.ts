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

app.get("/api/user", (_req, res) => {
  const user = storage.getUser(1);
  res.json(user);
});

// Files
app.get("/api/files", (req, res) => {
  const parentPath = (req.query.path as string) || "/";
  res.json(storage.getFiles(parentPath));
});

// Conversations
app.get("/api/conversations", (_req, res) => res.json(storage.getConversations()));
app.get("/api/conversations/:id/messages", (req, res) => {
  res.json(storage.getMessages(Number(req.params.id)));
});

// Events
app.get("/api/events", (_req, res) => res.json(storage.getEvents()));

// Notes
app.get("/api/notes", (_req, res) => res.json(storage.getNotes()));

// Contacts
app.get("/api/contacts", (_req, res) => res.json(storage.getContacts()));

// Boards
app.get("/api/boards", (_req, res) => res.json(storage.getBoards()));
app.get("/api/boards/:id/stacks", (req, res) => {
  res.json(storage.getStacks(Number(req.params.id)));
});
app.get("/api/boards/:id/cards", (req, res) => {
  res.json(storage.getCards(Number(req.params.id)));
});

// Emails
app.get("/api/emails", (req, res) => {
  const folder = (req.query.folder as string) || "inbox";
  res.json(storage.getEmails(folder));
});

// Activities
app.get("/api/activities", (_req, res) => res.json(storage.getActivities()));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CloudSpace API server running on http://localhost:${PORT}`);
});
