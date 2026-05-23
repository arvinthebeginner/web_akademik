'use client';

import { Button, Input } from '@/components';
import React, { useState } from 'react';
import { FiSend, FiSearch } from 'react-icons/fi';

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
  senderId: string;
  text: string;
  timestamp: string;
}

const mockThreads: MessageThread[] = [
  {
    id: '1',
    name: 'Drs. Sugiyono',
    lastMessage: 'Tugas matematika sudah diterima',
    timestamp: '2 jam yang lalu',
    unread: 2,
    avatar: 'DS',
  },
  {
    id: '2',
    name: 'Ibu Siti Nurhaliza',
    lastMessage: 'Nilai UAS sudah diinput',
    timestamp: '5 jam yang lalu',
    unread: 0,
    avatar: 'SN',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    lastMessage: 'Apakah PR untuk besok sama?',
    timestamp: 'Kemarin',
    unread: 1,
    avatar: 'BS',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'other',
    text: 'Halo, bagaimana tugas matematika Anda?',
    timestamp: '10:30',
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Sudah selesai Pak, tinggal menunggu deadline',
    timestamp: '10:35',
  },
  {
    id: '3',
    senderId: 'other',
    text: 'Tugas matematika sudah diterima',
    timestamp: '10:40',
  },
];

export default function MessagePage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(
    mockThreads[0]?.id || null
  );
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredThreads = mockThreads.filter((thread) =>
    thread.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentThread = mockThreads.find((t) => t.id === selectedThread);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const now = new Date();
      const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          senderId: 'me',
          text: newMessage,
          timestamp,
        },
      ]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Thread List */}
      <div className="w-full md:w-96 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pesan</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari pesan..."
              className="flex-1 bg-transparent outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`p-4 border-b cursor-pointer transition-colors ${
                selectedThread === thread.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {thread.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{thread.name}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {thread.lastMessage}
                  </p>
                </div>
                {thread.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {thread.unread}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">{thread.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 hidden md:flex flex-col">
        {currentThread ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentThread.name}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === 'me'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === 'me'
                          ? 'text-blue-100'
                          : 'text-gray-600'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-6"
                >
                  <FiSend className="inline" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Pilih pesan untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  );
}
