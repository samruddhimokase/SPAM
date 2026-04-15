import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, 
  Search, Home, Compass, User, ShieldAlert, 
  CheckCircle2, AlertTriangle, ShieldCheck, Grid, Square,
  ChevronLeft, ChevronRight, X as CloseIcon, Play, Music, Clapperboard, Plus,
  Instagram, Menu, LogOut, Settings, Activity, PlusSquare, UserSquare,
  LayoutGrid, Video, Film, Bell, Ghost, Download, Lock, Unlock,
  Palette, EyeOff, Shield, Smile, Zap, Sparkles
} from 'lucide-react';
import { 
  analyzeInstagramProfile, fetchInstagramPosts, uploadInstagramPost, 
  likeInstagramPost, commentInstagramPost, fetchInstagramStories, uploadInstagramStory,
  normalizeImageUrl,
  fetchUserProfile,
  searchUsers,
  fetchNotifications,
  followInstagramUser,
  fetchSuggestions,
  fetchFollowing,
  analyzeScreenshot,
  getOrCreateChat,
  sendWhatsAppMessage
} from '../api/api';
import { useSocket } from '../context/SocketContext';
import InstagramMessages from './InstagramMessages';

const InstagramClone = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'profile', 'messages', or 'reels'
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Honista-inspired features
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [appLockPin, setAppLockPin] = useState('');
  const [isAppAuthorized, setIsAppAuthorized] = useState(true); // Should be false if locked
  const [showLockModal, setShowLockModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default'); // 'default', 'ocean', 'gold', 'lavender'
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [userListModalType, setUserListModalType] = useState('followers'); // 'followers' or 'following'
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSavedTab, setShowSavedTab] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingPost, setSharingPost] = useState(null);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [fakePostLoading, setFakePostLoading] = useState(false);
  const [securityBlock, setSecurityBlock] = useState(null); // { risk: '', patterns: [], message: '' }
  const [editProfileData, setEditProfileData] = useState({ fullName: '', bio: '', profilePicture: '' });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [analyzingProfilePic, setAnalyzingProfilePic] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
  };

  // Session Management - Redirect if not logged in
  useEffect(() => {
    const session = localStorage.getItem('instagram_session');
    if (!session) {
      navigate('/instagram/login');
    }
  }, [navigate]);

  // Load Honista settings from localStorage
  useEffect(() => {
    const savedGhostMode = localStorage.getItem('honista_ghost_mode') === 'true';
    const savedAppLocked = localStorage.getItem('honista_app_locked') === 'true';
    const savedTheme = localStorage.getItem('honista_theme') || 'default';
    
    setIsGhostMode(savedGhostMode);
    setIsAppLocked(savedAppLocked);
    setCurrentTheme(savedTheme);
    
    if (savedAppLocked) {
      setIsAppAuthorized(false);
    }
  }, []);

  const toggleGhostMode = () => {
    const newVal = !isGhostMode;
    setIsGhostMode(newVal);
    localStorage.setItem('honista_ghost_mode', newVal);
  };

  const handleAppLockToggle = () => {
    if (isAppLocked) {
      // If already locked, we need PIN to unlock
      const pin = prompt('Enter your current PIN to disable app lock:');
      if (pin === '1234') { // Default PIN for demo
        setIsAppLocked(false);
        localStorage.setItem('honista_app_locked', 'false');
        showToast('App Lock disabled.', 'success');
      } else {
        showToast('Incorrect PIN.', 'error');
      }
    } else {
      // Enable lock
      setIsAppLocked(true);
      localStorage.setItem('honista_app_locked', 'true');
      showToast('App Lock enabled. Default PIN is 1234', 'info');
    }
  };

  const handleUnlock = (pin) => {
    if (pin === '1234') {
      setIsAppAuthorized(true);
      setAppLockPin('');
      showToast('Account unlocked', 'success');
    } else {
      showToast('Incorrect PIN', 'error');
      setAppLockPin('');
    }
  };

  const downloadMedia = async (url, filename = 'instagram_media.jpg') => {
    try {
      showToast('Preparing download...', 'info');
      
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(blobUrl);
      showToast('Media downloaded successfully', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback for CORS issues
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Opened in new tab (Download restricted)', 'info');
    }
  };

  // Mock current user for demo purposes - in real app, get from AuthContext
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Find a user to act as current user for the demo
        const { data: searchRes } = await searchUsers('rohit_gupta');
        let demoUser;
        if (searchRes && searchRes.length > 0) {
          demoUser = searchRes[0];
        } else {
          const { data: postsData } = await fetchInstagramPosts();
          if (postsData && postsData.length > 0) demoUser = postsData[0].user;
        }

        if (demoUser) {
          const { data: profile } = await fetchUserProfile(demoUser._id || demoUser);
          setCurrentUser(profile);
          
          // Join user's private room for notifications
          if (socket) {
            socket.emit('join_user', profile._id);
          }
          
          // Load initial notifications
          const { data: notifs } = await fetchNotifications(profile._id);
          setNotifications(notifs || []);
          
          // Load suggestions
          const { data: suggs } = await fetchSuggestions(profile._id);
          setSuggestions(suggs || []);
        }
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };
    loadCurrentUser();
  }, [socket]);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery) {
        try {
          const { data } = await searchUsers(searchQuery);
          setSearchResults(data || []);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const ExplorePage = () => {
    const allPosts = [...posts, ...reels].sort(() => Math.random() - 0.5);
    
    if (postsLoading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div></div>;

    return (
      <div className="max-w-[935px] mx-auto pt-4 px-4 pb-10">
        <div className="grid grid-cols-3 gap-1 md:gap-4 pb-12">
          {allPosts.map((post, i) => (
            <div 
              key={post._id || i} 
              className={`aspect-square relative group cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900 ${
                i % 10 === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => {
                // Potential to open post modal
                showToast(`Viewing post by ${post.user?.username || 'user'}`, 'info');
              }}
            >
              <img 
                src={normalizeImageUrl(post.imageUrl || post.videoUrl)} 
                alt="Post" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                <div className="flex items-center gap-1.5"><Heart className="fill-white w-5 h-5" /> {post.likeCount}</div>
                <div className="flex items-center gap-1.5"><MessageCircle className="fill-white w-5 h-5" /> {post.comments?.length || 0}</div>
              </div>
              {post.type === 'reel' && (
                <div className="absolute top-3 right-3 text-white drop-shadow-md">
                  <Film className="w-5 h-5" />
                </div>
              )}
              {post.isFake && (
                <div className="absolute top-3 left-3 z-[10] bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/20">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-[8px] font-black text-white uppercase tracking-wider">AI Generated</span>
                </div>
              )}
              {post.aiAnalysis?.classification === 'Scam' && (
                <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight backdrop-blur-sm">
                  AI Scam Detected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Real-time Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      // Show browser notification or toast here if desired
    });

    socket.on('follow_update', (data) => {
      // Update follower counts if viewing a profile
      if (selectedUser && selectedUser._id === data.followingId) {
        setSelectedUser(prev => ({
          ...prev,
          followers: data.isFollowing 
            ? [...prev.followers, { _id: data.followerId }] 
            : prev.followers.filter(f => f._id !== data.followerId)
        }));
      }
      
      // Update current user's following if they are the one who followed
      if (currentUser && currentUser._id === data.followerId) {
        setCurrentUser(prev => ({
          ...prev,
          following: data.isFollowing
            ? [...prev.following, { _id: data.followingId }]
            : prev.following.filter(f => f._id !== data.followingId)
        }));
      }
    });

    socket.on('new_post', (newPost) => {
      const normalized = {
        ...newPost,
        imageUrl: normalizeImageUrl(newPost.imageUrl || newPost.image),
        videoUrl: normalizeImageUrl(newPost.videoUrl || newPost.video)
      };
      
      if (normalized.type === 'reel') {
        setReels(prev => {
          if (prev.find(p => p._id === normalized._id)) return prev;
          return [normalized, ...prev];
        });
      } else {
        setPosts(prev => {
          if (prev.find(p => p._id === normalized._id)) return prev;
          return [normalized, ...prev];
        });
      }
    });

    socket.on('new_story', (newStory) => {
      console.log('New story received via socket:', newStory);
      loadStories();
    });

    socket.on('post_update', (update) => {
      const updateList = (list) => list.map(post => {
        if (post._id === update.postId) {
          return { ...post, ...update };
        }
        return post;
      });
      setPosts(prev => updateList(prev));
      setReels(prev => updateList(prev));
    });

    return () => {
      socket.off('new_post');
      socket.off('new_story');
      socket.off('post_update');
    };
  }, [socket]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    // Clear user session and redirect to Instagram login
    setCurrentUser(null);
    localStorage.removeItem('instagram_session'); // Mock session clearing
    showToast('Logged out successfully', 'info');
    navigate('/instagram/login');
  };

  const handleFollow = async (userId) => {
    try {
      const { data } = await followInstagramUser(userId, currentUser?._id);
      
      // Update local state for immediate feedback
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          followers: data.isFollowing 
            ? [...prev.followers, { _id: currentUser._id }] 
            : prev.followers.filter(f => (f._id || f) !== currentUser._id)
        }));
      }

      // Update current user's following list
      if (currentUser) {
        setCurrentUser(prev => ({
          ...prev,
          following: data.isFollowing
            ? [...prev.following, userId]
            : prev.following.filter(id => (id._id || id) !== userId)
        }));
      }

      // Remove from suggestions list if followed
      if (data.isFollowing) {
        setSuggestions(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const openUserProfile = async (userId) => {
    try {
      const { data } = await fetchUserProfile(userId);
      setSelectedUser(data);
      setActiveTab('profile');
      setShowSearch(false);
      setShowNotifications(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState({ caption: '', image: null, type: 'post' });
  const [newStoryContent, setNewStoryContent] = useState(null);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [stories, setStories] = useState([]); // Array of { user, stories: [] }
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [commentTexts, setCommentTexts] = useState({}); // { postId: 'comment text' }
  const [commentingLoading, setCommentingLoading] = useState({}); // { postId: true/false }
  const [following, setFollowing] = useState([]);
  const videoRefs = useRef({});

  useEffect(() => {
    if (!videoRefs.current) return;
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(err => console.log('Auto-play blocked'));
        } else {
          video.pause();
        }
      });
    }, options);

    const currentVideos = videoRefs.current;
    Object.values(currentVideos).forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      Object.values(currentVideos).forEach(video => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels, activeTab]);

  useEffect(() => {
    // Initial load
    loadData();
    loadStories();
  }, []); // Run only once on mount

  useEffect(() => {
    // If switching to reels tab specifically, ensure they are shuffled
    if (activeTab === 'reels' && reels.length > 0) {
      setReels(prev => shuffleArray([...prev]));
    }
  }, [activeTab]);

  const loadStories = async () => {
    try {
      const { data } = await fetchInstagramStories();
      console.log('Fetched stories:', data);
      
      // Group stories by user for the stories row
      const groupedStories = data.reduce((acc, story) => {
        const userId = story.user?._id;
        if (!userId) {
          console.warn('Story missing user data:', story);
          return acc;
        }
        
        if (!acc[userId]) {
          acc[userId] = {
            user: story.user,
            stories: []
          };
        }
        acc[userId].stories.push(story);
        return acc;
      }, {});

      const storiesList = Object.values(groupedStories);
      console.log('Grouped stories for display:', storiesList);
      setStories(storiesList);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  const handleUploadStory = async (e) => {
    e.preventDefault();
    if (!newStoryContent) return;

    try {
      const formData = new FormData();
      formData.append('username', currentUser?.username || 'user');
      formData.append('avatar', currentUser?.profilePicture || '');
      formData.append('file', newStoryContent);
      formData.append('type', 'image');

      const { data } = await uploadInstagramStory(formData);
      // After upload, reload stories to get grouped structure
      loadStories();
      setShowStoryUpload(false);
      setNewStoryContent(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let timer;
    if (activeUserIndex !== null) {
      setStoryProgress(0);
      timer = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 2;
        });
      }, 60);
    }
    return () => clearInterval(timer);
  }, [activeUserIndex, activeStoryIndex, stories.length]);

  const handleNextStory = () => {
    if (activeUserIndex === null) return;
    
    const currentUserStories = stories[activeUserIndex].stories;
    if (activeStoryIndex < currentUserStories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else if (activeUserIndex < stories.length - 1) {
      setActiveUserIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      setActiveUserIndex(null);
      setActiveStoryIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (activeUserIndex === null) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else if (activeUserIndex > 0) {
      setActiveUserIndex(prev => prev - 1);
      const prevUserStories = stories[activeUserIndex - 1].stories;
      setActiveStoryIndex(prevUserStories.length - 1);
    } else {
      setActiveStoryIndex(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeUserIndex !== null) {
        if (e.key === 'ArrowRight') handleNextStory();
        if (e.key === 'ArrowLeft') handlePrevStory();
        if (e.key === 'Escape') setActiveUserIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeUserIndex, activeStoryIndex, stories]);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCommentChange = (postId, value) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentTexts[postId];
    if (!text || !text.trim() || commentingLoading[postId]) return;

    setCommentingLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const { data } = await commentInstagramPost(postId, {
        userId: currentUser?._id,
        text: text.trim()
      });
      
      // Update the local post state to show the new comment
      const updateList = (list) => list.map(p => 
        p._id === postId ? { ...p, comments: data } : p
      );
      setPosts(updateList);
      setReels(updateList);
      
      // Clear the input
      handleCommentChange(postId, '');
      showToast('Comment posted', 'success');
    } catch (err) {
      console.error('Failed to post comment:', err);
      showToast('Failed to post comment', 'error');
    } finally {
      setCommentingLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const loadData = async () => {
    setPostsLoading(true);
    try {
      const { data } = await fetchInstagramPosts();
      const normalizedData = (data || []).map(p => ({
        ...p,
        imageUrl: normalizeImageUrl(p.imageUrl || p.image),
        videoUrl: normalizeImageUrl(p.videoUrl || p.video)
      }));
      
      // Deduplicate by ID to ensure uniqueness
      const uniqueNormalized = [];
      const seenIds = new Set();

      normalizedData.forEach(p => {
        if (!p || !p._id) return;
        
        const pid = p._id.toString();
        if (!seenIds.has(pid)) {
          seenIds.add(pid);
          uniqueNormalized.push(p);
        }
      });

      const reelsData = uniqueNormalized.filter(p => p.type === 'reel');
      const feedPostsData = uniqueNormalized.filter(p => p.type === 'post' || !p.type || p.type === '');

      setReels(shuffleArray(reelsData));
      setPosts(shuffleArray(feedPostsData));

      // Fallback: If current tab filters returned nothing but data exists
      if (reelsData.length === 0 && uniqueNormalized.length > 0) {
        setReels(shuffleArray(uniqueNormalized));
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await likeInstagramPost(postId, { userId: currentUser?._id });
      // Socket will handle the update for everyone, but we can optimistically update
      const updateList = (list) => list.map(post => {
        if (post._id === postId) {
          return { ...post, likeCount: data.likeCount, likes: data.likes };
        }
        return post;
      });
      setPosts(updateList(posts));
      setReels(updateList(reels));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePost = (post) => {
    setSavedPosts(prev => {
      const isSaved = prev.some(p => p._id === post._id);
      if (isSaved) {
        showToast('Post removed from saved', 'info');
        return prev.filter(p => p._id !== post._id);
      } else {
        showToast('Post saved successfully', 'success');
        return [post, ...prev];
      }
    });
  };

  const handleSharePost = (post) => {
    setSharingPost(post);
    setShowShareModal(true);
  };

  const shareToUser = async (targetUser) => {
    if (!sharingPost || !currentUser) return;
    
    try {
      // 1. Get or create chat
      const { data: chat } = await getOrCreateChat({
        participants: [currentUser._id, targetUser._id]
      });

      // 2. Send message with shared post
      const { data: message } = await sendWhatsAppMessage({
        chatId: chat._id,
        senderId: currentUser._id,
        text: `Shared a post`,
        mediaType: 'post',
        sharedPost: sharingPost._id
      });

      if (socket) {
        socket.emit('send_message', { ...message, room: chat._id });
      }

      showToast(`Shared with ${targetUser.username}`, 'success');
      setShowShareModal(false);
      setSharingPost(null);
    } catch (err) {
      console.error('Failed to share post:', err);
      showToast('Failed to share post', 'error');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.image) return;

    setLoading(true);
    setSecurityBlock(null);
    try {
      // 1. AI Image Analysis
      let analysisData = { success: false };
      try {
        const formDataAnalysis = new FormData();
        formDataAnalysis.append('screenshot', newPostContent.image);
        const response = await analyzeScreenshot(formDataAnalysis);
        analysisData = response.data;
      } catch (aiErr) {
        console.warn("AI Analysis failed, proceeding with standard upload", aiErr);
      }
      
      // 2. AI Caption Analysis
      let captionRisk = false;
      let captionPatterns = [];
      if (newPostContent.caption) {
        const scamKeywords = ['gift card', 'won', 'lottery', 'crypto', 'bitcoin', 'doubling', 'profit daily', 'click here', 'urgent', 'limited time'];
        const found = scamKeywords.filter(k => newPostContent.caption.toLowerCase().includes(k));
        if (found.length >= 2) {
          captionRisk = true;
          captionPatterns = found.map(k => `Scam Keyword: ${k}`);
        }
      }

      if ((analysisData?.success && analysisData?.analysis?.risk === 'High') || captionRisk) {
        // Strict Hard Block for Scam Posts
        setSecurityBlock({
          risk: 'High',
          patterns: [...(analysisData?.analysis?.flags || []), ...captionPatterns],
          message: "POST BLOCKED: SocialShield AI detected high-risk scam patterns in this content or caption. This post violates our safety guidelines."
        });
        showToast('Post blocked for security reasons', 'error');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('username', currentUser?.username || 'user');
      formData.append('avatar', currentUser?.profilePicture || '');
      formData.append('type', newPostContent.type);
      formData.append('file', newPostContent.image);
      formData.append('caption', newPostContent.caption);
      
      const { data } = await uploadInstagramPost(formData);
      
      if (data && data._id) {
        if (data.type === 'post') {
          setPosts(prev => [data, ...prev]);
          setActiveTab('feed');
        } else {
          setReels(prev => [data, ...prev]);
          setActiveTab('reels');
        }
        
        setNewPostContent({ caption: '', image: null, type: 'post' });
        setShowCreateModal(false);
        showToast('Post uploaded successfully', 'success');
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast('Failed to upload post. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = async (profileData) => {
    setLoading(true);
    setShowAnalysis(true);
    try {
      const { data } = await analyzeInstagramProfile(profileData);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (classification) => {
    switch (classification) {
      case 'Scam': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
      case 'Suspicious': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800';
      case 'Low Risk': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';
      default: return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    // Optimistic update
    const updatedUser = { ...currentUser, ...editProfileData };
    setCurrentUser(updatedUser);
    setShowEditProfileModal(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleSwitchAccount = (user) => {
    setCurrentUser(user);
    setShowSwitchAccountModal(false);
    showToast(`Switched to ${user.username}`, 'success');
  };

  const handleGenerateFakePost = async () => {
    setFakePostLoading(true);
    try {
      // Simulate AI post generation
      const captions = [
        "Congratulations! You won a $500 Amazon Gift Card. Click the link in my bio to claim it now! 🎁",
        "Invest $100 and get $1000 back in 24 hours. DM me for the secret method! 💸🚀 #crypto #rich",
        "URGENT: Your account will be deleted in 2 hours. Verify your identity here: http://bit.ly/fake-verify",
        "Hi! I saw your profile and I think you're cute. Check my private photos here: http://onlyfans-scam.com"
      ];
      
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];
      const randomImage = `https://picsum.photos/seed/${Math.random()}/800/800`;
      
      const formData = new FormData();
      formData.append('username', currentUser?.username || 'rohit_gupta');
      formData.append('caption', randomCaption);
      formData.append('type', 'post');
      
      // We'll simulate the file upload by sending a mock blob if needed, 
      // but for demo we can just call the API with the caption
      // and the backend will flag it based on the keywords we added earlier.
      
      showToast('AI Generating fake content...', 'info');
      
      // In a real app we'd fetch the image blob and append it
      const response = await fetch(randomImage);
      const blob = await response.blob();
      formData.append('file', blob, 'fake_post.jpg');
      
      const { data } = await uploadInstagramPost(formData);
      
      if (data && data.isFake) {
        showToast('AI Generated Fake Content Detected!', 'error');
        setPosts(prev => [data, ...prev]);
        setActiveTab('feed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate demo post', 'error');
    } finally {
      setFakePostLoading(false);
      setShowAIAnalysisModal(false);
    }
  };

  const AIAnalysisDashboard = () => {
    if (!showAIAnalysisModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#262626] w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="h-14 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-6 bg-emerald-500 text-white shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-lg uppercase tracking-tight">AI Security Dashboard</h3>
            </div>
            <button onClick={() => setShowAIAnalysisModal(false)} className="hover:rotate-90 transition-transform duration-300">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            {/* User Risk Profile */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[2px]">Current Session Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-[11px] text-slate-500 font-bold mb-1">USER RISK SCORE</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-black ${currentUser?.riskScore > 70 ? 'text-red-500' : currentUser?.riskScore > 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                      {currentUser?.riskScore || 0}%
                    </span>
                    <span className="text-[10px] text-slate-400 mb-1.5 uppercase font-bold">Probability</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-[11px] text-slate-500 font-bold mb-1">CLASSIFICATION</p>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${getRiskColor(currentUser?.riskClassification)}`}>
                    {currentUser?.riskClassification || 'Real'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Post Generation Demo */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-50/10 space-y-4">
              <div>
                <h4 className="text-emerald-600 dark:text-emerald-400 font-bold">AI Generated Fake Post Demo</h4>
                <p className="text-sm text-slate-500">Test SocialShield's detection capabilities by generating a realistic fake post using AI.</p>
              </div>
              <button 
                onClick={handleGenerateFakePost}
                disabled={fakePostLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {fakePostLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {fakePostLoading ? 'GENERATING FAKE CONTENT...' : 'GENERATE AI FAKE POST'}
              </button>
            </div>

            {/* Recent Detection History */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[2px]">Recent Detections</h4>
              <div className="space-y-3">
                {notifications.filter(n => n.isSecurityAlert).slice(0, 3).map(n => (
                  <div key={n._id} className="p-4 rounded-xl border border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">Security Alert</p>
                      <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-2">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserListModal = ({ isOpen, onClose, type, user }) => {
    if (!isOpen || !user) return null;
    const users = type === 'followers' ? user.followers : user.following;
    const title = type === 'followers' ? 'Followers' : 'Following';

    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl">
          <div className="h-11 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
            <div className="w-8"></div>
            <h3 className="font-bold text-[16px]">{title}</h3>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
            {users && users.length > 0 ? (
              users.map((u, i) => {
                const userData = typeof u === 'string' ? { _id: u, username: 'User' } : u;
                return (
                  <div key={userData._id || i} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3" onClick={() => {
                      openUserProfile(userData._id);
                      onClose();
                    }}>
                      <img 
                        src={normalizeImageUrl(userData.profilePicture)} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-100 dark:border-slate-800" 
                        alt="" 
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[14px]">{userData.username}</span>
                          {userData.isVerified && <CheckCircle2 className="w-3 h-3 text-[#0095f6] fill-[#0095f6]" />}
                        </div>
                        <span className="text-slate-500 text-[14px]">{userData.fullName || 'Instagram User'}</span>
                      </div>
                    </div>
                    {currentUser && userData._id !== currentUser._id && (
                      <button 
                        onClick={() => handleFollow(userData._id)}
                        className={`text-[12px] font-bold px-4 py-1.5 rounded-lg transition-colors ${
                          currentUser.following?.some(f => (f._id || f) === userData._id)
                            ? 'bg-[#efefef] dark:bg-slate-700 text-black dark:text-white'
                            : 'bg-[#0095f6] text-white'
                        }`}
                      >
                        {currentUser.following?.some(f => (f._id || f) === userData._id) ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">No users found.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Toast = ({ visible, message, type }) => {
    if (!visible) return null;
    const bgClass = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-[#262626]';
    return (
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 ${bgClass} text-white px-6 py-3 rounded-xl shadow-2xl z-[300] animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
        {type === 'error' && <AlertTriangle className="w-5 h-5" />}
        {type === 'info' && <ShieldCheck className="w-5 h-5" />}
        <span className="text-sm font-bold">{message}</span>
      </div>
    );
  };

  const ProfilePage = () => {
    const userToDisplay = selectedUser || currentUser;
    if (!userToDisplay) return <div className="p-20 text-center flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;

    const isOwnProfile = currentUser && userToDisplay._id === currentUser._id;
    const isFollowing = currentUser?.following?.some(f => (f._id || f) === userToDisplay._id);
    const userPosts = [...posts, ...reels].filter(p => p.user?._id === userToDisplay._id);

    return (
      <div className="max-w-[935px] mx-auto pt-8 px-4 pb-10">
        {/* User Risk Profile (Only visible if risk detected) */}
        {userToDisplay.riskScore > 0 && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 duration-500 ${getRiskColor(userToDisplay.riskClassification)}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-[13px] uppercase tracking-wider">AI Security Profile: {userToDisplay.riskClassification}</h4>
                <p className="text-[11px] opacity-80 font-medium">This account has a {userToDisplay.riskScore}% risk probability according to SocialShield AI.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAIAnalysisModal(true)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all"
            >
              View Analysis
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 border border-[#efefef] dark:border-slate-800 cursor-pointer">
            <img src={normalizeImageUrl(userToDisplay.profilePicture)} alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1 space-y-5">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-normal tracking-tight">{userToDisplay.username}</h2>
                {userToDisplay.isVerified && <CheckCircle2 className="w-[18px] h-[18px] text-[#0095f6] fill-[#0095f6]" />}
              </div>
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={() => {
                        setEditProfileData({ fullName: currentUser.fullName, bio: currentUser.bio, profilePicture: currentUser.profilePicture });
                        setShowEditProfileModal(true);
                      }}
                      className="bg-[#efefef] dark:bg-slate-800 hover:bg-[#dbdbdb] dark:hover:bg-slate-700 px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors"
                    >
                      Edit profile
                    </button>
                    <button 
                      onClick={() => setShowArchiveModal(true)}
                      className="bg-[#efefef] dark:bg-slate-800 hover:bg-[#dbdbdb] dark:hover:bg-slate-700 px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors"
                    >
                      View archive
                    </button>
                    <button 
                      onClick={() => {
                        showToast('AI Analyzing Profile Authenticity...', 'info');
                        setTimeout(() => showToast('✅ Account Verified: High Trust Score', 'success'), 2500);
                      }}
                      className="bg-[#0095f6] hover:bg-[#1877f2] text-white px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Scan Profile
                    </button>
                    <Settings 
                      onClick={() => setShowSettingsModal(true)}
                      className="w-6 h-6 cursor-pointer ml-1 hover:opacity-60 transition-opacity" 
                    />
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleFollow(userToDisplay._id)}
                      className={`${isFollowing ? 'bg-[#efefef] dark:bg-slate-800 text-black dark:text-white' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'} px-6 py-1.5 rounded-lg text-[14px] font-bold transition-colors`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('messages');
                        // Logic to open chat with this user would go here
                      }}
                      className="bg-[#efefef] dark:bg-slate-800 hover:bg-[#dbdbdb] dark:hover:bg-slate-700 px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors"
                    >
                      Message
                    </button>
                    <button 
                      onClick={() => {
                        showToast(`Analyzing ${userToDisplay.username}'s Profile...`, 'info');
                        const isScam = userToDisplay.riskClassification && userToDisplay.riskClassification !== 'Real';
                        setTimeout(() => {
                          if (isScam) {
                            showToast(`⚠️ Warning: ${userToDisplay.riskClassification} patterns detected!`, 'error');
                          } else {
                            showToast('✅ Profile Verified: High Authenticity', 'success');
                          }
                        }, 2500);
                      }}
                      className="bg-[#efefef] dark:bg-slate-800 hover:bg-[#dbdbdb] dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                      title="AI Profile Scan"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#0095f6]" />
                    </button>
                    <UserSquare className="w-6 h-6 cursor-pointer bg-[#efefef] dark:bg-slate-800 p-1 rounded-lg" />
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-10 text-[16px]">
              <div><span className="font-bold">{userPosts.length}</span> posts</div>
              <div 
                className="cursor-pointer hover:opacity-70 transition-opacity active:opacity-40"
                onClick={() => {
                  setUserListModalType('followers');
                  setShowUserListModal(true);
                }}
              >
                <span className="font-bold">{userToDisplay.followers?.length || 0}</span> followers
              </div>
              <div 
                className="cursor-pointer hover:opacity-70 transition-opacity active:opacity-40"
                onClick={() => {
                  setUserListModalType('following');
                  setShowUserListModal(true);
                }}
              >
                <span className="font-bold">{userToDisplay.following?.length || 0}</span> following
              </div>
            </div>
            <div className="text-[14px] space-y-0.5">
              <p className="font-bold">{userToDisplay.fullName}</p>
              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{userToDisplay.bio}</p>
              {userToDisplay.riskClassification && userToDisplay.riskClassification !== 'Real' && (
                <div className={`mt-2 px-2 py-1 rounded inline-flex items-center gap-1.5 border text-[11px] font-bold uppercase tracking-tight ${getRiskColor(userToDisplay.riskClassification)}`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  AI Security Alert: {userToDisplay.riskClassification}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-[#efefef] dark:border-slate-800 flex justify-center gap-12 text-[12px] font-bold uppercase tracking-[1px] text-slate-400">
          <button 
            onClick={() => setShowSavedTab(false)}
            className={`flex items-center gap-1.5 py-4 border-t ${!showSavedTab ? 'border-black dark:border-white -mt-[1px] text-black dark:text-white' : 'hover:text-black dark:hover:text-white'} transition-colors`}
          >
            <Grid className="w-3 h-3" /> Posts
          </button>
          <button className="flex items-center gap-1.5 py-4 hover:text-black dark:hover:text-white transition-colors">
            <Film className="w-3 h-3" /> Reels
          </button>
          <button 
            onClick={() => setShowSavedTab(true)}
            className={`flex items-center gap-1.5 py-4 border-t ${showSavedTab ? 'border-black dark:border-white -mt-[1px] text-black dark:text-white' : 'hover:text-black dark:hover:text-white'} transition-colors`}
          >
            <Bookmark className="w-3 h-3" /> Saved
          </button>
          <button className="flex items-center gap-1.5 py-4 hover:text-black dark:hover:text-white transition-colors">
            <UserSquare className="w-3 h-3" /> Tagged
          </button>
        </div>

        {/* Grid */}
        {showSavedTab ? (
          savedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-1 pb-12">
              {savedPosts.map(post => (
                <div key={post._id} className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={normalizeImageUrl(post.imageUrl)} 
                    alt="Post" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white font-bold">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2"><Heart className="fill-white w-5 h-5" /> {post.likeCount}</div>
                      <div className="flex items-center gap-2"><MessageCircle className="fill-white w-5 h-5" /> {post.comments?.length || 0}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadMedia(post.imageUrl, `post_${post._id}.jpg`);
                      }}
                      className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors flex items-center gap-2 text-xs"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                  {post.type === 'reel' && <Film className="absolute top-3 right-3 w-5 h-5 text-white drop-shadow-md" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center mb-4">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-[24px] font-bold">No Saved Posts Yet</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs">Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.</p>
            </div>
          )
        ) : userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-1 pb-12">
            {userPosts.map(post => (
              <div key={post._id} className="aspect-square relative group cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img 
                  src={normalizeImageUrl(post.imageUrl)} 
                  alt="Post" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white font-bold">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2"><Heart className="fill-white w-5 h-5" /> {post.likeCount}</div>
                    <div className="flex items-center gap-2"><MessageCircle className="fill-white w-5 h-5" /> {post.comments?.length || 0}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadMedia(post.imageUrl, `post_${post._id}.jpg`);
                    }}
                    className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors flex items-center gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                {post.type === 'reel' && <Film className="absolute top-3 right-3 w-5 h-5 text-white drop-shadow-md" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center mb-4">
              <Grid className="w-8 h-8" />
            </div>
            <h3 className="text-[24px] font-bold">No Posts Yet</h3>
          </div>
        )}
      </div>
    );
  };

  const closeStoryViewer = () => {
    setActiveUserIndex(null);
    setActiveStoryIndex(0);
    setStoryProgress(0);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeStoryViewer();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const StoryViewer = () => {
    if (activeUserIndex === null || !stories[activeUserIndex]) return null;
    const currentUserStories = stories[activeUserIndex].stories;
    const currentStory = currentUserStories[activeStoryIndex];
    const user = stories[activeUserIndex].user;

    return (
      <div 
        className="fixed inset-0 bg-black z-[200] flex items-center justify-center cursor-default"
        onClick={closeStoryViewer}
      >
        {/* Progress Bars for current user's stories - Moved to top as per screenshot */}
        <div 
          className="absolute top-0 left-0 right-0 px-1 pt-1.5 flex gap-1 z-[210]"
          onClick={(e) => e.stopPropagation()}
        >
          {currentUserStories.map((_, idx) => (
            <div key={idx} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx < activeStoryIndex ? '100%' : idx === activeStoryIndex ? `${storyProgress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls - Fixed to top right as per screenshot */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-[300]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              downloadMedia(currentStory.imageUrl, `story_${user.username}_${currentStory._id}.jpg`);
            }}
            className="text-white/80 hover:text-white transition-colors p-3 cursor-pointer z-[310] hover:scale-110 active:scale-95"
            title="Save (Download)"
          >
            <Download className="w-7 h-7" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              closeStoryViewer();
            }}
            className="text-white hover:text-white transition-colors p-3 cursor-pointer z-[310] hover:scale-110 active:scale-95"
            title="Cancel (Close)"
          >
            <CloseIcon className="w-9 h-9" />
          </button>
        </div>

        {/* User Header (Moved down slightly or kept subtle) */}
        <div 
          className="absolute top-8 left-4 flex items-center gap-4 z-[210]"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={closeStoryViewer}
            className="text-white hover:text-white/70 transition-colors p-1"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              closeStoryViewer();
              openUserProfile(user._id);
            }}
          >
            <img 
              src={normalizeImageUrl(user.profilePicture)} 
              className="w-8 h-8 rounded-full border border-white/40 group-hover:scale-105 transition-transform" 
              alt="" 
            />
            <div className="flex flex-col">
              <span className="text-white text-sm font-bold shadow-sm">{user.username || 'user'}</span>
              <span className="text-white/60 text-[10px] shadow-sm">
                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {isGhostMode && (
              <div className="bg-purple-600/60 px-2 py-0.5 rounded text-[10px] text-white font-bold flex items-center gap-1 ml-2">
                <Ghost className="w-2.5 h-2.5" /> GHOST
              </div>
            )}
          </div>
        </div>

        <div 
          className="w-full h-full max-w-[500px] relative flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={normalizeImageUrl(currentStory.imageUrl)} 
            className="w-full h-full object-contain select-none shadow-2xl rounded-lg" 
            alt="" 
          />
          
          {/* Circular Navigation Buttons */}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
            className="absolute left-4 md:left-[-100px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 p-4 rounded-full transition-all group z-[120] backdrop-blur-sm border border-white/10 active:scale-90"
            title="Previous"
          >
            <ChevronLeft className="text-white w-6 h-6 md:w-8 md:h-8 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
            className="absolute right-4 md:right-[-100px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 p-4 rounded-full transition-all group z-[120] backdrop-blur-sm border border-white/10 active:scale-90"
            title="Next"
          >
            <ChevronRight className="text-white w-6 h-6 md:w-8 md:h-8 transition-transform" />
          </button>

          {/* Mobile Tap Areas (Transparent) */}
          <div className="absolute inset-0 flex z-[110]">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrevStory}></div>
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNextStory}></div>
          </div>

          {/* Bottom Interaction Bar (Fully Working State) */}
          <div className="absolute bottom-6 left-0 right-0 px-4 flex items-center gap-4 z-[120]">
            <div className="flex-1 bg-transparent border border-white/40 rounded-full px-4 py-2.5">
              <input 
                type="text" 
                placeholder={`Reply to ${user.username}...`}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/60"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); showToast('Story liked!', 'success'); }}
              className="text-white hover:text-red-500 transition-colors active:scale-125"
            >
              <Heart className="w-7 h-7" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleSharePost(currentStory);
              }}
              className="text-white hover:opacity-70 transition-opacity active:scale-90"
            >
              <Send className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-black min-h-screen text-slate-900 dark:text-white flex relative font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 ${
      currentTheme === 'ocean' ? 'theme-ocean' : 
      currentTheme === 'gold' ? 'theme-gold' : 
      currentTheme === 'lavender' ? 'theme-lavender' : ''
    }`}>
      {/* App Lock Screen */}
      {isAppLocked && !isAppAuthorized && (
        <div className="fixed inset-0 bg-white dark:bg-black z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-8">
            <Lock className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Instagram Locked</h2>
          <p className="text-slate-500 mb-8">Enter PIN to access your account</p>
          <div className="flex gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-blue-500 ${appLockPin.length >= i ? 'bg-blue-500' : ''}`}></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '←'].map((n, i) => (
              <button 
                key={i} 
                onClick={() => {
                  if (n === '←') setAppLockPin(prev => prev.slice(0, -1));
                  else if (n === '') return;
                  else if (appLockPin.length < 4) {
                    const newPin = appLockPin + n;
                    setAppLockPin(newPin);
                    if (newPin.length === 4) handleUnlock(newPin);
                  }
                }}
                className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="mt-12 text-blue-500 font-bold hover:underline">Log out</button>
        </div>
      )}

      {/* Ghost Mode Indicator */}
      {isGhostMode && (
        <div className="fixed top-4 right-4 z-[150] pointer-events-none">
          <div className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
            <Ghost className="w-3.5 h-3.5" />
            GHOST MODE ACTIVE
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedPostForComments && (
        <div 
          className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => { setShowCommentsModal(false); setSelectedPostForComments(null); }}
        >
          <div 
            className="bg-white dark:bg-[#262626] w-full max-w-[900px] h-[90vh] rounded-r-xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: Image */}
            <div className="hidden md:flex flex-1 bg-black items-center justify-center border-r border-[#efefef] dark:border-slate-800">
              <img 
                src={normalizeImageUrl(selectedPostForComments.imageUrl)} 
                className="w-full h-full object-contain" 
                alt="" 
              />
            </div>

            {/* Right side: Comments */}
            <div className="w-full md:w-[400px] flex flex-col bg-white dark:bg-black">
              {/* Header */}
              <div className="h-14 border-b border-[#efefef] dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#efefef] dark:border-slate-800">
                    <img src={normalizeImageUrl(selectedPostForComments.user?.profilePicture)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="font-bold text-[14px]">{selectedPostForComments.user?.username}</span>
                </div>
                <button onClick={() => { setShowCommentsModal(false); setSelectedPostForComments(null); }} className="hover:opacity-50 transition-opacity">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                {/* Caption */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={normalizeImageUrl(selectedPostForComments.user?.profilePicture)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="text-[14px]">
                    <span className="font-bold mr-2">{selectedPostForComments.user?.username}</span>
                    {selectedPostForComments.caption}
                  </div>
                </div>

                {/* All Comments */}
                {selectedPostForComments.comments.map((comment, i) => (
                  <div key={i} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-black/5 dark:border-white/5">
                      <img src={normalizeImageUrl(comment.user?.profilePicture)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px]">
                        <span className="font-bold mr-2 cursor-pointer hover:text-slate-500">{comment.user?.username || 'user'}</span>
                        {comment.text}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500 font-medium">
                        <span>2h</span>
                        {comment.likes?.length > 0 && <span>{comment.likes.length} likes</span>}
                        <button className="font-bold hover:text-slate-400">Reply</button>
                      </div>
                      
                      {comment.aiAnalysis?.classification && comment.aiAnalysis.classification !== 'Real' && (
                        <div className={`mt-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${comment.aiAnalysis.classification === 'Scam' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {comment.aiAnalysis.classification === 'Scam' ? <ShieldAlert className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          AI Security: {comment.aiAnalysis.classification}
                        </div>
                      )}
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-[#efefef] dark:border-slate-800 shrink-0 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Heart className={`w-6 h-6 cursor-pointer hover:opacity-50 transition-all ${selectedPostForComments.hasLiked ? 'fill-[#ff3040] text-[#ff3040]' : ''}`} />
                    <MessageCircle className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all" />
                    <Send className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all" onClick={() => handleSharePost(selectedPostForComments)} />
                  </div>
                  <Bookmark className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all" onClick={() => handleSavePost(selectedPostForComments)} />
                </div>
                <p className="font-bold text-[14px]">{selectedPostForComments.likeCount?.toLocaleString()} likes</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">MARCH 22, 2026</p>
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-[#efefef] dark:border-slate-800 flex items-center gap-3 shrink-0">
                <Smile className="w-6 h-6 cursor-pointer text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-slate-500"
                  value={commentTexts[selectedPostForComments._id] || ''}
                  onChange={(e) => handleCommentChange(selectedPostForComments._id, e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(selectedPostForComments._id)}
                />
                <button 
                  onClick={() => handleCommentSubmit(selectedPostForComments._id)}
                  disabled={!commentTexts[selectedPostForComments._id]?.trim()}
                  className={`text-[#0095f6] font-bold text-[14px] ${!commentTexts[selectedPostForComments._id]?.trim() ? 'opacity-30 cursor-default' : 'hover:text-blue-700'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => { setShowShareModal(false); setSharingPost(null); }}
        >
          <div 
            className="bg-white dark:bg-[#262626] w-full max-w-[550px] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 border-b border-[#efefef] dark:border-slate-800 flex items-center px-6 relative shrink-0">
              <div className="w-full text-center font-bold text-lg">Share</div>
              <button 
                onClick={() => { setShowShareModal(false); setSharingPost(null); }} 
                className="absolute right-6 hover:opacity-50 transition-opacity"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Search Recipients */}
            <div className="p-6 border-b border-[#efefef] dark:border-slate-800 space-y-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[14px]">To:</span>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-transparent outline-none text-[14px]"
                  autoFocus
                />
              </div>
            </div>

            {/* Suggested List (Mocked) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <p className="px-2 mb-4 font-bold text-[14px]">Suggested</p>
              <div className="space-y-1">
                {suggestions.map((user) => (
                  <div 
                    key={user._id} 
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group"
                    onClick={() => shareToUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-[#efefef] dark:border-slate-800">
                        <img src={normalizeImageUrl(user.profilePicture)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px]">{user.username}</span>
                        <span className="text-slate-500 text-[14px]">{user.fullName}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-blue-500 transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-[#efefef] dark:border-slate-800 shrink-0">
              <button 
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${sharingPost?._id}`;
                  navigator.clipboard.writeText(postUrl);
                  showToast('Link copied to clipboard!', 'success');
                  setShowShareModal(false);
                  setSharingPost(null);
                }}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      <StoryViewer />

      {/* Toast Notification */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      {/* User List Modal (Followers/Following) */}
      <UserListModal 
        isOpen={showUserListModal} 
        onClose={() => setShowUserListModal(false)} 
        type={userListModalType} 
        user={selectedUser || currentUser} 
      />

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[500px] rounded-xl overflow-hidden shadow-2xl">
            <div className="h-11 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
              <button onClick={() => setShowEditProfileModal(false)} className="text-[14px]">Cancel</button>
              <h3 className="font-bold text-[16px]">Edit profile</h3>
              <button onClick={handleUpdateProfile} className="text-[#0095f6] font-bold text-[14px]">Done</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <img src={normalizeImageUrl(currentUser?.profilePicture)} className="w-14 h-14 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="font-bold text-[14px]">{currentUser?.username}</span>
                  <button className="text-[#0095f6] text-[13px] font-bold">Change profile photo</button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase ml-1">Name</label>
                  <input 
                    type="text" 
                    value={editProfileData.fullName}
                    onChange={(e) => setEditProfileData({...editProfileData, fullName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-4 py-2.5 outline-none border border-[#dbdbdb] dark:border-slate-800 text-[14px]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase ml-1">Bio</label>
                  <textarea 
                    rows="3"
                    value={editProfileData.bio}
                    onChange={(e) => setEditProfileData({...editProfileData, bio: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg px-4 py-2.5 outline-none border border-[#dbdbdb] dark:border-slate-800 text-[14px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[600px] h-[80vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-11 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4 shrink-0">
              <div className="w-8"></div>
              <h3 className="font-bold text-[16px]">Archive</h3>
              <button onClick={() => setShowArchiveModal(false)}><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="flex gap-4 border-b border-[#efefef] dark:border-slate-800 mb-6">
                <button className="pb-3 border-b-2 border-black dark:border-white font-bold text-[14px]">Posts archive</button>
                <button className="pb-3 text-slate-400 font-bold text-[14px]">Stories archive</button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {/* Mocking some archived posts */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-900 relative group cursor-pointer">
                    <img src={`https://picsum.photos/seed/archive${i}/400/400`} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-8 h-8 text-white/50" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center py-20 text-slate-400 text-sm">
                Only you can see your archived posts.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col">
              <button 
                onClick={() => { showToast('Apps and websites settings loading...', 'info'); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Apps and websites
              </button>
              <button 
                onClick={() => { showToast('QR Code generated successfully', 'success'); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                QR Code
              </button>
              <button 
                onClick={() => { showToast('Notification preferences updated', 'success'); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Notifications
              </button>
              <button 
                onClick={() => { showToast('Opening Settings and Privacy...', 'info'); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Settings and privacy
              </button>
              <button 
                onClick={() => { showToast('Supervision dashboard opening...', 'info'); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Supervision
              </button>
              <div className="py-2 px-4 border-b border-[#efefef] dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10">
                <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Honista Mods</span>
              </div>
              <button 
                onClick={() => { setShowAIAnalysisModal(true); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] font-bold text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> 
                AI Security Dashboard
              </button>
              <button 
                onClick={() => { toggleGhostMode(); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Ghost className={`w-4 h-4 ${isGhostMode ? 'text-purple-500' : ''}`} /> 
                {isGhostMode ? 'Disable Ghost Mode' : 'Enable Ghost Mode'}
              </button>
              <button 
                onClick={() => { handleAppLockToggle(); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> App Lock Settings
              </button>
              <button 
                onClick={() => { setShowSwitchAccountModal(true); setShowSettingsModal(false); }}
                className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Switch accounts
              </button>
              <button onClick={handleLogout} className="w-full py-3.5 border-b border-[#efefef] dark:border-slate-800 text-[14px] text-red-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Log out</button>
              <button onClick={() => setShowSettingsModal(false)} className="w-full py-3.5 text-[14px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      {showSwitchAccountModal && (
        <div className="fixed inset-0 bg-black/60 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-11 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
              <div className="w-8"></div>
              <h3 className="font-bold text-[16px]">Switch accounts</h3>
              <button onClick={() => setShowSwitchAccountModal(false)}><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="py-2">
              {/* Current Account */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <img src={normalizeImageUrl(currentUser?.profilePicture)} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <span className="font-bold text-[14px]">{currentUser?.username}</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#0095f6] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>
              
              {/* Other Accounts (Mocked) */}
              {[
                { _id: '1', username: 'rohit_alt', fullName: 'Rohit Gupta', profilePicture: 'https://i.pravatar.cc/150?u=rohit' },
                { _id: '2', username: 'kalindi_rainbows', fullName: 'Kalindi', profilePicture: 'https://i.pravatar.cc/150?u=kalindi' }
              ].filter(acc => acc.username !== currentUser?.username).map(acc => (
                <div 
                  key={acc._id} 
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => handleSwitchAccount(acc)}
                >
                  <div className="flex items-center gap-3">
                    <img src={normalizeImageUrl(acc.profilePicture)} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <span className="font-bold text-[14px]">{acc.username}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#efefef] dark:border-slate-800 p-4">
              <button 
                onClick={() => {
                  setShowSwitchAccountModal(false);
                  handleLogout();
                }}
                className="w-full text-[#0095f6] font-bold text-[14px] py-2 hover:opacity-70 transition-opacity"
              >
                Log into an existing account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 ${showSearch || showNotifications ? 'w-[72px]' : 'w-[72px] xl:w-[244px]'} border-r border-[#efefef] dark:border-slate-800 bg-white dark:bg-black z-50 flex flex-col px-3 pt-2 pb-5 transition-all duration-300`}>
        <div className={`mb-10 px-3 h-20 flex items-center ${showSearch || showNotifications ? 'hidden' : 'hidden xl:flex'}`} onClick={() => setActiveTab('feed')}>
          <h1 className="text-[24px] font-serif italic font-bold tracking-tight cursor-pointer select-none">Instagram</h1>
        </div>
        <div className={`mb-10 h-20 flex items-center justify-center ${showSearch || showNotifications ? 'flex' : 'xl:hidden flex'}`} onClick={() => setActiveTab('feed')}>
          <Instagram className="w-6 h-6 cursor-pointer" />
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {[
            { id: 'feed', icon: Home, label: 'Home' },
            { id: 'search', icon: Search, label: 'Search' },
            { id: 'explore', icon: Compass, label: 'Explore' },
            { id: 'reels', icon: Film, label: 'Reels' },
            { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 8 },
            { id: 'notifications', icon: Heart, label: 'Notifications', badge: notifications.filter(n => !n.isRead).length },
            { id: 'create', icon: Plus, label: 'Create' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item) => {
            const isActive = activeTab === item.id || (item.id === 'search' && showSearch) || (item.id === 'notifications' && showNotifications);
            return (
              <button 
                key={item.id}
                onClick={() => {
                  if (item.id === 'create') {
                    setShowCreateModal(true);
                  } else if (item.id === 'search') {
                    setShowSearch(!showSearch);
                    setShowNotifications(false);
                  } else if (item.id === 'notifications') {
                    setShowNotifications(!showNotifications);
                    setShowSearch(false);
                  } else {
                    setActiveTab(item.id);
                    setShowSearch(false);
                    setShowNotifications(false);
                    if (item.id === 'profile') setSelectedUser(null);
                  }
                }}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all group relative w-full ${isActive ? 'font-bold' : 'font-normal'}`}
              >
                <item.icon className={`w-6 h-6 shrink-0 transition-transform group-active:scale-90 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className={`${showSearch || showNotifications ? 'hidden' : 'hidden xl:block'} text-[16px] tracking-tight`}>{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-2 left-7 bg-[#ff3040] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-black min-w-[18px] flex items-center justify-center h-[18px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto relative">
          {showMoreMenu && (
            <div className="absolute bottom-14 left-0 w-72 bg-white dark:bg-[#262626] shadow-[0_4px_24px_rgba(0,0,0,0.15)] rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2 z-[60] animate-in slide-in-from-bottom-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5" /> Honista Mods
                </div>
              </div>
              
              <button 
                onClick={toggleGhostMode}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Ghost className={`w-[18px] h-[18px] ${isGhostMode ? 'text-purple-500' : ''}`} />
                  <span className={`text-sm ${isGhostMode ? 'font-bold' : ''}`}>Ghost Mode</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isGhostMode ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isGhostMode ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
              </button>

              <button 
                onClick={handleAppLockToggle}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isAppLocked ? <Lock className="w-[18px] h-[18px] text-blue-500" /> : <Unlock className="w-[18px] h-[18px]" />}
                  <span className={`text-sm ${isAppLocked ? 'font-bold' : ''}`}>App Lock</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isAppLocked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isAppLocked ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>

              {[
                { label: 'Settings', icon: Settings, onClick: () => setShowSettingsModal(true) },
                { label: 'Your activity', icon: Activity, onClick: () => setShowActivityModal(true) },
                { label: 'Saved', icon: Bookmark, onClick: () => { setActiveTab('profile'); setShowSavedTab(true); } },
                { label: 'Switch appearance', icon: LayoutGrid, onClick: toggleDarkMode },
                { label: 'Report a problem', icon: AlertTriangle, onClick: () => setShowReportModal(true) },
                { label: 'Log out', icon: LogOut, danger: true, onClick: handleLogout }
              ].map((menuItem, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    if (menuItem.onClick) menuItem.onClick();
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm ${menuItem.danger ? 'text-red-500' : ''}`}
                >
                  <menuItem.icon className="w-[18px] h-[18px]" />
                  <span>{menuItem.label}</span>
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
          >
            <Menu className={`w-6 h-6 group-hover:scale-105 transition-transform ${showMoreMenu ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className={`${showSearch || showNotifications ? 'hidden' : 'hidden xl:block'} text-[16px]`}>More</span>
          </button>
        </div>
      </aside>

      {/* Search Panel Overlay */}
      {showSearch && (
        <div className="fixed left-[72px] top-0 bottom-0 w-[397px] bg-white dark:bg-black border-r border-[#efefef] dark:border-slate-800 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.05)] animate-in slide-in-from-left duration-300 rounded-r-2xl overflow-hidden flex flex-col">
          <div className="p-6 pt-8 pb-4 shrink-0">
            <h2 className="text-[24px] font-bold mb-8 tracking-tight">Search</h2>
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#efefef] dark:bg-[#262626] rounded-lg px-4 py-2.5 outline-none text-[16px] placeholder:text-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#c7c7c7] dark:bg-slate-600 rounded-full p-0.5 hover:opacity-80 transition-opacity"
                >
                  <CloseIcon className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-[#efefef] dark:border-slate-800">
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="font-bold text-[16px]">Recent</span>
              {searchResults.length > 0 && (
                <button 
                  onClick={() => { /* Logic to clear search history */ }}
                  className="text-[#0095f6] text-[14px] font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-1 pb-10">
              {searchResults.length > 0 ? (
                <div className="px-2">
                  {searchResults.map(user => (
                    <div 
                      key={user._id} 
                      className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors group"
                      onClick={() => { setShowSearch(false); openUserProfile(user._id); }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={normalizeImageUrl(user.profilePicture)} className="w-11 h-11 rounded-full object-cover border border-black/5" alt="" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[14px] tracking-tight truncate">{user.username}</span>
                            {user.isVerified && <CheckCircle2 className="w-3 h-3 text-[#0095f6] fill-[#0095f6]" />}
                          </div>
                          <span className="text-slate-500 text-[14px] font-normal truncate">{user.fullName}</span>
                        </div>
                      </div>
                      <CloseIcon className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-40 px-10 text-center">
                  <span className="text-slate-500 text-[14px] font-medium opacity-60">No results found.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel Overlay */}
      {showNotifications && (
        <div className="fixed left-[72px] top-0 bottom-0 w-[397px] bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800 z-40 shadow-2xl animate-in slide-in-from-left duration-300 rounded-r-3xl overflow-hidden flex flex-col">
          <div className="p-6 pt-10 shrink-0">
            <h2 className="text-2xl font-bold mb-8">Notifications</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="space-y-6 pb-10">
              {notifications.length > 0 ? (
                notifications.map(notif => {
                  const isFollowing = currentUser?.following?.some(f => (f._id || f) === notif.sender?._id);
                  return (
                    <div key={notif._id} className="flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative shrink-0 cursor-pointer" onClick={() => { setShowNotifications(false); openUserProfile(notif.sender._id); }}>
                          <img 
                            src={normalizeImageUrl(notif.sender?.profilePicture)} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-100 dark:border-slate-800" 
                            alt="" 
                          />
                        </div>
                        <div className="text-[14px] leading-[1.2] min-w-0">
                          <div className="flex flex-wrap items-center gap-x-1">
                            <span 
                              className="font-bold cursor-pointer hover:opacity-70 transition-opacity truncate inline-block max-w-[120px]" 
                              onClick={() => { setShowNotifications(false); openUserProfile(notif.sender._id); }}
                            >
                              {notif.sender?.username}
                            </span>
                            <span className="text-slate-900 dark:text-slate-200">
                              {notif.type === 'like' && 'liked your photo.'}
                              {notif.type === 'comment' && `commented: ${notif.content}`}
                              {notif.type === 'follow' && 'started following you.'}
                              {notif.type === 'security' && notif.content}
                            </span>
                            {notif.isSecurityAlert && (
                              <span className="bg-red-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded tracking-tighter uppercase flex items-center gap-1 shrink-0 ml-1">
                                <ShieldAlert className="w-2 h-2" /> AI ALERT
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 text-[12px]">2h</span>
                        </div>
                      </div>
                      
                      {notif.post && notif.type !== 'follow' && (
                        <img 
                          src={normalizeImageUrl(notif.post.imageUrl)} 
                          className="w-11 h-11 object-cover rounded-sm shrink-0 border border-slate-100 dark:border-slate-800 cursor-pointer" 
                          alt="" 
                          onClick={() => { setShowNotifications(false); setActiveTab('feed'); }}
                        />
                      )}
                      
                      {notif.type === 'follow' && (
                        <button 
                          onClick={() => handleFollow(notif.sender?._id)}
                          className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                            isFollowing 
                              ? 'bg-[#efefef] dark:bg-slate-800 text-black dark:text-white hover:bg-[#dbdbdb] dark:hover:bg-slate-700' 
                              : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white mb-1">No notifications yet</p>
                  <p className="text-[14px] text-slate-500">When someone likes or comments on one of your posts, you'll see it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${showSearch || showNotifications ? 'ml-[72px]' : 'ml-[72px] lg:ml-[244px]'} flex justify-center transition-all duration-300 bg-white dark:bg-black`}>
        <div className={`w-full ${activeTab === 'feed' ? 'max-w-[935px]' : activeTab === 'messages' ? 'max-w-none' : 'max-w-[935px]'} ${activeTab === 'messages' ? 'px-0 py-0' : 'px-4 lg:px-0 py-8'} flex gap-8 justify-center`}>
          
          {/* Feed / Active Tab Content */}
          <div className={`${activeTab === 'feed' ? 'w-full max-w-[630px]' : activeTab === 'messages' ? 'w-full h-screen' : 'w-full'} transition-all duration-300`}>
            {activeTab === 'messages' ? (
              <div className="h-full w-full">
                <InstagramMessages isGhostMode={isGhostMode} showToast={showToast} openUserProfile={openUserProfile} />
              </div>
            ) : activeTab === 'reels' ? (
              <div className="max-w-md mx-auto h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-20">
                {postsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (Array.isArray(reels) && reels.length > 0) ? (
                  reels.map((reel) => (
                    <div key={reel._id} className="h-full w-full snap-start relative bg-black flex items-center justify-center">
                      <video 
                        ref={el => videoRefs.current[reel._id] = el}
                        src={reel.videoUrl} 
                        loop muted playsInline
                        className="h-full w-full object-cover"
                      />
                      {/* Reel UI Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 p-4 flex flex-col justify-end">
                        <div className="flex items-end justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <img src={normalizeImageUrl(reel.user?.profilePicture)} className="w-8 h-8 rounded-full border border-white" alt="" />
                              <span className="text-white font-bold text-sm">{reel.user?.username || 'user'}</span>
                            <button className="border border-white text-white text-xs px-3 py-1 rounded-lg font-bold">Follow</button>
                          </div>
                            <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
                          </div>
                          <div className="flex flex-col items-center gap-6 pb-4">
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => handleLike(reel._id)}>
                              <Heart className={`w-7 h-7 ${reel.hasLiked || (currentUser && reel.likes?.includes(currentUser._id)) ? 'fill-[#ff3040] text-[#ff3040]' : 'text-white'}`} />
                              <span className="text-white text-xs font-bold">{reel.likeCount}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => showToast('Opening comments...', 'info')}>
                              <MessageCircle className="w-7 h-7 text-white" />
                              <span className="text-white text-xs font-bold">{reel.comments.length}</span>
                            </div>
                            <Send 
                              onClick={() => handleSharePost(reel)}
                              className="w-7 h-7 text-white cursor-pointer hover:opacity-70 transition-opacity" 
                            />
                            <Bookmark 
                              onClick={() => handleSavePost(reel)}
                              className={`w-7 h-7 cursor-pointer hover:opacity-70 transition-opacity ${savedPosts.some(p => p._id === reel._id) ? 'fill-white text-white' : 'text-white'}`} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-500">No reels available.</div>
                )}
              </div>
            ) : activeTab === 'explore' ? (
              <ExplorePage />
            ) : activeTab === 'feed' ? (
              <div className="space-y-8">
                {/* Stories Row */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 mb-4">
                  {/* Your Story */}
                  <div className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer group" onClick={() => {
                    const myStoryIdx = stories.findIndex(s => s.user?._id === currentUser?._id);
                    if (myStoryIdx !== -1) {
                      setActiveUserIndex(myStoryIdx);
                      setActiveStoryIndex(0);
                    } else {
                      setShowStoryUpload(true);
                    }
                  }}>
                    <div className="w-[66px] h-[66px] rounded-full p-[3px] border border-[#dbdbdb] flex items-center justify-center relative bg-white dark:bg-black">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src={normalizeImageUrl(currentUser?.profilePicture)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-[#0095f6] rounded-full p-0.5 border-2 border-white dark:border-black">
                        {stories.some(s => s.user?._id === currentUser?._id) ? (
                          <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#0095f6] rounded-full" />
                          </div>
                        ) : (
                          <Plus className="w-3 h-3 text-white fill-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-xs truncate w-[72px] text-center text-slate-500">Your story</span>
                  </div>

                  {stories.filter(item => item.user?._id !== currentUser?._id).map((item, idx) => (
                    <div key={item.user?._id || idx} className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer group" onClick={() => {
                      // Need to find the correct index in the original stories array
                      const originalIdx = stories.findIndex(s => s.user?._id === item.user?._id);
                      setActiveUserIndex(originalIdx);
                      setActiveStoryIndex(0);
                    }}>
                      <div className="w-[66px] h-[66px] rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
                        <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-black">
                          <img src={normalizeImageUrl(item.user?.profilePicture)} 
                            alt={item.user?.username || 'user'} 
                            className="w-full h-full rounded-full object-cover border border-black/5" 
                          />
                        </div>
                      </div>
                      <span className="text-xs truncate w-[72px] text-center text-slate-700 dark:text-slate-300 group-hover:text-slate-500">{item.user?.username || 'user'}</span>
                    </div>
                  ))}
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <article key={post._id} className="border-b border-[#efefef] dark:border-slate-800 pb-4 mb-4">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] cursor-pointer" onClick={() => openUserProfile(post.user?._id)}>
                              <div className="w-full h-full rounded-full border-[1.5px] border-white dark:border-black overflow-hidden">
                                <img src={normalizeImageUrl(post.user?.profilePicture)} className="w-full h-full object-cover" alt="" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[14px] hover:text-slate-500 cursor-pointer" onClick={() => openUserProfile(post.user?._id)}>{post.user?.username || 'user'}</span>
                              {post.user?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#0095f6] fill-[#0095f6]" />}
                              <span className="text-slate-500 text-[14px] font-normal">• 2h</span>
                            </div>
                          </div>
                          <MoreHorizontal className="w-6 h-6 cursor-pointer hover:text-slate-500" />
                        </div>

                        {/* Post Image */}
                        <div className="rounded-[4px] overflow-hidden border border-[#efefef] dark:border-slate-800 bg-white dark:bg-black relative">
                          {/* AI Generated Content Badge - Top Right of Image */}
                          {post.isFake && (
                            <div className="absolute top-3 right-3 z-[10] bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-white/20 animate-in fade-in zoom-in duration-300">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">AI Generated</span>
                            </div>
                          )}
                          <img 
                            src={normalizeImageUrl(post.imageUrl)} 
                            className="w-full object-cover min-h-[300px] max-h-[700px]" 
                            alt="" 
                            onDoubleClick={() => handleLike(post._id)}
                            onError={(e) => {
                              e.target.src = 'https://i.pravatar.cc/1000?u=' + post._id;
                            }}
                          />
                        </div>

                        {/* Post Actions */}
                        <div className="mt-3 space-y-2.5">
                          <div className="flex justify-between items-center px-1">
                            <div className="flex gap-4">
                              <Heart 
                                onClick={() => handleLike(post._id)}
                                className={`w-6 h-6 cursor-pointer hover:opacity-50 transition-all active:scale-125 ${post.hasLiked || (currentUser && post.likes?.includes(currentUser._id)) ? 'fill-[#ff3040] text-[#ff3040]' : 'text-black dark:text-white'}`} 
                              />
                              <MessageCircle 
                                onClick={() => {
                                  setSelectedPostForComments(post);
                                  setShowCommentsModal(true);
                                }}
                                className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all text-black dark:text-white" 
                              />
                              <Send 
                                onClick={() => handleSharePost(post)}
                                className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all text-black dark:text-white" 
                              />
                              <Download 
                                onClick={() => downloadMedia(post.imageUrl, `post_${post.user?.username}_${post._id}.jpg`)}
                                className="w-6 h-6 cursor-pointer hover:opacity-50 transition-all text-black dark:text-white" 
                              />
                            </div>
                            <Bookmark 
                              onClick={() => handleSavePost(post)}
                              className={`w-6 h-6 cursor-pointer hover:opacity-50 transition-all ${savedPosts.some(p => p._id === post._id) ? 'fill-black dark:fill-white text-black dark:text-white' : 'text-black dark:text-white'}`} 
                            />
                          </div>
                          
                          <div className="px-1 space-y-1.5">
                            <p className="font-bold text-[14px]">{post.likeCount?.toLocaleString()} likes</p>
                            <div className="space-y-1">
                              <p className="text-[14px] leading-relaxed">
                                <span className="font-bold mr-2 cursor-pointer hover:text-slate-500" onClick={() => openUserProfile(post.user?._id)}>{post.user?.username || 'user'}</span>
                                {post.caption}
                              </p>
                              
                              {/* AI Risk Indicator for Post */}
                              {(post.isFake || (post.aiAnalysis && post.aiAnalysis.riskScore > 0)) && (
                                <div className={`px-2.5 py-1.5 mt-2 rounded-xl text-[11px] inline-flex flex-col gap-1 border w-full ${post.isFake ? 'text-red-600 bg-red-50 border-red-100' : getRiskColor(post.aiAnalysis.classification)}`}>
                                  <div className="flex items-center gap-2">
                                    {post.isFake ? <ShieldAlert className="w-4 h-4" /> : post.aiAnalysis.classification === 'Scam' ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                    <span className="font-black tracking-tighter uppercase">
                                      {post.isFake ? `Fake Post Detected (${post.fakeConfidence}% confidence)` : `AI Security: ${post.aiAnalysis.classification}`}
                                    </span>
                                  </div>
                                  {post.isFake && (
                                    <p className="text-[10px] opacity-80 leading-tight">SocialShield AI has flagged this content as potentially misleading or AI-generated.</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {post.comments?.length > 0 && (
                              <div className="space-y-1 mt-2">
                                {post.comments.slice(-2).map((comment, i) => (
                                  <div key={i} className="text-[14px] leading-relaxed group">
                                    <span className="font-bold mr-2 cursor-pointer hover:text-slate-500">{comment.user?.username || 'user'}</span>
                                    {comment.text}
                                    {comment.aiAnalysis?.classification && comment.aiAnalysis.classification !== 'Real' && (
                                      <span className={`ml-2 px-1 rounded text-[9px] font-bold uppercase ${comment.aiAnalysis.classification === 'Scam' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                        AI Security: {comment.aiAnalysis.classification}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {post.comments.length > 2 && (
                                  <button 
                                    onClick={() => {
                                      setSelectedPostForComments(post);
                                      setShowCommentsModal(true);
                                    }}
                                    className="text-slate-500 text-[14px] hover:text-slate-400 mt-1"
                                  >
                                    View all {post.comments.length} comments
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Add Comment Input */}
                            <div className="flex items-center justify-between border-b border-transparent focus-within:border-[#efefef] py-1">
                              <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                className="w-full bg-transparent text-[14px] outline-none placeholder:text-slate-500 py-2"
                                value={commentTexts[post._id] || ''}
                                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                              />
                              <button 
                                onClick={() => handleCommentSubmit(post._id)}
                                disabled={!commentTexts[post._id]?.trim() || commentingLoading[post._id]}
                                className={`text-[#0095f6] font-bold text-[14px] transition-opacity ml-2 ${!commentTexts[post._id]?.trim() || commentingLoading[post._id] ? 'opacity-30 cursor-default' : 'opacity-100 hover:opacity-80'}`}
                              >
                                {commentingLoading[post._id] ? '...' : 'Post'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <ProfilePage />
            )}
          </div>

      {/* Right Sidebar: Suggestions (Only on Feed) */}
          {activeTab === 'feed' && (
            <div className="hidden xl:block w-[319px] shrink-0 pt-4 space-y-4">
              {/* My Profile Section */}
              <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-[#efefef] dark:border-slate-800 cursor-pointer" onClick={() => setActiveTab('profile')}>
                    <img src={normalizeImageUrl(currentUser?.profilePicture)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[14px] tracking-tight cursor-pointer hover:text-slate-500 transition-colors" onClick={() => setActiveTab('profile')}>{currentUser?.username}</span>
                    <span className="text-slate-500 text-[14px] font-normal">{currentUser?.fullName}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSwitchAccountModal(true)}
                  className="text-[#0095f6] text-xs font-bold hover:text-slate-900 transition-colors active:opacity-50"
                >
                  Switch
                </button>
              </div>

              {/* Suggestions Header */}
              <div className="flex justify-between items-center py-1 px-1">
                <span className="text-slate-500 text-[14px] font-bold">Suggested for you</span>
                <button className="text-xs font-bold hover:text-slate-400 transition-colors text-slate-900 dark:text-white">See all</button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-3 px-1">
                {suggestions.map((item, i) => (
                  <div key={item._id || i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full overflow-hidden border border-[#efefef] dark:border-slate-800 cursor-pointer"
                        onClick={() => openUserProfile(item._id)}
                      >
                        <img src={normalizeImageUrl(item.profilePicture)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[14px] hover:text-slate-500 cursor-pointer" onClick={() => openUserProfile(item._id)}>{item.username}</span>
                          {item.isVerified && <CheckCircle2 className="w-3 h-3 text-[#0095f6] fill-[#0095f6]" />}
                        </div>
                        <span className="text-slate-500 text-[12px] truncate w-[160px]">
                          {item.riskClassification === 'Real' ? 'Suggested for you' : `AI Alert: ${item.riskClassification}`}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollow(item._id)}
                      className="text-[#0095f6] text-xs font-bold hover:text-slate-900 transition-colors"
                    >
                      {currentUser?.following?.some(f => (f._id || f) === item._id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer Links (IG style) */}
              <div className="mt-8 px-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-300 font-medium">
                  {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language', 'Meta Verified'].map(link => (
                    <span key={link} className="cursor-pointer hover:underline">{link}</span>
                  ))}
                </div>
                <div className="mt-4 text-[11px] text-slate-300 font-medium uppercase tracking-wide">
                  © 2026 INSTAGRAM FROM META
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AIAnalysisDashboard />
      {showStoryUpload && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => {
            setShowStoryUpload(false);
            setNewStoryContent(null);
          }}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl overflow-hidden shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="w-8"></div>
              <h3 className="font-bold">Add to Story</h3>
              <button 
                onClick={() => {
                  setShowStoryUpload(false);
                  setNewStoryContent(null);
                }} 
                className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUploadStory} className="p-8 space-y-4">
              <div className="aspect-[9/16] bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                {newStoryContent ? (
                  <div className="w-full h-full relative group">
                    <img src={URL.createObjectURL(newStoryContent)} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setNewStoryContent(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <PlusSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-sm text-slate-500">Click to select story image</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setNewStoryContent(e.target.files[0])}
                />
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  type="submit" 
                  disabled={!newStoryContent}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  Post Story
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowStoryUpload(false);
                    setNewStoryContent(null);
                  }}
                  className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 cursor-pointer"
          onClick={() => setShowCreateModal(false)}
        >
          <button 
            onClick={() => setShowCreateModal(false)}
            className="absolute top-4 right-4 text-white hover:scale-110 transition-transform z-[70]"
          >
            <CloseIcon className="w-8 h-8" />
          </button>
          
          <div 
            className="bg-white dark:bg-[#262626] w-full max-w-[450px] rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-11 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
              <div className="flex items-center gap-1.5 text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Audit Active</span>
              </div>
              <h3 className="font-bold text-[16px]">Create new post</h3>
              {newPostContent.image && !securityBlock ? (
                <button 
                  onClick={handleCreatePost}
                  disabled={loading}
                  className="text-[#0095f6] font-bold text-[14px] hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Share'}
                </button>
              ) : (
                <div className="w-8"></div>
              )}
            </div>
            
            <form onSubmit={handleCreatePost} className="flex flex-col">
              {securityBlock && (
                <div 
                  className="bg-red-500/10 border-b border-red-500/20 p-4"
                >
                  <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">SocialShield AI: Post Blocked</p>
                      <p className="text-sm font-medium leading-tight">{securityBlock.message}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {securityBlock.patterns.map((p, i) => (
                          <span key={i} className="text-[9px] bg-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-center border-b border-[#efefef] dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setNewPostContent({...newPostContent, type: 'post'})}
                  className={`flex-1 py-3 text-[14px] font-bold transition-colors ${newPostContent.type === 'post' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Post
                </button>
                <button 
                  type="button"
                  onClick={() => setNewPostContent({...newPostContent, type: 'reel'})}
                  className={`flex-1 py-3 text-[14px] font-bold transition-colors ${newPostContent.type === 'reel' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Reel
                </button>
              </div>

              <div className="aspect-square flex flex-col items-center justify-center relative bg-white dark:bg-[#262626]">
                {newPostContent.image ? (
                  <div className="w-full h-full relative group">
                    <img src={URL.createObjectURL(newPostContent.image)} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setNewPostContent({...newPostContent, image: null})}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 px-10 text-center">
                    <div className="relative">
                      <Film className="w-20 h-20 stroke-[0.5px] text-slate-800 dark:text-slate-200" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlusSquare className="w-10 h-10 stroke-[1px] text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                    <p className="text-[20px] font-normal text-slate-900 dark:text-white">Drag photos and videos here</p>
                    <div className="relative">
                      <button type="button" className="bg-[#0095f6] hover:bg-[#1877f2] text-white px-4 py-1.5 rounded-lg text-[14px] font-bold transition-colors">
                        Select from computer
                      </button>
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => setNewPostContent({...newPostContent, image: e.target.files[0]})}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {newPostContent.image && (
                <div className="p-4 border-t border-[#efefef] dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={normalizeImageUrl(currentUser?.profilePicture)} className="w-7 h-7 rounded-full object-cover" alt="" />
                    <span className="font-bold text-[14px]">{currentUser?.username}</span>
                  </div>
                  <textarea 
                    placeholder="Write a caption..." 
                    className="w-full bg-transparent text-[14px] outline-none resize-none placeholder:text-slate-400"
                    rows="4"
                    value={newPostContent.caption}
                    onChange={(e) => setNewPostContent({...newPostContent, caption: e.target.value})}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <Search className="w-5 h-5 text-slate-400 cursor-pointer" />
                    <span className="text-xs text-slate-300">{newPostContent.caption.length}/2,200</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-12 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
              <button onClick={() => setShowActivityModal(false)}><CloseIcon className="w-6 h-6" /></button>
              <h3 className="font-bold text-[16px]">Your activity</h3>
              <div className="w-6"></div>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-[18px] font-bold mb-2">One place to manage your activity</h4>
              <p className="text-sm text-slate-500 mb-6">We've added more tools for you to review and manage your photos, videos, account and activity on Instagram.</p>
              <button onClick={() => setShowActivityModal(false)} className="w-full bg-[#0095f6] text-white font-bold py-2 rounded-lg text-sm">Got it</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-12 border-b border-[#efefef] dark:border-slate-800 flex justify-between items-center px-4">
              <button onClick={() => setShowReportModal(false)}><CloseIcon className="w-6 h-6" /></button>
              <h3 className="font-bold text-[16px]">Report a problem</h3>
              <div className="w-6"></div>
            </div>
            <div className="p-6">
              <p className="text-sm font-bold mb-4">How can we help?</p>
              <div className="space-y-3">
                {['Spam or Abuse', 'Something Isn\'t Working', 'General Feedback'].map((opt, i) => (
                  <button key={i} onClick={() => { showToast('Report submitted', 'success'); setShowReportModal(false); }} className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors border border-slate-100 dark:border-slate-800">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramClone;
