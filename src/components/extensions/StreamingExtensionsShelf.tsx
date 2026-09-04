'use client';

import React, { useState } from 'react';
import {
  Puzzle,
  Plus,
  Radio,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { useExtensions } from '@/context/ExtensionsContext';
import { AddExtensionBox } from './AddExtensionBox';

export const StreamingExtensionsShelf: React.FC = () => {
  const {
    extensions,
    activeExtensionId,
    setActiveExtension,
    openModal,
    testPing
  } = useExtensions();

  const [isBoxExpanded, setIsBoxExpanded] = useState(false);

  const activeExt = extensions.find((e) => e.id === activeExtensionId) || extensions[0];

  return (
    <section className="streaming-extensions-shelf-section" id="extensionsSection">
      <div className="wrap">
        {/* Shelf Header */}
        <div className="shelf-header">
          <div className="shelf-title-wrap">
            <span className="shelf-kanji">
              <span className="glyph">拡</span> Extensions
            </span>
            <div className="shelf-title-sub-row">
              <h2 className="shelf-title">Streaming Sources &amp; Extensions</h2>
              <span className="shelf-count-badge gold">
                {extensions.filter((e) => e.enabled).length} Active
              </span>
            </div>
          </div>

          <div className="shelf-actions-group">
            <button
              type="button"
              className="shelf-action-btn"
              onClick={() => openModal('installed')}
              title="Open full extensions manager"
            >
              <Layers size={15} />
              <span>Manage ({extensions.length})</span>
            </button>

            <button
              type="button"
              className={`shelf-action-btn highlight ${isBoxExpanded ? 'active' : ''}`}
              onClick={() => setIsBoxExpanded(!isBoxExpanded)}
              title="Add anime streaming extension"
            >
              <Plus size={15} />
              <span>Add Extension</span>
              {isBoxExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Collapsible In-Page "Add Extension" Box */}
        {isBoxExpanded && (
          <div className="shelf-embedded-add-box animate-fadeIn">
            <AddExtensionBox
              onSuccess={() => setIsBoxExpanded(false)}
              defaultTab="url"
            />
          </div>
        )}

        {/* Active Engine Spotlight Bar */}
        {activeExt && (
          <div className="shelf-active-source-card">
            <div className="active-source-badge-strip">
              <span className="active-glow-dot" />
              <span className="active-label">ACTIVE STREAMING ENGINE:</span>
              <strong className="active-name">{activeExt.name}</strong>
              <span className="active-proto-badge">{activeExt.streamType.toUpperCase()}</span>
              {activeExt.badge && (
                <span className={`active-meta-pill ${activeExt.badgeType || 'community'}`}>
                  {activeExt.badge}
                </span>
              )}
            </div>

            <div className="active-source-stats">
              <div className="stat-pill">
                <span className="stat-label">Latency:</span>
                <span className="stat-val text-green">{activeExt.latencyMs}ms</span>
                <button
                  type="button"
                  className="btn-mini-refresh"
                  onClick={() => testPing(activeExt.id)}
                  title="Ping server"
                >
                  <RefreshCw size={11} />
                </button>
              </div>

              <div className="stat-pill">
                <span className="stat-label">Max Quality:</span>
                <span className="stat-val text-gold">
                  {activeExt.supportedResolutions[0] || '1080p'}
                </span>
              </div>

              <div className="stat-pill">
                <span className="stat-label">Audio:</span>
                <span className="stat-val">
                  {activeExt.supportsDub ? 'Sub & Dub' : 'Subbed Only'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Card Row of Available Extensions or Empty State */}
        {extensions.length === 0 ? (
          <div className="shelf-empty-extensions-box">
            <div className="shelf-empty-icon-circle">
              <Puzzle size={28} />
            </div>
            <div className="shelf-empty-text">
              <h4 className="shelf-empty-title">No Anime Streaming Extensions Installed</h4>
              <p className="shelf-empty-desc">
                Your extensions library is currently empty. Add a custom stream source, paste a repository manifest URL, or browse the Extension Store to start streaming.
              </p>
            </div>
            <div className="shelf-empty-btn-group">
              <button
                type="button"
                className="btn filled btn-shelf-cta"
                onClick={() => setIsBoxExpanded(true)}
              >
                <Plus size={15} />
                <span>+ Add Extension</span>
              </button>
              <button
                type="button"
                className="btn btn-shelf-cta"
                onClick={() => openModal('store')}
              >
                <Sparkles size={15} />
                <span>Browse Store</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="shelf-extensions-track custom-scrollbar">
            {extensions.map((ext) => {
              const isActive = ext.id === activeExtensionId;
              return (
                <div
                  key={ext.id}
                  className={`shelf-ext-card ${isActive ? 'is-active' : ''} ${
                    !ext.enabled ? 'is-disabled' : ''
                  }`}
                  onClick={() => {
                    if (!isActive && ext.enabled) {
                      setActiveExtension(ext.id);
                    }
                  }}
                >
                  <div className="shelf-card-header">
                    <div className="shelf-card-title-wrap">
                      <h4 className="shelf-card-name">{ext.name}</h4>
                      <span className="shelf-card-version">{ext.version}</span>
                    </div>
                    <div className="shelf-card-ping">
                      <span className={`ping-dot ${ext.status}`} />
                      <span>{ext.latencyMs}ms</span>
                    </div>
                  </div>

                  <p className="shelf-card-desc">{ext.description}</p>

                  <div className="shelf-card-features">
                    <span className="shelf-feature-pill proto">{ext.streamType.toUpperCase()}</span>
                    {ext.supportedResolutions.slice(0, 2).map((r) => (
                      <span key={r} className="shelf-feature-pill">
                        {r}
                      </span>
                    ))}
                    {ext.supportsDub && <span className="shelf-feature-pill">DUB</span>}
                    {ext.hasIntroSkip && <span className="shelf-feature-pill skip">SKIP INTRO</span>}
                  </div>

                  <div className="shelf-card-action">
                    {isActive ? (
                      <div className="shelf-active-btn-label">
                        <Radio size={14} className="animate-pulse" />
                        <span>Currently Active</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="shelf-select-source-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveExtension(ext.id);
                        }}
                        disabled={!ext.enabled}
                      >
                        <CheckCircle2 size={13} />
                        <span>Select Source</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* "+ Add More Extensions" Card */}
            <div
              className="shelf-ext-card add-card"
              onClick={() => setIsBoxExpanded(!isBoxExpanded)}
              role="button"
              tabIndex={0}
            >
              <div className="add-card-inner">
                <div className="add-card-icon">
                  <Plus size={24} />
                </div>
                <h4 className="add-card-title">Add Extension</h4>
                <p className="add-card-sub">Paste URL, import repository, or connect custom stream</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
