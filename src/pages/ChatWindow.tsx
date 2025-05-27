import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ChatWindow() {
  type Message = {
    id?: number;
    conversationId: number;
    senderId: number;
    content: string;
    timestamp: string;
  };

  type Conversation = {
    id: number;
    user1Id: number;
    user2Id: number;
  };

  type User = {
    id: number;
    nome: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [viewingConversation, setViewingConversation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(Number(storedId));
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('http://localhost:3003/User');
      const parsedUsers = res.data.map((user: any) => ({
        ...user,
        id: Number(user.id),
      }));
      setUsers(parsedUsers);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get('http://localhost:3003/Conversation');
      const userConversation = res.data.filter(
        (conv: { user1Id: number; user2Id: number; }) => conv.user1Id === userId || conv.user2Id === userId
      );
      setConversation(userConversation);
    };
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      const res = await axios.get('http://localhost:3003/Messages', {
        params: { conversationId: selectedConversation.id }
      });
      setMessages(res.data);
    };
    fetchMessages();
  }, [selectedConversation]);

  if (userId === null) {
    return <div>Carregando...</div>;
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      conversationId: selectedConversation!.id,
      senderId: userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    await axios.post('http://localhost:3003/Messages', message);
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getUserNameById = (id: number): string => {
    const user = users.find(u => u.id === id);
    return user ? user.nome : `Usuário #${id}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full bg-gray-100 p-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Big Chat Brasil</h1>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className={`w-full md:w-1/4 bg-gray-100 p-4 overflow-y-auto ${viewingConversation ? 'hidden' : 'block md:block'}`}>
          <h2 className="text-xl font-bold mb-4">Conversas</h2>
          {conversation.map(conv => {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            return (
              <div
                key={conv.id}
                className={`p-2 rounded cursor-pointer mb-2 ${selectedConversation?.id === conv.id ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                onClick={() => {
                  setSelectedConversation(conv);
                  if (window.innerWidth < 768) {
                    setViewingConversation(true);
                  }
                }}
              >
                {getUserNameById(otherUserId)}
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex flex-col p-4">
          {viewingConversation && (
            <div className="md:hidden mb-4">
              <button
                onClick={() => {
                  setViewingConversation(false);
                  setSelectedConversation(null);
                }}
                className="text-blue-500 underline"
              >
                ← Voltar para conversas
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto border p-4 rounded bg-white">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {selectedConversation && (
            <div className="mt-4 flex">
              <input
                type="text"
                className="flex-1 border rounded px-4 py-2 mr-2"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                ENVIAR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
