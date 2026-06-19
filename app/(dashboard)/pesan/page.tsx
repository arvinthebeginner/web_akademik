'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

  const loadThreads = useCallback(async (selectFirst = false) => {
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
  }, []);

  const loadMessages = useCallback(async (recipientId: string) => {
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThreads(true);
  }, [loadThreads]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadThreads(false);
      if (selectedThread) {
        fetch(`/api/messages?recipientId=${selectedThread}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setMessages(data.data);
          })
          .catch(console.error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedThread, loadThreads]);

  useEffect(() => {
    if (selectedThread) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMessages(selectedThread);
      setThreads((prev) =>
        prev.map((t) => (t.id === selectedThread ? { ...t, unread: 0 } : t))
      );
    } else {
      setMessages([]);
    }
  }, [selectedThread, loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    try {
      const payload = { recipientId: selectedThread, message: newMessage };
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
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
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Pesan</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kirim dan terima pesan dengan guru, siswa, dan staf.</p>
        </div>
      </div>

      {/* Messaging Container */}
      <div className="h-[calc(100vh-180px)] bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm flex overflow-hidden">
        {/* Thread List */}
        <div className="w-full md:w-80 border-r border-surface-border flex flex-col h-full bg-surface-container-lowest">
          {/* Search Header */}
          <div className="p-4 border-b border-surface-border bg-surface-background">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] leading-[20px] font-semibold text-on-background">Kontak Pesan</h2>
              <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">{filteredThreads.length} kontak</span>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Cari kontak..."
                className="w-full bg-surface-container-lowest border border-surface-border rounded-lg py-2 pl-9 pr-3 text-[12px] leading-[18px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
            {loadingThreads ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-surface-border border-t-secondary"></div>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] block mb-2">person_search</span>
                Tidak ada kontak ditemukan
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`p-4 cursor-pointer transition-all flex items-center justify-between border-l-4 ${
                    selectedThread === thread.id
                      ? 'bg-primary-container/30 border-l-primary'
                      : 'border-l-transparent hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-3 w-4/5">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-[11px] shrink-0">
                      {thread.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] leading-[16px] font-semibold text-on-background truncate">{thread.name}</h4>
                      <p className="text-[11px] leading-[14px] text-on-surface-variant truncate mt-0.5">{thread.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-on-surface-variant">{thread.timestamp}</span>
                    {thread.unread > 0 && (
                      <span className="bg-danger text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
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
        <div className="flex-1 flex flex-col h-full bg-surface-background">
          {currentThread ? (
            <>
              {/* Chat Header */}
              <div className="bg-surface-container-lowest border-b border-surface-border p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-[11px] shrink-0">
                    {currentThread.avatar}
                  </div>
                  <div>
                    <h3 className="text-[14px] leading-[20px] font-semibold text-on-background">{currentThread.name}</h3>
                    <span className="text-[11px] text-success flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
                <button className="p-2 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-surface-border border-t-secondary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-on-surface-variant text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    </div>
                    <p className="text-[14px] text-on-surface-variant font-medium">Mulai percakapan dengan {currentThread.name}</p>
                    <p className="text-[12px] text-on-surface-variant mt-1">Kirim pesan pertama Anda di bawah.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-xl text-[14px] leading-[20px] ${
                          msg.senderId === 'me'
                            ? 'bg-primary text-on-primary rounded-tr-none'
                            : 'bg-surface-container-lowest text-on-surface border border-surface-border rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`block text-[10px] text-right mt-1 font-semibold ${
                          msg.senderId === 'me' ? 'text-on-primary/60' : 'text-on-surface-variant'
                        }`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <div className="bg-surface-container-lowest border-t border-surface-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tulis pesan..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-surface-border rounded-lg text-[14px] leading-[20px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-container-lowest text-on-surface transition-all"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
              </div>
              <h3 className="text-[16px] font-semibold text-on-background mb-1">Mulai Obrolan</h3>
              <p className="text-[12px] text-on-surface-variant max-w-[260px]">Pilih salah satu kontak di panel kiri untuk memulai obrolan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
