'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useComments } from '@/context/CommentsContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AnimeComment, CommentMedia } from '@/lib/types';
import {
  Smile,
  Image as ImageIcon,
  Sparkles,
  Send,
  Heart,
  MessageCircle,
  Clock,
  AlertTriangle,
  X,
  Upload,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface CommentSectionProps {
  animeId: string;
  episodeNum?: number;
  currentPlaybackTime?: number; // In seconds
  isSidebarLayout?: boolean;
}

// Preset Anime Emojis
const EMOJI_CATEGORIES = {
  Expressions: ['🤩', '👺', '🥺', '😤', '💀', '🤯', '🤤', '😈', '😎', '🤣', '😭', '😱'],
  Reactions: ['🔥', '💥', '⚡', '💯', '👑', '🏆', '👏', '🙌', '🚀', '✨', '🍙', '🍜'],
  AnimeVibes: ['🌸', '💖', '🌙', '🏮', '🎐', '🍵', '⚔️', '🥷', '🎌', '🍿', '🦊', '🐺']
};

const QUICK_EMOJIS = ['🔥', '❤️', '😭', '😱', '👏', '⚔️', '🌸', '⚡', '🍙', '💯', '✨', '🍿'];

// Curated Anime Stickers
const ANIME_STICKERS: { id: string; name: string; visual: string; tag: string }[] = [
  { id: 'stk-flame', name: 'Flame Hype', visual: '🔥', tag: 'EPIC BATTLE' },
  { id: 'stk-anya', name: 'Anya Smug Heh', visual: '😏', tag: 'SMUG' },
  { id: 'stk-gojo', name: 'Hollow Purple', visual: '🟣', tag: 'DOMAIN EXPANSION' },
  { id: 'stk-nezuko', name: 'Nezuko Chibi', visual: '🌸', tag: 'KAWAII' },
  { id: 'stk-luffy', name: 'Gear 5 Joy', visual: '🏴‍☠️', tag: 'PEAK FICTION' },
  { id: 'stk-eren', name: 'Titan Roar', visual: '⚔️', tag: 'TATAKAE' },
  { id: 'stk-popcorn', name: 'Binge Watching', visual: '🍿', tag: 'NO ADS' },
  { id: 'stk-shock', name: 'Plot Twist Shock', visual: '🤯', tag: 'PLOT TWIST' },
  { id: 'stk-sparkle', name: 'Sakuga Tears', visual: '😭', tag: '10/10 MASTERPIECE' },
  { id: 'stk-speed', name: 'Lightning Slash', visual: '⚡', tag: 'SPEED BLITZ' }
];

export const CommentSection: React.FC<CommentSectionProps> = ({
  animeId,
  episodeNum = 1,
  currentPlaybackTime = 0,
  isSidebarLayout = false
}) => {
  const { getComments, addComment, likeComment, deleteComment } = useComments();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<CommentMedia | null>(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'top' | 'newest' | 'media'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Popover States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState<keyof typeof EMOJI_CATEGORIES>('Expressions');
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const stickerPickerRef = useRef<HTMLDivElement | null>(null);

  const comments = getComments(animeId, episodeNum);

  // Close popovers on click outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        !(e.target as HTMLElement).closest('.btn-emoji-trigger')
      ) {
        setShowEmojiPicker(false);
      }
      if (
        stickerPickerRef.current &&
        !stickerPickerRef.current.contains(target) &&
        !(e.target as HTMLElement).closest('.btn-sticker-trigger')
      ) {
        setShowStickerPicker(false);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, GIF)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setSelectedMedia({
          type: 'image',
          url: dataUrl,
          name: file.name
        });
        setShowEmojiPicker(false);
        setShowStickerPicker(false);
        showToast(`Uploaded image "${file.name}" ready to post! 🖼️`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSticker = (sticker: (typeof ANIME_STICKERS)[0]) => {
    setSelectedMedia({
      type: 'sticker',
      url: sticker.visual,
      name: `${sticker.name} (${sticker.tag})`
    });
    setShowStickerPicker(false);
    showToast(`Sticker "${sticker.name}" attached! ✨`, 'info');
  };

  const handleInsertEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !selectedMedia) {
      showToast('Please type a message or attach an image/sticker', 'warning');
      return;
    }

    const timestampStr = includeTimestamp ? formatSeconds(currentPlaybackTime) : undefined;

    addComment(animeId, commentText, {
      epNum: episodeNum,
      timestamp: timestampStr,
      media: selectedMedia || undefined,
      isSpoiler
    });

    setCommentText('');
    setSelectedMedia(null);
    setIsSpoiler(false);
    setIncludeTimestamp(false);
    setShowEmojiPicker(false);
    setShowStickerPicker(false);
  };

  const handleSendReply = (parentId: string) => {
    if (!replyText.trim()) return;

    addComment(animeId, replyText, {
      epNum: episodeNum,
      parentId
    });

    setReplyText('');
    setReplyingToId(null);
  };

  const toggleSpoiler = (commentId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Filter and sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (activeFilter === 'top') return b.likes - a.likes;
    if (activeFilter === 'newest') return 0; // Already unshifted newest first
    return 0;
  });

  const filteredComments = sortedComments.filter((c) => {
    if (activeFilter === 'media') return !!c.media;
    return true;
  });

  return (
    <div className={`anime-comments-container ${isSidebarLayout ? 'sidebar-layout' : ''}`}>
      {/* Header & Filter Controls */}
      <div className="comments-head-row">
        <div className="comments-title-wrap">
          <MessageCircle size={18} className="comments-icon" />
          <h3 className="comments-title">
            Episode {episodeNum} Discussion &amp; Live Chat
          </h3>
          <span className="comments-count-pill">{comments.length} Comments</span>
        </div>

        {/* Filter Pills */}
        <div className="comments-filter-bar">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'top' ? 'active' : ''}`}
            onClick={() => setActiveFilter('top')}
          >
            🔥 Top
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'newest' ? 'active' : ''}`}
            onClick={() => setActiveFilter('newest')}
          >
            ⚡ Newest
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'media' ? 'active' : ''}`}
            onClick={() => setActiveFilter('media')}
          >
            🖼️ Media/Stickers
          </button>
        </div>
      </div>

      {/* Quick Emoji Reaction Bar */}
      <div className="quick-emojis-strip">
        <span className="quick-emoji-label">Quick Reactions:</span>
        <div className="quick-emojis-scroll">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="quick-emoji-btn"
              title={`Add ${emoji}`}
              onClick={() => handleInsertEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Main Comment Input Box */}
      <form className="comment-composer-box" onSubmit={handleSubmitComment}>
        <div className="composer-top-row">
          <img
            src={user?.avatar || '/avatars/nami.svg'}
            alt="My Profile"
            className="composer-avatar"
          />
          <div className="composer-input-area">
            <textarea
              ref={textareaRef}
              className="comment-textarea"
              placeholder="Join the discussion... Share reactions, theories, or fan art!"
              rows={isSidebarLayout ? 2 : 3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmitComment(e);
                }
              }}
            />

            {/* Attached Media / Sticker Preview */}
            {selectedMedia && (
              <div className="media-preview-badge">
                {selectedMedia.type === 'image' ? (
                  <div className="media-thumb-box">
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name || 'Upload preview'}
                      className="preview-thumb-img"
                    />
                    <div className="media-info-text">
                      <span className="media-name-txt">{selectedMedia.name}</span>
                      <span className="media-type-tag">Device Uploaded Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="sticker-thumb-box">
                    <span className="sticker-visual-preview">{selectedMedia.url}</span>
                    <span className="sticker-name-txt">{selectedMedia.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  className="media-remove-btn"
                  title="Remove attached media"
                  onClick={() => setSelectedMedia(null)}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="composer-actions-bar">
          <div className="composer-tools-left">
            {/* Emoji Picker Trigger */}
            <div className="popover-wrapper">
              <button
                type="button"
                className={`composer-tool-btn btn-emoji-trigger ${showEmojiPicker ? 'active' : ''}`}
                title="Insert Emoji"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowStickerPicker(false);
                }}
              >
                <Smile size={16} />
                <span>Emoji</span>
              </button>

              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="kamui-emoji-popover">
                  <div className="emoji-popover-tabs">
                    {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`emoji-cat-btn ${activeEmojiTab === cat ? 'active' : ''}`}
                        onClick={() => setActiveEmojiTab(cat as keyof typeof EMOJI_CATEGORIES)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="emoji-grid">
                    {EMOJI_CATEGORIES[activeEmojiTab].map((em) => (
                      <button
                        key={em}
                        type="button"
                        className="emoji-item-btn"
                        onClick={() => handleInsertEmoji(em)}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticker Picker Trigger */}
            <div className="popover-wrapper">
              <button
                type="button"
                className={`composer-tool-btn btn-sticker-trigger ${showStickerPicker ? 'active' : ''}`}
                title="Send Anime Sticker"
                onClick={() => {
                  setShowStickerPicker(!showStickerPicker);
                  setShowEmojiPicker(false);
                }}
              >
                <Sparkles size={16} />
                <span>Stickers</span>
              </button>

              {showStickerPicker && (
                <div ref={stickerPickerRef} className="kamui-stickers-popover">
                  <div className="stickers-popover-head">
                    <span>Anime Reaction Stickers</span>
                  </div>
                  <div className="stickers-grid">
                    {ANIME_STICKERS.map((stk) => (
                      <button
                        key={stk.id}
                        type="button"
                        className="sticker-item-btn"
                        title={stk.name}
                        onClick={() => handleSelectSticker(stk)}
                      >
                        <span className="sticker-icon-big">{stk.visual}</span>
                        <span className="sticker-item-name">{stk.name}</span>
                        <span className="sticker-item-badge">{stk.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload from Device Button */}
            <button
              type="button"
              className="composer-tool-btn upload-device-btn"
              title="Upload photo, fan art or meme from your device"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Upload from Device</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.gif,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
              onChange={handleDeviceUpload}
            />

            {/* Timestamp Toggle */}
            <button
              type="button"
              className={`composer-tool-btn timestamp-tool-btn ${includeTimestamp ? 'active' : ''}`}
              title="Tag current video timestamp"
              onClick={() => setIncludeTimestamp(!includeTimestamp)}
            >
              <Clock size={15} />
              <span>{formatSeconds(currentPlaybackTime)}</span>
            </button>

            {/* Spoiler Toggle */}
            <button
              type="button"
              className={`composer-tool-btn spoiler-tool-btn ${isSpoiler ? 'active' : ''}`}
              title="Mark as Spoiler (blurs text)"
              onClick={() => setIsSpoiler(!isSpoiler)}
            >
              <AlertTriangle size={15} />
              <span>Spoiler</span>
            </button>
          </div>

          <button
            type="submit"
            className="composer-send-btn"
            disabled={!commentText.trim() && !selectedMedia}
          >
            <Send size={15} />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Comments Feed List */}
      <div className="comments-feed-list">
        {filteredComments.length === 0 ? (
          <div className="comments-empty-notice">
            <MessageCircle size={32} />
            <p>No comments found for this filter. Be the first to spark the discussion!</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isRevealed = revealedSpoilers[comment.id];

            return (
              <div key={comment.id} className="comment-card-item">
                <div className="comment-card-main">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="comment-author-avatar"
                  />

                  <div className="comment-body-wrapper">
                    {/* Author Meta Row */}
                    <div className="comment-author-row">
                      <span className="comment-author-name">{comment.author.name}</span>
                      {comment.author.badge && (
                        <span className={`comment-author-badge badge-${comment.author.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                          {comment.author.badge}
                        </span>
                      )}
                      <span className="comment-created-time">{comment.createdAt}</span>

                      {comment.timestamp && (
                        <span className="comment-timestamp-badge" title="Timestamp in episode">
                          <Clock size={11} />
                          {comment.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Comment Content (With Spoiler Blur) */}
                    <div className="comment-content-box">
                      {comment.isSpoiler && !isRevealed ? (
                        <div
                          className="spoiler-shield-overlay"
                          onClick={() => toggleSpoiler(comment.id)}
                          role="button"
                          tabIndex={0}
                        >
                          <AlertTriangle size={15} className="spoiler-icon" />
                          <span>⚠️ Spoiler Alert — Click to Reveal</span>
                        </div>
                      ) : (
                        <p className={`comment-text ${comment.isSpoiler ? 'spoiler-revealed' : ''}`}>
                          {comment.content}
                        </p>
                      )}

                      {/* Attached Media / Upload Render */}
                      {comment.media && (!comment.isSpoiler || isRevealed) && (
                        <div className="comment-attached-media">
                          {comment.media.type === 'image' ? (
                            <div
                              className="comment-media-image-wrap"
                              onClick={() => setEnlargedImage(comment.media?.url || null)}
                              title="Click to zoom image"
                            >
                              <img
                                src={comment.media.url}
                                alt={comment.media.name || 'Uploaded content'}
                                className="comment-media-image"
                              />
                              <div className="image-zoom-cue">🔍 Click to zoom</div>
                            </div>
                          ) : (
                            <div className="comment-sticker-display">
                              <span className="sticker-big-art">{comment.media.url}</span>
                              <span className="sticker-bubble-label">{comment.media.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Row (Like, Reply, Delete) */}
                    <div className="comment-interactions-row">
                      <button
                        type="button"
                        className={`comment-btn-like ${comment.isLiked ? 'liked' : ''}`}
                        onClick={() => likeComment(animeId, comment.id)}
                        title={comment.isLiked ? 'Unlike' : 'Like comment'}
                      >
                        <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        type="button"
                        className="comment-btn-reply"
                        onClick={() =>
                          setReplyingToId(replyingToId === comment.id ? null : comment.id)
                        }
                      >
                        <MessageCircle size={14} />
                        <span>Reply</span>
                      </button>

                      {comment.author.isCurrentUser && (
                        <button
                          type="button"
                          className="comment-btn-delete"
                          title="Delete comment"
                          onClick={() => deleteComment(animeId, comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {replyingToId === comment.id && (
                      <div className="reply-composer-inline">
                        <input
                          type="text"
                          className="reply-input"
                          placeholder={`Reply to @${comment.author.name}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendReply(comment.id);
                          }}
                        />
                        <button
                          type="button"
                          className="reply-send-btn"
                          onClick={() => handleSendReply(comment.id)}
                        >
                          Send
                        </button>
                        <button
                          type="button"
                          className="reply-cancel-btn"
                          onClick={() => setReplyingToId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Nested Replies List */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="nested-replies-list">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="nested-reply-item">
                            <img
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              className="nested-reply-avatar"
                            />
                            <div className="nested-reply-body">
                              <div className="comment-author-row">
                                <span className="comment-author-name">{reply.author.name}</span>
                                <span className="comment-created-time">{reply.createdAt}</span>
                              </div>
                              <p className="comment-text">{reply.content}</p>
                              <div className="comment-interactions-row">
                                <button
                                  type="button"
                                  className={`comment-btn-like ${reply.isLiked ? 'liked' : ''}`}
                                  onClick={() => likeComment(animeId, reply.id)}
                                >
                                  <Heart size={12} fill={reply.isLiked ? 'currentColor' : 'none'} />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enlarged Image Lightbox Modal */}
      {enlargedImage && (
        <div
          className="image-lightbox-overlay"
          onClick={() => setEnlargedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setEnlargedImage(null)}
            >
              <X size={20} />
            </button>
            <img src={enlargedImage} alt="Enlarged media" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
};
