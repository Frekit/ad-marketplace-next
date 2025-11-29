"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Paperclip, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const MOCK_CONVERSATIONS = [
    { id: "1", user: "Alex Marketing", userId: "user-1", lastMessage: "Sure, I can do that.", unread: 2, lastTime: "10:30 AM" },
    { id: "2", user: "Sarah PPC", userId: "user-2", lastMessage: "When is the deadline?", unread: 0, lastTime: "Yesterday" },
];

const MOCK_MESSAGES: Record<string, { id: string, sender: string, text: string, timestamp: string, file?: { name: string, url: string } }[]> = {
    "1": [
        { id: "m1", sender: "them", text: "Hi! I saw your gig about Facebook Ads.", timestamp: "10:15 AM" },
        { id: "m2", sender: "me", text: "Hello! Yes, how can I help you?", timestamp: "10:18 AM" },
        { id: "m3", sender: "them", text: "I need a campaign for my new product.", timestamp: "10:25 AM" },
        { id: "m4", sender: "me", text: "Sure, I can do that. What is your budget?", timestamp: "10:30 AM" },
    ],
    "2": [
        { id: "m5", sender: "them", text: "When is the deadline?", timestamp: "Yesterday" },
    ]
};

export function ChatInterface() {
    const [activeId, setActiveId] = useState("1");
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [input, setInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === activeId);

    const handleSend = () => {
        if (!input.trim()) return;
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const newMsg = { id: Date.now().toString(), sender: "me", text: input, timestamp };
        setMessages(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), newMsg]
        }));
        setInput("");
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const now = new Date();
            const timestamp = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const newMsg = {
                id: Date.now().toString(),
                sender: "me",
                text: `Sent a file: ${file.name}`,
                timestamp,
                file: { name: file.name, url: "#" }
            };
            setMessages(prev => ({
                ...prev,
                [activeId]: [...(prev[activeId] || []), newMsg]
            }));
        }
    };

    return (
        <div className="flex h-[600px] border rounded-xl overflow-hidden bg-background shadow-sm">
            {/* Sidebar */}
            <div className="w-1/3 border-r bg-muted/30 flex flex-col">
                <div className="p-4 border-b font-semibold">Conversations</div>
                <div className="overflow-y-auto flex-1">
                    {MOCK_CONVERSATIONS.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveId(conv.id)}
                            className={cn(
                                "p-4 cursor-pointer hover:bg-muted transition-colors flex items-center gap-3 border-b border-border/50 last:border-0",
                                activeId === conv.id ? "bg-muted" : ""
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium truncate">{conv.user}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{conv.lastTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                    {conv.unread > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-2">{conv.unread}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
                <div className="p-4 border-b flex items-center justify-between shadow-sm z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <Link href={`/freelancers/${activeConversation?.userId}`} className="font-semibold hover:underline">
                                {activeConversation?.user}
                            </Link>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                    {messages[activeId]?.map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.sender === "me" ? "items-end" : "items-start")}>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                                msg.sender === "me"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-white dark:bg-muted text-foreground rounded-bl-none border"
                            )}>
                                {msg.file ? (
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        <span className="text-sm underline">{msg.file.name}</span>
                                    </div>
                                ) : (
                                    <p className="text-sm">{msg.text}</p>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 px-2">{msg.timestamp}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-background">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleFileClick}
                            type="button"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
