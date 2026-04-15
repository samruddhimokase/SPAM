import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, Edit, Info, Image, Heart, Smile,
  Send, Search, Video, Phone, ShieldAlert, 
  ShieldCheck, AlertTriangle, MessageCircle, Camera,
  Mic, MoreVertical, Plus, UserPlus, PhoneCall,
  VideoIcon, Sparkles, ArrowLeft, Ghost
} from 'lucide-react';
import { 
  detectTelegramScam, 
  fetchWhatsAppChats, 
  fetchWhatsAppMessages, 
  sendWhatsAppMessage,
  normalizeImageUrl,
  fetchUserProfile,
  searchUsers,
  reportWhatsAppNumber,
  fetchInstagramStories,
  fetchFollowing
} from '../api/api';
import { useSocket } from '../context/SocketContext';

const InstagramMessages = ({ isGhostMode = false, showToast = () => {}, openUserProfile }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeMessageTab, setActiveMessageTab] = useState('primary'); // 'primary' or 'requests'
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState([]);
  const [requestChats, setRequestChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [stories, setStories] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const chatEndRef = useRef(null);
  const socket = useSocket();

  // Load current user, chats, following and stories
  useEffect(() => {
    const init = async () => {
      try {
        const { data: searchRes } = await searchUsers('rohit_gupta');
        if (searchRes && searchRes.length > 0) {
          const profile = searchRes[0];
          setCurrentUser(profile);
          
          const { data: chatList } = await fetchWhatsAppChats(profile._id);
          setChats(chatList || []);
          
          const { data: followingList } = await fetchFollowing(profile._id);
          setFollowing(followingList || []);

          // Create some mock request chats for demo
          const requests = [
            {
              _id: 'req_1',
              participants: [
                profile,
                { _id: 'scam_1', username: 'crypto_king_99', profilePicture: 'https://i.pravatar.cc/150?u=crypto', riskScore: 85, riskClassification: 'Scam' }
              ],
              lastMessage: { text: 'Just send 0.1 BTC to my wallet and...', createdAt: new Date().toISOString() },
              unreadCount: 1,
              isRequest: true
            },
            {
              _id: 'req_2',
              participants: [
                profile,
                { _id: 'scam_2', username: 'tech_support_official', profilePicture: 'https://i.pravatar.cc/150?u=tech', riskScore: 65, riskClassification: 'Suspicious' }
              ],
              lastMessage: { text: 'Your account security is at risk. Please...', createdAt: new Date().toISOString() },
              unreadCount: 1,
              isRequest: true
            }
          ];
          setRequestChats(requests);

          if (chatList && chatList.length > 0) {
            setSelectedChat(chatList[0]._id);
          }

          // Stories are now filtered to only show from people we follow
          setStories(followingList || []);
        }
      } catch (err) {
        console.error('Failed to init messages:', err);
      }
    };
    init();
  }, []);

  // Mock messages for request chats
  useEffect(() => {
    if (activeMessageTab === 'requests') {
      const mockRequestMessages = {
        'req_1': [
          { _id: 'm_req_1_1', text: 'Hey bro! I saw your profile. Are you interested in doubling your crypto?', sender: 'scam_1', createdAt: new Date(Date.now() - 3600000).toISOString(), aiAnalysis: { classification: 'Suspicious', riskScore: 60 } },
          { _id: 'm_req_1_2', text: 'Just send 0.1 BTC to my wallet and I will send you 0.2 BTC back instantly.', sender: 'scam_1', createdAt: new Date(Date.now() - 3500000).toISOString(), aiAnalysis: { classification: 'Scam', riskScore: 85, flags: ['Crypto Fraud'] } },
          { _id: 'm_req_1_3', text: 'Trust me, I have 10k followers. It\'s a limited time offer.', sender: 'scam_1', createdAt: new Date(Date.now() - 3400000).toISOString(), aiAnalysis: { classification: 'Low Risk', riskScore: 20 } }
        ],
        'req_2': [
          { _id: 'm_req_2_1', text: 'Hello, this is Instagram Support. We detected unusual login attempts.', sender: 'scam_2', createdAt: new Date(Date.now() - 3600000).toISOString(), aiAnalysis: { classification: 'Suspicious', riskScore: 55 } },
          { _id: 'm_req_2_2', text: 'Please click here to verify your identity: http://insta-verify-safe.net/login', sender: 'scam_2', createdAt: new Date(Date.now() - 3500000).toISOString(), aiAnalysis: { classification: 'Scam', riskScore: 90, flags: ['Phishing Link'] } }
        ]
      };
      setMessages(prev => ({ ...prev, ...mockRequestMessages }));
    }
  }, [activeMessageTab]);

  // Load messages when chat changes
  useEffect(() => {
    if (selectedChat && !selectedChat.startsWith('req_')) {
      const loadMessages = async () => {
        try {
          const { data } = await fetchWhatsAppMessages(selectedChat);
          setMessages(prev => ({
            ...prev,
            [selectedChat]: data || []
          }));
          
          if (socket) {
            socket.emit('join_chat', { room: selectedChat });
          }
        } catch (err) {
          console.error('Failed to load messages:', err);
        }
      };
      loadMessages();
      setShowOptions(false);
    }
  }, [selectedChat, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (data) => {
      const chatID = data.chat || data.chatID || data.chatId;
      setMessages(prev => {
        const currentMessages = prev[chatID] || [];
        if (currentMessages.find(m => (m._id || m.id) === (data._id || data.id))) return prev;
        
        return {
          ...prev,
          [chatID]: [...currentMessages, data]
        };
      });
      
      setChats(prev => prev.map(c => {
        if (c._id === chatID) {
          return { ...c, lastMessage: data };
        }
        return c;
      }));
    });

    socket.on('user_typing', (data) => {
      if (data.room === selectedChat && data.user !== currentUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on('message_seen', (data) => {
      if (data.chatId === selectedChat) {
        setMessages(prev => ({
          ...prev,
          [data.chatId]: prev[data.chatId]?.map(m => 
            (m._id || m.id) === data.messageId ? { ...m, status: 'seen' } : m
          ) || []
        }));
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('message_seen');
    };
  }, [socket, selectedChat, currentUser]);

  // Handle "Seen" logic with Ghost Mode support
  useEffect(() => {
    if (selectedChat && messages[selectedChat] && socket && !isGhostMode) {
      const lastMsg = messages[selectedChat][messages[selectedChat].length - 1];
      if (lastMsg && lastMsg.sender !== currentUser?._id && lastMsg.status !== 'seen') {
        socket.emit('mark_seen', {
          chatId: selectedChat,
          messageId: lastMsg._id || lastMsg.id,
          userId: currentUser?._id
        });
      }
    }
  }, [selectedChat, messages[selectedChat]?.length, isGhostMode, socket]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = async (e) => {
    if ((e.type === 'click' || e.key === 'Enter') && inputText.trim() && selectedChat) {
      const text = inputText;
      setInputText('');

      try {
        const { data: newMsg } = await sendWhatsAppMessage({
          chatId: selectedChat,
          senderId: currentUser?._id,
          text: text,
          mediaType: 'none'
        });

        // Optimistic update
        setMessages(prev => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), newMsg]
        }));

        if (socket) {
          socket.emit('send_message', { ...newMsg, room: selectedChat });
        }
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.mediaType === 'post' && msg.sharedPost) {
      const post = msg.sharedPost;
      const displayImage = post.imageUrl || post.image;
      const userPic = post.user?.profilePicture || post.user?.avatar;
      
      return (
        <div className="flex flex-col gap-2 max-w-[240px] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openUserProfile(post.user?._id)}>
          <div className="flex items-center gap-2 p-2 px-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img src={normalizeImageUrl(userPic)} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-[12px] font-bold">{post.user?.username}</span>
          </div>
          <div className="aspect-square w-full">
            <img src={normalizeImageUrl(displayImage)} className="w-full h-full object-cover" alt="" />
          </div>
          {post.caption && (
            <div className="p-2 px-3">
              <p className="text-[12px] line-clamp-2"><span className="font-bold mr-1">{post.user?.username}</span>{post.caption}</p>
            </div>
          )}
        </div>
      );
    }
    return <p className="text-[14px] leading-relaxed break-words">{msg.text}</p>;
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && selectedChat && !isGhostMode) {
      socket.emit('typing', { room: selectedChat, user: currentUser?._id });
    }
  };

  const handleReport = async (userId, reason) => {
    try {
      const participant = otherParticipant;
      if (participant?.phoneNumber) {
        await reportWhatsAppNumber(participant.phoneNumber, reason);
        alert('User reported successfully to AI security team.');
      }
      setShowOptions(false);
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  const currentChat = [...chats, ...requestChats].find(c => c._id === selectedChat);
  const otherParticipant = currentChat?.participants.find(p => p._id !== currentUser?._id);

  const getRiskColor = (classification) => {
    switch (classification) {
      case 'Scam': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
      case 'Suspicious': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800';
      case 'Low Risk': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
      default: return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-black overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-[397px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-black">
        {/* Sidebar Header */}
        <div className="p-5 pb-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 cursor-pointer">
            {activeMessageTab === 'requests' && (
              <button 
                onClick={() => {
                  setActiveMessageTab('primary');
                  setSelectedChat(chats[0]?._id);
                }}
                className="mr-2 hover:bg-slate-100 dark:hover:bg-slate-900 p-1 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="font-bold text-xl tracking-tight">
              {activeMessageTab === 'requests' ? 'Message Requests' : currentUser?.username}
            </span>
            {activeMessageTab !== 'requests' && <ChevronDown className="w-5 h-5" />}
          </div>
          <div className="flex items-center gap-4">
            <Edit className="w-6 h-6 cursor-pointer" />
          </div>
        </div>

        {/* Search Bar - Meta AI Style */}
        {activeMessageTab !== 'requests' && (
          <div className="px-5 py-3">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500" />
              </div>
              <input 
                type="text" 
                placeholder="Ask Meta AI or Search" 
                className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl py-2 pl-10 pr-4 text-[15px] outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Notes Row */}
          {activeMessageTab !== 'requests' && (
            <div className="px-5 py-4 flex gap-4 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-900 mb-2">
              <div className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                  <img src={normalizeImageUrl(currentUser?.profilePicture)} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute top-[-8px] bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-1 text-[11px] font-medium max-w-[80px] truncate">
                  Note...
                </div>
                <span className="text-[12px] text-slate-500">Your note</span>
              </div>
              
              {following.slice(0, 5).map((user, i) => (
                <div 
                  key={user._id || i} 
                  className="flex flex-col items-center gap-1.5 shrink-0 relative cursor-pointer group"
                  onClick={() => openUserProfile(user._id)}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-0.5">
                    <img src={normalizeImageUrl(user.profilePicture)} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute top-[-8px] bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-1 text-[11px] font-medium max-w-[80px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    Hey! 🔥
                  </div>
                  <span className="text-[12px] text-slate-500 truncate w-16 text-center">{user.username}</span>
                </div>
              ))}
            </div>
          )}

          {activeMessageTab === 'requests' ? (
            <div className="p-5 bg-blue-50/30 dark:bg-blue-900/5 border-b border-slate-100 dark:border-slate-900">
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Open a request to see who's messaging you. They won't know you've seen it until you accept.
              </p>
            </div>
          ) : (
            <div className="px-5 py-4 flex justify-between items-center bg-white dark:bg-black">
              <span className="font-bold text-[16px] dark:text-white">Messages</span>
              <button 
                onClick={() => {
                  setActiveMessageTab('requests');
                  if (requestChats.length > 0) {
                    setSelectedChat(requestChats[0]?._id);
                  }
                }}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-[#0095f6] text-[13px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95"
              >
                Requests
                <span className="bg-[#0095f6] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm shadow-blue-500/30">
                  {requestChats.length}
                </span>
              </button>
            </div>
          )}

          {(activeMessageTab === 'primary' ? chats : requestChats).map(chat => {
            const participant = chat.participants.find(p => p._id !== currentUser?._id);
            const isSelected = selectedChat === chat._id;
            // Generate some realistic status text based on mock data
            const statusText = chat.unreadCount > 0 
              ? `Sent you a message · 1h` 
              : participant?.riskScore > 30 
                ? `Active 5h ago` 
                : `Active 27m ago`;

            return (
              <div 
                key={chat._id}
                onClick={() => setSelectedChat(chat._id)}
                className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'bg-slate-100/80 dark:bg-slate-900/80' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
              >
                <div 
                  className="relative shrink-0 hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (participant?._id) openUserProfile(participant._id);
                  }}
                >
                  <img src={normalizeImageUrl(participant?.profilePicture)} alt="" className="w-[56px] h-[56px] rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                  {/* Online status dot (only some users) */}
                  {(participant?.riskScore < 40 && !chat.isRequest) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-sm"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] truncate ${chat.unreadCount > 0 ? 'font-bold' : 'text-slate-900 dark:text-white'}`}>{participant?.username}</p>
                  <p className={`text-[13px] truncate ${chat.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    {chat.lastMessage?.text || statusText}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-black relative">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[75px] border-b border-slate-100 dark:border-slate-900 flex items-center justify-between px-6 shrink-0">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => openUserProfile(otherParticipant?._id)}
              >
                <img src={normalizeImageUrl(otherParticipant?.profilePicture)} alt="" className="w-10 h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[16px] leading-tight group-hover:text-blue-500 transition-colors">{otherParticipant?.username}</span>
                    {isGhostMode && (
                      <div className="bg-purple-600/10 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                        <Ghost className="w-2 h-2" /> GHOST
                      </div>
                    )}
                  </div>
                  <span className="text-[12px] text-slate-500 leading-tight">Active 27m ago</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-slate-900 dark:text-white relative">
                <Phone className="w-[26px] h-[26px] cursor-pointer hover:opacity-70 transition-opacity" />
                <Video className="w-[26px] h-[26px] cursor-pointer hover:opacity-70 transition-opacity" />
                <Info 
                  className={`w-[26px] h-[26px] cursor-pointer hover:opacity-70 transition-opacity ${showOptions ? 'text-blue-500' : ''}`} 
                  onClick={() => setShowOptions(!showOptions)}
                />
                
                {showOptions && (
                  <div className="absolute top-12 right-0 w-56 bg-white dark:bg-[#262626] shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button onClick={() => handleReport(otherParticipant?._id, 'Scam attempt')} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">Report for Scam</button>
                    <button onClick={() => handleReport(otherParticipant?._id, 'Harassment')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">Report Harassment</button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                    <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">Block User</button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-black">
              {/* Date Separator */}
              <div className="flex justify-center py-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Yesterday at 3:22 PM</span>
              </div>

              {messages[selectedChat]?.map((msg, idx) => {
                const isMe = (msg.sender?._id || msg.sender) === currentUser?._id;
                const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const showAvatar = !isMe && (idx === 0 || (messages[selectedChat][idx - 1]?.sender?._id || messages[selectedChat][idx - 1]?.sender) === currentUser?._id);
                
                return (
                  <div key={msg._id || idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 shrink-0">
                        {showAvatar ? (
                          <img 
                            src={normalizeImageUrl(otherParticipant?.profilePicture)} 
                            className="w-full h-full rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-slate-100 dark:border-slate-800" 
                            alt="" 
                            onClick={() => openUserProfile(otherParticipant?._id)}
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[70%] group relative">
                      {/* Message Bubble */}
                      <div className={`p-3 px-4 rounded-[24px] text-[15px] leading-[1.4] relative shadow-sm ${
                        isMe 
                          ? 'bg-[#0095f6] text-white rounded-br-[4px]' 
                          : 'bg-[#efefef] dark:bg-[#262626] text-black dark:text-white rounded-bl-[4px]'
                      }`}>
                        {renderMessageContent(msg)}
                        
                        {/* Heart Reaction (Small icon at the bottom edge) */}
                        {(msg.isLiked || idx === 2) && ( // Mocking a reaction on the 3rd message for visual fidelity
                          <div className={`absolute -bottom-2 ${isMe ? 'left-2' : 'right-2'} bg-white dark:bg-black rounded-full p-0.5 shadow-sm border border-slate-100 dark:border-slate-800 scale-90`}>
                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          </div>
                        )}
                      </div>

                      {/* AI Risk Indicator (Keep this but style it to fit) */}
                      {!isMe && msg.aiAnalysis && (
                        <div className={`mt-2 px-3 py-2 rounded-2xl border text-[11px] flex flex-col gap-1 shadow-sm ${getRiskColor(msg.aiAnalysis.classification)}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                              {msg.aiAnalysis.classification === 'Scam' && <ShieldAlert className="w-3 h-3" />}
                              AI: {msg.aiAnalysis.classification}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-[22px] rounded-tl-[4px]">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar or Request Actions */}
            <div className="p-4 px-6 shrink-0 bg-white dark:bg-black border-t border-slate-50 dark:border-slate-900">
              {currentChat?.isRequest || activeMessageTab === 'requests' ? (
                <div className="flex flex-col gap-4 items-center bg-slate-50 dark:bg-[#121212] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-1">
                    <ShieldAlert className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-bold dark:text-white mb-1">Security Request</p>
                    <p className="text-[13px] text-slate-500 max-w-xs mx-auto">
                      SocialShield AI has flagged this as a request. Accepting will allow them to see your activity.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full max-w-sm mt-2">
                    <button 
                      onClick={() => {
                        showToast('Request deleted', 'info');
                        setActiveMessageTab('primary');
                        setSelectedChat(chats[0]?._id);
                      }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-red-100 dark:border-red-900/30"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => {
                        showToast('User blocked and reported', 'error');
                        setActiveMessageTab('primary');
                        setSelectedChat(chats[0]?._id);
                      }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-red-100 dark:border-red-900/30"
                    >
                      Block
                    </button>
                    <button 
                      onClick={() => {
                        const acceptedChat = requestChats.find(c => c._id === selectedChat) || currentChat;
                        if (acceptedChat) {
                          acceptedChat.isRequest = false;
                          setChats(prev => [acceptedChat, ...prev]);
                          setRequestChats(prev => prev.filter(c => c._id !== selectedChat));
                          setActiveMessageTab('primary');
                          showToast('Request accepted', 'success');
                        }
                      }}
                      className="flex-1 py-3 bg-[#0095f6] hover:bg-blue-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-blue-500/20"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#efefef] dark:bg-[#262626] rounded-[26px] px-4 py-2">
                  <div className="bg-[#0095f6] rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors shadow-sm">
                    <Camera className="w-5 h-5 text-white fill-white" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Message..." 
                    className="flex-1 bg-transparent outline-none text-[15px] dark:text-white placeholder:text-slate-500 py-2"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleSendMessage}
                  />
                  <div className="flex items-center gap-4 text-slate-900 dark:text-white px-1">
                    {inputText.trim() ? (
                      <button 
                        onClick={handleSendMessage}
                        className="text-[#0095f6] font-bold text-[15px] px-2 hover:text-blue-600"
                      >
                        Send
                      </button>
                    ) : (
                      <>
                        <Mic className="w-6 h-6 cursor-pointer hover:opacity-60 transition-opacity" />
                        <Image className="w-6 h-6 cursor-pointer hover:opacity-60 transition-opacity" />
                        <Heart className="w-6 h-6 cursor-pointer hover:opacity-60 transition-opacity" />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <div className="w-24 h-24 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your Messages</h2>
            <p className="text-slate-500 text-sm mb-6">Send private photos and messages to a friend or group.</p>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">Send Message</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramMessages;