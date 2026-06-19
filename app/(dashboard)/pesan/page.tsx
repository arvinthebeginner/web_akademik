'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiSend, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface MessageThread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
}

interface Message {
  id: string;
  senderId: 'me' | 'other';
  text: string;
  timestamp: string;
}

export default function MessagePage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load chat threads (users)
  const loadThreads = async (selectFirst = false) => {
    try {
      if (selectFirst) setLoadingThreads(true);
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.data);
        if (selectFirst && data.data.length > 0) {
          setSelectedThread(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load messaging threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Load message history with selected user
  const loadMessages = async (recipientId: string) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`/api/messages?recipientId=${recipientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadThreads(true);
  }, []);

  // Poll for messages/threads updates every 5 seconds (micro-realtime polling)
  useEffect(() => {
    const interval = setInterval(() => {
      loadThreads(false);
      if (selectedThread) {
        // Fetch new messages silently without loading spinners
        fetch(`/api/messages?recipientId=${selectedThread}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setMessages(data.data);
          })
          .catch(console.error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedThread]);

  // Load messages when selectedThread changes
  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
      // Mark read locally by updating threads
      setThreads((prev) =>
        prev.map((t) => (t.id === selectedThread ? { ...t, unread: 0 } : t))
      );
    } else {
      setMessages([]);
    }
  }, [selectedThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const payload = {
        recipientId: selectedThread,
        message: newMessage,
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        // Add new message to chat immediately
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
        // Reload threads list to update latest messages
        loadThreads(false);
      } else {
        toast.error('Gagal mengirim pesan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(error);
    }
  };

  const filteredThreads = threads.filter((thread) =>
    thread.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentThread = threads.find((t) => t.id === selectedThread);

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl shadow border border-gray-100 flex overflow-hidden text-gray-700">
      {/* Thread List */}
      <div className="w-full md:w-80 border-r flex flex-col h-full bg-gray-50/50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Pesan Kontak</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
            <FiSearch className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari kontak..."
              className="flex-1 bg-transparent outline-none text-xs text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loadingThreads ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Tidak ada kontak ditemukan</div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                  selectedThread === thread.id
                    ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 w-4/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">{thread.name}</h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{thread.lastMessage}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-400">{thread.timestamp}</span>
                  {thread.unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {currentThread ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                {currentThread.avatar}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{currentThread.name}</h3>
                <span className="text-[10px] text-green-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Terhubung
                </span>
              </div>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-sm text-gray-400">
                  <p>Mulai percakapan dengan {currentThread.name}</p>
                  <p className="text-xs mt-1">Kirim pesan pertama Anda di bawah.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                        msg.senderId === 'me'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`block text-[9px] text-right mt-1 font-semibold ${
                          msg.senderId === 'me' ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <div className="bg-white border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Tulis pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
                />
                <Button type="submit" variant="primary" size="md" className="rounded-xl px-5">
                  <FiSend size={16} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <svg
              className="w-16 h-16 text-gray-200 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="font-bold text-gray-700 mb-1">Mulai Obrolan</h3>
            <p className="text-xs">Pilih salah satu kontak di panel kiri untuk memulai obrolan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
