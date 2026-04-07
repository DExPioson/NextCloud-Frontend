import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import {
  MessageSquare, SquarePen, Phone, Video, MonitorUp,
  Search, PanelRight, Paperclip, Smile, SendHorizontal,
  Users, PhoneOff, X, FileText, Image, File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { Conversation, Message } from "@shared/schema";

// ─── Helpers ────────────────────────────────────────────────

function getAvatarColor(name: string): string {
  const colors = [
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
    "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300",
    "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  ];
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatMessageTime(dateStr: string) {
  return format(new Date(dateStr), "h:mm a");
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, d MMM");
}

function formatRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return format(d, "MMM d");
}

const EMOJI_LIST = ["😀","😂","👍","❤️","🎉","🔥","👀","🙏","💯","✅","🚀","😎","🤔","💡","📌","✨","🎯","📊","🏆","👏"];

// ─── Toast system (simple) ──────────────────────────────────

function useToast() {
  const [toast, setToast] = useState<{ message: string; action?: React.ReactNode } | null>(null);
  const show = useCallback((message: string, action?: React.ReactNode) => {
    setToast({ message, action });
    setTimeout(() => setToast(null), 4000);
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  return { toast, show, dismiss };
}

function ToastOverlay({ toast, onDismiss }: { toast: { message: string; action?: React.ReactNode } | null; onDismiss: () => void }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-foreground text-background rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 text-sm max-w-sm">
        <span className="flex-1">{toast.message}</span>
        {toast.action}
        <button onClick={onDismiss} className="hover:opacity-70"><X size={14} /></button>
      </div>
    </div>
  );
}

// ─── Mock members data ──────────────────────────────────────

const MOCK_MEMBERS: Record<string, { name: string; email: string }[]> = {
  "Product Team": [
    { name: "Piyush Sharma", email: "piyush@cloudspace.home" },
    { name: "Rohan Mehra", email: "rohan@cloudspace.home" },
    { name: "Priya Kapoor", email: "priya@cloudspace.home" },
    { name: "Arjun Singh", email: "arjun@cloudspace.home" },
  ],
  "HomeServer Admins": [
    { name: "Piyush Sharma", email: "piyush@cloudspace.home" },
    { name: "Arjun Singh", email: "arjun@cloudspace.home" },
  ],
};

const MOCK_SHARED_FILES = [
  { name: "Q1 Report.pdf", size: "2.5 MB", icon: FileText },
  { name: "Design Mockups.fig", size: "8.5 MB", icon: File },
  { name: "Team Photo.jpg", size: "3.4 MB", icon: Image },
];

// ─── Components ─────────────────────────────────────────────

function Avatar({ name, size = 38, isGroup = false }: { name: string; size?: number; isGroup?: boolean }) {
  const colorClass = getAvatarColor(name);
  return (
    <div
      className={cn("relative shrink-0 rounded-full flex items-center justify-center font-semibold", colorClass)}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {isGroup ? <Users size={size * 0.45} /> : getInitials(name)}
    </div>
  );
}

function OnlineDot({ size = 8, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("rounded-full bg-green-500 border-2 border-background", className)}
      style={{ width: size, height: size }}
    />
  );
}

// ─── Conversation List Item ─────────────────────────────────

function ConversationRow({
  conversation: c,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg mx-1 text-left transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
      )}
    >
      <div className="relative">
        <Avatar name={c.name} size={38} isGroup={c.type === "group"} />
        {c.type === "dm" && (
          <OnlineDot size={8} className="absolute bottom-0 right-0" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{c.name}</span>
          {c.lastMessageAt && (
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {formatRelativeTime(c.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate">
            {c.lastMessage || "No messages yet"}
          </span>
          {(c.unreadCount || 0) > 0 && (
            <span className="bg-primary text-white text-[10px] rounded-full px-1.5 min-w-[18px] text-center shrink-0 ml-2">
              {c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Date Separator ─────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground px-2">{formatDateSeparator(date)}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Message Bubble ─────────────────────────────────────────

function MessageBubble({
  message: m,
  isSent,
  showAvatar,
  showSenderName,
}: {
  message: Message;
  isSent: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
}) {
  const reactions = m.reactions ? JSON.parse(m.reactions) as Record<string, number> : null;

  if (isSent) {
    return (
      <div className={cn("flex items-end gap-2 max-w-[70%] ml-auto flex-row-reverse", !showAvatar && "mt-0.5")}>
        <div>
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm">
            {m.content}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 mr-1 text-right block">
            {formatMessageTime(m.sentAt)} · ✓✓
          </span>
          {reactions && (
            <div className="flex gap-1 mt-1 justify-end">
              {Object.entries(reactions).map(([emoji, count]) => (
                <span key={emoji} className="bg-muted border rounded-full px-2 py-0.5 text-xs cursor-pointer hover:bg-accent">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2 max-w-[70%]", !showAvatar && "mt-0.5 ml-[32px]")}>
      {showAvatar ? (
        <Avatar name={m.senderName} size={24} />
      ) : null}
      <div>
        {showSenderName && (
          <span className="text-[11px] text-muted-foreground mb-1 ml-1 block">{m.senderName}</span>
        )}
        <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm">
          {m.content}
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 ml-1 block">
          {formatMessageTime(m.sentAt)}
        </span>
        {reactions && (
          <div className="flex gap-1 mt-1">
            {Object.entries(reactions).map(([emoji, count]) => (
              <span key={emoji} className="bg-muted border rounded-full px-2 py-0.5 text-xs cursor-pointer hover:bg-accent">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{name} is typing...</span>
    </div>
  );
}

// ─── Info Panel ─────────────────────────────────────────────

function InfoPanel({ conversation }: { conversation: Conversation }) {
  const isDm = conversation.type === "dm";
  const members = MOCK_MEMBERS[conversation.name] || [];

  return (
    <div className="w-[260px] flex-shrink-0 border-l flex flex-col overflow-hidden bg-background">
      <div className="p-4 flex flex-col items-center text-center">
        <Avatar name={conversation.name} size={64} isGroup={!isDm} />
        <p className="font-semibold mt-3">{conversation.name}</p>
        {isDm ? (
          <>
            <p className="text-sm text-muted-foreground">
              {conversation.name.toLowerCase().replace(/\s/g, ".")}@cloudspace.home
            </p>
            <div className="flex items-center gap-1 mt-1">
              <OnlineDot size={6} />
              <span className="text-xs text-green-500">Online</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{members.length} members</p>
        )}
      </div>

      <Separator />

      {isDm ? (
        <>
          <div className="p-3 space-y-1">
            {["View profile", "Mute notifications", "Block user"].map((label) => (
              <Button key={label} variant="ghost" className="w-full justify-start text-sm h-9">
                {label}
              </Button>
            ))}
          </div>
          <Separator />
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">SHARED FILES</p>
            <div className="space-y-2">
              {MOCK_SHARED_FILES.map((f) => (
                <div key={f.name} className="flex items-center gap-2 text-sm">
                  <f.icon size={16} className="text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.size}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-3">
            <Button variant="outline" size="sm" className="w-full">
              Edit group
            </Button>
          </div>
          <Separator />
          <div className="p-3 flex-1 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">MEMBERS</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.name} className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar name={member.name} size={36} />
                    <OnlineDot size={6} className="absolute bottom-0 right-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="p-3 space-y-1">
            <Button variant="ghost" className="w-full justify-start text-sm h-9">
              Mute notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm h-9 text-destructive hover:text-destructive">
              Leave group
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Talk Page ─────────────────────────────────────────

export default function Talk() {
  const queryClient = useQueryClient();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  // State
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [composerContent, setComposerContent] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Queries
  const { data: conversationsData } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      return res.json() as Promise<{ data: Conversation[] }>;
    },
  });

  const conversations = conversationsData?.data || [];
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const { data: messagesData } = useQuery({
    queryKey: ["/api/conversations/messages", activeConversationId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`);
      return res.json() as Promise<{ data: Message[] }>;
    },
    enabled: !!activeConversationId,
  });

  const messagesList = messagesData?.data || [];

  // Set first conversation as active on load
  useEffect(() => {
    if (conversations.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${activeConversationId}/messages`, { content });
      return res.json() as Promise<{ data: Message }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations/messages", activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/conversations/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSelectConversation = useCallback((id: number) => {
    setActiveConversationId(id);
    // Optimistically clear unread count
    queryClient.setQueryData(["/api/conversations"], (old: { data: Conversation[] } | undefined) => {
      if (!old) return old;
      return {
        data: old.data.map((c) => c.id === id ? { ...c, unreadCount: 0 } : c),
      };
    });
    markReadMutation.mutate(id);
  }, [markReadMutation, queryClient]);

  const handleSend = useCallback(() => {
    const content = composerContent.trim();
    if (!content || !activeConversationId) return;

    // Optimistic update — append message locally
    const optimisticMsg: Message = {
      id: Date.now(),
      conversationId: activeConversationId,
      senderId: 1,
      senderName: "Piyush Sharma",
      content,
      sentAt: new Date().toISOString(),
      reactions: null,
      replyToId: null,
    };
    queryClient.setQueryData(
      ["/api/conversations/messages", activeConversationId],
      (old: { data: Message[] } | undefined) => ({
        data: [...(old?.data || []), optimisticMsg],
      })
    );

    setComposerContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMutation.mutate(content);
  }, [composerContent, activeConversationId, sendMutation, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleComposerFocus = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleComposerBlur = () => {
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
  };

  // Group messages by date for rendering
  const groupedMessages = messagesList.reduce<{ date: string; messages: Message[] }[]>((groups, msg) => {
    const dateKey = new Date(msg.sentAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      groups.push({ date: dateKey, messages: [msg] });
    }
    return groups;
  }, []);

  const dmConversations = conversations.filter((c) => c.type === "dm");
  const groupConversations = conversations.filter((c) => c.type === "group");

  return (
    <>
      <ToastOverlay toast={toast} onDismiss={dismissToast} />

      <div className="flex h-[calc(100vh-var(--topbar-height,56px))] overflow-hidden">
        {/* ─── Panel 1: Conversation List ─── */}
        <div className="w-[280px] flex-shrink-0 border-r flex flex-col bg-background">
          {/* Header */}
          <div className="p-3 flex items-center gap-2">
            <Input
              placeholder="Search conversations..."
              className="flex-1 h-9 rounded-lg bg-muted border-0"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setNewChatOpen(true)}>
                  <SquarePen size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New chat</TooltipContent>
            </Tooltip>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="dm" className="flex-1 flex flex-col overflow-hidden px-2">
            <TabsList className="w-full">
              <TabsTrigger value="dm" className="flex-1">Direct Messages</TabsTrigger>
              <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="dm" className="flex-1 overflow-y-auto mt-1">
              <div className="space-y-0.5">
                {dmConversations.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeConversationId}
                    onClick={() => handleSelectConversation(c.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="flex-1 overflow-y-auto mt-1">
              <div className="space-y-0.5">
                {groupConversations.map((c) => (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    isActive={c.id === activeConversationId}
                    onClick={() => handleSelectConversation(c.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Panel 2: Chat Area ─── */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat TopBar */}
            <div className="border-b px-4 h-14 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={activeConversation.name} size={36} isGroup={activeConversation.type === "group"} />
                  {activeConversation.type === "dm" && (
                    <OnlineDot size={8} className="absolute bottom-0 right-0" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{activeConversation.name}</p>
                  {activeConversation.type === "dm" ? (
                    <div className="flex items-center gap-1">
                      <OnlineDot size={6} />
                      <span className="text-xs text-green-500">Online</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {(MOCK_MEMBERS[activeConversation.name] || []).length} members
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[
                  { icon: Phone, label: "Voice call", action: () => showToast("Starting voice call...", <Button size="icon" variant="destructive" className="h-6 w-6" onClick={dismissToast}><PhoneOff size={12} /></Button>) },
                  { icon: Video, label: "Video call", action: () => showToast("Starting video call...", <Button size="icon" variant="destructive" className="h-6 w-6" onClick={dismissToast}><PhoneOff size={12} /></Button>) },
                  { icon: MonitorUp, label: "Screen share", action: () => showToast("Starting screen share...") },
                  { icon: Search, label: "Search in chat", action: () => setShowSearch((s) => !s) },
                  { icon: PanelRight, label: "Info", action: () => setShowInfoPanel((s) => !s) },
                ].map(({ icon: Icon, label, action }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={action}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Icon size={18} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Search Bar (collapsible) */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                showSearch ? "max-h-14" : "max-h-0"
              )}
            >
              <div className="px-4 py-2 border-b bg-muted/30">
                <Input placeholder="Search in conversation..." className="h-8 text-sm" />
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {groupedMessages.map((group, gi) => (
                <div key={group.date}>
                  <DateSeparator date={group.messages[0].sentAt} />
                  {group.messages.map((msg, mi) => {
                    const isSent = msg.senderId === 1;
                    const prevMsg = mi > 0 ? group.messages[mi - 1] : gi > 0 ? groupedMessages[gi - 1].messages.at(-1) : undefined;
                    const isConsecutive = prevMsg
                      && prevMsg.senderId === msg.senderId
                      && (new Date(msg.sentAt).getTime() - new Date(prevMsg.sentAt).getTime()) < 120000;

                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSent={isSent}
                        showAvatar={!isSent && !isConsecutive}
                        showSenderName={!isSent && !isConsecutive}
                      />
                    );
                  })}
                </div>
              ))}

              {isTyping && activeConversation && (
                <TypingIndicator name={activeConversation.name} />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <div className="border-t bg-background px-3 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => showToast("File sharing coming soon")}
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5"
                    >
                      <Paperclip size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>

                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5">
                      <Smile size={18} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-3" align="start">
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg"
                          onClick={() => {
                            setComposerContent((prev) => prev + emoji);
                            setEmojiOpen(false);
                            textareaRef.current?.focus();
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <textarea
                  ref={textareaRef}
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  onInput={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  onFocus={handleComposerFocus}
                  onBlur={handleComposerBlur}
                  placeholder={`Message ${activeConversation.name}...`}
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[36px] max-h-[120px]"
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-9 w-9 rounded-lg shrink-0 mb-0.5"
                      disabled={!composerContent.trim()}
                      onClick={handleSend}
                    >
                      <SendHorizontal size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-3">
              <MessageSquare size={48} className="text-muted-foreground/30 mx-auto" />
              <p className="font-medium text-muted-foreground">Select a conversation</p>
              <p className="text-sm text-muted-foreground/70">Choose from your direct messages or groups</p>
            </div>
          </div>
        )}

        {/* ─── Panel 3: Info Panel ─── */}
        {showInfoPanel && activeConversation && (
          <InfoPanel conversation={activeConversation} />
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
          </DialogHeader>
          <Input placeholder="Search people..." className="mb-3" />
          <div className="space-y-1">
            {["Rohan Mehra", "Priya Kapoor", "Arjun Singh"].map((name) => (
              <button
                key={name}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  showToast("Conversation feature coming soon");
                  setNewChatOpen(false);
                }}
              >
                <Avatar name={name} size={36} />
                <span className="text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
          <Button className="w-full mt-2" onClick={() => {
            showToast("Conversation feature coming soon");
            setNewChatOpen(false);
          }}>
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
