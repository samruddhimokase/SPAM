import React, { useState, useEffect } from 'react';
import { User, Shield, ShieldCheck, Mail, Calendar, Settings, Edit3, Users, CheckCircle2, X } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchUserProfile, followInstagramUser, searchUsers } from '../api/api';

const Profile = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  
  const { userId: profileIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('id');

  useEffect(() => {
    const initProfile = async () => {
      try {
        setLoading(true);
        // 1. Load current user (demo rohit)
        const { data: currentRes } = await searchUsers('rohit');
        if (currentRes && currentRes.length > 0) {
          setCurrentUser(currentRes[0]);
        }

        // 2. Load target profile
        const targetId = profileIdParam || queryUserId || currentRes?.[0]?._id;
        if (targetId) {
          const { data } = await fetchUserProfile(targetId);
          setProfileUser(data);
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    };
    initProfile();
  }, [profileIdParam, queryUserId]);

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    
    // Store original state for revert on error
    const originalFollowers = [...profileUser.followers];
    const isFollowing = originalFollowers.some(f => (f._id || f) === currentUser._id);

    // Optimistic UI Update
    setProfileUser({
      ...profileUser,
      followers: isFollowing 
        ? originalFollowers.filter(f => (f._id || f) !== currentUser._id)
        : [...originalFollowers, currentUser]
    });

    try {
      await followInstagramUser(profileUser._id, currentUser._id);
      const { data: refreshed } = await fetchUserProfile(profileUser._id);
      setProfileUser(refreshed);
    } catch (err) {
      console.error('Follow failed, reverting:', err);
      setProfileUser(prev => ({ ...prev, followers: originalFollowers }));
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!profileUser) return <div className="text-center py-20">User not found</div>;

  const isFollowing = profileUser.followers.some(f => (f._id || f) === currentUser?._id);
  const isSelf = currentUser?._id === profileUser._id;

  const UserListModal = ({ title, users, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {users.length > 0 ? users.map(u => (
            <div key={u._id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <img src={u.profilePicture || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold">{u.username}</p>
                    {u.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />}
                  </div>
                  <p className="text-xs text-slate-500">{u.fullName}</p>
                </div>
              </div>
              {!isSelf && u._id !== currentUserId && (
                <button className="text-xs font-bold text-blue-500 hover:text-blue-600">Follow</button>
              )}
            </div>
          )) : (
            <div className="text-center py-10 text-slate-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 py-12">
      {showFollowers && <UserListModal title="Followers" users={profileUser.followers} onClose={() => setShowFollowers(false)} />}
      {showFollowing && <UserListModal title="Following" users={profileUser.following} onClose={() => setShowFollowing(false)} />}

      <div className="card p-0 overflow-hidden relative mb-8">
        <div className="h-48 bg-gradient-to-r from-primary to-accent"></div>
        <div className="p-8 pt-0 -mt-16 flex flex-col md:flex-row items-end gap-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl relative">
            <div className="w-full h-full rounded-2xl bg-slate-200 flex items-center justify-center overflow-hidden">
              <img src={profileUser.profilePicture || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1.5 border-4 border-white dark:border-slate-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profileUser.fullName}</h1>
              {profileUser.isVerified && <CheckCircle2 className="text-blue-500 fill-blue-500 w-6 h-6" />}
            </div>
            <p className="text-slate-500">@{profileUser.username}</p>
            
            <div className="flex gap-6 mt-4">
              <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setShowFollowers(true)}>
                <span className="font-bold">{profileUser.followers.length}</span>
                <span className="text-slate-500 text-sm ml-1">followers</span>
              </div>
              <div className="cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setShowFollowing(true)}>
                <span className="font-bold">{profileUser.following.length}</span>
                <span className="text-slate-500 text-sm ml-1">following</span>
              </div>
            </div>
          </div>
          <div className="pb-4 flex gap-2">
            {isSelf ? (
              <>
                <button className="btn bg-slate-100 dark:bg-slate-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button className="btn btn-primary flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </>
            ) : (
              <button 
                onClick={handleFollow}
                className={`btn transition-all duration-200 active:scale-95 ${isFollowing ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'btn-primary'} flex items-center gap-2 px-8 font-bold`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Account Safety</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-800">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-bold">Verified Identity</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-bold">Safe Account (99/100)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">john@example.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Joined March 2026</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Security Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-2xl font-bold text-primary">42</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Blocked Attempts</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-2xl font-bold text-secondary">15</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Scams Reported</p>
                </div>
              </div>
            </div>

            <div className="card border-none bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-bold mb-2">Recent Safety Alerts</h4>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Login from new device</p>
                    <p className="text-[10px] text-slate-500">Today, 2:45 PM • New York, USA</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">YOU</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;