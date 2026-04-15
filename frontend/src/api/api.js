import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// Instagram
export const fetchInstagramPosts = (type) => api.get(`/instagram/posts${type ? `?type=${type}` : ''}`);
export const uploadInstagramPost = (formData) => api.post('/instagram/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const likeInstagramPost = (id, data) => api.post(`/instagram/like/${id}`, data);
export const commentInstagramPost = (id, data) => api.post(`/instagram/comment/${id}`, data);
export const fetchInstagramStories = () => api.get('/instagram/stories');
export const uploadInstagramStory = (formData) => api.post('/instagram/stories/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const analyzeInstagramProfile = (profileData) => api.post('/instagram/analyze-profile', { profileData });
export const followInstagramUser = (targetId, currentUserId) => api.post(`/instagram/user/follow/${targetId}`, { currentUserId });
export const fetchUserProfile = (userId) => api.get(`/instagram/user/profile/${userId}`);
export const searchUsers = (query) => api.get(`/instagram/search?query=${query}`);
export const fetchNotifications = (userId) => api.get(`/instagram/notifications/${userId}`);
export const fetchSuggestions = (userId) => api.get(`/instagram/suggestions?userId=${userId}`);
export const fetchFollowing = (userId) => api.get(`/instagram/following/${userId}`);

// Telegram
export const detectTelegramScam = (text) => api.post('/telegram/detect-scam', { text });

// WhatsApp
export const checkWhatsAppNumber = (number) => api.get(`/whatsapp/check-number/${number}`);
export const reportWhatsAppNumber = (data) => api.post('/whatsapp/report-number', data);
export const fetchWhatsAppChats = (userId) => api.get(`/whatsapp/chats?userId=${userId}`);
export const getOrCreateChat = (data) => api.post('/whatsapp/chats', data);
export const fetchWhatsAppMessages = (chatId) => api.get(`/whatsapp/messages/${chatId}`);
export const sendWhatsAppMessage = (data) => api.post('/whatsapp/messages', data);

// Analyzer
export const analyzeScreenshot = (formData) => api.post('/analyzer/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const analyzeUrl = (url) => api.post('/analyzer/analyze-url', { url });

export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return 'https://i.pravatar.cc/150?u=placeholder';
  
  // Resolve local uploads
  if (url.startsWith('/')) {
    return `http://localhost:5001${url}`;
  }
  
  // Replace blocked Unsplash URLs
  if (url.includes('unsplash.com')) {
    const match = url.match(/photo-([a-zA-Z0-9-]+)/);
    const id = match ? match[1] : Math.random().toString(36).substring(7);
    // Use a larger size for posts, smaller for avatars
    const size = url.includes('w=100') ? 150 : 1000;
    return `https://i.pravatar.cc/${size}?u=${id}`;
  }
  
  return url;
};

export default api;