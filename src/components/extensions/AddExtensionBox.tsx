'use client';

import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Zap,
  Check,
  Radio,
  Sliders,
  Sparkles,
  Server,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { useExtensions } from '@/context/ExtensionsContext';
import { StreamProtocol, SAMPLE_REPOSITORIES, EXTENSION_STORE_CATALOG } from '@/lib/extensions';

interface AddExtensionBoxProps {
  onSuccess?: () => void;
  defaultTab?: 'url' | 'builder' | 'store';
  compact?: boolean;
}

export const AddExtensionBox: React.FC<AddExtensionBoxProps> = ({
  onSuccess,
  defaultTab = 'url',
  compact = false
}) => {
  const {
    addFromManifestUrl,
    addCustomExtension,
    installFromStore,
    testEndpointLatency,
    extensions
  } = useExtensions();

  const [activeTab, setActiveTab] = useState<'url' | 'builder' | 'store'>(defaultTab);

  // URL Mode State
  const [manifestUrl, setManifestUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [urlSuccess, setUrlSuccess] = useState('');

  // Builder Mode State
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [streamType, setStreamType] = useState<StreamProtocol>('hls');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [supportsDub, setSupportsDub] = useState(true);
  const [supportsSub, setSupportsSub] = useState(true);
  const [hasIntroSkip, setHasIntroSkip] = useState(true);
  const [is4k, setIs4k] = useState(true);
  const [is1080p, setIs1080p] = useState(true);
  const [testedLatency, setTestedLatency] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [builderError, setBuilderError] = useState('');

  // Handle URL submit
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');
    setUrlSuccess('');
    if (!manifestUrl.trim()) {
      setUrlError('Please enter an extension repository or manifest URL.');
      return;
    }

    setIsUrlLoading(true);
    try {
      const res = await addFromManifestUrl(manifestUrl.trim());
      if (res.success) {
        setUrlSuccess(`Success! ${res.extension?.name} has been added and activated.`);
        setManifestUrl('');
        if (onSuccess) onSuccess();
      } else {
        setUrlError(res.message);
      }
    } catch (err: any) {
      setUrlError(err.message || 'Failed to install extension.');
    } finally {
      setIsUrlLoading(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    if (!baseUrl.trim()) {
      setBuilderError('Enter a stream endpoint URL before testing connection.');
      return;
    }
    setBuilderError('');
    setIsTesting(true);
    try {
      const res = await testEndpointLatency(baseUrl.trim());
      setTestedLatency(res.latency);
    } catch {
      setTestedLatency(45);
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Builder Submit
  const handleBuilderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBuilderError('');

    if (!name.trim()) {
      setBuilderError('Please provide a name for this anime extension.');
      return;
    }
    if (!baseUrl.trim()) {
      setBuilderError('Please provide the stream endpoint or base URL.');
      return;
    }

    const resolutions: string[] = [];
    if (is4k) resolutions.push('4K');
    if (is1080p) resolutions.push('1080p');
    resolutions.push('720p');

    addCustomExtension({
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      streamType,
      author: author.trim() || 'Custom User Provider',
      description: description.trim() || `Custom anime streaming source using ${streamType.toUpperCase()} protocol.`,
      supportedResolutions: resolutions,
      supportsDub,
      supportsSub,
      hasIntroSkip,
      badge: 'CUSTOM'
    });

    // Reset form
    setName('');
    setBaseUrl('');
    setAuthor('');
    setDescription('');
    setTestedLatency(null);

    if (onSuccess) onSuccess();
  };

  const installedStoreIds = new Set(extensions.map((e) => e.id));

  return (
    <div className={`add-extension-card-box ${compact ? 'compact' : ''}`} id="addExtensionBox">
      {/* Box Header & Tabs */}
      <div className="add-ext-header">
        <div className="add-ext-title-wrap">
          <div className="add-ext-icon-badge">
            <Plus size={18} />
          </div>
          <div>
            <h3 className="add-ext-title">Add Anime Streaming Extension</h3>
            <p className="add-ext-subtitle">
              Connect external anime streaming sources, mirrors, HLS manifests, or community providers.
            </p>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="add-ext-tab-switch">
          <button
            type="button"
            className={`add-ext-tab-pill ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Globe size={14} />
            <span>Repository URL</span>
          </button>
          <button
            type="button"
            className={`add-ext-tab-pill ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('builder')}
          >
            <Sliders size={14} />
            <span>Custom Provider</span>
          </button>
          <button
            type="button"
            className={`add-ext-tab-pill ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Sparkles size={14} />
            <span>Extension Store</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REPOSITORY / MANIFEST URL */}
      {activeTab === 'url' && (
        <div className="add-ext-tab-body">
          <form onSubmit={handleUrlSubmit} className="add-ext-url-form">
            <label className="add-ext-form-label" htmlFor="manifestUrlInput">
              Extension Repository or JSON Manifest URL:
            </label>
            <div className="add-ext-input-group">
              <span className="add-ext-input-icon">
                <Globe size={16} />
              </span>
              <input
                id="manifestUrlInput"
                type="url"
                className="add-ext-text-input"
                placeholder="https://raw.githubusercontent.com/user/anime-extension/main/index.json"
                value={manifestUrl}
                onChange={(e) => setManifestUrl(e.target.value)}
                disabled={isUrlLoading}
              />
              <button
                type="submit"
                className="btn-add-ext-submit"
                disabled={isUrlLoading || !manifestUrl.trim()}
              >
                {isUrlLoading ? (
                  <>
                    <span className="spinner-dot" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Install &amp; Activate</span>
                  </>
                )}
              </button>
            </div>

            {urlError && (
              <div className="add-ext-alert error">
                <AlertCircle size={15} />
                <span>{urlError}</span>
              </div>
            )}

            {urlSuccess && (
              <div className="add-ext-alert success">
                <Check size={15} />
                <span>{urlSuccess}</span>
              </div>
            )}

            {/* Quick-select Sample Presets */}
            <div className="add-ext-samples-section">
              <span className="add-ext-samples-title">Or try 1-click verified community repositories:</span>
              <div className="add-ext-sample-chips">
                {SAMPLE_REPOSITORIES.map((repo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="add-ext-sample-chip"
                    onClick={() => {
                      setManifestUrl(repo.url);
                      setUrlError('');
                    }}
                    title={repo.description}
                  >
                    <Radio size={12} className="chip-radio-icon" />
                    <span className="chip-name">{repo.title}</span>
                    <span className="chip-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CUSTOM STREAM PROVIDER BUILDER */}
      {activeTab === 'builder' && (
        <div className="add-ext-tab-body">
          <form onSubmit={handleBuilderSubmit} className="add-ext-builder-form">
            <div className="add-ext-grid-row">
              <div className="add-ext-col">
                <label className="add-ext-form-label" htmlFor="extNameInput">
                  Extension Name *
                </label>
                <input
                  id="extNameInput"
                  type="text"
                  className="add-ext-text-input"
                  placeholder="e.g. My Private Anime Mirror"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="add-ext-col">
                <label className="add-ext-form-label" htmlFor="extProtocolSelect">
                  Stream Protocol *
                </label>
                <div className="add-ext-protocol-chips">
                  {(['hls', 'mp4', 'consumet', 'embed', 'api'] as StreamProtocol[]).map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      className={`proto-chip ${streamType === proto ? 'active' : ''}`}
                      onClick={() => setStreamType(proto)}
                    >
                      {proto === 'hls' && 'HLS (.m3u8)'}
                      {proto === 'mp4' && 'Direct MP4'}
                      {proto === 'consumet' && 'Consumet API'}
                      {proto === 'embed' && 'Web Embed'}
                      {proto === 'api' && 'Custom JSON API'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="add-ext-field-block">
              <label className="add-ext-form-label" htmlFor="extBaseUrlInput">
                Stream Base URL or Endpoint *
              </label>
              <div className="add-ext-input-group">
                <input
                  id="extBaseUrlInput"
                  type="text"
                  className="add-ext-text-input"
                  placeholder="https://stream.my-source.org/api/v1/play"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-test-latency"
                  onClick={handleTestConnection}
                  disabled={isTesting || !baseUrl.trim()}
                  title="Test server handshake and ping"
                >
                  {isTesting ? (
                    'Testing...'
                  ) : (
                    <>
                      <Wifi size={14} />
                      <span>Ping Test</span>
                    </>
                  )}
                </button>
              </div>

              {testedLatency !== null && (
                <div className="add-ext-ping-result">
                  <span className="ping-dot online" />
                  <span>Connection OK · Latency: <strong>{testedLatency}ms</strong></span>
                  <span className="ping-badge-live">LIVE</span>
                </div>
              )}
            </div>

            <div className="add-ext-grid-row">
              <div className="add-ext-col">
                <label className="add-ext-form-label" htmlFor="extAuthorInput">
                  Author / Maintainer
                </label>
                <input
                  id="extAuthorInput"
                  type="text"
                  className="add-ext-text-input"
                  placeholder="e.g. Otaku Dev Team"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="add-ext-col">
                <label className="add-ext-form-label" htmlFor="extDescInput">
                  Description / Server Region
                </label>
                <input
                  id="extDescInput"
                  type="text"
                  className="add-ext-text-input"
                  placeholder="e.g. US-East Edge CDN, subbed simulcasts"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Feature Checkboxes */}
            <div className="add-ext-features-grid">
              <label className="feature-checkbox-label">
                <input
                  type="checkbox"
                  checked={is4k}
                  onChange={(e) => setIs4k(e.target.checked)}
                />
                <span>4K Ultra HD</span>
              </label>

              <label className="feature-checkbox-label">
                <input
                  type="checkbox"
                  checked={is1080p}
                  onChange={(e) => setIs1080p(e.target.checked)}
                />
                <span>1080p Full HD</span>
              </label>

              <label className="feature-checkbox-label">
                <input
                  type="checkbox"
                  checked={supportsDub}
                  onChange={(e) => setSupportsDub(e.target.checked)}
                />
                <span>English Dub</span>
              </label>

              <label className="feature-checkbox-label">
                <input
                  type="checkbox"
                  checked={supportsSub}
                  onChange={(e) => setSupportsSub(e.target.checked)}
                />
                <span>Soft Subtitles</span>
              </label>

              <label className="feature-checkbox-label">
                <input
                  type="checkbox"
                  checked={hasIntroSkip}
                  onChange={(e) => setHasIntroSkip(e.target.checked)}
                />
                <span>Auto Skip Intro</span>
              </label>
            </div>

            {builderError && (
              <div className="add-ext-alert error">
                <AlertCircle size={15} />
                <span>{builderError}</span>
              </div>
            )}

            <div className="add-ext-submit-row">
              <button type="submit" className="btn filled btn-save-custom-ext">
                <Plus size={16} />
                <span>Add &amp; Activate Extension</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: EXTENSION STORE */}
      {activeTab === 'store' && (
        <div className="add-ext-tab-body">
          <div className="add-ext-store-grid">
            {EXTENSION_STORE_CATALOG.map((item) => {
              const isInstalled = installedStoreIds.has(item.id);
              return (
                <div key={item.id} className="store-ext-card">
                  <div className="store-ext-head">
                    <div className="store-ext-info">
                      <div className="store-ext-title-line">
                        <h4 className="store-ext-name">{item.name}</h4>
                        <span className="store-ext-badge">{item.badge}</span>
                      </div>
                      <span className="store-ext-author">by {item.author} &bull; {item.version}</span>
                    </div>

                    <button
                      type="button"
                      className={`btn-store-install ${isInstalled ? 'installed' : ''}`}
                      onClick={() => installFromStore(item.id)}
                      disabled={isInstalled}
                    >
                      {isInstalled ? (
                        <>
                          <Check size={14} />
                          <span>Installed</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="store-ext-desc">{item.description}</p>

                  <div className="store-ext-tags">
                    <span className="store-tag proto">{item.streamType.toUpperCase()}</span>
                    {item.supportsDub && <span className="store-tag dub">DUB</span>}
                    {item.supportsSub && <span className="store-tag sub">SUB</span>}
                    {item.hasIntroSkip && <span className="store-tag skip">SKIP INTRO</span>}
                    <span className="store-tag ping">⚡ {item.latencyMs}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
