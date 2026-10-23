'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePlayback } from '@/context/PlaybackContext';
import { useToast } from '@/context/ToastContext';
import {
  downloadBackupFile,
  validateBackup,
  importBackup,
  getAutoBackupSnapshots,
  AutoBackupEntry
} from '@/lib/backup';
import {
  downloadListFile,
  exportListToShareCode,
  validateAndParseList,
  importListToWatchlist,
  SharedAnimeListPayload
} from '@/lib/sharing/listSharing';
import {
  Database,
  Download,
  Upload,
  Share2,
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  RotateCcw,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const BackupModal: React.FC = () => {
  const { isBackupModalOpen, closeBackupModal } = useAuth();
  const { watchlist, likedTitles } = usePlayback();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'backup' | 'sharing' | 'auto'>('backup');

  // Backup Import States
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [validatedBackup, setValidatedBackup] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sharing States
  const [selectedListSource, setSelectedListSource] = useState<'watchlist' | 'liked'>('watchlist');
  const [listTitle, setListTitle] = useState('My Anime Recommendations');
  const [shareInputText, setShareInputText] = useState('');
  const [validatedShareList, setValidatedShareList] = useState<SharedAnimeListPayload | null>(null);
  const [shareListError, setShareListError] = useState<string | null>(null);
  const [copiedShareCode, setCopiedShareCode] = useState(false);
  const listFileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto Backups State
  const [autoSnapshots, setAutoSnapshots] = useState<AutoBackupEntry[]>([]);

  useEffect(() => {
    if (isBackupModalOpen) {
      setAutoSnapshots(getAutoBackupSnapshots());
    }
  }, [isBackupModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBackupModalOpen) {
        closeBackupModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBackupModalOpen, closeBackupModal]);

  if (!isBackupModalOpen) return null;

  // Backup Actions
  const handleExportBackup = () => {
    try {
      const res = downloadBackupFile();
      showToast(`Exported backup "${res.filename}" (${(res.sizeBytes / 1024).toFixed(1)} KB)`, 'success');
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      verifyBackupPayload(content);
    };
    reader.readAsText(file);
  };

  const verifyBackupPayload = (text: string) => {
    setValidationError(null);
    setValidatedBackup(null);
    try {
      const parsed = JSON.parse(text);
      const res = validateBackup(parsed);
      if (res.valid && res.summary) {
        setValidatedBackup({ data: parsed, summary: res.summary });
      } else {
        setValidationError(res.error || 'Invalid backup structure.');
      }
    } catch (e: any) {
      setValidationError('File contains invalid JSON syntax.');
    }
  };

  const handleApplyBackup = () => {
    if (!validatedBackup) return;
    try {
      const result = importBackup(validatedBackup.data, { mode: importMode });
      showToast(
        `Backup imported successfully (${result.mode} mode). ${result.stats.watchlistCount} watchlist items restored.`,
        'success'
      );
      setValidatedBackup(null);
      closeBackupModal();
      // Reload page state cleanly
      setTimeout(() => window.location.reload(), 400);
    } catch (err: any) {
      showToast(`Import error: ${err.message}`, 'error');
    }
  };

  // List Sharing Actions
  const currentListIds = selectedListSource === 'watchlist' ? watchlist : likedTitles;

  const handleDownloadListFile = () => {
    if (currentListIds.length === 0) {
      showToast('Selected list is empty. Add titles before exporting.', 'warning');
      return;
    }
    const res = downloadListFile(listTitle, currentListIds);
    showToast(`Exported list "${res.filename}" with ${res.count} titles!`, 'success');
  };

  const handleCopyShareCode = () => {
    if (currentListIds.length === 0) {
      showToast('Selected list is empty. Add titles before generating share code.', 'warning');
      return;
    }
    const code = exportListToShareCode(listTitle, currentListIds);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedShareCode(true);
      showToast('Share code copied to clipboard!', 'success');
      setTimeout(() => setCopiedShareCode(false), 2500);
    }
  };

  const handleVerifyShareInput = (text: string) => {
    setShareInputText(text);
    setShareListError(null);
    setValidatedShareList(null);

    if (!text.trim()) return;

    const res = validateAndParseList(text);
    if (res.valid && res.payload) {
      setValidatedShareList(res.payload);
    } else {
      setShareListError(res.error || 'Invalid list format');
    }
  };

  const handleListFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      handleVerifyShareInput(content);
    };
    reader.readAsText(file);
  };

  const handleApplySharedList = () => {
    if (!validatedShareList) return;
    try {
      const res = importListToWatchlist(validatedShareList.animeIds);
      showToast(
        `Added ${res.newlyAddedCount} new titles to your Watchlist (${res.existingCount} duplicates skipped).`,
        'success'
      );
      setValidatedShareList(null);
      setShareInputText('');
      closeBackupModal();
      setTimeout(() => window.location.reload(), 400);
    } catch (err: any) {
      showToast(`Failed to import list: ${err.message}`, 'error');
    }
  };

  return (
    <div
      className="friends-modal-overlay"
      id="backupModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backupModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBackupModal();
      }}
    >
      <div className="friends-modal-container" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="friends-modal-header">
          <div className="friends-header-title-wrap">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
              <Database size={20} />
            </div>
            <div>
              <h2 className="friends-header-title" id="backupModalTitle">
                Data Management &amp; Backups
              </h2>
              <p className="friends-header-subtitle">
                Local-first data ownership · Export, import &amp; share lists without accounts
              </p>
            </div>
          </div>
          <button
            type="button"
            className="friends-close-btn"
            onClick={closeBackupModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="friends-tabs-bar">
          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Database size={15} />
            <span>Backup &amp; Restore</span>
          </button>

          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'sharing' ? 'active' : ''}`}
            onClick={() => setActiveTab('sharing')}
          >
            <Share2 size={15} />
            <span>Share Lists</span>
          </button>

          <button
            type="button"
            className={`friends-tab-btn ${activeTab === 'auto' ? 'active' : ''}`}
            onClick={() => setActiveTab('auto')}
          >
            <Clock size={15} />
            <span>Auto Snapshots ({autoSnapshots.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="friends-modal-body p-6 space-y-6">
          {/* TAB 1: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Export Box */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Download size={16} className="text-gold" />
                    <span>Export Local Backup</span>
                  </h4>
                  <p className="text-xs text-white/60 mt-1">
                    Download a full JSON archive of your watchlist, history, notes, and extension settings.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn filled text-xs py-2 px-3.5 shrink-0"
                  onClick={handleExportBackup}
                >
                  Download Backup
                </button>
              </div>

              {/* Import Section */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Upload size={16} className="text-emerald-400" />
                    <span>Import Backup Archive</span>
                  </h4>
                  <p className="text-xs text-white/60 mt-1">
                    Select a previously exported Kamui backup JSON file to restore your data.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 text-xs py-2 px-3.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Backup File...
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={handleBackupFileSelect}
                  />
                </div>

                {/* Validation Error Notice */}
                {validationError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Validated Backup Preview */}
                {validatedBackup && (
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span>Valid Version 1 Backup Verified</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-white/70">
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">Watchlist:</span>
                        <strong className="text-white text-xs">{validatedBackup.summary.watchlistCount} titles</strong>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">Liked:</span>
                        <strong className="text-white text-xs">{validatedBackup.summary.likedCount} titles</strong>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">History:</span>
                        <strong className="text-white text-xs">{validatedBackup.summary.historyCount} items</strong>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">Local Notes:</span>
                        <strong className="text-white text-xs">{validatedBackup.summary.commentsCount} comments</strong>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">Extensions:</span>
                        <strong className="text-white text-xs">{validatedBackup.summary.extensionsCount} sources</strong>
                      </div>
                      <div className="p-2 rounded bg-white/5">
                        <span className="text-white/40 block">Exported:</span>
                        <strong className="text-white text-xs">
                          {new Date(validatedBackup.summary.exportedAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    {/* Import Mode Selector */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-medium text-white/80">Choose restore strategy:</span>
                      <div className="flex gap-4 text-xs text-white/70">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'merge'}
                            onChange={() => setImportMode('merge')}
                          />
                          <span>Merge with local data (Recommended)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'replace'}
                            onChange={() => setImportMode('replace')}
                          />
                          <span>Replace all local data</span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn filled text-xs py-2 w-full mt-2 font-semibold"
                      onClick={handleApplyBackup}
                    >
                      Confirm &amp; Apply Restore
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIST SHARING */}
          {activeTab === 'sharing' && (
            <div className="space-y-6">
              {/* Export a List */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Share2 size={16} className="text-gold" />
                  <span>Share Anime Recommendations</span>
                </h4>
                <p className="text-xs text-white/60">
                  Share your favorite anime without needing accounts, friend requests, or servers.
                </p>

                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="shrink-0" />
                  <span>Privacy guarantee: Personal notes and comments are never included in shared lists.</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Source List</label>
                    <select
                      className="w-full text-xs p-2 rounded bg-black/40 border border-white/15 text-white"
                      value={selectedListSource}
                      onChange={(e) => setSelectedListSource(e.target.value as any)}
                    >
                      <option value="watchlist">My Watchlist ({watchlist.length} titles)</option>
                      <option value="liked">Liked Anime ({likedTitles.length} titles)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">List Title</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 rounded bg-black/40 border border-white/15 text-white"
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="btn filled text-xs py-2 px-3 flex items-center gap-1.5"
                    onClick={handleDownloadListFile}
                  >
                    <Download size={14} />
                    <span>Download .kamuilist.json</span>
                  </button>
                  <button
                    type="button"
                    className="btn bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs py-2 px-3 flex items-center gap-1.5"
                    onClick={handleCopyShareCode}
                  >
                    {copiedShareCode ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedShareCode ? 'Code Copied!' : 'Copy Share Code'}</span>
                  </button>
                </div>
              </div>

              {/* Import another user's list */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Upload size={16} className="text-emerald-400" />
                  <span>Import Shared List</span>
                </h4>
                <p className="text-xs text-white/60">
                  Paste a share code (`KM-LIST-...`) or upload another user's `.kamuilist.json` file.
                </p>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    className="w-full text-xs p-2.5 rounded bg-black/40 border border-white/15 text-white font-mono"
                    placeholder="Paste share code or JSON here..."
                    value={shareInputText}
                    onChange={(e) => handleVerifyShareInput(e.target.value)}
                  />

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="text-xs text-gold/80 hover:text-gold hover:underline flex items-center gap-1"
                      onClick={() => listFileInputRef.current?.click()}
                    >
                      <FileText size={13} />
                      <span>Or pick a .kamuilist.json file</span>
                    </button>
                    <input
                      ref={listFileInputRef}
                      type="file"
                      accept=".json,.kamuilist.json"
                      style={{ display: 'none' }}
                      onChange={handleListFileSelect}
                    />
                  </div>
                </div>

                {shareListError && (
                  <div className="p-2.5 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                    {shareListError}
                  </div>
                )}

                {validatedShareList && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400">
                        {validatedShareList.title}
                      </span>
                      <span className="text-white/60">{validatedShareList.animeIds.length} titles</span>
                    </div>
                    <button
                      type="button"
                      className="btn filled text-xs py-1.5 w-full font-semibold"
                      onClick={handleApplySharedList}
                    >
                      Add Titles to My Watchlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTO SNAPSHOTS */}
          {activeTab === 'auto' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Local Automatic Snapshots</h4>
                <p className="text-xs text-white/60 mt-0.5">
                  Kamui periodically keeps up to 3 generational snapshots in durable local storage to protect against accidental loss.
                </p>
              </div>

              {autoSnapshots.length === 0 ? (
                <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                  No automatic snapshots saved yet. As you use Kamui, snapshots will appear here.
                </div>
              ) : (
                <div className="space-y-2">
                  {autoSnapshots.map((snap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Clock size={13} className="text-gold" />
                          <span>Snapshot #{autoSnapshots.length - idx}</span>
                        </div>
                        <span className="text-[11px] text-white/50 block mt-0.5">
                          {new Date(snap.timestamp).toLocaleString()} · {snap.data.savedAnime?.watchlist?.length || 0} watchlist items
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 text-xs py-1.5 px-3 flex items-center gap-1"
                        onClick={() => {
                          try {
                            importBackup(snap.data, { mode: 'replace' });
                            showToast('Restored automatic snapshot.', 'success');
                            setTimeout(() => window.location.reload(), 400);
                          } catch (err: any) {
                            showToast(`Failed to restore snapshot: ${err.message}`, 'error');
                          }
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
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
