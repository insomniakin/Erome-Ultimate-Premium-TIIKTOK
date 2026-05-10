// ==UserScript==
// @name         Erome Ultimate Premium - Optimized by Insomnia
// @namespace    https://github.com/
// @version      8.0.0-optimized
// @description  Fast, polished Erome enhancer with smart downloads, premium feed mode, filters, tracking, and low-overhead UI refreshes.
// @icon         https://www.erome.com/favicon-32x32.png
// @match        https://*.erome.com/*
// @match        https://www.erome.com/*
// @run-at       document-end
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      erome.com
// @connect      *.erome.com
// @connect      *
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @license      MIT
// ==/UserScript==

/* globals JSZip saveAs GM GM_xmlhttpRequest GM_addStyle GM_setClipboard */

(function () {
    'use strict';

    const APP = {
        name: 'Erome Ultimate',
        version: '8.0.0-optimized',
        storage: 'eu8:',
        accent: '#9b6cff',
        accent2: '#00d5ff',
        danger: '#ff4d6d',
        success: '#4ade80',
        warn: '#fbbf24'
    };

    const DEFAULTS = {
        performanceMode: 'balanced', // eco | balanced | max
        feedLayout: matchMedia('(min-width: 800px)').matches ? 'desktop' : 'phone',
        feedType: 'all',
        fitMode: 'cover',
        autoplay: true,
        muted: true,
        loop: true,
        showDownloadButtons: true,
        showBadges: true,
        hideSeen: false,
        hideDownloaded: false,
        skipDownloaded: false,
        zipFolders: true,
        minSeconds: 0,
        maxSeconds: 0,
        search: '',
        lockListingFeed: true,
        loadRelatedAlbums: true,
        autoHideFeedTools: true
    };

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const isAlbumPage = /^\/a\//.test(location.pathname);
    const seenNodes = new WeakSet();
    let refreshTimer = 0;
    let observer;

    const settings = Object.assign({}, DEFAULTS, loadJSON('settings', {}));
    const tracking = {
        seenAlbums: new Set(loadJSON('seenAlbums', [])),
        downloadedAlbums: new Set(loadJSON('downloadedAlbums', [])),
        downloadedMedia: new Set(loadJSON('downloadedMedia', [])),
        favorites: loadJSON('favorites', [])
    };

    const feed = {
        open: false,
        items: [],
        itemUrls: new Set(),
        albumQueue: [],
        albumSeen: new Set(),
        loading: false,
        index: 0,
        io: null,
        listingPage: Number(new URL(location.href).searchParams.get('page') || 1) + 1,
        stopped: false
    };

    const ICON = {
        logo: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="eu-g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#9b6cff"/><stop offset=".55" stop-color="#ff4d9d"/><stop offset="1" stop-color="#00d5ff"/></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#eu-g)"/><path fill="#fff" d="M18 18h28v8H27v8h17v7H27v9h20v8H18z"/></svg>',
        brand: '<svg viewBox="0 0 420 96" aria-hidden="true"><defs><linearGradient id="eu-brand-g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#00e5ff"/><stop offset=".45" stop-color="#7c7cff"/><stop offset="1" stop-color="#ff4dd8"/></linearGradient><filter id="eu-brand-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#eu-brand-glow)"><rect x="8" y="13" width="70" height="70" rx="20" fill="rgba(0,0,0,.36)" stroke="url(#eu-brand-g)" stroke-width="5"/><path fill="url(#eu-brand-g)" d="M48 25h10v31c0 11-8 20-20 20-10 0-18-6-18-15 0-10 9-16 20-14 3 .5 5 1.5 8 3V25zm0 33c-3-2-6-3-9-3-6 0-10 3-10 7s4 7 9 7c6 0 10-4 10-11zM58 25c5 9 12 15 22 17v10c-10-2-17-6-22-12z"/><text x="98" y="65" fill="url(#eu-brand-g)" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="52" font-weight="900">EroTok</text></g></svg>',
        download: '<svg viewBox="0 0 24 24"><path d="M12 3v10.2l3.8-3.8 1.4 1.4L12 16l-5.2-5.2 1.4-1.4 3.8 3.8V3h2zm-7 15h14v2H5z"/></svg>',
        settings: '<svg viewBox="0 0 24 24"><path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 3a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5A9 9 0 0 0 4.5 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.6 1.5l.4 3h4l.4-3a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"/></svg>',
        close: '<svg viewBox="0 0 24 24"><path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4z"/><path d="M17.6 5 19 6.4 6.4 19 5 17.6z"/></svg>',
        play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg viewBox="0 0 24 24"><path d="M14 19h4V5h-4M6 19h4V5H6v14z"/></svg>',
        volumeHigh: '<svg viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77zM16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4zM3 9v6h4l5 5V4L7 9H3z"/></svg>',
        volumeLow: '<svg viewBox="0 0 24 24"><path d="M5 9v6h4l5 5V4L9 9H5zm13.5 3c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4z"/></svg>',
        volumeMuted: '<svg viewBox="0 0 24 24"><path d="M12 4 9.91 6.09 12 8.18M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21 21 19.73 12 10.73M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.95 8.95 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z"/></svg>',
        captions: '<svg viewBox="0 0 24 24"><path d="M18 11h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1M11 11H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6c0-1.11-.9-2-2-2z"/></svg>',
        mini: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9z"/></svg>',
        theaterTall: '<svg viewBox="0 0 24 24"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/></svg>',
        theaterWide: '<svg viewBox="0 0 24 24"><path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/></svg>',
        fullOpen: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
        fullClose: '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',
        heart: '<svg viewBox="0 0 24 24"><path d="M12 21 10.6 19.7C5.4 15 2 11.9 2 8.3 2 5.4 4.3 3 7.2 3c1.7 0 3.3.8 4.4 2 1.1-1.2 2.7-2 4.4-2C18.9 3 21.2 5.4 21.2 8.3c0 3.6-3.4 6.7-8.6 11.4z"/></svg>',
        copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4v14h2V3h10zm3 4H8v18h11z"/></svg>',
        eye: '<svg viewBox="0 0 24 24"><path d="M12 5c5.5 0 9 5.2 10 7-1 1.8-4.5 7-10 7S3 13.8 2 12c1-1.8 4.5-7 10-7zm0 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>',
        shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5h-2V6.4l-4.8 4.8-1.4-1.4L17.6 5H16zM4 7h3.5c1.5 0 2.8.8 3.5 2l5 7h3v-2.6l3 3.6-3 3.6V18h-4l-5.6-7.8A2.3 2.3 0 0 0 7.5 9H4zm0 10h3.5c.8 0 1.5-.4 1.9-1.1l1-1.4 1.2 1.8-.6.8A4.3 4.3 0 0 1 7.5 19H4z"/></svg>'
    };

    injectStyles();

    function key(name) { return APP.storage + name; }
    function loadJSON(name, fallback) {
        try {
            const raw = localStorage.getItem(key(name));
            return raw ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    }
    function saveJSON(name, value) {
        try { localStorage.setItem(key(name), JSON.stringify(value)); } catch {}
    }
    function saveSettings() { saveJSON('settings', settings); }
    function saveSet(name, set, limit = 5000) {
        const arr = Array.from(set).filter(Boolean);
        saveJSON(name, arr.slice(Math.max(0, arr.length - limit)));
    }
    function normalizeUrl(url, base = location.href) {
        if (!url) return '';
        try {
            const u = new URL(url, base);
            u.hash = '';
            return u.href;
        } catch { return String(url); }
    }
    function sanitize(name) {
        return String(name || 'Erome')
            .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 90) || 'Erome';
    }
    function htmlEscape(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }
    function filenameFromUrl(url) {
        try { return decodeURIComponent(new URL(url, location.href).pathname.split('/').pop()) || 'media'; }
        catch { return 'media'; }
    }
    function pageTitle(doc = document) {
        return sanitize($('h1, .album-title, .page-title', doc)?.textContent || doc.title || 'Erome Album');
    }
    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(Number(seconds) || 0));
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }
    function isVideo(url) { return /\.(mp4|webm|mov|m3u8)(?:[?#]|$)/i.test(url); }
    function isImage(url) { return /\.(jpe?g|png|gif|webp|bmp)(?:[?#]|$)/i.test(url); }

    function gmRequest(options) {
        const fn = (typeof GM !== 'undefined' && GM.xmlHttpRequest) || (typeof GM_xmlhttpRequest !== 'undefined' && GM_xmlhttpRequest);
        if (!fn) throw new Error('GM_xmlHttpRequest is unavailable');
        return fn(options);
    }
    function getBlob(url) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: 'GET',
                url,
                responseType: 'blob',
                timeout: 90000,
                headers: { Referer: location.origin + '/', Accept: '*/*' },
                onload: res => res.status >= 200 && res.status < 300 ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`)),
                onerror: err => reject(err?.error || new Error('Network error')),
                ontimeout: () => reject(new Error('Timeout'))
            });
        });
    }
    async function getBlobRetry(url, attempts = 2) {
        let last;
        for (let i = 0; i < attempts; i++) {
            try { return await getBlob(url); }
            catch (err) {
                last = err;
                await sleep(450 + i * 650);
            }
        }
        throw last;
    }
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    function toast(message, type = 'info', ms = 2500) {
        let wrap = $('#eu-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'eu-toast-wrap';
            document.body.appendChild(wrap);
        }
        const el = document.createElement('div');
        el.className = `eu-toast eu-${type}`;
        el.innerHTML = `<span class="eu-toast-dot"></span><span>${htmlEscape(message)}</span>`;
        wrap.appendChild(el);
        setTimeout(() => {
            el.classList.add('eu-gone');
            setTimeout(() => el.remove(), 260);
        }, ms);
    }

    function injectStyles() {
        GM_addStyle(`
        :root {
            --eu-accent: ${APP.accent};
            --eu-accent2: ${APP.accent2};
            --eu-bg: #0c0d13;
            --eu-panel: rgba(17, 18, 28, .88);
            --eu-line: rgba(255,255,255,.12);
            --eu-text: #f8f7ff;
            --eu-muted: #b8b1ca;
        }
        body { background: #151620 !important; color: var(--eu-text); }
        a { color: #bfa8ff; }
        .navbar-inverse { background: rgba(10,11,17,.96) !important; border-color: rgba(255,255,255,.08) !important; }
        .album-thumbnail-container, .album-image, .media-group { position: relative; }
        .album-thumbnail-container {
            border-radius: 8px !important;
            overflow: hidden;
            background: #0a0a0d;
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
            border: 1px solid rgba(255,255,255,.07);
        }
        .album-thumbnail-container:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 42px rgba(0,0,0,.45), 0 0 0 1px rgba(155,108,255,.65), 0 0 32px rgba(155,108,255,.26);
        }
        .eu-shell * { box-sizing: border-box; }
        .eu-fab {
            position: fixed;
            right: 18px;
            width: 52px;
            height: 52px;
            border: 0;
            border-radius: 50%;
            display: grid;
            place-items: center;
            color: #fff;
            cursor: pointer;
            z-index: 90000;
            background: linear-gradient(135deg, var(--eu-accent), #ff4d9d 55%, var(--eu-accent2));
            box-shadow: 0 14px 38px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.14), 0 0 34px rgba(155,108,255,.35);
            transition: transform .18s ease, box-shadow .18s ease;
        }
        .eu-fab:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 20px 52px rgba(0,0,0,.55), 0 0 42px rgba(155,108,255,.5); }
        .eu-fab svg { width: 26px; height: 26px; fill: currentColor; }
        #eu-feed-fab { bottom: 86px; }
        #eu-download-fab { bottom: 22px; background: linear-gradient(135deg, #282a36, var(--eu-accent)); }
        .eu-badge-count {
            position: absolute; top: -5px; right: -5px; min-width: 22px; height: 22px; padding: 0 6px;
            border-radius: 999px; background: ${APP.danger}; color: #fff; border: 2px solid #11121c;
            display: grid; place-items: center; font-size: 11px; font-weight: 900;
        }
        .eu-dl-btn {
            position: absolute; top: 10px; left: 10px; z-index: 40;
            height: 36px; min-width: 36px; padding: 0 10px;
            border-radius: 999px; border: 1px solid rgba(255,255,255,.16);
            background: rgba(8,9,14,.72); color: #fff; backdrop-filter: blur(12px);
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            cursor: pointer; font-size: 12px; font-weight: 800; box-shadow: 0 10px 26px rgba(0,0,0,.35);
            opacity: .86; transition: opacity .18s ease, transform .18s ease, background .18s ease;
        }
        .eu-dl-btn:hover { opacity: 1; transform: translateY(-1px); background: rgba(155,108,255,.85); }
        .eu-dl-btn svg { width: 17px; height: 17px; fill: currentColor; }
        .eu-chip {
            position: absolute; z-index: 30;
            border-radius: 999px; padding: 4px 8px;
            background: rgba(0,0,0,.68); color: #fff; border: 1px solid rgba(255,255,255,.12);
            backdrop-filter: blur(10px); font-size: 11px; font-weight: 900; line-height: 1.2;
        }
        .eu-chip-count { top: 8px; right: 8px; display: flex; gap: 7px; }
        .eu-chip-track { right: 8px; bottom: 8px; }
        .eu-chip-track.eu-downloaded { bottom: 34px; color: #d6ffe7; border-color: rgba(74,222,128,.45); }
        .eu-filtered { display: none !important; }
        .eu-modal {
            position: fixed; inset: 0; z-index: 100000; display: none; align-items: center; justify-content: center;
            background: rgba(0,0,0,.72); backdrop-filter: blur(10px); padding: 18px;
        }
        .eu-modal.eu-open { display: flex; }
        .eu-card {
            width: min(620px, 94vw); max-height: min(820px, 92vh); overflow: auto;
            border-radius: 18px; background: linear-gradient(180deg, rgba(24,25,37,.98), rgba(12,13,20,.98));
            border: 1px solid rgba(255,255,255,.12);
            box-shadow: 0 30px 100px rgba(0,0,0,.75), 0 0 70px rgba(155,108,255,.18);
        }
        .eu-card-head {
            position: sticky; top: 0; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 14px;
            padding: 16px 18px; background: rgba(17,18,28,.94); backdrop-filter: blur(14px);
            border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .eu-title { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 16px; font-weight: 900; color: #fff; }
        .eu-title svg { width: 26px; height: 26px; }
        .eu-close {
            width: 34px; height: 34px; border: 0; border-radius: 50%; display: grid; place-items: center;
            background: rgba(255,255,255,.08); color: #fff; cursor: pointer;
        }
        .eu-close svg { width: 18px; height: 18px; fill: currentColor; }
        .eu-card-body { padding: 18px; }
        .eu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .eu-field { display: grid; gap: 6px; margin-bottom: 12px; }
        .eu-field label { color: var(--eu-muted); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
        .eu-field input, .eu-field select {
            width: 100%; height: 40px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12);
            background: rgba(0,0,0,.32); color: #fff; padding: 0 10px; outline: 0;
        }
        .eu-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 14px; margin: 8px 0 14px; }
        .eu-checks label { display: flex; align-items: center; gap: 8px; color: #eee; font-size: 13px; user-select: none; }
        .eu-checks input { accent-color: var(--eu-accent); }
        .eu-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
        .eu-btn {
            min-height: 42px; border-radius: 12px; border: 1px solid rgba(255,255,255,.13);
            background: rgba(255,255,255,.08); color: #fff; font-weight: 900; cursor: pointer;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        }
        .eu-btn svg { width: 17px; height: 17px; fill: currentColor; }
        .eu-btn-primary { border: 0; background: linear-gradient(135deg, var(--eu-accent), #ff4d9d); }
        .eu-btn:hover { filter: brightness(1.08); }
        .eu-note, .eu-log {
            padding: 10px 12px; border-radius: 12px; background: rgba(0,0,0,.28);
            border: 1px solid rgba(255,255,255,.08); color: var(--eu-muted); font-size: 12px;
        }
        .eu-log { height: 150px; overflow: auto; white-space: pre-wrap; font: 11px/1.45 Consolas, monospace; }
        .eu-progress { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.09); margin: 12px 0 8px; }
        .eu-progress span { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--eu-accent), var(--eu-accent2)); transition: width .18s ease; }
        #eu-toast-wrap { position: fixed; right: 18px; bottom: 148px; z-index: 110000; display: grid; gap: 9px; pointer-events: none; }
        .eu-toast {
            pointer-events: auto; display: flex; align-items: center; gap: 9px;
            min-width: 220px; max-width: 360px; padding: 11px 13px; border-radius: 13px;
            background: rgba(14,15,24,.94); color: #fff; border: 1px solid rgba(255,255,255,.12);
            box-shadow: 0 16px 44px rgba(0,0,0,.45); animation: eu-in .22s ease both;
            font-size: 13px; font-weight: 700;
        }
        .eu-toast-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--eu-accent); box-shadow: 0 0 16px var(--eu-accent); flex: 0 0 auto; }
        .eu-success .eu-toast-dot { background: ${APP.success}; box-shadow: 0 0 16px ${APP.success}; }
        .eu-error .eu-toast-dot { background: ${APP.danger}; box-shadow: 0 0 16px ${APP.danger}; }
        .eu-warn .eu-toast-dot { background: ${APP.warn}; box-shadow: 0 0 16px ${APP.warn}; }
        .eu-gone { opacity: 0; transform: translateX(20px); transition: .25s ease; }
        @keyframes eu-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        #eu-feed {
            position: fixed; inset: 0; z-index: 99999; display: none; background: #000;
            color: #fff;
        }
        #eu-feed *, #eu-feed *::before, #eu-feed *::after { box-sizing: border-box; }
        #eu-feed.eu-open { display: grid; place-items: center; }
        #eu-feed .video-container {
            position: relative;
            width: 90%;
            max-width: 1000px;
            display: flex;
            justify-content: center;
            margin-inline: auto;
            background-color: #000;
        }
        #eu-feed .video-container.theater,
        #eu-feed .video-container.full-screen {
            max-width: initial;
            width: 100%;
        }
        #eu-feed .video-container.theater { max-height: 90vh; }
        #eu-feed .video-container.full-screen { max-height: 100vh; }
        .eu-phone {
            position: relative; overflow: hidden; background: #000;
            width: min(430px, 94vw); height: min(94vh, 764px); aspect-ratio: 9 / 16;
            border-radius: 28px; border: 1px solid rgba(255,255,255,.16);
            box-shadow: 0 30px 100px rgba(0,0,0,.75), 0 0 65px rgba(155,108,255,.23);
        }
        #eu-feed.eu-desktop.eu-open { display: block; }
        #eu-feed.eu-desktop .eu-phone {
            width: 100vw; height: 100vh; max-width: none; max-height: none; aspect-ratio: auto;
            border-radius: 0; border: 0; box-shadow: none;
        }
        .eu-feed-head {
            position: absolute; inset: 0 0 auto 0; z-index: 8; height: 92px;
            display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
            padding: 18px; background: linear-gradient(180deg, rgba(0,0,0,.72), transparent); pointer-events: none;
        }
        .eu-feed-head > * { pointer-events: auto; }
        .eu-brand { display: flex; align-items: center; gap: 9px; font-weight: 950; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
        .eu-brand svg { width: 156px; height: 36px; flex: none; filter: drop-shadow(0 0 18px rgba(0,213,255,.3)); }
        .eu-feed-tabs { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; justify-content: flex-end; }
        .eu-pill {
            height: 32px; padding: 0 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,.14);
            background: rgba(0,0,0,.45); color: #fff; font-size: 12px; font-weight: 900; cursor: pointer; backdrop-filter: blur(10px);
        }
        .eu-pill.eu-active { background: rgba(155,108,255,.75); border-color: rgba(255,255,255,.24); }
        .eu-feed-scroll { height: 100%; overflow-y: auto; scroll-snap-type: y mandatory; scrollbar-width: none; }
        .eu-feed-scroll::-webkit-scrollbar { display: none; }
        .eu-feed-item { position: relative; width: 100%; height: 100%; scroll-snap-align: start; scroll-snap-stop: always; display: flex; align-items: center; justify-content: center; background: #000; overflow: hidden; }
        #eu-feed .eu-feed-item.video-container { max-width: initial; width: 100%; max-height: 100%; margin: 0; }
        .eu-feed-media { width: 100%; height: 100%; object-fit: cover; background: #000; }
        #eu-feed.eu-fit-contain .eu-feed-media { object-fit: contain; }
        #eu-feed.eu-fit-cover .eu-feed-media { object-fit: cover; }
        #eu-feed.eu-fit-natural .eu-feed-media { object-fit: scale-down; }
        .eu-feed-item:after { content: ""; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 -180px 140px -60px rgba(0,0,0,.72), inset 0 80px 100px -70px rgba(0,0,0,.65); }
        .eu-caption { position: absolute; z-index: 4; left: 18px; right: 96px; bottom: 24px; text-shadow: 0 2px 14px #000; }
        .eu-user { color: #fff !important; font-size: 14px; font-weight: 950; text-decoration: none; }
        .eu-desc { margin-top: 4px; color: rgba(255,255,255,.9); font-size: 12px; line-height: 1.35; max-height: 52px; overflow: hidden; }
        .eu-album-link { display: inline-flex; margin-top: 8px; padding: 6px 10px; border-radius: 999px; color: #fff !important; text-decoration: none; background: rgba(155,108,255,.42); border: 1px solid rgba(255,255,255,.14); font-size: 12px; font-weight: 900; }
        .eu-side { position: absolute; z-index: 5; right: 14px; bottom: 28px; display: grid; gap: 10px; justify-items: center; }
        .eu-action {
            width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,.15);
            background: rgba(0,0,0,.48); color: #fff; display: grid; place-items: center; cursor: pointer; backdrop-filter: blur(10px);
        }
        .eu-action svg { width: 20px; height: 20px; fill: currentColor; }
        .video-controls-container {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            color: #fff;
            z-index: 7;
            opacity: 0;
            transition: opacity 150ms ease-in-out;
        }
        .video-controls-container::before {
            content: "";
            position: absolute;
            bottom: 0;
            background: linear-gradient(to top, rgba(0,0,0,.86), rgba(0,0,0,.5) 48%, transparent);
            width: 100%;
            aspect-ratio: 6 / 1;
            z-index: -1;
            pointer-events: none;
        }
        .video-container:hover .video-controls-container,
        .video-container:focus-within .video-controls-container,
        .video-container.paused .video-controls-container { opacity: 1; }
        .video-controls-container .controls {
            display: flex;
            gap: .45rem;
            padding: .3rem .65rem .7rem;
            align-items: center;
        }
        .video-controls-container .controls button {
            display: grid;
            place-items: center;
            background: rgba(255,255,255,.06);
            border: none;
            color: inherit;
            padding: 0;
            height: 34px;
            width: 34px;
            border-radius: 50%;
            font-size: 11px;
            font-weight: 900;
            cursor: pointer;
            opacity: .85;
            transition: opacity 150ms ease-in-out, background 150ms ease-in-out, transform 150ms ease-in-out;
        }
        .video-controls-container .controls button:hover { opacity: 1; background: rgba(155,108,255,.36); transform: translateY(-1px); }
        .video-controls-container .controls button svg { width: 21px; height: 21px; fill: currentColor; filter: drop-shadow(0 1px 6px rgba(0,0,0,.8)); }
        .video-container.paused .pause-icon { display: none; }
        .video-container:not(.paused) .play-icon { display: none; }
        .video-container.theater .tall { display: none; }
        .video-container:not(.theater) .wide { display: none; }
        .video-container.full-screen .open { display: none; }
        .video-container:not(.full-screen) .close { display: none; }
        .volume-high-icon, .volume-low-icon, .volume-muted-icon { display: none; }
        .video-container[data-volume-level="high"] .volume-high-icon { display: block; }
        .video-container[data-volume-level="low"] .volume-low-icon { display: block; }
        .video-container[data-volume-level="muted"] .volume-muted-icon { display: block; }
        .volume-container { display: flex; align-items: center; gap: .35rem; }
        .volume-slider {
            width: 0;
            max-width: 100px;
            transform-origin: left;
            transform: scaleX(0);
            accent-color: var(--eu-accent2);
            transition: width 150ms ease-in-out, transform 150ms ease-in-out;
        }
        .volume-container:hover .volume-slider,
        .volume-slider:focus { width: 100px; transform: scaleX(1); }
        .duration-container {
            display: flex;
            align-items: center;
            gap: .25rem;
            flex-grow: 1;
            font-size: 12px;
            font-weight: 800;
            text-shadow: 0 1px 8px #000;
        }
        .video-container.captions .captions-btn { color: var(--eu-accent2); box-shadow: inset 0 -3px 0 var(--eu-accent2); }
        .video-controls-container .controls button.wide-btn { width: 48px; border-radius: 999px; }
        .speed-btn { font-variant-numeric: tabular-nums; }
        .timeline-container {
            height: 7px;
            margin-inline: .65rem;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        .timeline {
            --progress-position: 0;
            --preview-position: 0;
            background-color: rgba(255,255,255,.2);
            height: 3px;
            width: 100%;
            position: relative;
            border-radius: 999px;
        }
        .timeline::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            right: calc(100% - var(--preview-position) * 100%);
            background-color: rgba(255,255,255,.42);
            display: none;
        }
        .timeline::after {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            right: calc(100% - var(--progress-position) * 100%);
            background: linear-gradient(90deg, var(--eu-accent2), #7c7cff, #ff4d9d);
        }
        .timeline .thumb-indicator {
            --scale: 0;
            position: absolute;
            transform: translateX(-50%) scale(var(--scale));
            height: 200%;
            top: -50%;
            left: calc(var(--progress-position) * 100%);
            background-color: #fff;
            box-shadow: 0 0 14px var(--eu-accent2), 0 0 20px #ff4d9d;
            border-radius: 50%;
            transition: transform 150ms ease-in-out;
            aspect-ratio: 1 / 1;
        }
        .timeline .preview-img {
            position: absolute;
            height: 80px;
            aspect-ratio: 16 / 9;
            top: -1rem;
            transform: translate(-50%, -100%);
            left: calc(var(--preview-position) * 100%);
            border-radius: .25rem;
            border: 2px solid #fff;
            display: none;
            object-fit: cover;
            background: #000;
        }
        .thumbnail-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: none;
            pointer-events: none;
            z-index: 2;
        }
        .video-container.scrubbing .thumbnail-img { display: block; }
        .video-container.scrubbing .preview-img,
        .timeline-container:hover .preview-img { display: block; }
        .thumbnail-img:not([src]),
        .preview-img:not([src]) { display: none !important; }
        .video-container.scrubbing .timeline::before,
        .timeline-container:hover .timeline::before { display: block; }
        .video-container.scrubbing .thumb-indicator,
        .timeline-container:hover .thumb-indicator { --scale: 1; }
        .video-container.scrubbing .timeline,
        .timeline-container:hover .timeline { height: 100%; }
        .eu-counter, .eu-status {
            position: absolute; z-index: 9; left: 18px; top: 88px; padding: 5px 9px; border-radius: 999px;
            background: rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.12); color: #fff; font-size: 11px; font-weight: 900; backdrop-filter: blur(10px);
        }
        .eu-status { top: 120px; color: var(--eu-muted); }
        #eu-feed.eu-desktop .eu-feed-head { padding: 18px clamp(18px, 3vw, 42px); }
        #eu-feed.eu-desktop .eu-tools { top: 66px; width: min(860px, calc(100% - 120px)); }
        #eu-feed.eu-desktop .eu-counter { left: clamp(18px, 3vw, 42px); top: 94px; }
        #eu-feed.eu-desktop .eu-status { left: clamp(18px, 3vw, 42px); top: 126px; }
        #eu-feed.eu-desktop .eu-caption {
            left: clamp(18px, 3vw, 42px); right: 128px; bottom: 36px;
            max-width: min(620px, calc(100vw - 180px));
        }
        #eu-feed.eu-desktop .eu-side { right: clamp(18px, 3vw, 42px); bottom: 36px; }
        #eu-feed.eu-desktop .eu-feed-item:after {
            box-shadow: inset 0 -230px 170px -70px rgba(0,0,0,.74), inset 0 120px 130px -78px rgba(0,0,0,.72);
        }
        .eu-tools {
            position: absolute; z-index: 10; left: 50%; top: 58px; transform: translateX(-50%);
            display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; width: min(740px, calc(100% - 34px));
            transition: opacity .2s ease, transform .2s ease;
        }
        .eu-tools.eu-hidden { opacity: 0; pointer-events: none; transform: translate(-50%, -8px); }
        .eu-progress-video { position: absolute; z-index: 6; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.14); }
        .eu-progress-video span { display: block; height: 100%; width: 0; background: #fff; }
        .eu-empty { width: 100%; height: 100%; display: grid; place-items: center; text-align: center; color: var(--eu-muted); padding: 28px; font-weight: 800; }
        @media (max-width: 560px) {
            .eu-grid, .eu-checks, .eu-actions { grid-template-columns: 1fr; }
            .eu-phone { width: 100vw; height: 100vh; border-radius: 0; border: 0; }
            .eu-feed-tabs .eu-pill:nth-child(n+5) { display: none; }
            .eu-caption { right: 76px; }
        }
        `);
    }

    function scheduleRefresh(reason = 'mutation') {
        clearTimeout(refreshTimer);
        const delay = settings.performanceMode === 'eco' ? 700 : settings.performanceMode === 'max' ? 90 : 220;
        refreshTimer = setTimeout(() => refreshAll(reason), delay);
    }

    function refreshAll() {
        attachDownloadButtons();
        decorateAlbums();
        decorateMediaDurations();
        applyFilters();
        updateFabCount();
    }

    function installBlockers() {
        const blocked = ['brightadnetwork.com', 'pemsrv.com', '/jump/next.php', 'splash.php'];
        const bad = url => url && blocked.some(part => String(url).includes(part));
        const open = window.open;
        window.open = function (url, ...rest) {
            if (bad(url)) {
                toast('Blocked popup redirect', 'warn', 1300);
                return null;
            }
            return open.call(this, url, ...rest);
        };
        document.addEventListener('click', event => {
            const link = event.target.closest?.('a[href]');
            if (link && bad(link.href)) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }, true);
    }

    function bypassDialogs() {
        $('#disclaimer')?.remove();
        $('#needAccount')?.remove();
        document.body.style.overflow = '';
        try { fetch('/user/disclaimer', { method: 'POST', credentials: 'include' }).catch(() => {}); } catch {}
    }

    function collectMediaUrls(root = document) {
        const urls = new Set();
        $$('.media-group img, img.media, .album-image img', root).forEach(img => {
            const src = img.currentSrc || img.src || img.dataset?.src || img.getAttribute('data-src') || img.getAttribute('data-original');
            if (src && !/avatar|logo|favicon/i.test(src)) urls.add(normalizeUrl(src));
        });
        $$('.media-group video, .video-js video, video, video source, source', root).forEach(v => {
            const src = v.currentSrc || v.src || v.dataset?.src || v.getAttribute('src') || v.getAttribute('data-src');
            if (src) urls.add(normalizeUrl(src));
        });
        return Array.from(urls).filter(Boolean);
    }

    function attachDownloadButtons() {
        if (!settings.showDownloadButtons) return;
        $$('.media-group img, .media-group video, .video-js video, .album-image img').forEach(media => {
            if (seenNodes.has(media)) return;
            seenNodes.add(media);
            const parent = media.closest('.media-group, .video, .album-image, .media') || media.parentElement;
            if (!parent || $('.eu-dl-btn', parent)) return;
            const src = media.currentSrc || media.src || $('source', media)?.src || media.dataset?.src || media.getAttribute('data-src');
            if (!src) return;
            const btn = document.createElement('button');
            btn.className = 'eu-dl-btn';
            btn.type = 'button';
            btn.title = 'Download media';
            btn.innerHTML = `${ICON.download}<span>Save</span>`;
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                downloadSingle(normalizeUrl(src), filenameFromUrl(src), btn);
            });
            parent.appendChild(btn);
        });
    }

    function albumUrl(album, base = location.href) {
        const a = $('a.album-link[href*="/a/"], a[href*="/a/"]', album);
        return normalizeUrl(a?.getAttribute('href') || a?.href || '', base);
    }

    function decorateAlbums() {
        if (isAlbumPage) markSeen(location.href);
        $$('.album').forEach(album => {
            const thumb = $('.album-thumbnail-container', album) || album;
            const url = albumUrl(album);
            if (!$('.eu-chip-count', thumb)) {
                const images = ($('.album-images', album)?.textContent || '').match(/\d+/)?.[0];
                const videos = ($('.album-videos', album)?.textContent || '').match(/\d+/)?.[0];
                if (images || videos) {
                    const chip = document.createElement('div');
                    chip.className = 'eu-chip eu-chip-count';
                    chip.innerHTML = `${images ? `<span>${images} img</span>` : ''}${videos ? `<span>${videos} vid</span>` : ''}`;
                    thumb.appendChild(chip);
                }
            }
            if (url && settings.showBadges) {
                if (tracking.seenAlbums.has(url) && !$('.eu-chip-track.eu-seen', thumb)) {
                    thumb.insertAdjacentHTML('beforeend', '<div class="eu-chip eu-chip-track eu-seen">Seen</div>');
                }
                if (tracking.downloadedAlbums.has(url) && !$('.eu-chip-track.eu-downloaded', thumb)) {
                    thumb.insertAdjacentHTML('beforeend', '<div class="eu-chip eu-chip-track eu-downloaded">Saved</div>');
                }
            }
        });
    }

    function applyFilters() {
        const q = settings.search.trim().toLowerCase();
        $$('.album').forEach(album => {
            const url = albumUrl(album);
            const isSeen = url && tracking.seenAlbums.has(url);
            const isDownloaded = url && tracking.downloadedAlbums.has(url);
            const searchMiss = q && !(`${album.textContent} ${url}`.toLowerCase().includes(q));
            album.classList.toggle('eu-filtered', !!searchMiss || (settings.hideSeen && isSeen) || (settings.hideDownloaded && isDownloaded));
        });
        $$('.video, .media-group').forEach(group => {
            const video = $('video', group);
            if (!video || !video.dataset.euSeconds) return;
            const seconds = Number(video.dataset.euSeconds);
            group.classList.toggle('eu-filtered', !lengthAllowed(seconds));
        });
    }

    function lengthAllowed(seconds) {
        if (!seconds || !Number.isFinite(seconds)) return true;
        if (settings.minSeconds > 0 && seconds < settings.minSeconds) return false;
        if (settings.maxSeconds > 0 && seconds > settings.maxSeconds) return false;
        return true;
    }
    function lengthLabel() {
        const min = Number(settings.minSeconds) || 0;
        const max = Number(settings.maxSeconds) || 0;
        if (min && max) return `${min}-${max}s`;
        if (min) return `${min}s+`;
        if (max) return `<=${max}s`;
        return 'Any length';
    }

    function decorateMediaDurations() {
        $$('.media-group video, .video-js video, video').forEach(video => {
            if (video.dataset.euDurationAttached) return;
            video.dataset.euDurationAttached = '1';
            const set = () => {
                if (!Number.isFinite(video.duration) || !video.duration) return;
                video.dataset.euSeconds = String(Math.floor(video.duration));
                const parent = video.closest('.media-group, .video') || video.parentElement;
                if (parent && !$('.eu-duration', parent)) {
                    parent.insertAdjacentHTML('beforeend', `<div class="eu-chip eu-duration" style="left:8px;right:auto;bottom:8px">${formatTime(video.duration)}</div>`);
                }
                applyFilters();
            };
            video.addEventListener('loadedmetadata', set, { once: true });
            set();
        });
    }

    function markSeen(url) {
        const clean = normalizeUrl(url);
        if (!clean) return;
        tracking.seenAlbums.add(clean);
        saveSet('seenAlbums', tracking.seenAlbums, 5000);
    }
    function markDownloaded(mediaUrl, album = location.href) {
        const media = normalizeUrl(mediaUrl);
        const alb = normalizeUrl(album);
        if (media) tracking.downloadedMedia.add(media);
        if (alb && /^https?:\/\/[^/]+\/a\//.test(alb)) tracking.downloadedAlbums.add(alb);
        saveSet('downloadedMedia', tracking.downloadedMedia, 10000);
        saveSet('downloadedAlbums', tracking.downloadedAlbums, 5000);
    }

    async function downloadSingle(url, name = filenameFromUrl(url), btn = null, album = location.href) {
        const old = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span>Saving...</span>';
        }
        try {
            const blob = await getBlobRetry(url, settings.performanceMode === 'max' ? 3 : 2);
            const tmp = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = tmp;
            a.download = sanitize(name);
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(tmp), 5000);
            markDownloaded(url, album);
            toast(`Saved ${name}`, 'success');
            scheduleRefresh('download');
        } catch (err) {
            console.error('[EU] Download failed', err);
            toast(`Download failed: ${err.message || err}`, 'error', 3500);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = old;
            }
        }
    }

    function buildFab() {
        if ($('#eu-feed-fab')) return;
        const feedBtn = document.createElement('button');
        feedBtn.id = 'eu-feed-fab';
        feedBtn.className = 'eu-fab eu-shell';
        feedBtn.title = 'Open premium feed';
        feedBtn.innerHTML = ICON.logo;
        feedBtn.addEventListener('click', () => openFeed(settings.feedType, settings.feedLayout));
        document.body.appendChild(feedBtn);

        const dl = document.createElement('button');
        dl.id = 'eu-download-fab';
        dl.className = 'eu-fab eu-shell';
        dl.title = 'Downloads and settings';
        dl.innerHTML = `${ICON.download}<span class="eu-badge-count" id="eu-fab-count">0</span>`;
        dl.addEventListener('click', openDownloadModal);
        document.body.appendChild(dl);
    }

    function updateFabCount() {
        const el = $('#eu-fab-count');
        if (!el) return;
        const count = collectMediaUrls().length;
        el.textContent = String(count);
        el.style.display = count ? 'grid' : 'none';
    }

    function modalShell(id, title, body) {
        let modal = document.getElementById(id);
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'eu-modal eu-shell';
        modal.innerHTML = `
            <div class="eu-card">
                <div class="eu-card-head">
                    <h2 class="eu-title">${ICON.logo}<span>${htmlEscape(title)}</span></h2>
                    <button class="eu-close" type="button" title="Close">${ICON.close}</button>
                </div>
                <div class="eu-card-body">${body}</div>
            </div>`;
        document.body.appendChild(modal);
        $('.eu-close', modal).addEventListener('click', () => modal.classList.remove('eu-open'));
        modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('eu-open'); });
        return modal;
    }

    function openDownloadModal() {
        const modal = modalShell('eu-download-modal', 'Downloads & Settings', `
            <div class="eu-grid">
                <div class="eu-field"><label>Source</label><select id="eu-dl-source"><option value="page">Current page</option><option value="feed">Loaded feed</option></select></div>
                <div class="eu-field"><label>Type</label><select id="eu-dl-type"><option value="all">All media</option><option value="videos">Videos only</option><option value="images">Images only</option></select></div>
                <div class="eu-field"><label>Feed layout</label><select id="eu-set-layout"><option value="desktop">Desktop</option><option value="phone">Phone</option></select></div>
                <div class="eu-field"><label>Fit mode</label><select id="eu-set-fit"><option value="contain">Contain</option><option value="cover">Cover</option><option value="natural">Natural</option></select></div>
                <div class="eu-field"><label>Min seconds</label><input id="eu-set-min" type="number" min="0" step="5"></div>
                <div class="eu-field"><label>Max seconds</label><input id="eu-set-max" type="number" min="0" step="5"></div>
                <div class="eu-field" style="grid-column:1/-1"><label>Album search filter</label><input id="eu-set-search" type="text" placeholder="blank = off"></div>
            </div>
            <div class="eu-checks">
                <label><input id="eu-set-autoplay" type="checkbox"> Autoplay feed</label>
                <label><input id="eu-set-muted" type="checkbox"> Start muted</label>
                <label><input id="eu-set-loop" type="checkbox"> Loop videos</label>
                <label><input id="eu-set-buttons" type="checkbox"> Media save buttons</label>
                <label><input id="eu-set-badges" type="checkbox"> Seen/saved badges</label>
                <label><input id="eu-set-hide-seen" type="checkbox"> Hide seen albums</label>
                <label><input id="eu-set-hide-down" type="checkbox"> Hide saved albums</label>
                <label><input id="eu-set-skip-down" type="checkbox"> Skip saved media</label>
                <label><input id="eu-set-folders" type="checkbox"> ZIP folders</label>
                <label><input id="eu-set-lock" type="checkbox"> Lock listing feed</label>
                <label><input id="eu-set-related" type="checkbox"> Load related albums</label>
                <label><input id="eu-set-tools" type="checkbox"> Auto-hide feed tools</label>
            </div>
            <div class="eu-note" id="eu-dl-stats">Scanning...</div>
            <div class="eu-progress"><span id="eu-dl-progress"></span></div>
            <div class="eu-note" id="eu-dl-line">Ready</div>
            <div class="eu-actions">
                <button class="eu-btn eu-btn-primary" id="eu-start-zip">${ICON.download}<span>Download ZIP</span></button>
                <button class="eu-btn" id="eu-start-loose">${ICON.download}<span>Download Files</span></button>
                <button class="eu-btn" id="eu-open-feed">${ICON.logo}<span>Open Feed</span></button>
                <button class="eu-btn" id="eu-save-settings">${ICON.settings}<span>Save Settings</span></button>
            </div>
            <div class="eu-log" id="eu-dl-log">No downloads started.</div>
        `);
        syncModalSettings(modal);
        const refresh = () => updateDownloadStats(modal);
        ['#eu-dl-source', '#eu-dl-type', '#eu-set-skip-down'].forEach(sel => $(sel, modal).addEventListener('change', refresh));
        $('#eu-start-zip', modal).onclick = () => runBulkDownload(modal, true);
        $('#eu-start-loose', modal).onclick = () => runBulkDownload(modal, false);
        $('#eu-open-feed', modal).onclick = () => openFeed(settings.feedType, settings.feedLayout);
        $('#eu-save-settings', modal).onclick = () => {
            readModalSettings(modal);
            saveSettings();
            applyFilters();
            applyFeedFit();
            toast('Settings saved', 'success');
        };
        updateDownloadStats(modal);
        modal.classList.add('eu-open');
    }

    function syncModalSettings(modal) {
        $('#eu-set-layout', modal).value = settings.feedLayout;
        $('#eu-set-fit', modal).value = settings.fitMode;
        $('#eu-set-min', modal).value = settings.minSeconds;
        $('#eu-set-max', modal).value = settings.maxSeconds;
        $('#eu-set-search', modal).value = settings.search;
        $('#eu-set-autoplay', modal).checked = settings.autoplay;
        $('#eu-set-muted', modal).checked = settings.muted;
        $('#eu-set-loop', modal).checked = settings.loop;
        $('#eu-set-buttons', modal).checked = settings.showDownloadButtons;
        $('#eu-set-badges', modal).checked = settings.showBadges;
        $('#eu-set-hide-seen', modal).checked = settings.hideSeen;
        $('#eu-set-hide-down', modal).checked = settings.hideDownloaded;
        $('#eu-set-skip-down', modal).checked = settings.skipDownloaded;
        $('#eu-set-folders', modal).checked = settings.zipFolders;
        $('#eu-set-lock', modal).checked = settings.lockListingFeed;
        $('#eu-set-related', modal).checked = settings.loadRelatedAlbums;
        $('#eu-set-tools', modal).checked = settings.autoHideFeedTools;
    }
    function readModalSettings(modal) {
        settings.feedLayout = $('#eu-set-layout', modal).value;
        settings.fitMode = $('#eu-set-fit', modal).value;
        settings.minSeconds = Math.max(0, Number($('#eu-set-min', modal).value) || 0);
        settings.maxSeconds = Math.max(0, Number($('#eu-set-max', modal).value) || 0);
        if (settings.minSeconds && settings.maxSeconds && settings.minSeconds > settings.maxSeconds) {
            const tmp = settings.minSeconds;
            settings.minSeconds = settings.maxSeconds;
            settings.maxSeconds = tmp;
        }
        settings.search = $('#eu-set-search', modal).value.trim();
        settings.autoplay = $('#eu-set-autoplay', modal).checked;
        settings.muted = $('#eu-set-muted', modal).checked;
        settings.loop = $('#eu-set-loop', modal).checked;
        settings.showDownloadButtons = $('#eu-set-buttons', modal).checked;
        settings.showBadges = $('#eu-set-badges', modal).checked;
        settings.hideSeen = $('#eu-set-hide-seen', modal).checked;
        settings.hideDownloaded = $('#eu-set-hide-down', modal).checked;
        settings.skipDownloaded = $('#eu-set-skip-down', modal).checked;
        settings.zipFolders = $('#eu-set-folders', modal).checked;
        settings.lockListingFeed = $('#eu-set-lock', modal).checked;
        settings.loadRelatedAlbums = $('#eu-set-related', modal).checked;
        settings.autoHideFeedTools = $('#eu-set-tools', modal).checked;
    }

    function getDownloadItems(modal) {
        readModalSettings(modal);
        const source = $('#eu-dl-source', modal).value;
        const type = $('#eu-dl-type', modal).value;
        let items = [];
        if (source === 'feed' && feed.items.length) {
            items = feed.items.map((item, i) => ({ ...item, index: i + 1 }));
        } else {
            items = collectMediaUrls().map((url, i) => ({
                url,
                kind: isVideo(url) ? 'video' : 'image',
                title: pageTitle(),
                username: 'Erome',
                albumUrl: isAlbumPage ? normalizeUrl(location.href) : '',
                index: i + 1
            }));
        }
        if (type === 'videos') items = items.filter(item => item.kind === 'video' || isVideo(item.url));
        if (type === 'images') items = items.filter(item => item.kind === 'image' || isImage(item.url));
        if (settings.skipDownloaded) items = items.filter(item => !tracking.downloadedMedia.has(normalizeUrl(item.url)));
        const dedupe = new Set();
        return items.filter(item => {
            const clean = normalizeUrl(item.url);
            if (!clean || dedupe.has(clean)) return false;
            dedupe.add(clean);
            return true;
        });
    }
    function updateDownloadStats(modal) {
        const items = getDownloadItems(modal);
        const videos = items.filter(item => item.kind === 'video' || isVideo(item.url)).length;
        const images = items.length - videos;
        $('#eu-dl-stats', modal).textContent = `Ready: ${items.length} files (${images} images, ${videos} videos). Length filter: ${lengthLabel()}. Feed loaded: ${feed.items.length}.`;
    }
    async function runBulkDownload(modal, zipMode) {
        const items = getDownloadItems(modal);
        if (!items.length) return toast('No downloadable media found', 'error');
        saveSettings();
        const progress = $('#eu-dl-progress', modal);
        const line = $('#eu-dl-line', modal);
        const log = $('#eu-dl-log', modal);
        const addLog = txt => { log.textContent += `${txt}\n`; log.scrollTop = log.scrollHeight; };
        log.textContent = '';
        let ok = 0;
        try {
            if (zipMode) {
                if (typeof JSZip === 'undefined') throw new Error('JSZip did not load');
                const zip = new JSZip();
                const failed = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const name = `${String(i + 1).padStart(4, '0')}_${sanitize(filenameFromUrl(item.url))}`;
                    const path = settings.zipFolders ? `${sanitize(item.title || pageTitle())}/${name}` : name;
                    progress.style.width = `${(i / items.length) * 100}%`;
                    line.textContent = `Downloading ${i + 1}/${items.length}: ${name}`;
                    try {
                        const blob = await getBlobRetry(item.url, settings.performanceMode === 'max' ? 3 : 2);
                        zip.file(path, await blob.arrayBuffer());
                        markDownloaded(item.url, item.albumUrl);
                        ok++;
                        addLog(`OK  ${name}`);
                    } catch (err) {
                        failed.push(`${item.url}\n${err.message || err}`);
                        addLog(`ERR ${name} - ${err.message || err}`);
                    }
                }
                if (failed.length) zip.file('FAILED_DOWNLOADS.txt', failed.join('\n\n'));
                line.textContent = 'Compressing ZIP...';
                const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }, meta => {
                    progress.style.width = `${meta.percent}%`;
                    line.textContent = `Compressing ZIP: ${Math.round(meta.percent)}%`;
                });
                saveAs(blob, `Erome_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}_${pageTitle()}.zip`);
            } else {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const name = `${String(i + 1).padStart(4, '0')}_${sanitize(filenameFromUrl(item.url))}`;
                    progress.style.width = `${(i / items.length) * 100}%`;
                    line.textContent = `Downloading ${i + 1}/${items.length}: ${name}`;
                    try {
                        await downloadSingle(item.url, name, null, item.albumUrl);
                        ok++;
                        addLog(`OK  ${name}`);
                        await sleep(settings.performanceMode === 'max' ? 120 : 320);
                    } catch (err) {
                        addLog(`ERR ${name} - ${err.message || err}`);
                    }
                }
            }
            progress.style.width = '100%';
            line.textContent = `Complete: ${ok}/${items.length}`;
            toast(`Download complete: ${ok}/${items.length}`, 'success');
        } catch (err) {
            console.error('[EU] Bulk download failed', err);
            toast(`Bulk download failed: ${err.message || err}`, 'error', 4000);
        } finally {
            scheduleRefresh('bulk-download');
            updateDownloadStats(modal);
        }
    }

    function buildFeedOverlay() {
        if ($('#eu-feed')) return;
        const overlay = document.createElement('div');
        overlay.id = 'eu-feed';
        overlay.className = 'eu-shell';
        overlay.innerHTML = `
            <div class="eu-phone">
                <div class="eu-feed-head">
                    <div class="eu-brand">${ICON.brand}</div>
                    <div class="eu-feed-tabs">
                        <button class="eu-pill" data-feed-type="all">All</button>
                        <button class="eu-pill" data-feed-type="videos">Videos</button>
                        <button class="eu-pill" data-feed-type="images">Photos</button>
                        <button class="eu-pill" id="eu-layout">Layout</button>
                        <button class="eu-pill" id="eu-close-feed">${ICON.close}</button>
                    </div>
                </div>
                <div class="eu-tools" id="eu-tools">
                    <button class="eu-pill" id="eu-fit">Fit</button>
                    <button class="eu-pill" id="eu-shuffle">${ICON.shuffle} Shuffle</button>
                    <button class="eu-pill" id="eu-mute">Mute</button>
                    <button class="eu-pill" id="eu-length">Length</button>
                    <button class="eu-pill" id="eu-more">More</button>
                </div>
                <div class="eu-counter" id="eu-counter">0 / 0</div>
                <div class="eu-status" id="eu-feed-status">Ready</div>
                <div class="eu-feed-scroll" id="eu-feed-scroll"></div>
            </div>`;
        document.body.appendChild(overlay);
        $('#eu-close-feed', overlay).onclick = closeFeed;
        $('#eu-layout', overlay).onclick = () => setFeedLayout(settings.feedLayout === 'desktop' ? 'phone' : 'desktop');
        $('#eu-fit', overlay).onclick = cycleFit;
        $('#eu-shuffle', overlay).onclick = shuffleFeed;
        $('#eu-mute', overlay).onclick = () => {
            settings.muted = !settings.muted;
            saveSettings();
            $$('#eu-feed video').forEach(applyVideoPrefs);
            syncFeedControls();
        };
        $('#eu-length', overlay).onclick = () => {
            const min = prompt('Minimum video seconds, 0 for off', String(settings.minSeconds));
            if (min === null) return;
            const max = prompt('Maximum video seconds, 0 for off', String(settings.maxSeconds));
            if (max === null) return;
            settings.minSeconds = Math.max(0, Number(min) || 0);
            settings.maxSeconds = Math.max(0, Number(max) || 0);
            saveSettings();
            pruneFeedByLength();
            applyFilters();
            syncFeedControls();
        };
        $('#eu-more', overlay).onclick = openDownloadModal;
        overlay.addEventListener('click', e => { if (e.target === overlay) closeFeed(); });
        $$('.eu-feed-tabs [data-feed-type]', overlay).forEach(btn => {
            btn.onclick = () => openFeed(btn.dataset.feedType, settings.feedLayout, true);
        });
        $('#eu-feed-scroll', overlay).addEventListener('scroll', debounce(() => {
            const scroller = $('#eu-feed-scroll');
            if (scroller.scrollTop + scroller.clientHeight > scroller.scrollHeight - scroller.clientHeight * 2) preloadAlbum();
            if (settings.autoHideFeedTools) hideToolsSoon();
        }, 90), { passive: true });
        document.addEventListener('keydown', feedKeys);
    }

    function debounce(fn, ms) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    async function openFeed(type = settings.feedType, layout = settings.feedLayout, reset = false) {
        buildFeedOverlay();
        settings.feedType = type;
        settings.feedLayout = layout;
        saveSettings();
        const overlay = $('#eu-feed');
        overlay.classList.add('eu-open');
        document.body.style.overflow = 'hidden';
        feed.open = true;
        setFeedLayout(layout);
        syncFeedControls();
        if (reset || !feed.items.length) await resetFeed();
        toast(layout === 'desktop' ? 'Desktop feed ready' : 'Swipe feed ready', 'info', 1800);
    }

    function closeFeed() {
        feed.open = false;
        $('#eu-feed')?.classList.remove('eu-open');
        document.body.style.overflow = '';
        $$('#eu-feed video').forEach(v => v.pause());
    }

    function setFeedLayout(layout) {
        settings.feedLayout = layout === 'desktop' ? 'desktop' : 'phone';
        saveSettings();
        $('#eu-feed')?.classList.toggle('eu-desktop', settings.feedLayout === 'desktop');
        syncFeedControls();
    }
    function applyFeedFit() {
        const overlay = $('#eu-feed');
        if (!overlay) return;
        overlay.classList.remove('eu-fit-contain', 'eu-fit-cover', 'eu-fit-natural');
        overlay.classList.add(`eu-fit-${settings.fitMode || 'cover'}`);
    }
    function cycleFit() {
        const modes = ['contain', 'cover', 'natural'];
        settings.fitMode = modes[(modes.indexOf(settings.fitMode) + 1) % modes.length] || 'cover';
        saveSettings();
        applyFeedFit();
        syncFeedControls();
    }
    function syncFeedControls() {
        applyFeedFit();
        $$('#eu-feed [data-feed-type]').forEach(btn => btn.classList.toggle('eu-active', btn.dataset.feedType === settings.feedType));
        $('#eu-layout') && ($('#eu-layout').textContent = settings.feedLayout === 'desktop' ? 'Phone' : 'Desktop');
        $('#eu-fit') && ($('#eu-fit').textContent = `Fit: ${settings.fitMode}`);
        $('#eu-mute') && ($('#eu-mute').textContent = settings.muted ? 'Muted' : 'Sound');
        $('#eu-length') && ($('#eu-length').textContent = lengthLabel());
        updateFeedStatus();
    }
    function updateFeedCounter() {
        const el = $('#eu-counter');
        if (el) el.textContent = `${Math.min(feed.index + 1, feed.items.length)} / ${feed.items.length}`;
        updateFeedStatus();
    }
    function updateFeedStatus() {
        const el = $('#eu-feed-status');
        if (!el) return;
        el.textContent = `Queue ${feed.albumQueue.length} - ${settings.lockListingFeed && !isAlbumPage ? 'listing lock' : 'related on'} - ${lengthLabel()}`;
    }
    let hideToolsTimer = 0;
    function hideToolsSoon() {
        clearTimeout(hideToolsTimer);
        const tools = $('#eu-tools');
        if (!tools) return;
        tools.classList.remove('eu-hidden');
        hideToolsTimer = setTimeout(() => tools.classList.add('eu-hidden'), 2400);
    }

    async function resetFeed() {
        feed.items = [];
        feed.itemUrls = new Set();
        feed.albumQueue = [];
        feed.albumSeen = new Set();
        feed.loading = false;
        feed.index = 0;
        feed.listingPage = Number(new URL(location.href).searchParams.get('page') || 1) + 1;
        feed.stopped = false;
        const scroller = $('#eu-feed-scroll');
        scroller.innerHTML = '';
        setupFeedObserver(scroller);

        if (isAlbumPage) {
            feed.albumSeen.add(normalizeUrl(location.href));
            addFeedItems(extractMedia(document, location.href));
            queueAlbumsFromDoc(document, location.href, 'album');
        } else {
            queueAlbumsFromDoc(document, location.href, 'listing');
            if (!feed.albumQueue.length) await queueNextListingPage();
        }

        let attempts = 0;
        while (!feed.items.length && attempts++ < 10 && (feed.albumQueue.length || !feed.stopped)) {
            if (!feed.albumQueue.length) await queueNextListingPage();
            await preloadAlbum();
        }
        if (!feed.items.length) scroller.innerHTML = '<div class="eu-empty">No media found here. Try another tab or turn related album loading on.</div>';
        updateFeedCounter();
        if (feed.albumQueue.length) setTimeout(preloadAlbum, 700);
    }

    function setupFeedObserver(scroller) {
        feed.io?.disconnect();
        feed.io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.intersectionRatio < .64) return;
                const card = entry.target;
                feed.index = Number(card.dataset.index) || 0;
                updateFeedCounter();
                const item = card._euItem;
                if (item?.albumUrl) markSeen(item.albumUrl);
                $$('#eu-feed video').forEach(v => { if (!card.contains(v)) v.pause(); });
                const video = $('video', card);
                if (video) {
                    applyVideoPrefs(video);
                    if (settings.autoplay) video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
                }
                if (feed.index >= feed.items.length - 3) preloadAlbum();
            });
        }, { root: scroller, threshold: [.64] });
    }

    function getAlbumMeta(doc, url) {
        return {
            albumUrl: normalizeUrl(url),
            title: pageTitle(doc),
            username: sanitize($('#user_name, .username, .user-name', doc)?.textContent || 'Erome')
        };
    }
    function extractMedia(doc, albumPageUrl) {
        const meta = getAlbumMeta(doc, albumPageUrl);
        const results = [];
        const add = (kind, raw) => {
            const url = normalizeUrl(raw, albumPageUrl);
            if (!url || feed.itemUrls.has(url) || /thumb|avatar|logo|favicon/i.test(url)) return;
            if (settings.feedType === 'videos' && kind !== 'video') return;
            if (settings.feedType === 'images' && kind !== 'image') return;
            feed.itemUrls.add(url);
            results.push({ kind, url, ...meta });
        };
        $$('.media-group video, .video-js video, video, source', doc).forEach(v => add('video', v.currentSrc || v.src || v.getAttribute('src') || v.dataset?.src));
        $$('.media-group img, img.media, .album-image img', doc).forEach(img => add('image', img.currentSrc || img.src || img.getAttribute('src') || img.dataset?.src || img.getAttribute('data-src')));
        const html = doc.documentElement?.innerHTML || '';
        html.match(/https?:\/\/[^"'<>\\\s]+?\.(?:mp4|webm|m3u8)(?:\?[^"'<>\\\s]*)?/gi)?.forEach(url => add('video', url));
        return results;
    }
    function queueAlbumsFromDoc(doc, base, source) {
        if (!isAlbumPage && source === 'album' && settings.lockListingFeed) return 0;
        if (isAlbumPage && source === 'album' && !settings.loadRelatedAlbums) return 0;
        const before = feed.albumQueue.length;
        const cards = $$('#albums .album, .albums .album, .user-albums .album, .page-content .album', doc);
        const links = cards.length
            ? cards.map(card => albumUrl(card, base)).filter(Boolean)
            : (source === 'album' ? $$('a[href*="/a/"]', doc).map(a => normalizeUrl(a.getAttribute('href'), base)) : []);
        const q = settings.search.trim().toLowerCase();
        links.forEach(url => {
            if (!url || feed.albumSeen.has(url) || feed.albumQueue.includes(url)) return;
            if (q && source === 'listing') {
                const card = cards.find(c => albumUrl(c, base) === url);
                if (card && !(`${card.textContent} ${url}`.toLowerCase().includes(q))) return;
            }
            feed.albumQueue.push(url);
        });
        updateFeedStatus();
        return feed.albumQueue.length - before;
    }
    async function queueNextListingPage() {
        if (isAlbumPage || feed.stopped) return 0;
        const url = new URL(location.href);
        url.searchParams.set('page', feed.listingPage);
        try {
            const res = await fetch(url.href, { credentials: 'include' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            const added = queueAlbumsFromDoc(doc, url.href, 'listing');
            feed.listingPage++;
            if (!added) feed.stopped = true;
            return added;
        } catch (err) {
            feed.stopped = true;
            console.warn('[EU] listing feed stopped', err);
            return 0;
        }
    }
    async function preloadAlbum() {
        if (feed.loading) return 0;
        if (!feed.albumQueue.length && !isAlbumPage && !feed.stopped) await queueNextListingPage();
        if (!feed.albumQueue.length) return 0;
        feed.loading = true;
        const url = feed.albumQueue.shift();
        feed.albumSeen.add(url);
        updateFeedStatus();
        try {
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            if (isAlbumPage || !settings.lockListingFeed) queueAlbumsFromDoc(doc, url, 'album');
            const items = extractMedia(doc, url);
            addFeedItems(items);
            if (!items.length) return preloadAlbum();
            return items.length;
        } catch (err) {
            console.warn('[EU] album preload failed', err);
            return 0;
        } finally {
            feed.loading = false;
            updateFeedCounter();
        }
    }
    function addFeedItems(items) {
        const scroller = $('#eu-feed-scroll');
        if (!scroller) return;
        $('.eu-empty', scroller)?.remove();
        items.forEach(item => {
            feed.items.push(item);
            appendFeedCard(item, feed.items.length - 1);
        });
        pruneFeedByLength(false);
        updateFeedCounter();
    }
    function appendFeedCard(item, index) {
        const scroller = $('#eu-feed-scroll');
        const card = document.createElement('section');
        card.className = item.kind === 'video' ? 'eu-feed-item video-container theater paused' : 'eu-feed-item';
        card.dataset.index = String(index);
        card._euItem = item;
        const safeUser = htmlEscape(item.username || 'Erome');
        const safeTitle = htmlEscape(item.title || 'Media');
        const media = item.kind === 'video'
            ? `<video class="eu-feed-media" src="${htmlEscape(item.url)}" playsinline preload="metadata"></video>
               <img class="thumbnail-img" alt="">
               <div class="video-controls-container">
                   <div class="timeline-container"><div class="timeline"><img class="preview-img" alt=""><div class="thumb-indicator"></div></div></div>
                   <div class="controls">
                       <button class="play-pause-btn" type="button" data-video-act="play" title="Play/Pause"><span class="play-icon">${ICON.play}</span><span class="pause-icon">${ICON.pause}</span></button>
                       <div class="volume-container">
                           <button class="mute-btn" type="button" data-video-act="mute" title="Mute">${ICON.volumeHigh.replace('<svg', '<svg class="volume-high-icon"')}${ICON.volumeLow.replace('<svg', '<svg class="volume-low-icon"')}${ICON.volumeMuted.replace('<svg', '<svg class="volume-muted-icon"')}</button>
                           <input class="volume-slider" type="range" min="0" max="1" step="any" value="1" title="Volume">
                       </div>
                       <div class="duration-container"><span class="current-time">0:00</span><span class="duration-separator">/</span><span class="total-time">0:00</span></div>
                       <button class="captions-btn" type="button" data-video-act="captions" title="Captions">${ICON.captions}</button>
                       <button class="speed-btn wide-btn" type="button" data-video-act="speed" title="Playback speed">1x</button>
                       <button class="mini-player-btn" type="button" data-video-act="mini" title="Mini player">${ICON.mini}</button>
                       <button class="theater-btn" type="button" data-video-act="theater" title="Theater mode"><span class="tall">${ICON.theaterTall}</span><span class="wide">${ICON.theaterWide}</span></button>
                       <button class="full-screen-btn" type="button" data-video-act="full" title="Fullscreen"><span class="open">${ICON.fullOpen}</span><span class="close">${ICON.fullClose}</span></button>
                   </div>
               </div>`
            : `<img class="eu-feed-media" src="${htmlEscape(item.url)}" alt="" loading="lazy">`;
        card.innerHTML = `
            ${media}
            <div class="eu-caption">
                <a class="eu-user" href="${htmlEscape(item.albumUrl || '#')}" target="_blank" rel="noopener">@${safeUser}</a>
                <div class="eu-desc">${safeTitle}</div>
                <a class="eu-album-link" href="${htmlEscape(item.albumUrl || item.url)}" target="_blank" rel="noopener">View album</a>
            </div>
            <div class="eu-side">
                <button class="eu-action" data-act="save" title="Download">${ICON.download}</button>
                <button class="eu-action" data-act="fav" title="Favorite">${ICON.heart}</button>
                <button class="eu-action" data-act="copy" title="Copy URL">${ICON.copy}</button>
            </div>`;
        $('.eu-side', card).addEventListener('click', e => {
            const btn = e.target.closest('[data-act]');
            if (!btn) return;
            e.stopPropagation();
            const act = btn.dataset.act;
            if (act === 'save') downloadSingle(item.url, filenameFromUrl(item.url), null, item.albumUrl);
            if (act === 'copy') copyText(item.url);
            if (act === 'fav') {
                tracking.favorites.unshift({ url: item.url, albumUrl: item.albumUrl, title: item.title, savedAt: new Date().toISOString() });
                tracking.favorites = tracking.favorites.slice(0, 1000);
                saveJSON('favorites', tracking.favorites);
                toast('Saved to local favorites', 'success');
            }
        });
        if (item.kind === 'video') {
            const video = $('video', card);
            const timelineContainer = $('.timeline-container', card);
            const timeline = $('.timeline', card);
            const currentTime = $('.current-time', card);
            const totalTime = $('.total-time', card);
            const volumeSlider = $('.volume-slider', card);
            const speedBtn = $('.speed-btn', card);
            const thumbnail = $('.thumbnail-img', card);
            const preview = $('.preview-img', card);
            card.dataset.volumeLevel = settings.muted ? 'muted' : 'high';
            applyVideoPrefs(video);
            volumeSlider.value = video.muted ? '0' : String(video.volume || 1);
            video.addEventListener('loadedmetadata', () => {
                item.seconds = Math.floor(video.duration || 0);
                totalTime.textContent = formatTime(video.duration || 0);
                if (video.poster) {
                    thumbnail.src = video.poster;
                    preview.src = video.poster;
                }
                if (!lengthAllowed(item.seconds)) {
                    card.remove();
                    feed.items = feed.items.filter(x => x !== item);
                    reindexFeedCards();
                }
            });
            video.addEventListener('timeupdate', () => {
                currentTime.textContent = formatTime(video.currentTime || 0);
                if (video.duration) timeline.style.setProperty('--progress-position', video.currentTime / video.duration);
            });
            video.addEventListener('play', () => card.classList.remove('paused'));
            video.addEventListener('pause', () => card.classList.add('paused'));
            $('.video-controls-container', card).addEventListener('click', e => {
                const btn = e.target.closest('[data-video-act]');
                if (!btn) return;
                e.preventDefault();
                e.stopPropagation();
                const act = btn.dataset.videoAct;
                if (act === 'play') video.paused ? video.play().catch(() => {}) : video.pause();
                if (act === 'mute') {
                    video.muted = !video.muted;
                    if (!video.muted && video.volume === 0) video.volume = .7;
                    volumeSlider.value = video.muted ? '0' : String(video.volume || .7);
                    updateVolumeLevel(card, video);
                }
                if (act === 'captions') card.classList.toggle('captions');
                if (act === 'speed') {
                    const speeds = [.5, .75, 1, 1.25, 1.5, 2];
                    const next = speeds[(speeds.indexOf(video.playbackRate) + 1) % speeds.length] || 1;
                    video.playbackRate = next;
                    speedBtn.textContent = `${next}x`;
                }
                if (act === 'mini') video.requestPictureInPicture?.().catch(() => toast('Mini player unavailable here', 'warn', 1400));
                if (act === 'theater') card.classList.toggle('theater');
                if (act === 'full') {
                    if (document.fullscreenElement) document.exitFullscreen?.();
                    else card.requestFullscreen?.();
                }
            });
            volumeSlider.addEventListener('input', e => {
                e.stopPropagation();
                video.volume = Number(volumeSlider.value) || 0;
                video.muted = video.volume === 0;
                settings.muted = video.muted;
                saveSettings();
                updateVolumeLevel(card, video);
            });
            document.addEventListener('fullscreenchange', () => {
                card.classList.toggle('full-screen', document.fullscreenElement === card);
            });
            installTimelineScrub(card, video, timelineContainer, timeline);
            card.addEventListener('click', e => {
                if (e.target.closest('a,button')) return;
                video.paused ? video.play().catch(() => {}) : video.pause();
            });
        }
        scroller.appendChild(card);
        feed.io?.observe(card);
    }
    function updateVolumeLevel(card, video) {
        if (!card || !video) return;
        let level = 'high';
        if (video.muted || video.volume === 0) level = 'muted';
        else if (video.volume < .5) level = 'low';
        card.dataset.volumeLevel = level;
    }
    function installTimelineScrub(card, video, timelineContainer, timeline) {
        if (!card || !video || !timelineContainer || !timeline) return;
        const eventPercent = event => {
            const rect = timelineContainer.getBoundingClientRect();
            if (!rect.width) return 0;
            return Math.min(Math.max(0, (event.clientX - rect.left) / rect.width), 1);
        };
        const seek = event => {
            const percent = eventPercent(event);
            timeline.style.setProperty('--preview-position', percent);
            timeline.style.setProperty('--progress-position', percent);
            if (video.duration) video.currentTime = percent * video.duration;
        };
        timelineContainer.addEventListener('pointermove', event => {
            timeline.style.setProperty('--preview-position', eventPercent(event));
        });
        timelineContainer.addEventListener('click', event => event.stopPropagation());
        timelineContainer.addEventListener('pointerdown', event => {
            event.preventDefault();
            event.stopPropagation();
            const wasPaused = video.paused;
            card.classList.add('scrubbing');
            video.pause();
            seek(event);
            const onMove = moveEvent => seek(moveEvent);
            const onUp = upEvent => {
                seek(upEvent);
                card.classList.remove('scrubbing');
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                if (!wasPaused) video.play().catch(() => {});
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp, { once: true });
        });
    }
    function applyVideoPrefs(video) {
        if (!video) return;
        video.muted = !!settings.muted;
        video.loop = !!settings.loop;
        video.setAttribute('playsinline', '');
        const card = video.closest('.video-container');
        const slider = card && $('.volume-slider', card);
        if (slider) slider.value = video.muted ? '0' : String(video.volume || 1);
        updateVolumeLevel(card, video);
    }
    function pruneFeedByLength(rebuild = true) {
        const before = feed.items.length;
        feed.items = feed.items.filter(item => item.kind !== 'video' || !item.seconds || lengthAllowed(item.seconds));
        if (rebuild && feed.items.length !== before) {
            const items = [...feed.items];
            feed.items = [];
            $('#eu-feed-scroll').innerHTML = '';
            items.forEach(item => addFeedItems([item]));
        }
        reindexFeedCards();
    }
    function reindexFeedCards() {
        $$('#eu-feed .eu-feed-item').forEach((card, i) => {
            card.dataset.index = String(i);
            if (feed.items[i]) card._euItem = feed.items[i];
        });
        feed.index = Math.min(feed.index, Math.max(0, feed.items.length - 1));
        updateFeedCounter();
    }
    function shuffleFeed() {
        for (let i = feed.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [feed.items[i], feed.items[j]] = [feed.items[j], feed.items[i]];
        }
        $('#eu-feed-scroll').innerHTML = '';
        const items = [...feed.items];
        feed.items = [];
        items.forEach(item => addFeedItems([item]));
        feed.index = 0;
        toast('Feed shuffled', 'success');
    }
    function feedKeys(event) {
        if (!feed.open) return;
        if (event.key === 'Escape') return closeFeed();
        if (event.key === 'ArrowDown' || event.key.toLowerCase() === 'j') { scrollFeed(1); event.preventDefault(); }
        if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'k') { scrollFeed(-1); event.preventDefault(); }
        if (event.key === ' ') {
            const card = $$('#eu-feed .eu-feed-item')[feed.index];
            const video = $('video', card);
            if (video) {
                video.paused ? video.play().catch(() => {}) : video.pause();
                event.preventDefault();
            }
        }
        if (event.key.toLowerCase() === 'd') {
            const item = feed.items[feed.index];
            if (item) downloadSingle(item.url, filenameFromUrl(item.url), null, item.albumUrl);
        }
    }
    function scrollFeed(delta) {
        const cards = $$('#eu-feed .eu-feed-item');
        const next = Math.max(0, Math.min(cards.length - 1, feed.index + delta));
        cards[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (next >= cards.length - 3) preloadAlbum();
    }

    function copyText(text) {
        try {
            if (typeof GM_setClipboard === 'function') GM_setClipboard(text);
            else navigator.clipboard?.writeText(text);
            toast('Copied', 'success', 1200);
        } catch {
            toast('Copy failed', 'error');
        }
    }

    function installInfiniteScroll() {
        if (isAlbumPage) return;
        const container = $('#albums, .user-albums, .albums, .page-content');
        if (!container || !$('.pagination')) return;
        let page = Number(new URL(location.href).searchParams.get('page') || 1) + 1;
        let busy = false;
        let stopped = false;
        const known = new Set($$('.album').map(album => albumUrl(album)).filter(Boolean));
        async function loadMore() {
            if (busy || stopped) return;
            busy = true;
            const url = new URL(location.href);
            url.searchParams.set('page', page);
            try {
                const res = await fetch(url.href, { credentials: 'include' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
                let added = 0;
                $$('.album', doc).forEach(album => {
                    const urlKey = albumUrl(album, url.href);
                    if (!urlKey || known.has(urlKey)) return;
                    known.add(urlKey);
                    container.appendChild(document.importNode(album, true));
                    added++;
                });
                page++;
                if (!added) stopped = true;
                scheduleRefresh('infinite-scroll');
            } catch (err) {
                stopped = true;
                console.warn('[EU] infinite scroll stopped', err);
            } finally {
                busy = false;
            }
        }
        window.addEventListener('scroll', () => {
            if (innerHeight + scrollY > document.documentElement.scrollHeight - 1200) loadMore();
        }, { passive: true });
    }

    function init() {
        console.log(`[${APP.name}] ${APP.version} booting`);
        installBlockers();
        bypassDialogs();
        buildFab();
        if (isAlbumPage) markSeen(location.href);
        refreshAll();
        installInfiniteScroll();
        observer = new MutationObserver(() => scheduleRefresh('mutation'));
        observer.observe(document.body, { childList: true, subtree: true });
        const interval = settings.performanceMode === 'eco' ? 10000 : settings.performanceMode === 'max' ? 2500 : 5500;
        setInterval(() => { if (!document.hidden || settings.performanceMode !== 'eco') refreshAll('interval'); }, interval);
        addEventListener('load', () => setTimeout(refreshAll, 900), { once: true });
        setTimeout(() => toast(`${APP.name} ready - ${collectMediaUrls().length} media found`, 'success', 3000), 850);
        window.eromeUltimate = {
            settings,
            tracking,
            feed,
            refreshAll,
            openFeed,
            openDownloadModal,
            collectMediaUrls,
            downloadSingle
        };
        console.log(`[${APP.name}] ready`);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
