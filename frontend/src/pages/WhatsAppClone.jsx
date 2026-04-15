import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MoreVertical, Phone, Video, Paperclip, 
  Smile, Send, Mic, ShieldAlert, ShieldCheck, 
  Check, CheckCheck, User, ArrowLeft, Camera, 
  MoreHorizontal, MessageSquare, Users, Filter, Plus,
  AlertTriangle, Info, Shield, ShieldQuestion,
  PhoneCall, CircleDashed, LayoutDashboard, Settings,
  MessageCircle, Star, Trash2, Archive, Pin, X, Download,
  ChevronLeft, ChevronRight, BellOff, Copy, Monitor, CheckCircle2,
  PhoneIncoming, Radio, Image as ImageIcon, MapPin, AtSign, FileText,
  Key, Lock, HelpCircle, Globe, Database, Bell, QrCode, LogOut
} from 'lucide-react';
import { checkWhatsAppNumber, reportWhatsAppNumber, fetchWhatsAppChats, fetchWhatsAppMessages, sendWhatsAppMessage, detectTelegramScam } from '../api/api';
import { useSocket } from '../context/SocketContext';

const WhatsAppClone = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleLogout = () => {
    // Clear any local storage related to session
    localStorage.removeItem('whatsapp_session');
    // Navigate back to login
    navigate('/whatsapp/login');
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [numberInfo, setNumberInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [securityDetails, setSecurityDetails] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  
  // WhatsApp Status (Stories) State
  const [statuses, setStatuses] = useState([]);
  const [activeStatusUserIndex, setActiveStatusUserIndex] = useState(null);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  const [statusProgress, setStatusProgress] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Use the first seeded user as currentUserId for demo consistency
  const currentUserId = "60b0f1b2c3d4e5f6a7b8c901"; // Placeholder that will be updated by loadChats
  const currentUserName = "Rohit Gupta";

  const downloadMedia = async (url, filename = 'whatsapp_media.jpg') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadChats();
      await loadStatuses();
      // Force focus on the first scam chat for demo
      setActiveTab('chats');
    };
    init();
  }, []);

  const loadStatuses = () => {
    // Mock WhatsApp statuses using unique human names
    const statusNames = [
      'Aryan Gupta', 'Isha Patel', 'Siddharth Sharma', 'Ananya Iyer', 
      'Vikram Malhotra', 'Kavya Reddy', 'Rohan Verma', 'Meera Kapoor'
    ];

    const mockStatuses = statusNames.map((name, idx) => ({
      user: { 
        _id: `u_status_${idx}`, 
        username: name.toLowerCase().replace(' ', '_'), 
        fullName: name, 
        profilePicture: `https://i.pravatar.cc/150?u=status_${name.replace(' ', '')}` 
      },
      items: [
        { _id: `s_${idx}_1`, url: `https://picsum.photos/seed/wa_status_${idx}_1/500/800`, type: 'image', time: `${9 + idx}:00 AM` },
        { _id: `s_${idx}_2`, url: `https://picsum.photos/seed/wa_status_${idx}_2/500/800`, type: 'image', time: `${10 + idx}:30 AM` }
      ].slice(0, (idx % 2) + 1)
    }));

    // Add current user status at the beginning
    const myStatus = {
      user: { _id: currentUserId, username: 'rohit_gupta', fullName: 'Rohit Gupta', profilePicture: `https://i.pravatar.cc/150?u=${currentUserName}` },
      items: [
        { _id: 'my_s1', url: 'https://picsum.photos/seed/my_wa_status/500/800', type: 'image', time: 'Just now' }
      ]
    };

    setStatuses([myStatus, ...mockStatuses]);
  };

  // Status Viewer Timer Logic
  useEffect(() => {
    let timer;
    if (activeStatusUserIndex !== null) {
      setStatusProgress(0);
      timer = setInterval(() => {
        setStatusProgress(prev => {
          if (prev >= 100) {
            handleNextStatus();
            return 0;
          }
          return prev + 1.5;
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [activeStatusUserIndex, activeStatusIndex]);

  const handleNextStatus = () => {
    if (activeStatusUserIndex === null) return;
    
    const currentUserStatuses = statuses[activeStatusUserIndex].items;
    if (activeStatusIndex < currentUserStatuses.length - 1) {
      setActiveStatusIndex(prev => prev + 1);
    } else if (activeStatusUserIndex < statuses.length - 1) {
      setActiveStatusUserIndex(prev => prev + 1);
      setActiveStatusIndex(0);
    } else {
      setActiveStatusUserIndex(null);
      setActiveStatusIndex(0);
    }
  };

  const handlePrevStatus = () => {
    if (activeStatusUserIndex === null) return;

    if (activeStatusIndex > 0) {
      setActiveStatusIndex(prev => prev - 1);
    } else if (activeStatusUserIndex > 0) {
      const prevUserStatuses = statuses[activeStatusUserIndex - 1].items;
      setActiveStatusUserIndex(prev => prev - 1);
      setActiveStatusIndex(prevUserStatuses.length - 1);
    } else {
      setActiveStatusIndex(0);
    }
  };

  useEffect(() => {
    const handleStatusKeyDown = (e) => {
      if (activeStatusUserIndex !== null) {
        if (e.key === 'ArrowRight') handleNextStatus();
        if (e.key === 'ArrowLeft') handlePrevStatus();
        if (e.key === 'Escape') setActiveStatusUserIndex(null);
      }
    };
    window.addEventListener('keydown', handleStatusKeyDown);
    return () => window.removeEventListener('keydown', handleStatusKeyDown);
  }, [activeStatusUserIndex, activeStatusIndex, statuses]);

  const loadChats = async () => {
    try {
      // 50 unique names, no repetitions, matching screenshot for first 8
      const humanNames = [
        'WhatsApp Security', 'Amazon Rewards', 'Crypto Expert', 'Job Opportunity', 'Bank Alert',
        'Customs Dept', 'Instagram Help', 'Family Member', 'Lucky Draw', 'Refund Support',
        'Maya Kasuma', 'Jio Care', 'Myntra Support', 'Amazon Help',
        'Big Bakes', 'Dario De Luca', 'Anika Chavan', 
        'Alice Whitman', 'London Crew', 'Anna Soe', 'Sofia Hidalgo',
        'Aryan Gupta', 'Isha Patel', 'Siddharth Sharma', 'Ananya Iyer', 
        'Vikram Malhotra', 'Kavya Reddy', 'Rohan Verma', 'Meera Kapoor', 
        'Arjun Singh', 'Saira Khan', 'Aditya Joshi', 'Zoya Ahmed', 
        'Kabir Das', 'Diya Menon', 'Ranveer Singh', 'Kiara Advani',
        'Akshay Kumar', 'Priyanka Chopra', 'Hrithik Roshan', 'Deepika Padukone',
        'Shah Rukh Khan', 'Alia Bhatt', 'Aamir Khan', 'Kareena Kapoor',
        'Salman Khan', 'Anushka Sharma', 'Varun Dhawan', 'Sara Ali Khan',
        'Kartik Aaryan', 'Janhvi Kapoor', 'Ayushmann Khurrana', 'Kriti Sanon',
        'Rajkummar Rao', 'Taapsee Pannu', 'Vicky Kaushal', 'Bhumi Pednekar',
        'Ranbir Kapoor', 'Shraddha Kapoor', 'Tiger Shroff', 'Disha Patani',
        'Ishaan Khatter', 'Tara Sutaria', 'Siddhant Chaturvedi', 'Ananya Panday',
        'Ishita Dutta', 'Vatsal Sheth', 'Gurmeet Choudhary', 'Debina Bonnerjee',
        'Shoaib Ibrahim', 'Dipika Kakar', 'Ravi Dubey', 'Sargun Mehta',
        'Abhinav Shukla', 'Rubina Dilaik', 'Aly Goni', 'Jasmin Bhasin',
        'Prince Narula', 'Yuvika Chaudhary', 'Karan Kundrra', 'Tejasswi Prakash'
      ];

      const sampleMessages = [
        'Welcome to WhatsApp!',
        'Your plan is expiring soon.',
        'Your order has been delivered.',
        'How can we help you today?',
        'Yes that\'s my fave too!',
        'Staša Benko: [Photo]',
        'Honestly this sourdough starter.',
        'Are you coming today?',
        'typing...',
        'Mo: @Chris R joining us?',
        'Sorry I couldn\'t hear you.',
        'This is the most up-to-date file.',
        'Can you send me the invoice?',
        'I\'ll be there in 5 mins.',
        'The project is looking great!',
        'Let\'s catch up later.',
        'Did you get the email?',
        'Happy Friday!',
        'The weather is so nice today.',
        'Check out this cool link.',
        'I\'m on my way.',
        'Where should we eat?',
        'Thanks for the heads up.',
        'Let\'s schedule a meeting.',
        'Great job on the presentation!',
        'I\'ll call you back.',
        'Can you help me with this?',
        'See you soon!',
        'How was your weekend?',
        'I\'m excited for the trip!',
        'Don\'t forget the documents.',
        'I\'ll send the files tonight.',
        'Lunch tomorrow at 1?',
        'Nice meeting you!',
        'Can you believe it?',
        'I\'m feeling much better.',
        'What are your plans?',
        'See you at the office.',
        'I\'m running a bit late.',
        'The photos look amazing.',
        'Thanks for the help!',
        'I\'ll be home by 8.',
        'Let\'s go for a run.',
        'I\'m so proud of you.',
        'Have a safe flight!',
        'Let me know if you need anything.',
        'Talk to you later!',
        'I\'m almost there.',
        'Wait for me.',
        'Which restaurant?',
        'Is it raining?',
        'I\'ll call you.',
        'Good luck!',
        'Check this out.'
      ];

      const generatedChats = humanNames.map((name, idx) => {
        let lastMsg = idx < sampleMessages.length ? sampleMessages[idx] : `Message ${idx + 1}`;
        if (name === 'WhatsApp Security') {
          lastMsg = "Your account is at risk! Please share the OTP sent to your phone immediately.";
        } else if (name === 'Amazon Rewards') {
          lastMsg = "CONGRATULATIONS! You've won a $1,000 gift card. Click to claim!";
        } else if (name === 'Crypto Expert') {
          lastMsg = "Double your Bitcoin in 24 hours! 100% guaranteed profit.";
        } else if (name === 'Job Opportunity') {
          lastMsg = "Earn $500/day working from home. DM for details.";
        } else if (name === 'Bank Alert') {
          lastMsg = "Your account has been suspended. Please verify your identity.";
        }
        const isGroup = name === 'Big Bakes' || name === 'London Crew';
        
        // Exact screenshot values for users, adjusted for 4 new initial users
        const unreadMap = { 0: 1, 7: 1, 9: 2, 11: 4 };
        const timeMap = { 0: '14:30', 1: '14:25', 2: '14:20', 3: '14:18', 4: 'Yesterday', 5: '14:15', 6: '13:54', 7: '12:18', 8: '12:06', 9: '10:34', 10: '9:24', 11: '8:55' };
        
        return {
          _id: `chat_${idx}`,
          isGroupChat: isGroup,
          fullName: name,
          participants: [
            { _id: currentUserId, username: 'rohit_gupta', fullName: currentUserName },
            { 
              _id: `user_${idx}`, 
              username: name.toLowerCase().replace(' ', '_'), 
              fullName: name,
              profilePicture: idx === 0 ? 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' : 
                              idx === 1 ? 'https://upload.wikimedia.org/wikipedia/commons/5/50/Reliance_Jio_Logo.svg' :
                              idx === 2 ? 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png' :
                              idx === 3 ? 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' :
                              idx === 5 ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=150&h=150&auto=format&fit=crop' : 
                              `https://i.pravatar.cc/150?u=wa_user_${name.replace(' ', '')}`,
              isVerified: idx < 4 || idx === 5 || idx === 9
            }
          ],
          lastMessage: {
            text: lastMsg,
            createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
            sender: `user_${idx}`,
            status: (idx === 2 || idx === 6) ? 'seen' : 'delivered'
          },
          unreadCount: unreadMap[idx] || 0,
          isPinned: idx === 0,
          hasAtMention: idx === 5,
          hasFileIcon: idx === 7,
          hasVideoCallIcon: idx === 2,
          timeLabel: timeMap[idx] || 'Yesterday'
        };
      });

      setChats(generatedChats);
      // Force 'WhatsApp Security' to be active for the scam demo
      setActiveChat(generatedChats[0]._id);
      setActiveTab('chats'); 
    } catch (err) {
      console.error('WhatsApp: Failed to load chats:', err);
    }
  };

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      const chat = chats.find(c => c._id === activeChat);
      if (chat && chat.participants) {
        // Find the "other" person to show their info (not user1)
        const otherParticipant = chat.participants.find(p => p.username !== 'user1') || chat.participants[0];
        if (otherParticipant && otherParticipant.phoneNumber) {
          fetchNumberInfo(otherParticipant.phoneNumber);
        }
      }
      if (socket) {
        socket.emit('join_chat', { room: activeChat });
      }
    }
  }, [activeChat, socket, chats]);

  const loadMessages = async (chatId) => {
    try {
      const chat = chats.find(c => c._id === chatId);
      if (!chat) return;

      // Check localStorage first
      const allSaved = localStorage.getItem('wa_clone_messages') ? JSON.parse(localStorage.getItem('wa_clone_messages')) : {};
      if (allSaved[chatId]) {
        setMessages(allSaved[chatId]);
        return;
      }

      const isBigBakes = chat.fullName === 'Big Bakes';
      const isFakeSupport = chat.fullName === 'WhatsApp Security';
      const isAmazonScam = chat.fullName === 'Amazon Rewards';
      const isCryptoScam = chat.fullName === 'Crypto Expert';
      const isJobScam = chat.fullName === 'Job Opportunity';
      const isBankScam = chat.fullName === 'Bank Alert';
      const isCustomsScam = chat.fullName === 'Customs Dept';
      const isInstaScam = chat.fullName === 'Instagram Help';
      const isFamilyScam = chat.fullName === 'Family Member';
      const isLuckyScam = chat.fullName === 'Lucky Draw';
      const isRefundScam = chat.fullName === 'Refund Support';

      if (isFakeSupport) {
        setMessages([
          {
            _id: 'm_scam_1',
            text: 'Hello, I\'m from WhatsApp support. We noticed suspicious activity on your account.',
            sender: { _id: 'user_0', fullName: 'WhatsApp Security' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: false, riskScore: 10, flags: [] }
          },
          {
            _id: 'm_scam_2',
            text: 'Oh, what kind of activity?',
            sender: { _id: currentUserId, fullName: 'Rohit Gupta' },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            status: 'seen'
          },
          {
            _id: 'm_scam_3',
            text: 'Someone from Russia tried to login. To secure your account, we sent an OTP to your phone. Please share it here immediately.',
            sender: { _id: 'user_0', fullName: 'WhatsApp Security' },
            createdAt: new Date(Date.now() - 3400000).toISOString(),
            status: 'seen',
            aiAnalysis: { 
              isScam: true, 
              riskScore: 90, 
              recommendation: "High risk! This user is asking for an OTP. Never share your OTP with anyone.",
              classification: 'Scam',
              flags: ['OTP Request', 'Urgency / Pressure'] 
            }
          },
          {
            _id: 'm_scam_4',
            text: 'I haven\'t received any code.',
            sender: { _id: currentUserId, fullName: 'Rohit Gupta' },
            createdAt: new Date(Date.now() - 3300000).toISOString(),
            status: 'seen'
          },
          {
            _id: 'm_scam_5',
            text: 'Check your SMS again. It is urgent or your account will be suspended within 24 hours.',
            sender: { _id: 'user_0', fullName: 'WhatsApp Security' },
            createdAt: new Date(Date.now() - 3200000).toISOString(),
            status: 'seen',
            aiAnalysis: { 
              isScam: true, 
              riskScore: 85, 
              recommendation: "Suspicious activity detected! Do not share any details.",
              classification: 'Scam',
              flags: ['Urgency / Pressure', 'Account Suspension Threat'] 
            }
          }
        ]);
        return;
      }

      if (isCustomsScam) {
        setMessages([
          {
            _id: 'm_customs_1',
            text: 'Hello, this is the Customs Department. A package addressed to you has been intercepted.',
            sender: { _id: 'user_customs', fullName: 'Customs Dept' },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 65, flags: ['Ecommerce'], recommendation: "Government departments don't use WhatsApp for duty notifications." }
          },
          {
            _id: 'm_customs_2',
            text: 'To release the package, you must pay a customs duty of $150 immediately.',
            sender: { _id: 'user_customs', fullName: 'Customs Dept' },
            createdAt: new Date(Date.now() - 7100000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 80, flags: ['Ecommerce', 'Payment Request'] }
          }
        ]);
        return;
      }

      if (isInstaScam) {
        setMessages([
          {
            _id: 'm_insta_1',
            text: 'Your Instagram account is scheduled for deletion due to a copyright violation.',
            sender: { _id: 'user_insta', fullName: 'Instagram Help' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 70, flags: ['Phishing'], recommendation: "Official support will only contact you via email or in-app notifications." }
          }
        ]);
        return;
      }

      if (isFamilyScam) {
        setMessages([
          {
            _id: 'm_fam_1',
            text: 'Hi, it\'s me. I lost my phone and I\'m using a friend\'s number. I\'m in a bit of trouble and need money.',
            sender: { _id: 'user_fam', fullName: 'Family Member' },
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 90, flags: ['Impersonation', 'Urgency'], recommendation: "Call your family member on their known number to verify." }
          }
        ]);
        return;
      }

      if (isLuckyScam) {
        setMessages([
          {
            _id: 'm_lucky_1',
            text: 'CONGRATS! Your mobile number has won $5,000,000 in our Global Lucky Draw!',
            sender: { _id: 'user_lucky', fullName: 'Lucky Draw' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 95, flags: ['Lottery / Prize'], recommendation: "If it sounds too good to be true, it's a scam." }
          }
        ]);
        return;
      }

      if (isRefundScam) {
        setMessages([
          {
            _id: 'm_refund_1',
            text: 'We are processing your tax refund of $450. Please click to verify your bank account details.',
            sender: { _id: 'user_refund', fullName: 'Refund Support' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 85, flags: ['Govt Fraud', 'Phishing Link'], recommendation: "Never share banking info via links in messages." }
          }
        ]);
        return;
      }

      if (isAmazonScam) {
        setMessages([
          {
            _id: 'm_amazon_1',
            text: 'CONGRATULATIONS! You have been selected as our lucky winner for today!',
            sender: { _id: 'user_1', fullName: 'Amazon Rewards' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 75, flags: ['Lottery / Prize'], recommendation: "Be careful! Unsolicited prize notifications are common scams." }
          },
          {
            _id: 'm_amazon_2',
            text: 'You have won an Amazon Gift Card worth $1,000.',
            sender: { _id: 'user_1', fullName: 'Amazon Rewards' },
            createdAt: new Date(Date.now() - 3550000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 80, flags: ['Lottery / Prize'] }
          },
          {
            _id: 'm_amazon_3',
            text: 'To claim your reward, simply visit: http://amazon-gift-win.net/claim and enter your login details to verify.',
            sender: { _id: 'user_1', fullName: 'Amazon Rewards' },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            status: 'seen',
            aiAnalysis: { 
              isScam: true, 
              riskScore: 95, 
              flags: ['Phishing Link', 'Lottery / Prize'],
              recommendation: "This is a phishing link. Do not enter your login details on this website."
            }
          }
        ]);
        return;
      }

      if (isCryptoScam) {
        setMessages([
          {
            _id: 'm_crypto_1',
            text: 'Hey! Are you interested in doubling your money in just 24 hours?',
            sender: { _id: 'user_2', fullName: 'Crypto Expert' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 60, flags: ['Crypto Fraud'], recommendation: "Guaranteed high returns are a major red flag for crypto scams." }
          },
          {
            _id: 'm_crypto_2',
            text: 'I have an AI bot that exploits Bitcoin price differences. 100% legit profit daily.',
            sender: { _id: 'user_2', fullName: 'Crypto Expert' },
            createdAt: new Date(Date.now() - 3550000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 85, flags: ['Crypto Fraud', 'Investment Scam'] }
          },
          {
            _id: 'm_crypto_3',
            text: 'Just send 0.01 BTC to this wallet and you will get 0.02 BTC back by tomorrow.',
            sender: { _id: 'user_2', fullName: 'Crypto Expert' },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 90, flags: ['Crypto Fraud'], recommendation: "Never send cryptocurrency to someone promising to double it." }
          }
        ]);
        return;
      }

      if (isJobScam) {
        setMessages([
          {
            _id: 'm_job_1',
            text: 'Hello! We are hiring for a remote work-from-home position. No experience needed.',
            sender: { _id: 'user_3', fullName: 'Job Opportunity' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 50, flags: ['Fake Job'], recommendation: "Remote jobs that require no experience and pay high are often scams." }
          },
          {
            _id: 'm_job_2',
            text: 'You can earn up to $500 per day just by liking YouTube videos.',
            sender: { _id: 'user_3', fullName: 'Job Opportunity' },
            createdAt: new Date(Date.now() - 3550000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 80, flags: ['Fake Job'] }
          },
          {
            _id: 'm_job_3',
            text: 'To start, please pay a $50 registration fee to our HR manager via UPI.',
            sender: { _id: 'user_3', fullName: 'Job Opportunity' },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 95, flags: ['Fake Job', 'Payment Request'], recommendation: "Legitimate jobs never ask for a registration fee." }
          }
        ]);
        return;
      }

      if (isBankScam) {
        setMessages([
          {
            _id: 'm_bank_1',
            text: 'Dear Customer, your bank account has been temporarily suspended due to a security update.',
            sender: { _id: 'user_4', fullName: 'Bank Alert' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 70, flags: ['Bank Fraud', 'Urgency / Pressure'], recommendation: "Banks will never notify you of suspension via WhatsApp." }
          },
          {
            _id: 'm_bank_2',
            text: 'Please click here to verify your KYC immediately: http://your-bank-kyc-verify.com',
            sender: { _id: 'user_4', fullName: 'Bank Alert' },
            createdAt: new Date(Date.now() - 3550000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 90, flags: ['Bank Fraud', 'Phishing Link'] }
          },
          {
            _id: 'm_bank_3',
            text: 'Failure to comply will lead to permanent account closure.',
            sender: { _id: 'user_4', fullName: 'Bank Alert' },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            status: 'seen',
            aiAnalysis: { isScam: true, riskScore: 85, flags: ['Bank Fraud', 'Urgency / Pressure'] }
          }
        ]);
        return;
      }

      if (isBigBakes) {
        setMessages([
          {
            _id: 'm1',
            text: 'Oh yumm!',
            sender: { _id: 'user_4', fullName: 'Alice Whitman', color: '#9333ea' },
            createdAt: '2023-10-19T12:52:00Z',
            status: 'seen'
          },
          {
            _id: 'm2',
            text: 'Those look great.',
            sender: { _id: 'user_4', fullName: 'Alice Whitman', color: '#9333ea' },
            createdAt: '2023-10-19T12:52:00Z',
            status: 'seen'
          },
          {
            _id: 'm3',
            text: 'Hey folks. 15th July, Big Marlow Bake Off - Don\'t forget!',
            sender: { _id: currentUserId, fullName: 'Rohit Gupta' },
            createdAt: '2023-10-19T14:02:00Z',
            status: 'seen'
          },
          {
            _id: 'm4',
            text: 'Who\'s going? What are you all baking?',
            sender: { _id: 'user_6', fullName: 'Anna Soe', color: '#16a34a' },
            createdAt: '2023-10-19T14:14:00Z',
            status: 'seen'
          },
          {
            _id: 'm5',
            text: 'Definitely! I\'m making an apricot couronne.',
            sender: { _id: 'user_group_member_1', fullName: 'Staša Benko', color: '#2563eb' },
            createdAt: '2023-10-19T14:15:00Z',
            status: 'seen'
          },
          {
            _id: 'm6',
            text: '',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop',
            sender: { _id: 'user_group_member_1', fullName: 'Staša Benko', color: '#2563eb' },
            createdAt: '2023-10-19T14:15:00Z',
            status: 'seen'
          }
        ]);
        return;
      }

      // Generate a unique history for each chat
      const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
      setMessages([
        {
          _id: 'm_start',
          text: `Hey Rohit! This is ${otherParticipant.fullName}.`,
          sender: { _id: otherParticipant._id, fullName: otherParticipant.fullName },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'seen'
        },
        {
          _id: 'm_reply',
          text: `Hi ${otherParticipant.fullName}, how are you?`,
          sender: { _id: 'user_current', fullName: 'Rohit Gupta' },
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          status: 'seen'
        },
        {
          _id: 'm_last',
          text: chat.lastMessage.text,
          sender: { _id: otherParticipant._id, fullName: otherParticipant.fullName },
          createdAt: chat.lastMessage.createdAt,
          status: 'seen'
        }
      ]);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const fetchNumberInfo = async (number) => {
    setLoading(true);
    try {
      const cleanNumber = number.replace(/[^\d+]/g, '');
      const { data } = await checkWhatsAppNumber(cleanNumber);
      setNumberInfo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', async (data) => {
      console.log('WhatsApp: Received message socket event:', data);
      
      let finalMsg = data;
      // Real-time AI Scan for incoming messages
      if (data.sender?._id !== currentUserId && data.text) {
        try {
          const analysisRes = await detectTelegramScam(data.text);
          finalMsg = { ...data, aiAnalysis: analysisRes.data };
        } catch (e) {}
      }

      if (data.chat === activeChat || data.chatId === activeChat) {
        setMessages(prev => [...prev, finalMsg]);
      }
      // Always refresh chat list to update last message preview in sidebar
      loadChats();
    });

    socket.on('user_typing', (data) => {
      if (data.chat === activeChat && data.user !== currentUserId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket, activeChat]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && activeChat) {
      setAnalyzingImage(true);
      setImageAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('screenshot', file);

      try {
        const { data } = await apiAnalyzeScreenshot(formData);
        if (data.success) {
          const analysis = {
            isScam: data.analysis.risk === 'High',
            riskScore: data.analysis.score,
            recommendation: data.analysis.risk === 'High' 
              ? "High risk image! OCR detected scam patterns in this image. Be extremely careful."
              : "Low risk image. No suspicious text detected.",
            classification: data.analysis.risk,
            flags: data.analysis.flags
          };

          const newMessage = {
            _id: Date.now().toString(),
            text: data.extractedText,
            imageUrl: URL.createObjectURL(file),
            sender: { _id: currentUserId, fullName: currentUserName },
            createdAt: new Date().toISOString(),
            status: 'delivered',
            aiAnalysis: analysis
          };

          const updatedMessages = [...messages, newMessage];
          setMessages(updatedMessages);
          saveMessagesToLocal(activeChat, updatedMessages);
          
          setImageAnalysisResult(analysis);
          setShowSecurityModal(true);
          setSecurityDetails({
            riskScore: analysis.riskScore / 10,
            redFlags: analysis.flags,
            recommendation: analysis.recommendation
          });
        }
      } catch (err) {
        console.error("Failed to analyze image:", err);
      } finally {
        setAnalyzingImage(false);
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChat) return;
    
    const newMessage = {
      _id: Date.now().toString(),
      text: inputText,
      sender: { _id: currentUserId, fullName: currentUserName },
      createdAt: new Date().toISOString(),
      status: 'delivered'
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessagesToLocal(activeChat, updatedMessages);
    setInputText('');

    // Update the last message in the chat list
    setChats(prevChats => prevChats.map(chat => {
      if (chat._id === activeChat) {
        return {
          ...chat,
          lastMessage: {
            text: inputText,
            createdAt: newMessage.createdAt,
            sender: currentUserId,
            status: 'delivered'
          },
          timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        };
      }
      return chat;
    }));

    // Simulation of Real-time interaction
    // 1. Mark as seen after 1.5 seconds
    setTimeout(() => {
      setMessages(prev => {
        const updated = prev.map(m => m._id === newMessage._id ? { ...m, status: 'seen' } : m);
        saveMessagesToLocal(activeChat, updated);
        return updated;
      });
    }, 1500);

    // 2. Show "typing..." indicator after 2 seconds
    setTimeout(() => {
      setIsTyping(true);
      // Update sidebar preview to "typing..."
      setChats(prevChats => prevChats.map(c => {
        if (c._id === activeChat) {
          return {
            ...c,
            lastMessage: {
              ...c.lastMessage,
              text: 'typing...'
            }
          };
        }
        return c;
      }));
    }, 2000);

    // 3. Mock auto-reply after 4.5 seconds
    setTimeout(() => {
      const chat = chats.find(c => c._id === activeChat);
      if (!chat) return;
      const otherParticipant = chat.participants.find(p => p._id !== currentUserId);
      
      const replies = [
        "That's interesting!",
        "Okay, I'll let you know.",
        "Got it, thanks!",
        "Can we talk about this tomorrow?",
        "I'm not sure about that.",
        "Yes, absolutely!",
        "Haha, nice one!",
        "Let me check and get back to you.",
        "What do you think?",
        "I'll be there in 10 minutes.",
        "That sounds like a plan!",
        "I'm busy right now, talk later?",
        "Can you send me more details?",
        "I'm on my way!",
        "Let's do it!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg = {
        _id: (Date.now() + 1).toString(),
        text: randomReply,
        sender: { _id: otherParticipant._id, fullName: otherParticipant.fullName },
        createdAt: new Date().toISOString(),
        status: 'seen'
      };

      setMessages(prev => {
        const updated = [...prev, replyMsg];
        saveMessagesToLocal(activeChat, updated);
        return updated;
      });
      setIsTyping(false);

      // Update sidebar with the new reply
      setChats(prevChats => prevChats.map(c => {
        if (c._id === activeChat) {
          return {
            ...c,
            lastMessage: {
              text: randomReply,
              createdAt: replyMsg.createdAt,
              sender: otherParticipant._id,
              status: 'seen'
            },
            timeLabel: 'Just now'
          };
        }
        return c;
      }));
    }, 4500);
  };

  const saveMessagesToLocal = (chatId, msgs) => {
    try {
      const allSaved = localStorage.getItem('wa_clone_messages') ? JSON.parse(localStorage.getItem('wa_clone_messages')) : {};
      allSaved[chatId] = msgs;
      localStorage.setItem('wa_clone_messages', JSON.stringify(allSaved));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (socket && activeChat) {
      socket.emit('typing', { chat: activeChat, user: currentUserId });
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentChat = chats.find(c => c._id === activeChat);
  const otherParticipant = currentChat?.participants.find(p => p._id !== currentUserId);

  const WhatsAppStatusViewer = () => {
    if (activeStatusUserIndex === null || !statuses[activeStatusUserIndex]) return null;
    const currentUserStatuses = statuses[activeStatusUserIndex].items;
    const currentStatus = currentUserStatuses[activeStatusIndex];
    const user = statuses[activeStatusUserIndex].user;

    return (
      <div className="fixed inset-0 bg-[#0b141a] z-[200] flex items-center justify-center">
        {/* Progress Bars - Fixed to top edge */}
        <div className="absolute top-0 left-0 right-0 px-1 pt-1.5 flex gap-1 z-[210]">
          {currentUserStatuses.map((_, idx) => (
            <div key={idx} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-linear"
                style={{ 
                  width: idx < activeStatusIndex ? '100%' : idx === activeStatusIndex ? `${statusProgress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Status Header & Controls - Higher z-index to stay above tap areas */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[250]">
          <div className="flex items-center gap-3">
            <img 
              src={user.profilePicture} 
              className="w-10 h-10 rounded-full border border-white/20 shadow-md" 
              alt="" 
            />
            <div className="flex flex-col">
              <span className="text-white text-[15px] font-bold shadow-sm">{user.username}</span>
              <span className="text-white/60 text-[11px] shadow-sm">{currentStatus.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                downloadMedia(currentStatus.url, `status_${user.username}_${currentStatus._id}.jpg`);
              }}
              className="text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-all cursor-pointer z-[260]"
              title="Save (Download)"
            >
              <Download className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveStatusUserIndex(null);
              }}
              className="text-white/80 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-all cursor-pointer z-[260]"
              title="Cancel (Close)"
            >
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Main Status Image */}
        <div className="w-full h-full max-w-[500px] relative flex items-center justify-center">
          <img 
            src={currentStatus.url} 
            className="w-full h-full object-contain select-none shadow-2xl" 
            alt="" 
          />
          
          {/* Navigation Buttons (Circular as requested) */}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevStatus(); }}
            className="absolute left-4 md:left-[-80px] top-1/2 -translate-y-1/2 bg-[#202c33]/60 hover:bg-[#374248] p-3.5 rounded-full transition-all group z-[220] shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft className="text-white w-6 h-6 md:w-8 md:h-8 group-active:scale-90 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextStatus(); }}
            className="absolute right-4 md:right-[-80px] top-1/2 -translate-y-1/2 bg-[#202c33]/60 hover:bg-[#374248] p-3.5 rounded-full transition-all group z-[220] shadow-lg backdrop-blur-sm"
          >
            <ChevronRight className="text-white w-6 h-6 md:w-8 md:h-8 group-active:scale-90 transition-transform" />
          </button>

          {/* Tap Areas */}
          <div className="absolute inset-0 flex z-[215]">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStatus}></div>
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStatus}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#111b21] overflow-hidden selection:bg-[#00a884]/20 font-sans relative">
      <WhatsAppStatusViewer />
      
      {/* Narrow Left Sidebar (Web Only) */}
      {!isMobile && (
        <div className="w-[60px] flex flex-col items-center py-4 bg-[#f0f2f5] dark:bg-[#202c33] border-r border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col gap-6 items-center flex-1">
            <div 
              onClick={() => setActiveTab('chats')}
              className={`relative group cursor-pointer p-2 rounded-lg transition-colors ${activeTab === 'chats' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <MessageSquare className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
              <span className="absolute -top-1 -right-1 bg-[#25d366] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">3</span>
            </div>
            <div 
              onClick={() => setActiveTab('calls')}
              className={`cursor-pointer p-2 rounded-lg transition-colors ${activeTab === 'calls' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Phone className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
            </div>
            <div 
              onClick={() => setActiveTab('status')}
              className={`cursor-pointer p-2 rounded-lg transition-colors ${activeTab === 'status' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <CircleDashed className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
            </div>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <div className="cursor-pointer p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Radio className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
            </div>
            <div 
              onClick={() => setActiveTab('communities')}
              className={`cursor-pointer p-2 rounded-lg transition-colors ${activeTab === 'communities' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Users className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
            </div>
            <div className="cursor-pointer p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mt-4">
              <div className="w-6 h-6 rounded-full border-2 border-slate-400 dark:border-[#aebac1] flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-tr from-[#3b82f6] to-[#9333ea] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center mb-2">
            <div 
              onClick={() => setActiveTab('settings')}
              className={`cursor-pointer p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Settings className="w-6 h-6 text-slate-600 dark:text-[#aebac1]" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity">
              <img 
                src={`https://i.pravatar.cc/150?u=${currentUserName}`} 
                alt={currentUserName} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Sidebar (Chat List) */}
      <div className={`${isMobile ? (activeChat ? 'hidden' : 'w-full') : 'w-[30%] min-w-[350px]'} border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#111b21] transition-all duration-300`}>
        {/* Android Top Bar (Mobile) */}
        {isMobile && (
          <div className="bg-[#075E54] text-white p-4 pb-0 flex flex-col gap-4 shadow-md z-20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <h1 className="text-[20px] font-bold tracking-wide">WhatsApp</h1>
              <div className="flex items-center gap-6">
                <Camera className="w-5 h-5 opacity-90 cursor-pointer hover:opacity-100" />
                <Search className="w-5 h-5 opacity-90 cursor-pointer hover:opacity-100" />
                <MoreVertical className="w-5 h-5 opacity-90 cursor-pointer hover:opacity-100" />
              </div>
            </div>
            {/* Android Tabs (Flutter Style) */}
            <div className="flex w-full mt-2 relative">
              <button onClick={() => setActiveTab('communities')} className={`flex-1 py-3 text-sm font-bold uppercase transition-all flex items-center justify-center ${activeTab === 'communities' ? 'opacity-100' : 'opacity-70'}`}>
                <Users className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab('chats')} className={`flex-[3] py-3 text-sm font-bold uppercase transition-all ${activeTab === 'chats' ? 'opacity-100' : 'opacity-70'}`}>
                CHATS
                {activeTab === 'chats' && <span className="ml-2 bg-white text-[#075E54] text-[10px] px-1.5 py-0.5 rounded-full">3</span>}
              </button>
              <button onClick={() => setActiveTab('status')} className={`flex-[3] py-3 text-sm font-bold uppercase transition-all ${activeTab === 'status' ? 'opacity-100' : 'opacity-70'}`}>
                STATUS
                {activeTab === 'status' && <span className="ml-2 w-2 h-2 bg-white rounded-full inline-block mb-0.5"></span>}
              </button>
              <button onClick={() => setActiveTab('calls')} className={`flex-[3] py-3 text-sm font-bold uppercase transition-all ${activeTab === 'calls' ? 'opacity-100' : 'opacity-70'}`}>
                CALLS
              </button>
              
              {/* Animated Tab Indicator */}
              <div 
                className="absolute bottom-0 h-[3px] bg-white transition-all duration-300 ease-in-out"
                style={{ 
                  left: activeTab === 'communities' ? '0%' : activeTab === 'chats' ? '10%' : activeTab === 'status' ? '40%' : '70%',
                  width: activeTab === 'communities' ? '10%' : '30%'
                }}
              />
            </div>
          </div>
        )}

        {/* Sidebar Header (Web Only) */}
        {!isMobile && (
          <div className="p-4 pb-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-[22px] font-bold dark:text-white">Chats</h1>
              <div className="flex items-center gap-4 text-slate-600 dark:text-[#aebac1]">
                <div className="p-2 hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="p-2 hover:bg-[#f0f2f5] dark:hover:bg-[#202c33] rounded-lg cursor-pointer transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#00a884] transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search or start a new chat" 
                className="w-full bg-[#f0f2f5] dark:bg-[#202c33] pl-10 pr-4 py-1.5 rounded-lg outline-none text-sm dark:text-white placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 items-center mb-2">
              <button className="px-4 py-1 rounded-full text-sm font-medium bg-[#dcf8c6] dark:bg-[#054739] text-[#00a884] dark:text-[#e9edef]">All</button>
              <button className="px-4 py-1 rounded-full text-sm font-medium bg-[#f0f2f5] dark:bg-[#202c33] text-slate-500 dark:text-[#8696a0] hover:bg-[#e9edef] dark:hover:bg-[#2a3942] transition-colors">Unread</button>
              <button className="px-4 py-1 rounded-full text-sm font-medium bg-[#f0f2f5] dark:bg-[#202c33] text-slate-500 dark:text-[#8696a0] hover:bg-[#e9edef] dark:hover:bg-[#2a3942] transition-colors">Favourites</button>
              <button className="px-4 py-1 rounded-full text-sm font-medium bg-[#f0f2f5] dark:bg-[#202c33] text-slate-500 dark:text-[#8696a0] hover:bg-[#e9edef] dark:hover:bg-[#2a3942] transition-colors">Groups</button>
            </div>
          </div>
        )}

        {/* Content based on Active Tab */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeTab === 'chats' ? (
            <div className="flex flex-col">
              {chats
                .filter(chat => chat.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((chat) => {
                const participant = chat.participants.find(p => p._id !== currentUserId);
                return (
                  <div 
                    key={chat._id}
                    onClick={() => setActiveChat(chat._id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors group"
                    style={{ backgroundColor: activeChat === chat._id && !isMobile ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#2a3942' : '#ebebeb') : '' }}
                  >
                    <div className="relative shrink-0">
                      <img src={participant?.profilePicture || 'https://via.placeholder.com/150'} alt={participant?.username} className="w-14 h-14 rounded-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-medium truncate dark:text-[#e9edef] text-[17px]">{chat.fullName}</h3>
                          {participant?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#00a884] fill-[#00a884] text-white" />}
                        </div>
                        <span className={`text-[12px] ${chat.unreadCount > 0 ? 'text-[#25d366] font-medium' : 'text-slate-500 dark:text-[#8696a0]'}`}>
                          {chat.timeLabel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-[14px] truncate flex items-center gap-1 ${chat.lastMessage?.text === 'typing...' ? 'text-[#25d366] font-medium' : 'text-slate-500 dark:text-[#8696a0]'}`}>
                          {chat.lastMessage?.sender === currentUserId && (
                            chat.lastMessage?.status === 'seen' ? <CheckCheck className="w-4 h-4 text-[#53bdeb]" /> : <CheckCheck className="w-4 h-4 text-slate-400" />
                          )}
                          {chat.fullName === 'Big Bakes' ? (
                            <span className="flex items-center gap-1.5"><span className="text-slate-700 font-medium dark:text-slate-300">Staša Benko:</span> <Camera className="w-3.5 h-3.5 text-slate-400" /> Photo</span>
                          ) : chat.lastMessage?.text === 'typing...' ? (
                            <span className="italic">typing...</span>
                          ) : (
                            <>
                              {chat.hasVideoCallIcon && (
                                <span className="flex items-center gap-1.5">
                                  <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                                  <Video className="w-3.5 h-3.5 text-slate-400" />
                                </span>
                              )}
                              {chat.hasFileIcon && <FileText className="w-3.5 h-3.5 text-slate-400" />}
                              {chat.fullName === 'Anna Soe' && <CheckCheck className="w-4 h-4 text-[#53bdeb]" />}
                              {chat.fullName === 'London Crew' ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="text-slate-700 font-medium dark:text-slate-300">Mo:</span> @Chris R joining us?
                                </span>
                              ) : chat.lastMessage?.text}
                            </>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          {chat.isPinned && <Pin className="w-3.5 h-3.5 text-slate-400 -rotate-45" />}
                          {chat.hasAtMention && (
                            <div className="w-5 h-5 flex items-center justify-center bg-[#25d366]/10 rounded-full">
                              <AtSign className="w-3 h-3 text-[#25d366]" />
                            </div>
                          )}
                          {chat.unreadCount > 0 && (
                            <span className="bg-[#25d366] text-white text-[11px] min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full font-bold">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'status' ? (
            <div className="p-4 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">
              <div className="p-4 flex items-center gap-4 bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors rounded-xl mb-4">
                <div className="relative">
                  <img src={`https://i.pravatar.cc/150?u=${currentUserName}`} className="w-14 h-14 rounded-full object-cover" alt="" />
                  <div className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-1 border-2 border-white dark:border-[#111b21]">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium dark:text-white text-lg">My Status</span>
                  <span className="text-sm text-slate-500 dark:text-[#8696a0]">Tap to add status update</span>
                </div>
              </div>
              
              <div className="px-4 mb-4">
                <h2 className="text-sm font-medium text-[#00a884] dark:text-[#00a884] uppercase tracking-wider">Recent updates</h2>
              </div>

              <div className="flex flex-col bg-white dark:bg-[#111b21] rounded-xl overflow-hidden">
                {statuses.slice(1).map((status, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setActiveStatusUserIndex(idx + 1);
                      setActiveStatusIndex(0);
                    }}
                    className="p-4 flex items-center gap-4 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800"
                  >
                    <div className="w-14 h-14 rounded-full p-[2px] border-2 border-[#00a884]">
                      <img src={status.user.profilePicture} className="w-full h-full rounded-full object-cover" alt="" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium dark:text-white text-[17px]">{status.user.fullName}</span>
                      <span className="text-sm text-slate-500 dark:text-[#8696a0]">{status.items[0].time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'communities' ? (
            <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21]">
              <div className="p-4 flex items-center gap-4 bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors mb-2">
                <div className="w-12 h-12 bg-slate-200 dark:bg-[#202c33] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <span className="font-bold dark:text-white text-[17px]">New Community</span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-2"></div>
              <div className="p-4 flex items-center gap-4 bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#00a884] rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold dark:text-white text-[17px]">Big Marlow Bake Off</span>
                  <span className="text-sm text-slate-500 dark:text-[#8696a0]">Community • 12 groups</span>
                </div>
              </div>
            </div>
          ) : activeTab === 'calls' ? (
            <div className="flex flex-col h-full bg-white dark:bg-[#111b21]">
              <div className="p-4 flex items-center gap-4 hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold dark:text-white text-[17px]">Create call link</span>
                  <span className="text-sm text-slate-500 dark:text-[#8696a0]">Share a link for your WhatsApp call</span>
                </div>
              </div>
              <div className="px-4 py-2">
                <h2 className="text-sm font-bold text-slate-500 dark:text-[#8696a0] uppercase tracking-wider">Recent</h2>
              </div>
              {[
                { name: 'Aryan Gupta', time: 'Today, 10:30 AM', type: 'incoming', video: true },
                { name: 'Isha Patel', time: 'Yesterday, 8:45 PM', type: 'outgoing', video: false },
                { name: 'Siddharth Sharma', time: 'October 19, 2:15 PM', type: 'missed', video: true }
              ].map((call, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={`https://i.pravatar.cc/150?u=call_${idx}`} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[17px] ${call.type === 'missed' ? 'text-red-500' : 'dark:text-white'}`}>{call.name}</span>
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-[#8696a0]">
                        {call.type === 'incoming' && <PhoneIncoming className="w-3.5 h-3.5 text-[#25d366]" />}
                        {call.type === 'outgoing' && <PhoneIncoming className="w-3.5 h-3.5 text-[#25d366] rotate-180" />}
                        {call.type === 'missed' && <PhoneIncoming className="w-3.5 h-3.5 text-red-500" />}
                        {call.time}
                      </div>
                    </div>
                  </div>
                  {call.video ? <Video className="w-5 h-5 text-[#075E54]" /> : <Phone className="w-5 h-5 text-[#075E54]" />}
                </div>
              ))}
            </div>
          ) : activeTab === 'settings' ? (
            <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21] overflow-y-auto custom-scrollbar">
              {selectedSetting ? (
                <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                  <div className="bg-[#00a884] dark:bg-[#202c33] p-4 flex items-center gap-6 text-white shrink-0 shadow-md">
                    <button onClick={() => setSelectedSetting(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-[19px] font-bold">{selectedSetting.title}</h2>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111b21]">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-6">
                      <selectedSetting.icon className="w-10 h-10 text-[#00a884]" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2">{selectedSetting.title} Settings</h3>
                    <p className="text-slate-500 dark:text-[#8696a0] max-w-xs mb-8">
                      Manage your {selectedSetting.title.toLowerCase()} preferences, {selectedSetting.subtitle.toLowerCase()}.
                    </p>
                    <div className="w-full max-w-sm space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-[#202c33] rounded-xl text-left border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors">
                        <span className="font-medium dark:text-white">General Settings</span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-[#202c33] rounded-xl text-left border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2a3942] transition-colors">
                        <span className="font-medium dark:text-white">Advanced Configuration</span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Profile Section */}
                  <div className="bg-white dark:bg-[#111b21] p-6 flex items-center gap-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#202c33] transition-colors mb-2 shadow-sm relative group/profile">
                    <div className="relative shrink-0">
                      <img src={`https://i.pravatar.cc/150?u=${currentUserName}`} className="w-16 h-16 rounded-full object-cover shadow-md" alt="" />
                      <div className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-1 border-2 border-white dark:border-[#111b21]">
                        <QrCode className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold dark:text-white text-[19px]">{currentUserName}</h2>
                      <p className="text-[14px] text-slate-500 dark:text-[#8696a0] truncate">Available • Hey there! I am using WhatsApp.</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast('AI Scanning Profile Picture...', 'info');
                        setTimeout(() => showToast('✅ Profile Picture Verified: Authentic', 'success'), 2000);
                      }}
                      className="opacity-0 group-hover/profile:opacity-100 absolute right-6 top-1/2 -translate-y-1/2 bg-[#00a884]/10 text-[#00a884] px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#00a884]/20 transition-all hover:bg-[#00a884] hover:text-white"
                    >
                      Scan AI
                    </button>
                  </div>

                  {/* Settings Options */}
                  <div className="flex flex-col gap-0.5 bg-white dark:bg-[#111b21] shadow-sm">
                    {[
                      { icon: Key, title: 'Account', subtitle: 'Security notifications, change number', color: 'text-slate-500' },
                      { icon: Lock, title: 'Privacy', subtitle: 'Block contacts, disappearing messages', color: 'text-slate-500' },
                      { icon: MessageCircle, title: 'Chats', subtitle: 'Theme, wallpapers, chat history', color: 'text-slate-500' },
                      { icon: Bell, title: 'Notifications', subtitle: 'Message, group & call tones', color: 'text-slate-500' },
                      { icon: Database, title: 'Storage and data', subtitle: 'Network usage, auto-download', color: 'text-slate-500' },
                      { icon: Globe, title: 'App language', subtitle: 'English (phone\'s language)', color: 'text-slate-500' },
                      { icon: HelpCircle, title: 'Help', subtitle: 'Help center, contact us, privacy policy', color: 'text-slate-500' },
                      { icon: Users, title: 'Invite a friend', subtitle: '', color: 'text-slate-500' },
                      { icon: LogOut, title: 'Log out', subtitle: '', color: 'text-red-500', onClick: handleLogout }
                    ].map((item, idx) => (
                      <div key={idx} onClick={() => item.onClick ? item.onClick() : setSelectedSetting(item)} className="flex items-center gap-6 px-6 py-4 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors group">
                        <item.icon className={`w-6 h-6 ${item.color} shrink-0`} />
                        <div className="flex flex-col border-b border-slate-50 dark:border-slate-800 w-full pb-3 -mb-3 last:border-0">
                          <span className={`font-medium text-[17px] ${item.color === 'text-red-500' ? 'text-red-500' : 'dark:text-white'}`}>{item.title}</span>
                          {item.subtitle && <span className="text-sm text-slate-500 dark:text-[#8696a0]">{item.subtitle}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-8 flex flex-col items-center justify-center gap-1 opacity-60">
                    <span className="text-[12px] dark:text-white font-medium">from</span>
                    <span className="text-[14px] dark:text-white font-bold tracking-widest uppercase">Meta</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-[#8696a0] p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-[#202c33] rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium dark:text-white capitalize">{activeTab}</h3>
              <p className="text-sm mt-2">No content for {activeTab}.</p>
            </div>
          )}
        </div>

        {/* Android FAB (Mobile Only - Flutter Style) */}
        {isMobile && activeTab === 'chats' && (
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-50 hover:bg-[#1ebe57]">
            <MessageSquare className="w-6 h-6 fill-white" />
          </button>
        )}
        {isMobile && activeTab === 'status' && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-5 items-center z-50">
            <button className="w-11 h-11 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-slate-100">
              <Plus className="w-6 h-6" />
            </button>
            <button className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-50 hover:bg-[#1ebe57]">
              <Camera className="w-6 h-6 fill-white" />
            </button>
          </div>
        )}
        {isMobile && activeTab === 'calls' && (
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-50 hover:bg-[#1ebe57]">
            <PhoneCall className="w-6 h-6 fill-white" />
          </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`${isMobile ? (activeChat ? 'fixed inset-0 z-[100]' : 'hidden') : 'flex-1'} flex flex-col bg-[#efe7de] dark:bg-[#0b141a] transition-all duration-300`}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className={`h-16 ${isMobile ? 'bg-[#075E54] text-white shadow-md' : 'bg-[#f0f2f5] dark:bg-[#202c33] dark:text-[#e9edef]'} flex items-center justify-between px-4 z-10 shrink-0 border-l border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300`}>
              <div className="flex items-center gap-2 cursor-pointer">
                {isMobile && (
                  <button onClick={() => setActiveChat(null)} className="p-1 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <img src={otherParticipant?.profilePicture || 'https://via.placeholder.com/150'} alt={otherParticipant?.username} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  <div className="min-w-0">
                    <h3 className="font-bold truncate text-[16px] leading-tight">{currentChat?.fullName}</h3>
                    <p className={`text-[12px] truncate ${isMobile ? 'text-white/90' : 'text-slate-500 dark:text-[#8696a0]'}`}>
                      {isTyping ? (
                        <span className="italic animate-pulse">typing...</span>
                      ) : (
                        currentChat?.fullName === 'Big Bakes' ? 'Alice, Anna, Maya, Sofia, Staša, You' : 'online'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-5 ${isMobile ? 'text-white' : 'text-slate-500 dark:text-[#aebac1]'}`}>
                <Video className="w-5.5 h-5.5 cursor-pointer hover:bg-white/10 p-1 rounded-full transition-all" />
                <Phone className="w-5 h-5 cursor-pointer hover:bg-white/10 p-1 rounded-full transition-all" />
                <MoreVertical className="w-5.5 h-5.5 cursor-pointer hover:bg-white/10 p-1 rounded-full transition-all" />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-3 md:px-16 py-4 space-y-1 bg-[#efe7de] dark:bg-[#0b141a] relative custom-scrollbar">
              {/* Background Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
              
              <div className="flex justify-center mb-6 sticky top-0 z-20">
                <span className="bg-[#fff] dark:bg-[#182229] text-slate-500 dark:text-[#8696a0] text-[12px] px-3 py-1 rounded-lg shadow-sm font-medium">Today</span>
              </div>

              {messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`max-w-[85%] md:max-w-[65%] rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative overflow-hidden ${
                    msg.sender._id === currentUserId 
                      ? 'bg-[#dcf8c6] dark:bg-[#005c4b] px-3 py-2 rounded-tr-none' 
                      : 'bg-white dark:bg-[#202c33] px-3 py-2 rounded-tl-none'
                  }`}>
                    {msg.sender._id !== currentUserId && currentChat.isGroupChat && (
                      <p className="text-[13px] font-bold mb-1" style={{ color: msg.sender.color || '#00a884' }}>
                        {msg.sender.fullName}
                      </p>
                    )}

                    {msg.imageUrl ? (
                      <div className="flex flex-col gap-1 -mx-1 -mt-1">
                        <img src={msg.imageUrl} alt="Attachment" className="w-full max-h-[400px] object-cover rounded-lg" />
                        <div className="absolute bottom-1 right-2 flex items-center gap-1 bg-black/20 px-1 rounded-md backdrop-blur-sm">
                          <span className="text-[10px] text-white font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.aiAnalysis?.isScam && (
                          <div className="flex items-center gap-1.5 mb-2.5 py-1.5 px-3 bg-red-500/15 border border-red-500/30 rounded-xl cursor-pointer hover:bg-red-500/25 transition-all shadow-sm group/scam"
                            onClick={() => {
                              setSecurityDetails({
                                riskScore: msg.aiAnalysis.riskScore / 10,
                                redFlags: msg.aiAnalysis.flags,
                                recommendation: msg.aiAnalysis.recommendation
                              });
                              setShowSecurityModal(true);
                            }}
                          >
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[12px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">SCAM DETECTED - CLICK FOR DETAILS</span>
                          </div>
                        )}
                        <p className={`text-[15px] leading-[22px] font-medium dark:text-[#e9edef] pr-12 whitespace-pre-wrap ${msg.aiAnalysis?.isScam ? 'text-red-800 dark:text-red-200' : ''}`}>{msg.text}</p>
                        <div className="absolute bottom-1.5 right-2 flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 dark:text-[#8696a0]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          {msg.sender._id === currentUserId && (
                            msg.status === 'seen' ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" /> : <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Android Input Bar (Flutter Style) */}
            <div className={`flex items-end px-2 pb-2 pt-1 gap-2 shrink-0 bg-[#efe7de] dark:bg-[#0b141a] ${isMobile ? 'mb-2' : ''}`}>
              <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-[24px] px-3 py-2.5 flex items-center shadow-sm">
                <Smile className="w-6 h-6 text-slate-500 mr-2 cursor-pointer flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Message" 
                  className="bg-transparent outline-none text-[16px] w-full dark:text-[#e9edef] placeholder:text-slate-400 py-0"
                  value={inputText}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  <div className="relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      onChange={handleFileUpload}
                      accept="image/*"
                      disabled={analyzingImage}
                    />
                    <Paperclip className={`w-6 h-6 ${analyzingImage ? 'animate-pulse text-[#00a884]' : 'text-slate-500'} -rotate-45 cursor-pointer`} />
                  </div>
                  {!inputText.trim() && <Camera className="w-6 h-6 text-slate-500 cursor-pointer" />}
                </div>
              </div>
              <button 
                onClick={handleSendMessage}
                className="w-12 h-12 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 active:scale-90 transition-all"
              >
                {inputText.trim() ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] text-center px-8 border-b-4 border-[#25d366]">
            <div className="w-80 h-48 bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5z23.png')] bg-contain bg-no-repeat bg-center mb-10 opacity-60"></div>
            <h1 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4">WhatsApp Web</h1>
            <p className="text-sm text-[#667781] dark:text-[#8696a0] max-w-md leading-relaxed">
              Send and receive messages without keeping your phone online.<br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
            <div className="mt-auto pb-10 flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              End-to-end encrypted
            </div>
          </div>
        )}
      </div>
      {/* Security Analysis Modal */}
      {showSecurityModal && securityDetails && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#222e35] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Security Analysis</h3>
                  <p className="text-sm text-slate-500 dark:text-[#8696a0]">AI-powered scam detection</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Risk Score: {securityDetails.riskScore}/10</p>
                </div>
                
                <div>
                  <p className="text-sm font-bold dark:text-[#e9edef] mb-2">Red Flags Detected:</p>
                  <ul className="space-y-2 mb-4">
                    {securityDetails.redFlags?.map((flag, idx) => (
                      <li key={idx} className="text-sm text-slate-600 dark:text-[#8696a0] flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>

                  {securityDetails.recommendation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                      <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                        <strong>AI Recommendation:</strong> {securityDetails.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowSecurityModal(false)}
                className="w-full mt-8 py-3 bg-[#00a884] text-white rounded-xl font-bold hover:bg-[#008f6f] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppClone;