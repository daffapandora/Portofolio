"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Mail,
    Loader2,
    Trash2,
    Circle,
    Calendar,
    User,
} from "lucide-react";
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
} from "firebase/firestore";
import { db, COLLECTIONS, Message } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch messages
    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        try {
            const messagesRef = collection(db, COLLECTIONS.MESSAGES);
            const q = query(messagesRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            const messagesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];

            setMessages(messagesData);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    }

    // Mark as read
    async function markAsRead(id: string) {
        try {
            await updateDoc(doc(db, COLLECTIONS.MESSAGES, id), { read: true });
            setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    }

    // Delete message
    async function handleDelete(id: string) {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, COLLECTIONS.MESSAGES, id));
            setMessages(messages.filter(m => m.id !== id));
            setSelectedMessage(null);
            toast.success("Message deleted");
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        } finally {
            setDeleting(false);
        }
    }

    // Format date
    function formatDate(date: Date | { toDate: () => Date }) {
        const d = 'toDate' in date ? date.toDate() : new Date(date);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    const unreadCount = messages.filter(m => !m.read).length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-[var(--background-secondary)] rounded w-48 animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-background border border-[var(--border)] rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    Messages
                    {unreadCount > 0 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/20 text-blue-500 rounded-full">
                            {unreadCount} unread
                        </span>
                    )}
                </h1>
                <p className="text-[var(--text-muted)] mt-1">
                    Messages from your contact form
                </p>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
                <div className="bg-background border border-[var(--border)] rounded-xl p-12 text-center">
                    <Mail className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
                    <p className="text-[var(--text-muted)]">
                        When visitors send you a message, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Messages List */}
                    <div className="space-y-3">
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => {
                                    setSelectedMessage(message);
                                    if (!message.read) {
                                        markAsRead(message.id!);
                                    }
                                }}
                                className={`bg-background border rounded-xl p-4 cursor-pointer transition-all hover:border-foreground/30 ${selectedMessage?.id === message.id
                                    ? "border-foreground/50"
                                    : "border-[var(--border)]"
                                    } ${!message.read ? "bg-blue-500/5" : ""}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        {message.read ? (
                                            <Circle className="w-3 h-3 text-[var(--text-muted)]" />
                                        ) : (
                                            <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-medium text-foreground truncate">
                                                {message.name}
                                            </span>
                                            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                                                {formatDate(message.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground/80 truncate mb-1">
                                            {message.subject}
                                        </p>
                                        <p className="text-sm text-[var(--text-muted)] line-clamp-1">
                                            {message.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:sticky lg:top-6 h-fit">
                        {selectedMessage ? (
                            <div className="bg-background border border-[var(--border)] rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {selectedMessage.subject}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-muted)]">
                                            <User className="w-3.5 h-3.5" />
                                            {selectedMessage.name}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(selectedMessage.id!)}
                                        disabled={deleting}
                                        className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {deleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="space-y-3 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <Mail className="w-3.5 h-3.5" />
                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(selectedMessage.createdAt)}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--border)]">
                                    <p className="text-foreground whitespace-pre-line">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-background border border-[var(--border)] rounded-xl p-12 text-center">
                                <Mail className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
                                <p className="text-[var(--text-muted)]">
                                    Select a message to view details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
