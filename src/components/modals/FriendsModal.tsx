'use client';

import React, { useState, useEffect } from 'react';
import { useFriends } from '@/context/FriendsContext';
import { useToast } from '@/context/ToastContext';
import {
  Users,
  UserPlus,
  Inbox,
  X,
  Search,
  Tv,
  Check,
  Trash2,
  Share2,
  Copy,
  Sparkles,
  Flame,
  MessageSquare
} from 'lucide-react';

export const FriendsModal: React.FC = () => {
  const {
    friends,
    requests,
    suggestedFriends,
    isFriendsModalOpen,
    activeTab,
    myFriendCode,
    closeFriendsModal,
    setActiveTab,
    addFriend,
    addSuggestedFriend,
    removeFriend,
    acceptRequest,
    declineRequest,
    sendWatchPartyInvite
  } = useFriends();

  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [addInput, setAddInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFriendsModalOpen) {
        closeFriendsModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFriendsModalOpen, closeFriendsModal]);

  // Lock scroll when open
  useEffect(() => {
    if (isFriendsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFriendsModalOpen]);

  if (!isFriendsModalOpen) return null;

  const filteredFriends = friends.filter(
    (f) =>
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addInput.trim()) return;
    const res = addFriend(addInput.trim());
    if (res.success) {
      setAddInput('');
      setActiveTab('friends');
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`kamui.stream/add/${myFriendCode}`);
      setCopiedCode(true);
      showToast('Friend invite link copied to clipboard! 📋', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div
      className="friends-modal-overlay"
      id="friendsModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="friendsModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFriendsModal();
      }}
    >
      <div className="friends-modal-container" id="friendsModalContainer">
        {/* Header */}
        <div className="friends-modal-header">
          <div className="friends-header-title-wrap">
            <div className="friends-header-icon">
              <Users size={20} />
            </div>
            <div>
              <h2 className="friends-header-title" id="friendsModalTitle">
                Anime Friends &amp; Watch Party
              </h2>
              <p className="friends-header-subtitle">
                Connect with anime fans, stream simulcasts together in real time
              </p>
            </div>
          </div>
          <button
            type="button"
            className="friends-close-btn"
            id="friendsCloseBtn"
            onClick={closeFriendsModal}
            aria-label="Close friends window"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="friends-tabs-bar">
          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
            id="tabMyFriends"
            onClick={() => setActiveTab('friends')}
          >
            <Users size={16} />
            <span>My Friends</span>
            <span className="friends-tab-badge">{friends.length}</span>
          </button>

          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            id="tabAddFriend"
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={16} />
            <span>Add Friend</span>
          </button>

          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            id="tabRequests"
            onClick={() => setActiveTab('requests')}
          >
            <Inbox size={16} />
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="friends-tab-badge highlight">{requests.length}</span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="friends-modal-body">
          {/* TAB 1: MY FRIENDS */}
          {activeTab === 'friends' && (
            <div className="friends-tab-content">
              {/* Search Bar */}
              <div className="friends-search-box">
                <Search size={16} className="friends-search-icon" />
                <input
                  type="text"
                  className="friends-search-input"
                  placeholder="Filter friends by name, tag or anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="friends-search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Friends List */}
              {filteredFriends.length === 0 ? (
                <div className="friends-empty-state">
                  <div className="empty-icon-wrap">
                    <Users size={32} />
                  </div>
                  <h3>No friends found</h3>
                  <p>Try searching for a different username or invite someone new!</p>
                  <button
                    type="button"
                    className="btn filled"
                    style={{ marginTop: 12 }}
                    onClick={() => setActiveTab('add')}
                  >
                    Add Anime Friends
                  </button>
                </div>
              ) : (
                <div className="friends-list-grid">
                  {filteredFriends.map((f) => (
                    <div key={f.id} className="friend-card">
                      <div className="friend-card-left">
                        <div className="friend-avatar-wrap">
                          <img
                            src={f.avatar}
                            alt={f.displayName}
                            className="friend-avatar-img"
                          />
                          <span
                            className={`friend-status-dot ${f.status}`}
                            title={`Status: ${f.status}`}
                          />
                        </div>

                        <div className="friend-info">
                          <div className="friend-name-row">
                            <span className="friend-display-name">{f.displayName}</span>
                            <span className="friend-tag">{f.tag}</span>
                          </div>

                          {f.status === 'watching' && f.currentAnime && (
                            <div className="friend-activity-watching">
                              <Tv size={12} className="watching-icon" />
                              <span>
                                Streaming <strong>{f.currentAnime}</strong>
                                {f.currentEp ? ` Ep. ${f.currentEp}` : ''}
                              </span>
                            </div>
                          )}

                          {f.status === 'online' && (
                            <div className="friend-activity-online">
                              <span className="online-pill">Online</span>
                              {f.bio && <span className="friend-bio-snippet">{f.bio}</span>}
                            </div>
                          )}

                          {f.status === 'idle' && (
                            <div className="friend-activity-idle">
                              <span className="idle-pill">Away</span>
                              {f.bio && <span className="friend-bio-snippet">{f.bio}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="friend-actions">
                        <button
                          type="button"
                          className="friend-action-btn party-btn"
                          title="Invite to Watch Party"
                          onClick={() =>
                            sendWatchPartyInvite(f.id, f.currentAnime || 'Kamui Simulcast')
                          }
                        >
                          <Tv size={14} />
                          <span>Watch Party</span>
                        </button>

                        <button
                          type="button"
                          className="friend-action-btn delete-btn"
                          title="Remove Friend"
                          onClick={() => removeFriend(f.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD FRIEND */}
          {activeTab === 'add' && (
            <div className="friends-tab-content">
              {/* Form to add by username/tag */}
              <form className="add-friend-form" onSubmit={handleAddSubmit}>
                <label className="add-friend-label" htmlFor="friendInputQuery">
                  Add Anime Friend by Username or Tag
                </label>
                <div className="add-friend-input-wrap">
                  <input
                    id="friendInputQuery"
                    type="text"
                    className="add-friend-input"
                    placeholder="Enter username (e.g. Tanjiro_99 or #KM-4521)"
                    value={addInput}
                    onChange={(e) => setAddInput(e.target.value)}
                  />
                  <button type="submit" className="add-friend-submit-btn">
                    <UserPlus size={16} />
                    <span>Add Friend</span>
                  </button>
                </div>
              </form>

              {/* Share My Code Card */}
              <div className="my-code-banner">
                <div className="my-code-left">
                  <span className="my-code-label">Your Personal Kamui Friend ID</span>
                  <span className="my-code-value">{myFriendCode}</span>
                </div>
                <button
                  type="button"
                  className="my-code-copy-btn"
                  onClick={handleCopyCode}
                  title="Copy your friend invite link"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedCode ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>

              {/* Suggested Friends */}
              {suggestedFriends.length > 0 && (
                <div className="suggested-friends-section">
                  <div className="suggested-head">
                    <Sparkles size={16} className="sparkle-icon" />
                    <h4>Suggested Streamers You May Know</h4>
                  </div>

                  <div className="suggested-grid">
                    {suggestedFriends.map((sugg) => (
                      <div key={sugg.id} className="suggested-card">
                        <div className="suggested-avatar-wrap">
                          <img
                            src={sugg.avatar}
                            alt={sugg.displayName}
                            className="suggested-avatar-img"
                          />
                        </div>
                        <div className="suggested-info">
                          <div className="suggested-name">{sugg.displayName}</div>
                          <div className="suggested-meta">
                            <span>{sugg.tag}</span>
                            {sugg.mutualFriends && (
                              <span> · {sugg.mutualFriends} mutual anime fans</span>
                            )}
                          </div>
                          {sugg.bio && <p className="suggested-bio">{sugg.bio}</p>}
                        </div>
                        <button
                          type="button"
                          className="suggested-add-btn"
                          onClick={() => addSuggestedFriend(sugg)}
                        >
                          <UserPlus size={14} />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUESTS */}
          {activeTab === 'requests' && (
            <div className="friends-tab-content">
              {requests.length === 0 ? (
                <div className="friends-empty-state">
                  <div className="empty-icon-wrap">
                    <Inbox size={32} />
                  </div>
                  <h3>No pending friend requests</h3>
                  <p>When other anime watchers add your Kamui ID, you will see requests here.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map((req) => (
                    <div key={req.id} className="request-card">
                      <div className="request-card-left">
                        <img
                          src={req.from.avatar}
                          alt={req.from.displayName}
                          className="request-avatar-img"
                        />
                        <div className="request-info">
                          <div className="request-name-row">
                            <span className="request-name">{req.from.displayName}</span>
                            <span className="request-tag">{req.from.tag}</span>
                          </div>
                          {req.from.bio && <p className="request-bio">{req.from.bio}</p>}
                          <span className="request-time">Received {req.sentAt}</span>
                        </div>
                      </div>

                      <div className="request-actions">
                        <button
                          type="button"
                          className="request-btn accept-btn"
                          onClick={() => acceptRequest(req.id)}
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          className="request-btn decline-btn"
                          onClick={() => declineRequest(req.id)}
                        >
                          <X size={14} />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
