'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Puzzle,
  Plus,
  Radio,
  Server,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Wifi,
  Sparkles,
  Settings2,
  FileCode,
  Layers
} from 'lucide-react';
import { useExtensions } from '@/context/ExtensionsContext';
import { AddExtensionBox } from './AddExtensionBox';

export const ExtensionsModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    modalTab,
    openModal,
    extensions,
    activeExtensionId,
    setActiveExtension,
    toggleExtension,
    removeExtension,
    testPing,
    exportExtensions,
    importExtensions,
    resetToDefaults
  } = useExtensions();

  const [jsonInput, setJsonInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const activeExt = extensions.find((e) => e.id === activeExtensionId) || extensions[0];

  const handleCopyJson = () => {
    const json = exportExtensions();
    navigator.clipboard.writeText(json).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    const res = importExtensions(jsonInput.trim());
    if (res.success) {
      setImportStatus(`Successfully imported ${res.count} extension(s)!`);
      setJsonInput('');
    } else {
      setImportStatus(`Import failed: ${res.error}`);
    }
  };

  return (
    <div
      className="extensions-modal-overlay open"
      id="extensionsModalOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="extensions-modal-container custom-scrollbar">
        {/* Modal Header */}
        <div className="extensions-modal-head">
          <div className="ext-head-left">
            <div className="ext-icon-circle">
              <Puzzle size={22} />
            </div>
            <div>
              <div className="ext-head-badge-row">
                <span className="ext-kanji-label">拡張機能</span>
                <span className="ext-pill-live">
                  <span className="ext-live-dot" /> STREAM HUB
                </span>
              </div>
              <h2 className="extensions-modal-title">Anime Streaming Extensions &amp; Sources</h2>
            </div>
          </div>

          <button
            type="button"
            className="extensions-modal-close"
            onClick={closeModal}
            aria-label="Close extensions manager"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Source Highlight Banner */}
        {activeExt && (
          <div className="active-extension-banner">
            <div className="active-ext-left">
              <div className="active-radio-indicator">
                <Radio size={16} className="text-gold animate-pulse" />
              </div>
              <div className="active-ext-meta">
                <div className="active-ext-row">
                  <span className="active-ext-tag">CURRENT STREAM SOURCE</span>
                  <span className="active-ext-name">{activeExt.name}</span>
                  <span className="active-ext-proto">{activeExt.streamType.toUpperCase()}</span>
                </div>
                <p className="active-ext-desc">{activeExt.description}</p>
              </div>
            </div>

            <div className="active-ext-right">
              <div className="active-ext-ping-box">
                <span className="ping-dot online" />
                <span className="ping-val">{activeExt.latencyMs}ms</span>
                <button
                  type="button"
                  className="btn-refresh-ping"
                  onClick={() => testPing(activeExt.id)}
                  title="Test latency"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
              <span className="active-resolutions-pill">
                {activeExt.supportedResolutions.join(' · ')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="extensions-tabs-nav">
          <button
            type="button"
            className={`ext-nav-tab ${modalTab === 'installed' ? 'active' : ''}`}
            onClick={() => openModal('installed')}
          >
            <Layers size={16} />
            <span>Installed ({extensions.length})</span>
          </button>
          <button
            type="button"
            className={`ext-nav-tab ${modalTab === 'add' ? 'active' : ''}`}
            onClick={() => openModal('add')}
          >
            <Plus size={16} />
            <span>Add Extension</span>
          </button>
          <button
            type="button"
            className={`ext-nav-tab ${modalTab === 'store' ? 'active' : ''}`}
            onClick={() => openModal('store')}
          >
            <Sparkles size={16} />
            <span>Extension Store</span>
          </button>
          <button
            type="button"
            className={`ext-nav-tab ${modalTab === 'settings' ? 'active' : ''}`}
            onClick={() => openModal('settings')}
          >
            <Settings2 size={16} />
            <span>Backup &amp; Import</span>
          </button>
        </div>

        {/* Tab 1: Installed Extensions List */}
        {modalTab === 'installed' && (
          <div className="extensions-tab-content">
            <div className="installed-ext-top-actions">
              <p className="installed-ext-info">
                Manage your active streaming engines. Drag or click <strong>Make Active</strong> to select which provider plays your anime.
              </p>
              <button
                type="button"
                className="btn-quick-add-link"
                onClick={() => openModal('add')}
              >
                <Plus size={14} />
                <span>Add New Extension</span>
              </button>
            </div>

            <div className="installed-ext-list">
              {extensions.map((ext) => {
                const isActive = ext.id === activeExtensionId;
                return (
                  <div
                    key={ext.id}
                    className={`installed-ext-item ${isActive ? 'is-active-source' : ''} ${
                      !ext.enabled ? 'is-disabled' : ''
                    }`}
                  >
                    <div className="ext-item-main">
                      <div className="ext-item-header">
                        <div className="ext-item-title-group">
                          <h4 className="ext-item-name">{ext.name}</h4>
                          <span className="ext-item-version">{ext.version}</span>
                          {ext.badge && (
                            <span className={`ext-badge-tag ${ext.badgeType || 'community'}`}>
                              {ext.badge}
                            </span>
                          )}
                          {isActive && <span className="ext-active-pill">ACTIVE SOURCE</span>}
                        </div>

                        <div className="ext-item-controls">
                          {/* Ping Meter */}
                          <div className="ext-ping-indicator">
                            <span className={`ping-dot ${ext.status}`} />
                            <span className="ping-text">{ext.latencyMs}ms</span>
                            <button
                              type="button"
                              className="btn-icon-ping"
                              onClick={() => testPing(ext.id)}
                              title="Test latency"
                            >
                              <RefreshCw size={12} />
                            </button>
                          </div>

                          {/* Enable / Disable toggle */}
                          <label className="kamui-toggle-switch" title={ext.enabled ? 'Disable' : 'Enable'}>
                            <input
                              type="checkbox"
                              checked={ext.enabled}
                              onChange={() => toggleExtension(ext.id)}
                            />
                            <span className="toggle-slider" />
                          </label>

                          {/* Delete (if not official) */}
                          {ext.badgeType !== 'official' && (
                            <button
                              type="button"
                              className="btn-ext-delete"
                              onClick={() => removeExtension(ext.id)}
                              title="Uninstall extension"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="ext-item-description">{ext.description}</p>

                      <div className="ext-item-footer">
                        <div className="ext-capabilities-row">
                          <span className="cap-pill proto">{ext.streamType.toUpperCase()}</span>
                          {ext.supportedResolutions.map((r) => (
                            <span key={r} className="cap-pill res">
                              {r}
                            </span>
                          ))}
                          {ext.supportsDub && <span className="cap-pill dub">DUB</span>}
                          {ext.supportsSub && <span className="cap-pill sub">SUB</span>}
                          {ext.hasIntroSkip && <span className="cap-pill skip">AUTO-SKIP</span>}
                        </div>

                        <div className="ext-action-btns">
                          {!isActive && ext.enabled && (
                            <button
                              type="button"
                              className="btn-set-active"
                              onClick={() => setActiveExtension(ext.id)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Make Active Source</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Add Extension Box */}
        {modalTab === 'add' && (
          <div className="extensions-tab-content">
            <AddExtensionBox
              onSuccess={() => openModal('installed')}
              defaultTab="url"
            />
          </div>
        )}

        {/* Tab 3: Extension Store */}
        {modalTab === 'store' && (
          <div className="extensions-tab-content">
            <AddExtensionBox
              onSuccess={() => openModal('installed')}
              defaultTab="store"
            />
          </div>
        )}

        {/* Tab 4: Backup & Settings */}
        {modalTab === 'settings' && (
          <div className="extensions-tab-content">
            <div className="backup-section-card">
              <h3 className="backup-title">Export / Backup Installed Extensions</h3>
              <p className="backup-desc">
                Export your configured streaming extensions and servers as a JSON file or copy to clipboard to sync across devices.
              </p>
              <div className="backup-actions-row">
                <button
                  type="button"
                  className="btn filled"
                  onClick={handleCopyJson}
                >
                  <FileCode size={15} />
                  <span>{copySuccess ? 'Copied JSON!' : 'Copy Config to Clipboard'}</span>
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={resetToDefaults}
                >
                  <RefreshCw size={14} />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>
            </div>

            <div className="backup-section-card" style={{ marginTop: 24 }}>
              <h3 className="backup-title">Import Extensions JSON</h3>
              <p className="backup-desc">
                Paste an exported JSON manifest containing your custom extensions.
              </p>
              <form onSubmit={handleImportSubmit}>
                <textarea
                  className="backup-textarea"
                  rows={5}
                  placeholder="Paste JSON array here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="submit" className="btn filled" disabled={!jsonInput.trim()}>
                    <Upload size={14} />
                    <span>Import Extensions</span>
                  </button>
                  {importStatus && <span className="import-status-text">{importStatus}</span>}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
