'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useExtensions } from '@/hooks/useExtensions';
import { fetchManifest, ExtensionManifest, InstalledExtension } from '@/lib/extensions';
import {
  Puzzle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  Power
} from 'lucide-react';

export default function ExtensionsPage() {
  const {
    extensions,
    hasEnabledExtensions,
    hasAcknowledgedNotice,
    acknowledgeNotice,
    install,
    remove,
    toggle,
    reorder,
    checkHealth
  } = useExtensions();

  const [inputUrl, setInputUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewManifest, setPreviewManifest] = useState<ExtensionManifest | null>(null);
  const [healthMap, setHealthMap] = useState<Record<string, { checking: boolean; ok?: boolean; latency?: number; error?: string }>>({});

  // Validate manifest before installing
  const handleValidateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) return;

    setIsValidating(true);
    setValidationError(null);
    setPreviewManifest(null);

    try {
      const manifest = await fetchManifest(clean);
      setPreviewManifest(manifest);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to fetch or validate manifest.');
    } finally {
      setIsValidating(false);
    }
  };

  // Confirm install
  const handleConfirmInstall = async () => {
    if (!previewManifest || !inputUrl.trim()) return;
    try {
      await install(inputUrl.trim(), previewManifest);
      setInputUrl('');
      setPreviewManifest(null);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to install extension.');
    }
  };

  // Ping health check
  const handleCheckHealth = async (ext: InstalledExtension) => {
    setHealthMap((prev) => ({ ...prev, [ext.id]: { checking: true } }));
    const res = await checkHealth(ext);
    setHealthMap((prev) => ({
      ...prev,
      [ext.id]: { checking: false, ok: res.ok, latency: res.latency, error: res.error }
    }));
  };

  return (
    <>
      <Navbar />

      <main className="wrap min-h-screen pt-28 pb-20 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-gold mb-2">
            <Puzzle size={16} />
            <span>Streaming Provider Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Extension Manager
          </h1>
          <p className="text-sm sm:text-base text-white/60 mt-2 max-w-2xl leading-relaxed">
            Kamui ships with <strong>no built-in media content sources</strong>. Connect declarative HTTP
            extensions to unlock stream scraping and playback for episodes.
          </p>
        </div>

        {/* First Install Notice */}
        {!hasAcknowledgedNotice && (
          <div className="mb-8 p-4 sm:p-5 rounded-xl bg-gold/10 border border-gold/30 text-white flex flex-col sm:flex-row gap-4 items-start justify-between">
            <div className="flex gap-3">
              <ShieldAlert className="shrink-0 text-gold mt-0.5" size={22} />
              <div className="text-sm space-y-1">
                <h4 className="font-bold text-gold">Important Disclaimer &amp; Privacy Notice</h4>
                <p className="text-white/80 leading-relaxed text-xs sm:text-sm">
                  Kamui does not provide, host or endorse any extension. You are responsible for the
                  sources you add and for following the laws that apply to you. Extensions can see your
                  IP address when they serve streams.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={acknowledgeNotice}
              className="px-4 py-2 bg-gold text-black font-semibold rounded-lg text-xs hover:bg-gold/90 transition-all shrink-0 self-end sm:self-auto"
            >
              I Understand
            </button>
          </div>
        )}

        {/* Add Extension Section */}
        <section className="mb-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Plus size={18} className="text-gold" />
            <span>Add Extension by Base URL</span>
          </h2>
          <p className="text-xs text-white/50 mb-4">
            Enter the base URL of a compatible HTTP provider (e.g. <code>https://my-extension.org</code>).
            Kamui will query <code>&lt;base&gt;/manifest.json</code> to verify compatibility.
          </p>

          <form onSubmit={handleValidateUrl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              placeholder="https://example.com/anime-provider"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setValidationError(null);
                setPreviewManifest(null);
              }}
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              disabled={isValidating || !inputUrl.trim()}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isValidating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Fetch Manifest</span>
              )}
            </button>
          </form>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Manifest Preview Card */}
          {previewManifest && (
            <div className="mt-6 p-4 rounded-xl bg-black/50 border border-gold/40">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {previewManifest.icon ? (
                    <img
                      src={previewManifest.icon}
                      alt={previewManifest.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white/5"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gold/15 flex items-center justify-center text-gold">
                      <Puzzle size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>{previewManifest.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                        {previewManifest.version}
                      </span>
                    </h3>
                    <p className="text-xs text-white/40">{previewManifest.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmInstall}
                  className="px-4 py-2 bg-gold text-black font-bold rounded-lg text-xs hover:bg-gold/90 transition-all cursor-pointer"
                >
                  Confirm &amp; Install
                </button>
              </div>

              <p className="text-xs text-white/70 leading-relaxed mb-3">
                {previewManifest.description || 'No description provided by extension author.'}
              </p>

              {previewManifest.homepage && (
                <a
                  href={previewManifest.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold/80 hover:underline inline-flex items-center gap-1"
                >
                  <span>Homepage</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </section>

        {/* Installed Extensions List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Installed Extensions</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                {extensions.length}
              </span>
            </h2>
            {extensions.length > 0 && (
              <span className="text-xs text-white/40">
                {hasEnabledExtensions ? 'Playback unlocked' : 'All extensions disabled'}
              </span>
            )}
          </div>

          {extensions.length === 0 ? (
            /* Empty State */
            <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/40 mx-auto mb-4">
                <Puzzle size={28} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">No Extensions Installed</h3>
              <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed mb-6">
                Kamui is a catalog-only client. To watch episodes, add a compatible HTTP extension above.
                Third-party developers can build extensions following the declarative HTTP protocol.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-gold/80 bg-gold/10 px-3 py-1.5 rounded-full border border-gold/20">
                <ShieldAlert size={14} />
                <span>Zero code execution · Pure JSON protocol</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {extensions.map((ext, idx) => {
                const health = healthMap[ext.id];
                return (
                  <div
                    key={ext.id}
                    className={`p-4 rounded-xl border transition-all ${
                      ext.enabled
                        ? 'bg-white/[0.04] border-white/15'
                        : 'bg-white/[0.01] border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-3">
                        {ext.manifest.icon ? (
                          <img
                            src={ext.manifest.icon}
                            alt={ext.manifest.name}
                            className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                            <Puzzle size={20} />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-white text-sm">{ext.manifest.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                              {ext.manifest.version}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                ext.enabled
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-white/10 text-white/40'
                              }`}
                            >
                              {ext.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 font-mono mt-0.5 truncate max-w-md">
                            {ext.baseUrl}
                          </p>
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {ext.manifest.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {/* Health Ping Button */}
                        <button
                          type="button"
                          onClick={() => handleCheckHealth(ext)}
                          disabled={health?.checking}
                          title="Check extension connectivity"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw
                            size={14}
                            className={health?.checking ? 'animate-spin' : ''}
                          />
                          {health && !health.checking && (
                            <span
                              className={`text-[10px] ${
                                health.ok ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {health.ok ? `${health.latency}ms` : 'Error'}
                            </span>
                          )}
                        </button>

                        {/* Reorder Up */}
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => reorder(idx, idx - 1)}
                            title="Move up priority"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
                          >
                            <ArrowUpDown size={14} />
                          </button>
                        )}

                        {/* Toggle Enable/Disable */}
                        <button
                          type="button"
                          onClick={() => toggle(ext.id)}
                          title={ext.enabled ? 'Disable extension' : 'Enable extension'}
                          className={`p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            ext.enabled
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          <Power size={14} />
                          <span className="hidden sm:inline">{ext.enabled ? 'On' : 'Off'}</span>
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => remove(ext.id)}
                          title="Remove extension"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
