import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/authContextValue';
import Button from '../../components/ui/Button';
import { FiSend, FiMessageSquare, FiUser, FiArrowLeft } from 'react-icons/fi';

const Messages = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [suggestedArtisans, setSuggestedArtisans] = useState([]);
  const messagesEndRef = useRef(null);

  // Load suggested artisans for demo chat links
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'artisan'));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setSuggestedArtisans(list.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggested();
  }, []);

  // Sync scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats using onSnapshot
  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'chats'), 
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatList = [];
      for (const d of querySnapshot.docs) {
        const data = d.data();
        // Identify recipient
        const recipientId = data.participants.find(p => p !== currentUser.uid);
        
        // Fetch recipient name
        let recipientName = 'Artisan Professional';
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', recipientId)));
          if (!userDoc.empty) {
            recipientName = userDoc.docs[0].data().name;
          }
        } catch (e) {
          console.error(e);
        }

        chatList.push({
          id: d.id,
          recipientId,
          recipientName,
          ...data
        });
      }
      setChats(chatList);
      setLoadingChats(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Load message streams once a chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, `chats/${selectedChat.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgList = [];
      querySnapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
    });

    return unsubscribe;
  }, [selectedChat]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const msgRef = collection(db, `chats/${selectedChat.id}/messages`);
      await addDoc(msgRef, {
        senderId: currentUser.uid,
        text: textToSend,
        timestamp: new Date().toISOString(),
        read: false
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Start new demo chat helper
  const handleStartDemoChat = async (artisan) => {
    // Check if chat exists
    const existing = chats.find(c => c.recipientId === artisan.id);
    if (existing) {
      setSelectedChat(existing);
      return;
    }

    // Create new chat room
    const chatRoomId = `chat-${currentUser.uid}-${artisan.id}`;
    const chatRef = doc(db, 'chats', chatRoomId);
    
    const newChat = {
      participants: [currentUser.uid, artisan.id],
      lastMessage: 'Chat initiated',
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(chatRef, newChat);
      setSelectedChat({
        id: chatRoomId,
        recipientId: artisan.id,
        recipientName: artisan.name,
        ...newChat
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[75vh] flex rounded-3xl border border-secondary/5 overflow-hidden bg-white shadow-sm">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-secondary/5 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-secondary/5 font-bold text-secondary text-sm">
          Active Conversations
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loadingChats ? (
            <p className="text-xs text-secondary/40 text-center py-4">Syncing threads...</p>
          ) : chats.length === 0 ? (
            <div className="space-y-4 text-center py-8">
              <FiMessageSquare className="mx-auto text-secondary/20" size={24} />
              <p className="text-xs text-secondary/40 px-4">No active conversations. Start a quick chat with nearby artisans:</p>
              <div className="space-y-1 px-3">
                {suggestedArtisans.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => handleStartDemoChat(art)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-primary flex items-center gap-1.5"
                  >
                    <FiUser size={12} /> Chat with {art.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedChat?.id === chat.id ? 'bg-primary/5 border border-primary/20 text-secondary' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-secondary">{chat.recipientName}</h4>
                </div>
                <p className="text-[10px] text-secondary/45 truncate mt-1">{chat.lastMessage || 'Message thread initialized'}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Chat Pane */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {selectedChat ? (
          <React.Fragment>
            {/* Thread Header */}
            <div className="px-6 py-4 bg-white border-b border-secondary/5 flex items-center gap-3">
              <button 
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1.5 rounded-lg hover:bg-secondary/5 text-secondary/50"
              >
                <FiArrowLeft size={16} />
              </button>
              <div>
                <h4 className="text-xs font-extrabold text-secondary">{selectedChat.recipientName}</h4>
                <p className="text-[9px] text-accent uppercase font-bold tracking-wider">Contractor Verified</p>
              </div>
            </div>

            {/* Message Stream lists */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-xs text-secondary/40 text-center py-8">Send a message to initiate trade scope discussions.</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed
                        ${isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-secondary border border-secondary/5 rounded-tl-none'
                        }
                      `}>
                        <p>{msg.text}</p>
                        <p className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-secondary/40'}`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input box */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-secondary/5 flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Discuss contract details or upload images..."
                className="flex-1 px-4 py-3 bg-slate-50 text-secondary text-xs rounded-xl border border-secondary/5 outline-none focus:border-primary/50 transition-all duration-200"
              />
              <Button type="submit" variant="primary" disabled={!inputText.trim()} className="!py-3">
                <FiSend size={14} />
              </Button>
            </form>
          </React.Fragment>
        ) : (
          <div className="text-center space-y-3">
            <FiMessageSquare size={32} className="mx-auto text-secondary/20" />
            <p className="text-xs text-secondary/45">Select a conversation thread to initiate real-time contract negotiations.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
