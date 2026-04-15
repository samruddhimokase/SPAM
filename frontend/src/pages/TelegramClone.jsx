import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Menu, Phone, MoreVertical, Paperclip, 
  Send, Smile, ShieldAlert, ShieldCheck, Check, CheckCheck,
  User, Users, Megaphone, Settings, Lock, ArrowLeft,
  Image as ImageIcon, Video as VideoIcon, FileText,
  SmilePlus, Mic, Hash, Volume2, SearchIcon, X, Pin, BellOff,
  UserPlus, UserMinus, Plus, Camera
} from 'lucide-react';
import { detectTelegramScam, analyzeScreenshot } from '../api/api';
import { useSocket } from '../context/SocketContext';

const TelegramClone = () => {
  const socket = useSocket();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingImage, setAnalyzingImage] = useState(false);
  
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Demo User ID
  const currentUserId = "69bbebb0babab3ff59afc1bf";

  useEffect(() => {
    // Initialize with demo data
    const demoChats = [
      { id: 1, name: "Alex Rivera", lastMsg: "Yeah, the AI scam detection...", time: "10:31 AM", unread: 0, type: 'private', avatar: 'https://i.pravatar.cc/150?u=alex', status: 'online' },
      { id: 2, name: "Telegram Security", lastMsg: "URGENT: Your account...", time: "11:00 AM", unread: 1, type: 'bot', avatar: 'https://i.pravatar.cc/150?u=support', isSuspicious: true, status: 'bot' },
      { id: 3, name: "Amazon Rewards 🎁", lastMsg: "CONGRATULATIONS! You've won...", time: "12:15 PM", unread: 1, type: 'bot', avatar: 'https://i.pravatar.cc/150?u=amazon', isSuspicious: true, status: 'bot' },
      { id: 4, name: "Crypto Alpha 🚀", lastMsg: "Welcome to the Crypto...", time: "Yesterday", unread: 0, type: 'channel', avatar: 'https://i.pravatar.cc/150?u=crypto', members: '12.4K' },
      { id: 5, name: "Job Opportunity 💼", lastMsg: "Earn $500/day working from...", time: "2:45 PM", unread: 3, type: 'private', avatar: 'https://i.pravatar.cc/150?u=job', isSuspicious: true, status: 'online' },
      { id: 6, name: "Bank Alert 🏦", lastMsg: "Your account has been suspended...", time: "9:20 AM", unread: 1, type: 'bot', avatar: 'https://i.pravatar.cc/150?u=bank', isSuspicious: true, status: 'bot' },
      { id: 7, name: "Dev Team", lastMsg: "Sarah: Let's deploy at 5", time: "2:45 PM", unread: 5, type: 'group', avatar: 'https://i.pravatar.cc/150?u=devteam', members: '45' }
    ];
    setChats(demoChats);
    setActiveChat(demoChats[1].id); // Default to first scam chat

    const initialMessages = {
      1: [
        { id: 1, text: "Hey! Did you see the new update?", sender: "Alex Rivera", time: "10:30 AM", status: 'read', senderId: 'alex' },
        { id: 2, text: "Yeah, the AI scam detection is pretty cool.", sender: "Me", time: "10:31 AM", status: 'read', senderId: currentUserId }
      ],
      2: [
        { id: 1, text: "Hello, I'm from Telegram support. We noticed suspicious activity on your account.", sender: "Telegram Security", time: "10:55 AM", status: 'read', senderId: 'bot' },
        { id: 2, text: "Oh, what kind of activity?", sender: "Me", time: "10:57 AM", status: 'read', senderId: currentUserId },
        { id: 3, text: "Someone from Russia tried to login. To secure your account, we sent an OTP to your phone. Please share it here immediately.", sender: "Telegram Security", time: "11:00 AM", status: 'unread', senderId: 'bot', aiAnalysis: { isScam: true, riskScore: 90, flags: ['OTP Request', 'Urgency / Pressure'], recommendation: "High risk! Never share your OTP." } }
      ],
      3: [
        { id: 1, text: "CONGRATULATIONS! You have been selected as our lucky winner for today!", sender: "Amazon Rewards 🎁", time: "12:10 PM", status: 'read', senderId: 'bot', aiAnalysis: { isScam: true, riskScore: 75, flags: ['Lottery / Prize'] } },
        { id: 2, text: "To claim your $1,000 gift card, visit: http://amazon-gift-win.net/claim and enter your login details.", sender: "Amazon Rewards 🎁", time: "12:15 PM", status: 'unread', senderId: 'bot', aiAnalysis: { isScam: true, riskScore: 95, flags: ['Phishing Link', 'Lottery / Prize'], recommendation: "Phishing link detected. Do not click." } }
      ],
      5: [
        { id: 1, text: "Hello! We are hiring for a remote work-from-home position. No experience needed.", sender: "Job Opportunity 💼", time: "2:40 PM", status: 'read', senderId: 'job', aiAnalysis: { isScam: true, riskScore: 50, flags: ['Fake Job'] } },
        { id: 2, text: "You can earn up to $500 per day. To start, please pay a $50 registration fee via UPI.", sender: "Job Opportunity 💼", time: "2:45 PM", status: 'unread', senderId: 'job', aiAnalysis: { isScam: true, riskScore: 95, flags: ['Fake Job', 'Payment Request'], recommendation: "Legitimate jobs never ask for a fee." } }
      ],
      6: [
        { id: 1, text: "Dear Customer, your bank account has been temporarily suspended due to a security update.", sender: "Bank Alert 🏦", time: "9:15 AM", status: 'read', senderId: 'bank', aiAnalysis: { isScam: true, riskScore: 70, flags: ['Bank Fraud', 'Urgency'] } },
        { id: 2, text: "Please click here to verify your KYC immediately: http://your-bank-kyc-verify.com", sender: "Bank Alert 🏦", time: "9:20 AM", status: 'unread', senderId: 'bank', aiAnalysis: { isScam: true, riskScore: 90, flags: ['Bank Fraud', 'Phishing Link'], recommendation: "Banks do not notify via Telegram." } }
      ],
      7: [
        { id: 1, text: "Hey team, how's the progress?", sender: "John", time: "1:00 PM", status: 'read', senderId: 'john' },
        { id: 2, text: "Sarah: Let's deploy at 5", sender: "Sarah", time: "2:45 PM", status: 'read', senderId: 'sarah' }
      ]
    };
    setMessages(initialMessages);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', async (data) => {
      let finalMsg = {
        id: Date.now(),
        text: data.text,
        sender: data.sender || "Contact",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        senderId: data.senderId
      };

      if (data.senderId !== currentUserId) {
        try {
          const { data: analysis } = await detectTelegramScam(data.text);
          if (analysis.isScam) {
            finalMsg.aiAnalysis = analysis;
          }
        } catch (e) {}
      }

      setMessages(prev => ({
        ...prev,
        [data.room || activeChat]: [...(prev[data.room || activeChat] || []), finalMsg]
      }));
    });

    return () => socket.off('receive_message');
  }, [socket, activeChat]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && activeChat) {
      setAnalyzingImage(true);
      
      const formData = new FormData();
      formData.append('screenshot', file);

      try {
        const { data } = await analyzeScreenshot(formData);
        if (data.success) {
          const chatID = activeChat;
          const newMsg = {
            id: Date.now(),
            text: data.extractedText,
            imageUrl: URL.createObjectURL(file),
            sender: "Me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            senderId: currentUserId,
            aiAnalysis: {
              isScam: data.analysis.risk === 'High',
              riskScore: data.analysis.score,
              recommendation: data.analysis.risk === 'High' 
                ? "High risk image! Scam patterns detected."
                : "Mostly safe image.",
              flags: data.analysis.flags
            }
          };

          setMessages(prev => ({
            ...prev,
            [chatID]: [...(prev[chatID] || []), newMsg]
          }));

          if (data.analysis.risk === 'High') {
            setTimeout(() => {
              const warning = {
                id: Date.now() + 1,
                text: `SECURITY ALERT: Image analysis detected ${data.analysis.flags.join(', ')}. Recommendation: ${newMsg.aiAnalysis.recommendation}`,
                sender: "SocialShield",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAlert: true,
                aiAnalysis: newMsg.aiAnalysis
              };
              setMessages(prev => ({
                ...prev,
                [chatID]: [...(prev[chatID] || []), warning]
              }));
            }, 600);
          }
        }
      } catch (err) {
        console.error("Failed to analyze image:", err);
      } finally {
        setAnalyzingImage(false);
      }
    }
  };

  const handleSendMessage = async (e) => {
    if ((e.type === 'click' || e.key === 'Enter') && inputText.trim()) {
      if (e.key === 'Enter' && e.shiftKey) return;
      if (e.key === 'Enter') e.preventDefault();

      const chatID = activeChat;
      const text = inputText.trim();
      const newMsg = {
        id: Date.now(),
        text: text,
        sender: "Me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        senderId: currentUserId
      };

      if (socket) {
        socket.emit('send_message', { 
          room: chatID, 
          text: text, 
          sender: 'Me',
          senderId: currentUserId
        });
      }

      setMessages(prev => ({
        ...prev,
        [chatID]: [...(prev[chatID] || []), newMsg]
      }));
      setInputText('');

      try {
        const { data } = await detectTelegramScam(text);
        if (data.isScam) {
          setTimeout(() => {
            const warning = {
              id: Date.now() + 1,
              text: `SECURITY ALERT: ${data.flags.join(', ')} detected. Recommendation: ${data.recommendation}`,
              sender: "SocialShield",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAlert: true,
              aiAnalysis: data
            };
            setMessages(prev => ({
              ...prev,
              [chatID]: [...(prev[chatID] || []), warning]
            }));
          }, 600);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentChat = chats.find(c => c.id === activeChat) || chats[0] || {};
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden font-sans selection:bg-[#3390ec]/30">
      {/* Sidebar */}
      <div className={`flex flex-col bg-[#212121] border-r border-white/5 transition-all duration-300 relative ${showSidebar ? 'w-[420px]' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 flex items-center gap-4 bg-[#212121]">
          <div className="p-2.5 hover:bg-white/5 rounded-full cursor-pointer transition-all active:scale-90 group">
            <Menu className="w-6 h-6 text-[#aaaaaa] group-hover:text-white" />
          </div>
          <div className="flex-1 bg-[#2c2c2c] rounded-full px-5 py-2 flex items-center gap-3 border border-transparent focus-within:border-[#3390ec] focus-within:bg-[#212121] transition-all group shadow-inner">
            <Search className="w-4.5 h-4.5 text-[#aaaaaa] group-focus-within:text-[#3390ec]" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent outline-none text-[15px] w-full placeholder-[#aaaaaa] py-0.5 font-medium" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`mx-2 my-0.5 px-3 py-3 flex items-center gap-4 cursor-pointer transition-all duration-200 rounded-2xl ${activeChat === chat.id ? 'bg-[#3390ec] text-white' : 'hover:bg-white/5'}`}
            >
              <div className="relative shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-[54px] h-[54px] rounded-full object-cover border border-white/5 shadow-sm" />
                {chat.isSuspicious && (
                  <div className="absolute -bottom-1 -right-1 bg-[#e53935] p-1.5 rounded-full border-2 border-[#212121] shadow-lg">
                    <ShieldAlert className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {chat.status === 'online' && (
                  <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#00c73c] rounded-full border-2 ${activeChat === chat.id ? 'border-[#3390ec]' : 'border-[#212121]'}`}></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-bold truncate text-[16px] tracking-tight ${activeChat === chat.id ? 'text-white' : 'text-[#ffffff]'}`}>
                    {chat.name}
                    {chat.type === 'channel' && <Megaphone className="w-3.5 h-3.5 inline ml-2 text-[#aaaaaa]" />}
                  </h3>
                  <span className={`text-[12px] font-medium ${activeChat === chat.id ? 'text-white/80' : 'text-[#aaaaaa]'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-[15px] truncate leading-snug font-medium ${activeChat === chat.id ? 'text-white/90' : 'text-[#aaaaaa]'}`}>{chat.lastMsg}</p>
                  <div className="flex items-center gap-2 ml-2">
                    {chat.unread > 0 && (
                      <span className={`text-[11px] min-w-[22px] h-[22px] flex items-center justify-center rounded-full font-black px-1.5 ${activeChat === chat.id ? 'bg-white text-[#3390ec]' : 'bg-[#3390ec] text-white'}`}>
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Telegram FAB */}
        <div className="absolute bottom-8 right-8 z-20">
          <button className="w-14 h-14 bg-[#3390ec] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#3390ec]/20 hover:scale-110 active:scale-95 transition-all group">
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#0f0f0f] relative overflow-hidden">
        {activeChat ? (
          <>
            <div className="h-[60px] bg-[#212121] flex items-center justify-between px-6 z-10 shrink-0 shadow-md border-b border-white/5">
              <div className="flex items-center gap-4 cursor-pointer group">
                <div 
                  className="p-2 -ml-2 hover:bg-white/5 rounded-full lg:hidden active:scale-90 transition-transform"
                  onClick={() => setShowSidebar(true)}
                >
                  <ArrowLeft className="w-6 h-6 text-[#aaaaaa]" />
                </div>
                <div className="relative">
                  <img src={currentChat.avatar} alt={currentChat.name} className="w-10 h-10 rounded-full object-cover border border-white/5" />
                  {currentChat.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00c73c] rounded-full border-2 border-[#212121]"></div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[17px] leading-tight truncate group-hover:text-[#3390ec] transition-colors">{currentChat.name}</h3>
                  <p className="text-[13px] text-[#aaaaaa] leading-tight font-medium mt-0.5">
                    {currentChat.type === 'channel' ? `${currentChat.members} subscribers` : 
                     currentChat.type === 'group' ? `${currentChat.members} members, 12 online` : 
                     currentChat.status || 'online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#aaaaaa]">
                {currentChat.isSuspicious && (
                  <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#e53935]/15 text-[#e53935] rounded-xl border border-[#e53935]/30 text-[11px] font-black uppercase tracking-widest animate-pulse mr-4 shadow-lg shadow-red-500/10">
                    <ShieldAlert className="w-4 h-4" /> SCAM SUSPECT
                  </div>
                )}
                <div className="p-2.5 hover:bg-white/5 rounded-full transition-all cursor-pointer group active:scale-90">
                  <SearchIcon className="w-5.5 h-5.5 group-hover:text-white" />
                </div>
                <div className="p-2.5 hover:bg-white/5 rounded-full transition-all cursor-pointer group active:scale-90">
                  <Phone className="w-5.5 h-5.5 group-hover:text-white" />
                </div>
                <div className="p-2.5 hover:bg-white/5 rounded-full transition-all cursor-pointer group active:scale-90">
                  <MoreVertical className="w-5.5 h-5.5 group-hover:text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:px-48 space-y-4 bg-[#0f0f0f] relative custom-scrollbar">
              {/* Telegram Background Pattern Overlay */}
              <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-[0.03] pointer-events-none"></div>

              <div className="flex justify-center mb-8 sticky top-0 z-20 pointer-events-none">
                <span className="bg-[#212121]/90 backdrop-blur-md text-white/70 text-[12px] px-5 py-1.5 rounded-full font-bold shadow-xl border border-white/5 uppercase tracking-widest">Today</span>
              </div>

              {messages[activeChat]?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-400`}>
                  <div className={`max-w-[85%] lg:max-w-[520px] p-3 rounded-2xl shadow-lg relative group transition-all hover:shadow-2xl ${
                    msg.isAlert 
                      ? 'bg-[#e53935]/20 border border-[#e53935]/30 text-white text-center w-full mx-12 my-8 backdrop-blur-md rounded-[2rem]' 
                      : msg.senderId === currentUserId 
                        ? 'bg-[#3390ec] text-white rounded-br-sm' 
                        : 'bg-[#212121] text-white rounded-bl-sm'
                  }`}>
                    {msg.isAlert && (
                      <div className="mb-4">
                        <div className="w-14 h-14 bg-[#e53935] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl shadow-red-500/20">
                          <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
                        </div>
                        <h4 className="text-xl font-black tracking-tight mb-1">SECURITY ALERT</h4>
                      </div>
                    )}
                    
                    {currentChat.type === 'group' && msg.senderId !== currentUserId && (
                      <p className="text-[14px] font-black text-[#3390ec] mb-1 cursor-pointer hover:underline uppercase tracking-tight">{msg.sender}</p>
                    )}
                    
                    <p className={`text-[16px] leading-[1.5] whitespace-pre-wrap font-medium ${msg.aiAnalysis?.isScam ? 'text-red-50' : ''}`}>{msg.text}</p>
                    
                    {msg.imageUrl && (
                      <div className="mt-2.5 mb-1 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <img src={msg.imageUrl} alt="Attached" className="w-full max-h-[400px] object-cover hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}
                    
                    {msg.aiAnalysis?.isScam && !msg.isAlert && (
                      <div className="mt-4 py-3 px-4 bg-[#e53935]/25 border border-[#e53935]/40 rounded-[1.2rem] flex flex-col gap-2 shadow-inner">
                        <div className="flex items-center gap-2.5 text-[#ff5252]">
                          <div className="w-6 h-6 bg-[#ff5252] rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/20">
                            <ShieldAlert className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[12px] font-black uppercase tracking-widest">AI Security Risk Detected</span>
                        </div>
                        <p className="text-[13px] text-white font-bold leading-relaxed italic px-1 opacity-90">
                          {msg.aiAnalysis.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {msg.aiAnalysis.flags?.map((flag, fidx) => (
                            <span key={fidx} className="bg-red-500/40 text-[10px] px-2.5 py-1 rounded-lg font-black border border-red-500/30 uppercase tracking-tighter">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1.5 mt-2 -mr-0.5 opacity-70">
                      <span className="text-[11px] font-bold">
                        {msg.time}
                      </span>
                      {msg.senderId === currentUserId && (
                        msg.status === 'read' ? <CheckCheck className="w-4.5 h-4.5 text-white" /> : <Check className="w-4.5 h-4.5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-[#212121] border-t border-white/5 shadow-2xl relative z-30">
              <div className="max-w-3xl mx-auto flex items-end gap-4">
                <div className="flex-1 bg-[#2c2c2c] rounded-[1.5rem] px-5 py-3.5 flex items-end gap-4 border border-transparent focus-within:border-[#3390ec]/30 focus-within:bg-[#212121] transition-all shadow-xl group">
                  <Smile className="w-7 h-7 text-[#aaaaaa] cursor-pointer hover:text-[#3390ec] transition-all mb-1 hover:scale-110 active:scale-90" />
                  <textarea 
                    rows="1"
                    placeholder="Message" 
                    className="bg-transparent outline-none text-[16.5px] w-full resize-none text-white placeholder-[#aaaaaa] py-1 max-h-60 custom-scrollbar font-medium"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleSendMessage}
                  />
                  <div className="relative mb-1">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={analyzingImage}
                    />
                    <Paperclip className={`w-7 h-7 ${analyzingImage ? 'animate-pulse text-[#3390ec]' : 'text-[#aaaaaa]'} cursor-pointer hover:text-[#3390ec] transition-all rotate-45 hover:scale-110 active:scale-90`} />
                  </div>
                </div>
                <div className="shrink-0 mb-1">
                  {inputText.trim() ? (
                    <button 
                      onClick={handleSendMessage}
                      className="w-[54px] h-[54px] bg-[#3390ec] rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all shadow-lg shadow-[#3390ec]/20"
                    >
                      <Send className="w-6 h-6 ml-0.5" />
                    </button>
                  ) : (
                    <button className="w-[54px] h-[54px] bg-[#3390ec] rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all shadow-lg shadow-[#3390ec]/20">
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 select-none relative">
            <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-[0.02] pointer-events-none"></div>
            <div className="w-40 h-40 bg-[#212121] rounded-full flex items-center justify-center mb-8 shadow-2xl border border-white/5">
              <svg viewBox="0 0 24 24" className="w-20 h-20 text-[#3390ec] fill-current opacity-80">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.34-.14 1.1-.55 1.47-.94 1.51-.85.08-1.5-.56-2.32-1.09-1.28-.84-2-1.36-3.25-2.19-1.44-.96-.51-1.49.31-2.45.22-.25 3.96-3.62 4.03-3.94.01-.04.01-.19-.08-.27-.09-.08-.22-.05-.32-.03-.14.03-2.35 1.49-6.64 4.39-.63.43-1.2.64-1.72.63-.57-.01-1.67-.32-2.48-.59-.99-.33-1.78-.5-1.71-1.06.04-.29.42-.59 1.14-.9 4.44-1.93 7.4-3.2 8.88-3.81 4.22-1.73 5.1-2.03 5.67-2.04.13 0 .41.03.59.18.15.12.2.29.22.41.02.08.03.23.02.36z" />
              </svg>
            </div>
            <h2 className="text-[22px] font-black mb-3 tracking-tight">Select a chat to start messaging</h2>
            <p className="text-[#aaaaaa] max-w-[280px] text-[15px] leading-relaxed font-medium">Choose a contact from the left menu to begin a secure conversation monitored by SocialShield AI.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramClone;
