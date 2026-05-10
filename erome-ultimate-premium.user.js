// ==UserScript==
// @name         Erome Ultimate Premium — By Insomnia
// @namespace    https://github.com// @version      7.3.6-hover-length-filter
// @description  The ultimate all-in-one Erome enhancer: TikTok-style vertical feed plus desktop feed with Erome-native buttons (Like, Favorite, Comment, Share, Report), background album preloading, downloads (single + bulk ZIP), M3U8/HLS, sort by views/video-count/photo-count, infinite scroll, video-only mode, cinema mode, playback speed, flip video, PiP, NSFW blur, hide photos/videos, album counts, video duration badges, like counts, hidden-by-duration, redirect/popup blocker, modern Twitter-like popup UI, persistent settings, seen/downloaded tracking, smart download manager, feed controls, status panel, performance modes, search/listing feed scope, and restored album-page next-album loading, auto-hiding feed tools, logo control toggle, and min/max video-length filtering.
// @author       Insomniakin
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

/* globals $ JSZip saveAs */

(function () {
    'use strict';

    /* ============================================================
     *  CONFIGURATION & STATE
     * ============================================================ */
    const CONFIG = {
        brand: 'Erome Ultimate',
        version: '7.3.6-hover-length-filter',
        accent: '#8a5acc',
        accentSoft: '#b39ad6',
        dark: '#14151f',
        darker: '#0e0f17',
        surface: '#1d1e2a',
        success: '#4ade80',
        danger: '#ef4444',
        warning: '#fbbf24'
    };

    /* === Embedded Erome Logo (base64 PNG) === */
    const LOGO_SPLASH = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAACcCAMAAABm1A0xAAAB/lBMVEWcHy2hV1ceFCBUICHc2uCcKE3PV2+WatIQEB2tkY7Ms9kPkpPgJGHbqKqHSzqhjnJgM1jcX4yOcpq3nd49QD3rxK1tU5nCCSZd196o9fclYmUp0tXWmHRUPoB+R8fmPYV7cF+FPrwFBQoRERsUEiN2dnKsCCNWVlM2NTS0hnDGyshJSEksKSZoaGlMOStxWEbS1tDMlnjn7OOMZ1JWRTe1uLaPhXOuemrSmYiUlpTlp47WpInl59tyZFOHiYgAAAHqt5Tv9O6OdFqnqKjFiXJpSTeOemcDAwUBAQMtIxuvlXgCAgSKWUnHxrm9wsJvUj2SBhgUDyCsdVpTR2mwpY+9wrsqGhOmAhvd4desmod5eYMGBgwEBAinalZFOlVwOS90Z41bWWZkWnHNua1IKhp0CBK6vMHToX07OUN9gYOIVsyxaWUGBgs+QUHhnIvUtZSdoaLuSZLo2NBeYWKbnKHGeXFxKCrJi4htTUFuWpGqh9ldYFlvFxl9gXusNVDV/f0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS69gxAAAAgHRSTlP//+n//////6z//////////////////////////////////v7+//////////////////////////////////8F/////////43P//+x////////////////////US7///////////////////9w/////////////////////////+lpkHUAABqCSURBVHja7d2LX9NY9gBwanmsDr7H2dn375cQkzS5Sds0SUNJVvKaaadS7SBYdpGnCjK+38/913/n3PSRloIocX9lN0cUFHTmky/nnHtuHh37e2LxzyHxj6HxWyd+6o/f/fQ7jF/gjQZ+FMWpfTFzhGAPC2Yk47ex/kPyS1/8PDQS/5847LDNHC9OnMhvY6Pz/xI7UEnoHAwxyiIjCMIklywHpsboivw0NmIew7Mj4ao1wiKjAxJlxjCPmWPHgSIMm4Icnh/st/AY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';
    const LOGO_ICON   = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAB/lBMVEWXHiq1mNve4ttgIxyXbNPQcJp1WZuDTzyhUk2fjXHoIVrDp+Day7MQEBs/QDyvK0OtqZvEYGjgn34fIB45LEVfUjxjT2KHY7bABCPCpq4MCxUREBwUEiNVVlQ3NzRISEjGycezhnByWEfNl3mtCCMsKSZnaGmKZ1LR19CuemlLOStTRDd1dXLn7ONwZFWNhnTRmYe0t7Xlp4+HiIjYpIlmSjjk5tuVl5Tqt5OnqaeOdFqNe2fr8uqvlHbEiHEvIxuMWkoUDiDHxrptUTypARurdlu0pI2SBRi9wsJ5eIMJCREICBB0aYusmIcqGxNDOlBlWnKmali9wrnd4dhQQ2c9OkVxOjA+QUFeYWLNuLIQEB2doaLa4+Pm2s59gYS5vMLIioVdYFvinYtcV2R3BxNsFxl0KCWal6S0Z2W1jIaUaNWrFy2rJzbHe2nXtI99gHuwQ1O1WWiqh9dFKBdvWZKWISuUbGOCeomzOETJnKXQoX3Mu8jjxLgkHS5HLSdtTUIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+vwaQAAAAgHRSTlP/////////////////v/////////////////7+/v///////////////////////////////////////////////////////////7nR///////////////////T/////////////////////////////////////////////////zEiVIkAAArlSURBVHja7Zn3X9tIGocNJJtsL9elqMwISVZBxbIQkpHtuGHvYlpCCwRISAKk92w2u5t//d4ZGWODDVifu/vpvsTYOPb76C3zzowm83NX3377y507d34hupOIBd04T+wZMaeVSZ7OfvLGxWIHaQigAzlFGo2RfHkogD1l/8Zl1Yu4AJDKfh9iAKEPkMp8L4I5S+gBnDgwNIMD1Uc4k4bMafsM/cbpnF1EGO5CZmCAzi0/Vu5XP+G0C5mTEhpwQSBioiTLPV/5C39K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';


    const DEFAULT_SETTINGS = {
        defaultFeedLayout: 'desktop',      // 'phone' | 'desktop'
        defaultFeedType: 'all',           // 'videos' | 'photos' | 'all'
        performanceMode: 'normal',        // 'lite' | 'normal' | 'aggressive'
        autoplay: true,
        muteVideos: false,
        loopVideos: true,
        autoResume: true,
        fitMode: 'contain',               // 'contain' | 'cover' | 'natural'
        showSeenBadges: true,
        hideSeen: false,
        hideDownloaded: false,
        skipDownloadedInDownloads: false,
        zipFolders: true,
        retryDownloads: true,
        showDownloadButtons: true,
        hiddenSeconds: 0,              // legacy min-length value
        minVideoSeconds: 0,             // 0 = off; hide videos shorter than this
        maxVideoSeconds: 0,             // 0 = off; hide videos longer than this
        sortMode: 'views',
        sortAscending: false,
        albumSearch: '',
        lockFeedToSearch: true,          // listing/search feeds stay inside the current result set/pagination
        allowRelatedAlbumExpansion: true,  // album-page feeds preload next/related albums by default
        strictSearchTitleMatch: false,   // optional extra filter: album card/title must contain a search word
        feedControlsAutoHide: true,      // hide the feed tools/search/shuffle row after a moment
        feedControlsPinned: false,       // keep feed tools visible until manually hidden
        lastFeed: null
    };

    const SETTINGS = Object.assign({}, DEFAULT_SETTINGS, loadJSON('eu_settings_v73', {}));

    const TRACKING = {
        seenAlbums: new Set(loadJSON('eu_seen_albums_v1', [])),
        downloadedMedia: new Set(loadJSON('eu_downloaded_media_v1', [])),
        downloadedAlbums: new Set(loadJSON('eu_downloaded_albums_v1', [])),
        hiddenAlbums: new Set(loadJSON('eu_hidden_albums_v1', [])),
        favorites: loadJSON('eu_favorites_v1', [])
    };

    const DLX = {
        running: false,
        cancel: false,
        done: 0,
        total: 0,
        ok: 0,
        failed: []
    };

    const STATE = {
        showPhotos: true,
        showVideos: true,
        showDownloadButtons: SETTINGS.showDownloadButtons !== false,
        cinemaMode: false,
        nsfwBlur: loadBool('eu_nsfw', false),
        hiddenSeconds: Math.max(0, Number(SETTINGS.minVideoSeconds || SETTINGS.hiddenSeconds) || 0),
        maxVideoSeconds: Math.max(0, Number(SETTINGS.maxVideoSeconds) || 0),
        videoOnlyMode: loadBool('eu_video_only', false),
        sortAscending: !!SETTINGS.sortAscending,
        sortMode: SETTINGS.sortMode || 'views', // 'views' | 'videos' | 'photos'
        videoDurations: new Map(),
        downloadQueue: [],
        downloadInProgress: false,
        tiktokMode: false,
        tiktokLayout: SETTINGS.defaultFeedLayout === 'desktop' ? 'desktop' : 'phone', // 'phone' | 'desktop'
        tiktokType: SETTINGS.defaultFeedType || 'videos', // 'videos' | 'photos' | 'all'
        tiktokIndex: 0
    };

    function loadBool(key, def) {
        try { return localStorage.getItem(key) === 'true' ? true : (localStorage.getItem(key) === 'false' ? false : def); }
        catch (e) { return def; }
    }
    function saveBool(key, val) {
        try { localStorage.setItem(key, val ? 'true' : 'false'); } catch (e) {}
    }
    function loadJSON(key, def) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : def;
        } catch (e) { return def; }
    }
    function saveJSON(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }
    function saveSettings() {
        saveJSON('eu_settings_v73', SETTINGS);
    }
    function updateSetting(key, value) {
        SETTINGS[key] = value;
        saveSettings();
    }

    // 7.3.3 migration: 7.3.1 saved album-page feeds as "Current album only".
    // Restore the old behavior one time so album pages preload the next/related album again.
    (function migrateV733NextAlbumDefault() {
        try {
            const key = 'eu_migrated_v733_album_next_restored';
            if (localStorage.getItem(key) !== '1') {
                SETTINGS.allowRelatedAlbumExpansion = true;
                saveSettings();
                localStorage.setItem(key, '1');
            }
        } catch (e) {
            SETTINGS.allowRelatedAlbumExpansion = true;
        }
    })();
    function saveLimitedSet(key, set, limit = 2500) {
        const arr = Array.from(set).filter(Boolean);
        saveJSON(key, arr.slice(Math.max(0, arr.length - limit)));
    }

    const IS_ALBUM_PAGE = /^\/a\//.test(window.location.pathname);

    /* ============================================================
     *  REDIRECT & POPUP BLOCKER
     * ============================================================ */
    const BLOCKED_PATTERNS = [
        'brightadnetwork.com',
        'pemsrv.com',
        '/jump/next.php',
        'splash.php'
    ];

    function isBlockedUrl(url) {
        return url && typeof url === 'string' && BLOCKED_PATTERNS.some(p => url.includes(p));
    }

    (function installRedirectBlocker() {
        const origOpen = window.open;
        window.open = function (url, ...rest) {
            if (isBlockedUrl(url)) { console.log('[EU] Blocked popup:', url); return null; }
            return origOpen.apply(this, [url, ...rest]);
        };

        document.addEventListener('click', function (e) {
            let t = e.target;
            while (t && t.tagName !== 'A' && t.tagName !== 'FORM') t = t.parentElement;
            if (t && t.tagName === 'A' && isBlockedUrl(t.href)) {
                console.log('[EU] Blocked click redirect:', t.href);
                e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            }
        }, { capture: true, passive: false });

        const observer = new MutationObserver(muts => {
            muts.forEach(m => m.addedNodes.forEach(node => {
                if (node.tagName === 'A' && isBlockedUrl(node.href)) { node.href = '#'; node.onclick = e => { e.preventDefault(); return false; }; }
                if ((node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') && isBlockedUrl(node.src)) node.remove();
            }));
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    })();

    /* ============================================================
     *  STYLES — Modern Twitter-like UI
     * ============================================================ */
    GM_addStyle(`
    /* ---------- Global Theme ---------- */
    body {
        background-color: ${CONFIG.surface} !important;
        color: #fff;
    }
    a { color: ${CONFIG.accent}; }

    /* ---------- Navbar ---------- */
    .navbar-inverse { background-color: ${CONFIG.dark} !important; }
    .nav.navbar-nav.navbar-right li a {
        color: ${CONFIG.accent};
        transition: all .2s ease-in-out;
    }
    .nav.navbar-nav.navbar-right li a:hover {
        color: #fff;
        text-shadow: 0 0 10px rgba(138,90,204,.9);
        transform: scale(1.05);
    }

    /* ---------- Buttons ---------- */
    .btn-pink {
        color: #fff;
        background-color: rgba(138,90,204,.35);
        border-radius: 6px;
        border: 1px solid transparent;
        transition: all .25s ease;
    }
    .btn-pink:hover {
        background-color: transparent;
        border: 1px solid ${CONFIG.accent} !important;
        box-shadow: 0 0 20px 2px rgba(138,90,204,.5);
        color: #fff;
    }
    .btn-grey {
        color: #fff;
        border-radius: 6px;
        filter: drop-shadow(0 0 5px rgba(138,90,204,.6));
    }
    .btn-grey:hover {
        background: transparent !important;
        border: 1px solid ${CONFIG.accent} !important;
        box-shadow: 0 0 15px rgba(138,90,204,.5);
    }

    /* ---------- Album Cards ---------- */
    .album-thumbnail-container {
        transition: all .25s ease-in-out;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
    }
    .album-thumbnail-container:hover {
        transform: scale(.96);
        box-shadow: 0 0 25px 4px rgba(138,90,204,.55);
    }
    .album .album-thumbnail {
        object-fit: cover;
        width: 100%;
        height: 100%;
    }

    /* ---------- Pagination ---------- */
    .pagination > li > a, .pagination > li > span {
        background-color: ${CONFIG.dark};
        color: #fff;
        border: none;
        border-radius: 6px;
        margin: 0 4px;
        transition: background-color .3s ease;
    }
    .pagination > li > a:hover, .pagination > .active > a,
    .pagination > .active > span {
        background-color: ${CONFIG.accent};
        color: #fff;
        box-shadow: 0 0 10px rgba(138,90,204,.7);
    }

    /* ---------- NSFW Blur ---------- */
    .eu-blur {
        filter: grayscale(100%) blur(10px) invert(100%) hue-rotate(90deg) contrast(170%);
        transition: filter .3s ease;
    }

    /* ---------- Keyframes ---------- */
    @keyframes eu-spin { to { transform: rotate(360deg); } }
    @keyframes eu-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    @keyframes eu-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes eu-toast-in {
        0%   { opacity: 0; transform: translateX(100px); }
        100% { opacity: 1; transform: translateX(0); }
    }

    /* ---------- Download Button on Media ---------- */
    .eu-dl-btn {
        position: absolute;
        top: 10px; left: 10px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: ${CONFIG.dark};
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 3px rgba(138,90,204,.4);
        cursor: pointer;
        transition: all .3s ease;
        overflow: hidden;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        white-space: nowrap;
    }
    .eu-dl-btn svg { width: 16px; height: 16px; transition: margin-right .2s ease; }
    .eu-dl-btn:hover {
        width: 110px;
        border-radius: 24px;
        background: ${CONFIG.accent};
    }
    .eu-dl-btn:hover .eu-dl-label { display: inline; margin-left: 6px; }
    .eu-dl-btn .eu-dl-label { display: none; }
    .eu-dl-btn.downloading { background: ${CONFIG.accent}; width: 110px; border-radius: 24px; pointer-events: none; }
    .eu-dl-btn.downloading .eu-dl-label { display: inline; margin-left: 6px; }

    /* ---------- Album Badges ---------- */
    .eu-duration-badge {
        position: absolute;
        top: 8px; right: 8px;
        background: rgba(0,0,0,.82);
        color: #fff;
        padding: 3px 7px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        z-index: 15;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,.08);
    }
    .eu-count-badge {
        position: absolute;
        top: 8px; left: 8px;
        background: rgba(0,0,0,.82);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        z-index: 15;
        display: flex;
        gap: 8px;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255,255,255,.08);
    }
    .eu-likes-badge {
        color: ${CONFIG.accent};
        filter: drop-shadow(0 0 4px rgba(138,90,204,.8));
        margin-left: 6px;
        font-weight: 600;
    }

    /* ---------- Toast Notifications ---------- */
    .eu-toast-wrap {
        position: fixed;
        bottom: 24px; right: 24px;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        z-index: 100000;
        pointer-events: none;
    }
    .eu-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 240px;
        max-width: 360px;
        padding: 12px 16px;
        border-radius: 12px;
        background: rgba(20,21,31,.95);
        color: ${CONFIG.accentSoft};
        font-size: 13.5px;
        font-family: 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,.4), 0 0 0 1px rgba(138,90,204,.25);
        backdrop-filter: blur(10px);
        animation: eu-toast-in .35s cubic-bezier(.22,1,.36,1);
        border-left: 3px solid ${CONFIG.accent};
        pointer-events: auto;
    }
    .eu-toast.success { border-left-color: ${CONFIG.success}; color: #e0ffef; }
    .eu-toast.error   { border-left-color: ${CONFIG.danger};  color: #ffe0e0; }
    .eu-toast.warning { border-left-color: ${CONFIG.warning}; color: #fff4d6; }
    .eu-toast svg { flex-shrink: 0; }

    /* ---------- Hub Menu (Twitter-like popup cards) ---------- */
    .eu-hub {
        position: relative;
        display: inline-block;
        margin-left: 10px;
        vertical-align: middle;
        margin-top: 15px;
    }
    .eu-hub-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 9px;
        background: ${CONFIG.surface};
        border-radius: 10px;
        color: ${CONFIG.accentSoft};
        transition: all .3s ease;
        cursor: pointer;
        border: 1px solid transparent;
    }
    .eu-hub-btn:hover {
        border-color: ${CONFIG.accent};
        box-shadow: 0 0 15px rgba(138,90,204,.4);
        transform: translateY(-1px);
    }
    .eu-hub-btn svg { width: 18px; height: 18px; fill: #fff; }
    .eu-hub-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        background: ${CONFIG.dark};
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(138,90,204,.2);
        padding: 8px;
        list-style: none;
        display: none;
        min-width: 220px;
        z-index: 10000;
        backdrop-filter: blur(12px);
        animation: eu-fade-in .2s ease;
    }
    .eu-hub.open .eu-hub-menu { display: block; }
    .eu-hub-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        cursor: pointer;
        color: #fff;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        transition: all .2s ease;
        white-space: nowrap;
    }
    .eu-hub-item:hover {
        background: rgba(138,90,204,.15);
        transform: translateX(3px);
    }
    .eu-hub-item svg { width: 16px; height: 16px; fill: ${CONFIG.accentSoft}; flex-shrink: 0; }
    .eu-hub-item.inactive { opacity: .45; }
    .eu-hub-item .eu-kbd {
        margin-left: auto;
        background: rgba(255,255,255,.08);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        color: ${CONFIG.accentSoft};
    }

    /* ---------- Bulk Download Modal ---------- */
    .eu-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.75);
        backdrop-filter: blur(6px);
        z-index: 99998;
        display: none;
        align-items: center;
        justify-content: center;
        animation: eu-fade-in .2s ease;
    }
    .eu-modal-overlay.open { display: flex; }
    .eu-modal {
        background: ${CONFIG.dark};
        border-radius: 16px;
        width: 440px;
        max-width: 92vw;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0,0,0,.7), 0 0 0 1px rgba(138,90,204,.2);
        animation: eu-fade-in .25s cubic-bezier(.22,1,.36,1);
    }
    .eu-modal-header {
        padding: 18px 22px;
        background: linear-gradient(135deg, ${CONFIG.accent}, #6b3fb0);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .eu-modal-header h3 {
        margin: 0;
        color: #fff;
        font-size: 17px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .eu-modal-close {
        background: rgba(255,255,255,.2);
        border: none;
        color: #fff;
        width: 30px; height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .2s ease;
    }
    .eu-modal-close:hover { background: rgba(255,255,255,.35); }
    .eu-modal-body { padding: 22px; }

    .eu-option-group { margin-bottom: 18px; }
    .eu-option-title {
        color: ${CONFIG.accentSoft};
        font-weight: 700;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: .8px;
        margin-bottom: 10px;
    }
    .eu-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        color: #e4e4e8;
        cursor: pointer;
        transition: color .2s ease;
        font-size: 14px;
    }
    .eu-option:hover { color: ${CONFIG.accentSoft}; }
    .eu-option input { display: none; }
    .eu-radio, .eu-check {
        width: 18px; height: 18px;
        border: 2px solid #555;
        border-radius: 50%;
        position: relative;
        transition: all .25s ease;
        flex-shrink: 0;
    }
    .eu-check { border-radius: 4px; }
    .eu-option input:checked + .eu-radio,
    .eu-option input:checked + .eu-check {
        border-color: ${CONFIG.accent};
        background: ${CONFIG.accent};
    }
    .eu-option input:checked + .eu-radio::after {
        content: ''; position: absolute;
        top: 4px; left: 4px;
        width: 6px; height: 6px;
        background: #fff; border-radius: 50%;
    }
    .eu-option input:checked + .eu-check::after {
        content: '✓'; position: absolute;
        top: -2px; left: 2px;
        color: #fff; font-size: 13px; font-weight: bold;
    }
    .eu-zip-preview {
        font-size: 11px;
        color: #888;
        margin-top: 6px;
        padding: 8px 10px;
        background: ${CONFIG.darker};
        border-radius: 6px;
        word-break: break-all;
        font-family: monospace;
    }
    .eu-btn-primary {
        width: 100%;
        padding: 13px;
        background: linear-gradient(135deg, ${CONFIG.accent}, #a77fd4);
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all .25s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    .eu-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(138,90,204,.5);
    }
    .eu-btn-primary:disabled { opacity: .55; cursor: not-allowed; }

    .eu-progress-box {
        margin-top: 14px;
        padding: 14px;
        background: ${CONFIG.darker};
        border-radius: 10px;
    }
    .eu-progress-bar {
        width: 100%; height: 6px;
        background: rgba(255,255,255,.08);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
    }
    .eu-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, ${CONFIG.accent}, ${CONFIG.accentSoft});
        width: 0;
        transition: width .25s ease;
    }
    .eu-progress-text {
        color: ${CONFIG.accentSoft};
        font-size: 12px;
        text-align: center;
        font-weight: 600;
    }

    /* ---------- Floating Action Button (FAB) ---------- */
    .eu-fab {
        position: fixed;
        bottom: 24px; right: 24px;
        width: 56px; height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${CONFIG.accent}, #6b3fb0);
        border: none;
        cursor: pointer;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 6px 18px rgba(138,90,204,.55);
        transition: all .3s ease;
    }
    .eu-fab:hover { transform: scale(1.08); box-shadow: 0 8px 26px rgba(138,90,204,.75); }
    .eu-fab svg { width: 24px; height: 24px; fill: #fff; }
    .eu-fab-badge {
        position: absolute;
        top: -4px; right: -4px;
        min-width: 22px; height: 22px;
        padding: 0 6px;
        background: ${CONFIG.danger};
        color: #fff;
        border-radius: 11px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${CONFIG.dark};
    }

    /* ---------- Hidden Slider (bottom-left) ---------- */
    .eu-hidden-slider {
        position: fixed;
        bottom: 24px; left: 24px;
        width: 44px; height: 44px;
        border-radius: 50%;
        background: ${CONFIG.dark};
        border: none;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 3px rgba(138,90,204,.35);
        cursor: pointer;
        transition: all .3s ease;
        z-index: 9999;
        color: #fff;
        font-weight: 700;
        font-size: 12px;
        overflow: hidden;
    }
    .eu-hidden-slider.visible { display: flex; }
    .eu-hidden-slider:hover {
        width: 110px;
        border-radius: 22px;
        background: ${CONFIG.accent};
    }
    .eu-hidden-slider svg { width: 20px; height: 20px; fill: #fff; }

    /* ---------- Video Player Custom Controls ---------- */
    .video-js .vjs-play-progress {
        background: ${CONFIG.accent} !important;
        box-shadow: 0 0 18px 4px rgba(138,90,204,.5);
    }
    .vjs-control:hover { background: rgba(138,90,204,.3); }
    .eu-player-btn {
        background: ${CONFIG.accent};
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 6px 10px;
        margin: 0 3px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .2s ease;
        font-weight: 600;
        font-size: 12px;
    }
    .eu-player-btn:hover { background: #a77fd4; }
    .eu-player-btn svg { width: 16px; height: 16px; fill: #fff; }

    /* ---------- Cinema Overlay ---------- */
    .eu-cinema-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,.92);
        z-index: 998;
        pointer-events: none;
        display: none;
    }
    body.eu-cinema .eu-cinema-overlay { display: block; }
    body.eu-cinema .video-js,
    body.eu-cinema .media-group img { z-index: 9999; position: relative; }

    /* ---------- Utility ---------- */
    .eu-hidden-video { display: none !important; }

    /* ---------- Video-Only Filter (no gaps!) ---------- */
    .eu-filtered-out {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
    }
    /* Compact grid auto-flow so remaining items reflow with no empty slots */
    .eu-grid-compact {
        display: grid !important;
        grid-auto-flow: row dense !important;
    }
    /* Some Erome templates use flex-wrap — ensure items reflow */
    .user-albums.eu-grid-compact,
    .albums.eu-grid-compact {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 12px !important;
    }
    .eu-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: eu-spin .8s linear infinite;
        display: inline-block;
    }
    `);

    /* ============================================================
     *  ICONS (SVG)
     * ============================================================ */
    const ICONS = {
        download:  '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
        upload:    '<svg viewBox="0 0 384 512"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>',
        settings:  '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
        eye:       '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
        eyeOff:    '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.39 2.59-3.26 3.1-5.34-1.71-4.38-5.98-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1.14 12c1.71 4.38 5.98 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/></svg>',
        photo:     '<svg viewBox="0 0 24 24"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>',
        video:     '<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
        cinema:    '<svg viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>',
        heart:     '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        copy:      '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
        zip:       '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-4 17h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm3 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg>',
        flip:      '<svg viewBox="0 0 16 16"><path d="M7 16V0H9V16H7Z"/><path d="M15 12H14L10 8L14 4H15L15 12Z"/><path d="M2 12H1L1 4H2L6 8L2 12Z"/></svg>',
        pip:       '<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
        clock:     '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>',
        sort:      '<svg viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>',
        bell:      '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
        close:     '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        check:     '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        star:      '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        starFill:  '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        share:     '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',
        flag:      '<svg viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>',
        comment:   '<svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
        user:      '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
        music:     '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
    };

    /* ============================================================
     *  TOAST SYSTEM
     * ============================================================ */
    const toastWrap = document.createElement('div');
    toastWrap.className = 'eu-toast-wrap';
    (document.body || document.documentElement).appendChild(toastWrap);

    function toast(message, type = 'info', duration = 2600) {
        const t = document.createElement('div');
        t.className = `eu-toast ${type}`;
        const iconMap = { success: ICONS.check, error: ICONS.close, warning: ICONS.bell, info: ICONS.bell };
        t.innerHTML = `${iconMap[type] || ICONS.bell}<span>${message}</span>`;
        toastWrap.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(100px)';
            t.style.transition = 'all .3s ease';
            setTimeout(() => t.remove(), 350);
        }, duration);
    }

    /* ============================================================
     *  UTILITIES
     * ============================================================ */
    function formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    }
    function formatDuration(ms) {
        let s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600); s %= 3600;
        const m = Math.floor(s / 60); s %= 60;
        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    }
    function getFilename(url) {
        try { return url.split('?')[0].split('/').pop(); }
        catch (e) { return 'file'; }
    }
    function sanitize(name) {
        return (name || '').replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_').substring(0, 60);
    }

    function normalizeUrl(url, base = location.href) {
        if (!url) return '';
        try {
            const u = new URL(url, base);
            u.hash = '';
            return u.href;
        } catch (e) { return url || ''; }
    }
    function getAlbumUrlFromElement(album, base = location.href) {
        const link = album?.querySelector?.('a.album-link, a[href*="/a/"]');
        const href = link?.getAttribute('href') || link?.href || '';
        return href ? normalizeUrl(href, base) : '';
    }
    function currentAlbumUrl() {
        return IS_ALBUM_PAGE ? normalizeUrl(location.href) : '';
    }
    function markSeenAlbum(url) {
        const clean = normalizeUrl(url || currentAlbumUrl());
        if (!clean) return;
        TRACKING.seenAlbums.add(clean);
        saveLimitedSet('eu_seen_albums_v1', TRACKING.seenAlbums);
    }
    function markDownloadedMedia(url, albumUrl = '') {
        const media = normalizeUrl(url);
        if (media) TRACKING.downloadedMedia.add(media);
        const album = normalizeUrl(albumUrl || currentAlbumUrl());
        if (album) TRACKING.downloadedAlbums.add(album);
        saveLimitedSet('eu_downloaded_media_v1', TRACKING.downloadedMedia, 5000);
        saveLimitedSet('eu_downloaded_albums_v1', TRACKING.downloadedAlbums, 2500);
    }
    function saveFavoriteItem(item) {
        if (!item || !item.url) return;
        const clean = normalizeUrl(item.url);
        const exists = TRACKING.favorites.some(f => f.url === clean);
        if (!exists) {
            TRACKING.favorites.unshift({
                url: clean,
                kind: item.kind || 'media',
                albumUrl: normalizeUrl(item.albumUrl || ''),
                title: item.title || 'Media',
                username: item.username || 'Erome',
                savedAt: new Date().toISOString()
            });
            TRACKING.favorites = TRACKING.favorites.slice(0, 1000);
            saveJSON('eu_favorites_v1', TRACKING.favorites);
        }
    }
    function exportTextFile(name, text) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u; a.download = name; a.style.display = 'none';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 5000);
    }

    function gmRequest(opts) {
        const fn = (typeof GM !== 'undefined' && GM.xmlHttpRequest) ? GM.xmlHttpRequest
                 : (typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : null);
        if (!fn) throw new Error('GM.xmlHttpRequest not available');
        return fn(opts);
    }

    /* ============================================================
     *  DOWNLOAD ENGINE
     * ============================================================ */
    function downloadBlob(url) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: 'GET',
                url,
                responseType: 'blob',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://www.erome.com/',
                    'Accept': '*/*'
                },
                timeout: 60000,
                onload: r => r.status === 200 ? resolve(r.response) : reject(`HTTP ${r.status}`),
                onerror: e => reject(e?.error || 'Network error'),
                ontimeout: () => reject('Timeout')
            });
        });
    }

    async function downloadBlobWithRetry(url, attempts = 2) {
        let lastErr;
        for (let i = 0; i < Math.max(1, attempts); i++) {
            try { return await downloadBlob(url); }
            catch (e) {
                lastErr = e;
                await new Promise(r => setTimeout(r, 500 + (i * 350)));
            }
        }
        throw lastErr;
    }

    async function downloadSingle(url, filename, btn) {
        const name = filename || getFilename(url);
        const originalHTML = btn ? btn.innerHTML : null;

        if (btn) {
            btn.classList.add('downloading');
            btn.innerHTML = `<span class="eu-spinner"></span><span class="eu-dl-label">Downloading</span>`;
        }

        try {
            const blob = await downloadBlob(url);
            const tmp = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = tmp; a.download = name; a.style.display = 'none';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(tmp), 5000);
            markDownloadedMedia(url, arguments[3] || currentAlbumUrl());
            decorateTrackingBadges();
            toast(`Downloaded: ${name}`, 'success');
        } catch (err) {
            console.error('[EU] Download failed:', err);
            toast(`Download failed: ${err}`, 'error');
        } finally {
            if (btn) {
                btn.classList.remove('downloading');
                btn.innerHTML = originalHTML;
            }
        }
    }

    /* ============================================================
     *  INLINE DOWNLOAD BUTTONS ON MEDIA
     * ============================================================ */
    function buildDownloadButton(url) {
        const btn = document.createElement('button');
        btn.className = 'eu-dl-btn';
        btn.innerHTML = `${ICONS.upload}<span class="eu-dl-label">Download</span>`;
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            downloadSingle(url, getFilename(url), btn);
        });
        return btn;
    }

    function attachDownloadButtons() {
        if (!STATE.showDownloadButtons) return;

        document.querySelectorAll('.media-group video, .media-group img').forEach(media => {
            const parent = media.parentElement?.parentElement;
            if (!parent || parent.querySelector('.eu-dl-btn')) return;

            let src;
            if (media.tagName === 'IMG') {
                src = media.src || media.getAttribute('data-src');
            } else {
                src = media.querySelector('source')?.src || media.src || media.currentSrc;
            }
            if (!src) return;

            parent.style.position = parent.style.position || 'relative';
            parent.appendChild(buildDownloadButton(src));
        });

        // Also handle album thumbnails on listing pages for image detection
        document.querySelectorAll('.album-image img').forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            if (!src) return;
            const host = img.closest('.album-image');
            if (!host || host.querySelector('.eu-dl-btn')) return;
            host.style.position = host.style.position || 'relative';
            host.appendChild(buildDownloadButton(src));
        });
    }

    /* ============================================================
     *  VIDEO DURATION DETECTION (from file header)
     * ============================================================ */
    function detectVideoDuration(url) {
        return new Promise(resolve => {
            if (!url) return resolve(0);
            if (STATE.videoDurations.has(url)) return resolve(STATE.videoDurations.get(url));

            const cacheKey = 'eu_vl_' + url;
            const cached = localStorage.getItem(cacheKey);
            if (cached && !isNaN(parseInt(cached))) {
                const d = parseInt(cached);
                STATE.videoDurations.set(url, d);
                return resolve(d);
            }

            try {
                let req = gmRequest({
                    method: 'GET',
                    url,
                    headers: {
                        'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.5',
                        'Referer': 'https://www.erome.com/',
                        'Range': 'bytes=0-500'
                    },
                    responseType: 'blob',
                    onprogress: r => { if (Math.max(r.loaded || 0, r.total || 0) > 600) req.abort?.(); },
                    onload: r => {
                        try {
                            const text = r.responseText || '';
                            const m = text.match(/\x03.*\xe8/);
                            if (m) {
                                const i = text.indexOf(m[0]) + m[0].length;
                                const s = text.substring(i, i + 4);
                                const ms = Array.from(s)
                                    .map(c => c.charCodeAt(0))
                                    .map((v, idx, arr) => v * Math.pow(256, arr.length - idx - 1))
                                    .reduce((a, b) => a + b, 0);
                                localStorage.setItem(cacheKey, ms);
                                STATE.videoDurations.set(url, ms);
                                return resolve(ms);
                            }
                        } catch (e) {}
                        resolve(0);
                    },
                    onerror: () => resolve(0),
                    ontimeout: () => resolve(0)
                });
            } catch (e) { resolve(0); }
        });
    }

    function decorateVideoDurations() {
        document.querySelectorAll('.media-group video, .video-js video').forEach(video => {
            const container = video.closest('.media-group') || video.closest('.video') || video.parentElement;
            if (!container || container.querySelector('.eu-duration-badge')) return;

            const src = video.querySelector('source')?.src || video.src || video.currentSrc;
            if (!src) return;

            detectVideoDuration(src).then(ms => {
                if (ms > 0 && !container.querySelector('.eu-duration-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'eu-duration-badge';
                    badge.textContent = formatDuration(ms);
                    container.style.position = container.style.position || 'relative';
                    container.appendChild(badge);
                    video.dataset.length = Math.floor(ms / 1000);
                    applyHiddenFilter();
                }
            });
        });
    }

    /* ============================================================
     *  ALBUM COUNT BADGES (on listing page)
     * ============================================================ */
    function decorateAlbumCounts() {
        document.querySelectorAll('.album').forEach(album => {
            if (album.querySelector('.eu-count-badge')) return;

            const imgCount = parseInt(album.querySelector('.album-images')?.textContent?.match(/\d+/)?.[0] || '0');
            const vidCount = parseInt(album.querySelector('.album-videos')?.textContent?.match(/\d+/)?.[0] || '0');
            if (imgCount === 0 && vidCount === 0) return;

            const badge = document.createElement('div');
            badge.className = 'eu-count-badge';
            const parts = [];
            if (imgCount > 0) parts.push(`<span>🖼️ ${imgCount}</span>`);
            if (vidCount > 0) parts.push(`<span>🎥 ${vidCount}</span>`);
            badge.innerHTML = parts.join('');

            const thumb = album.querySelector('.album-thumbnail-container');
            if (thumb) {
                thumb.style.position = thumb.style.position || 'relative';
                thumb.appendChild(badge);
            }
        });
    }


    function decorateTrackingBadges() {
        if (IS_ALBUM_PAGE) markSeenAlbum(location.href);

        document.querySelectorAll('.album').forEach(album => {
            const albumUrl = getAlbumUrlFromElement(album);
            if (!albumUrl) return;

            const thumb = album.querySelector('.album-thumbnail-container') || album;
            thumb.style.position = thumb.style.position || 'relative';

            const isSeen = TRACKING.seenAlbums.has(albumUrl);
            const isDownloaded = TRACKING.downloadedAlbums.has(albumUrl);

            if (SETTINGS.showSeenBadges && isSeen && !thumb.querySelector('.eu-tracking-badge.eu-seen')) {
                const b = document.createElement('div');
                b.className = 'eu-tracking-badge eu-seen';
                b.textContent = 'Seen';
                thumb.appendChild(b);
            }
            if (SETTINGS.showSeenBadges && isDownloaded && !thumb.querySelector('.eu-tracking-badge.eu-downloaded')) {
                const b = document.createElement('div');
                b.className = 'eu-tracking-badge eu-downloaded';
                b.textContent = 'Downloaded';
                thumb.appendChild(b);
            }

            album.classList.toggle('eu-track-filtered-out',
                (SETTINGS.hideSeen && isSeen) ||
                (SETTINGS.hideDownloaded && isDownloaded) ||
                TRACKING.hiddenAlbums.has(albumUrl)
            );

            const link = album.querySelector('a.album-link, a[href*="/a/"]');
            if (link && !link.dataset.euTrackSeen) {
                link.dataset.euTrackSeen = '1';
                link.addEventListener('click', () => markSeenAlbum(albumUrl), { capture: true });
            }
        });
    }

    function applyAlbumSearch() {
        const q = (SETTINGS.albumSearch || '').trim().toLowerCase();
        document.querySelectorAll('.album').forEach(album => {
            if (!q) { album.classList.remove('eu-search-filtered-out'); return; }
            const text = album.textContent.toLowerCase();
            const href = getAlbumUrlFromElement(album).toLowerCase();
            album.classList.toggle('eu-search-filtered-out', !(text.includes(q) || href.includes(q)));
        });
    }

    function openAlbumSearch() {
        const q = prompt('Search loaded albums by title, creator, or URL. Leave blank to clear.', SETTINGS.albumSearch || '');
        if (q === null) return;
        updateSetting('albumSearch', q.trim());
        applyAlbumSearch();
        toast(q.trim() ? `Search filter: ${q.trim()}` : 'Search filter cleared', 'info');
    }

    /* ============================================================
     *  LIKE COUNTS ON ALBUMS (listing page)
     * ============================================================ */
    async function loadAlbumLikes() {
        if (IS_ALBUM_PAGE || SETTINGS.performanceMode === 'lite') return;

        // Unlimited: process every album currently loaded, not just the first 30.
        // dataset.euLiked keeps this cheap on repeat calls; small pauses keep the UI responsive.
        const albums = Array.from(document.querySelectorAll('.album-link'));
        for (const a of albums) {
            if (a.dataset.euLiked) continue;
            a.dataset.euLiked = '1';
            try {
                const res = await fetch(a.href, { credentials: 'include' });
                const text = await res.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                const likeArea = doc.querySelector('#like_count') || doc.querySelector('.far.fa-heart.fa-lg');
                const count = likeArea?.nextElementSibling?.firstChild?.textContent?.trim() || 0;
                if (+count < 1) continue;
                const viewSec = a.parentElement.querySelector('.album-bottom-right .album-images');
                if (!viewSec || viewSec.querySelector('.eu-likes-badge')) continue;
                viewSec.insertAdjacentHTML('afterbegin',
                    `<span class="eu-likes-badge">${ICONS.heart} ${count}</span>`);
            } catch (e) { /* silent */ }

            // Avoid hammering the browser/site when many albums are loaded.
            const likeDelay = SETTINGS.performanceMode === 'aggressive' ? 25 : 100;
            await new Promise(r => setTimeout(r, likeDelay));
        }
    }

    /* ============================================================
     *  SORT ALBUMS BY VIEWS
     * ============================================================ */
    function parseViews(text) {
        if (!text) return 0;
        const hasK = /k/i.test(text);
        const num = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));
        return (isNaN(num) ? 0 : num) * (hasK ? 1000 : 1);
    }
    function parseCount(text) {
        if (!text) return 0;
        const n = parseInt(text.replace(/[^\d]/g, ''));
        return isNaN(n) ? 0 : n;
    }
    function getAlbumMetric(album, mode) {
        switch (mode) {
            case 'videos': return parseCount(album.querySelector('.album-videos')?.textContent);
            case 'photos': return parseCount(album.querySelector('.album-images')?.textContent);
            case 'views':
            default: return parseViews(album.querySelector('.album-bottom-views')?.textContent);
        }
    }

    function sortAlbums(mode) {
        if (mode) STATE.sortMode = mode;
        updateSetting('sortMode', STATE.sortMode);
        updateSetting('sortAscending', STATE.sortAscending);
        const container = document.querySelector('#albums') || document.querySelector('.page-content');
        if (!container) return;
        const albums = Array.from(container.querySelectorAll('.album'));
        if (albums.length < 2) return;

        albums.sort((a, b) => {
            const va = getAlbumMetric(a, STATE.sortMode);
            const vb = getAlbumMetric(b, STATE.sortMode);
            return STATE.sortAscending ? va - vb : vb - va;
        });
        albums.forEach(a => container.appendChild(a));

        const labels = { views: 'views', videos: 'video count', photos: 'photo count' };
        toast(`Sorted by ${labels[STATE.sortMode]} (${STATE.sortAscending ? 'ascending' : 'descending'})`, 'info');
    }
    // Backward-compatible alias
    function sortAlbumsByViews() { sortAlbums('views'); }

    /* ============================================================
     *  TOGGLES: photos / videos / downloads / NSFW / cinema / video-only
     * ============================================================ */
    function togglePhotos() {
        STATE.showPhotos = !STATE.showPhotos;
        document.querySelectorAll('.media-group img').forEach(el => {
            el.style.display = STATE.showPhotos ? '' : 'none';
        });
        toast(STATE.showPhotos ? 'Photos visible' : 'Photos hidden', 'info');
    }
    function toggleVideos() {
        STATE.showVideos = !STATE.showVideos;
        document.querySelectorAll('.video-js, .media-group video').forEach(el => {
            el.style.display = STATE.showVideos ? '' : 'none';
        });
        toast(STATE.showVideos ? 'Videos visible' : 'Videos hidden', 'info');
    }
    function toggleDownloadButtons() {
        STATE.showDownloadButtons = !STATE.showDownloadButtons;
        document.querySelectorAll('.eu-dl-btn').forEach(btn => {
            btn.style.display = STATE.showDownloadButtons ? '' : 'none';
        });
        updateSetting('showDownloadButtons', STATE.showDownloadButtons);
        toast(STATE.showDownloadButtons ? 'Download buttons visible' : 'Download buttons hidden', 'info');
    }
    function toggleNSFW() {
        STATE.nsfwBlur = !STATE.nsfwBlur;
        saveBool('eu_nsfw', STATE.nsfwBlur);
        applyNSFW();
        toast(STATE.nsfwBlur ? 'NSFW blur enabled' : 'NSFW blur disabled', 'info');
    }
    function applyNSFW() {
        const targets = document.querySelectorAll(
            '.album-thumbnail-container, .media-group img, .media-group video, .vjs-poster'
        );
        targets.forEach(el => el.classList.toggle('eu-blur', STATE.nsfwBlur));
    }
    function toggleCinema() {
        STATE.cinemaMode = !STATE.cinemaMode;
        document.body.classList.toggle('eu-cinema', STATE.cinemaMode);
        if (STATE.cinemaMode && !document.querySelector('.eu-cinema-overlay')) {
            const o = document.createElement('div');
            o.className = 'eu-cinema-overlay';
            document.body.appendChild(o);
        }
        toast(STATE.cinemaMode ? 'Cinema mode on' : 'Cinema mode off', 'info');
    }
    function toggleVideoOnly() {
        STATE.videoOnlyMode = !STATE.videoOnlyMode;
        saveBool('eu_video_only', STATE.videoOnlyMode);
        applyVideoOnly();
        toast(STATE.videoOnlyMode ? 'Showing video albums only' : 'Showing all albums', 'info');
    }
    function applyVideoOnly() {
        // Use a CSS class so layout reflows cleanly (no orphan grid rows / gaps)
        document.querySelectorAll('.album').forEach(a => {
            const hasVideo = !!a.querySelector('.album-videos');
            if (STATE.videoOnlyMode && !hasVideo) {
                a.classList.add('eu-filtered-out');
            } else {
                a.classList.remove('eu-filtered-out');
            }
        });

        // Also hide empty placeholder slots that some Erome templates leave behind
        document.querySelectorAll('.album-placeholder, .album-empty, .albums .placeholder').forEach(el => {
            if (STATE.videoOnlyMode) el.classList.add('eu-filtered-out');
            else el.classList.remove('eu-filtered-out');
        });

        // Force the parent grid/flex container to reflow by toggling a class
        const containers = document.querySelectorAll('.user-albums, .albums, .user-content, #albums');
        containers.forEach(c => {
            c.classList.toggle('eu-grid-compact', STATE.videoOnlyMode);
        });
    }

    /* ============================================================
     *  VIDEO LENGTH FILTERS
     * ============================================================ */
    function getMinVideoSeconds() {
        return Math.max(0, Number(SETTINGS.minVideoSeconds || SETTINGS.hiddenSeconds || 0) || 0);
    }

    function getMaxVideoSeconds() {
        return Math.max(0, Number(SETTINGS.maxVideoSeconds || 0) || 0);
    }

    function videoLengthAllowed(seconds) {
        const s = Number(seconds) || 0;
        if (!s || !isFinite(s)) return true; // unknown length is allowed until metadata loads
        const min = getMinVideoSeconds();
        const max = getMaxVideoSeconds();
        if (min > 0 && s < min) return false;
        if (max > 0 && s > max) return false;
        return true;
    }

    function getLengthFilterLabel() {
        const min = getMinVideoSeconds();
        const max = getMaxVideoSeconds();
        if (min > 0 && max > 0) return `Length ${min}-${max}s`;
        if (min > 0) return `Length ${min}s+`;
        if (max > 0) return `Length ≤${max}s`;
        return 'Length Any';
    }

    function explainLengthFilter(seconds) {
        const s = Number(seconds) || 0;
        const min = getMinVideoSeconds();
        const max = getMaxVideoSeconds();
        if (min > 0 && s > 0 && s < min) return `under ${min}s`;
        if (max > 0 && s > 0 && s > max) return `over ${max}s`;
        return '';
    }

    function refreshFeedIndexes() {
        document.querySelectorAll('#eu-tiktok-feed .eu-tiktok-item').forEach((card, idx) => {
            card.dataset.idx = idx;
        });
    }

    function filterOutFeedVideoByLength(item, card, seconds) {
        if (!item || !card || videoLengthAllowed(seconds)) return false;
        const reason = explainLengthFilter(seconds);
        const oldIndex = Number(card.dataset.idx) || 0;
        TT.items = TT.items.filter(x => x.url !== item.url);
        card.remove();
        refreshFeedIndexes();
        STATE.tiktokIndex = Math.min(STATE.tiktokIndex, Math.max(0, TT.items.length - 1));
        updateTikTokCounter();
        updateFeedStatus();

        const cards = document.querySelectorAll('#eu-tiktok-feed .eu-tiktok-item');
        if (cards.length) {
            cards[Math.min(oldIndex, cards.length - 1)]?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
        if (TT.items.length < 5 || STATE.tiktokIndex >= TT.items.length - 3) {
            setTimeout(() => preloadNextAlbum(), 160);
        }
        if (reason) console.log(`[EU] Length-filtered feed video (${reason}):`, item.url);
        return true;
    }

    function pruneKnownFeedVideosByLength() {
        const before = TT.items.length;
        TT.items = TT.items.filter(item => item.kind !== 'video' || !item.duration || videoLengthAllowed(item.duration));
        if (TT.items.length !== before) {
            rebuildFeedFromItems(Math.min(STATE.tiktokIndex, Math.max(0, TT.items.length - 1)));
            if (TT.items.length < 5) setTimeout(() => preloadNextAlbum(), 160);
        }
    }

    function promptLengthFilter() {
        const minNow = getMinVideoSeconds();
        const maxNow = getMaxVideoSeconds();
        const minRaw = prompt('Minimum video length in seconds. Use 0 for no minimum.', String(minNow));
        if (minRaw === null) return;
        const maxRaw = prompt('Maximum video length in seconds. Use 0 for no maximum.', String(maxNow));
        if (maxRaw === null) return;
        const min = Math.max(0, Math.floor(Number(minRaw) || 0));
        const max = Math.max(0, Math.floor(Number(maxRaw) || 0));
        if (min > 0 && max > 0 && min > max) {
            toast('Min length cannot be higher than max length', 'error');
            return;
        }
        updateSetting('minVideoSeconds', min);
        updateSetting('hiddenSeconds', min); // keep the older bottom-left album filter in sync
        updateSetting('maxVideoSeconds', max);
        STATE.hiddenSeconds = min;
        STATE.maxVideoSeconds = max;
        applyHiddenFilter();
        pruneKnownFeedVideosByLength();
        updateFeedTools();
        toast(`${getLengthFilterLabel()} filter saved`, 'success');
    }

    /* ============================================================
     *  HIDDEN BY DURATION (bottom-left slider)
     * ============================================================ */
    function applyHiddenFilter() {
        const minSeconds = getMinVideoSeconds();
        const maxSeconds = getMaxVideoSeconds();
        STATE.hiddenSeconds = minSeconds;
        STATE.maxVideoSeconds = maxSeconds;
        document.querySelectorAll('.video').forEach(vc => {
            const video = vc.querySelector('.video-js video, video');
            if (!video || !video.dataset.length) { vc.classList.remove('eu-hidden-video'); return; }
            const len = parseInt(video.dataset.length, 10);
            if ((minSeconds > 0 && len < minSeconds) || (maxSeconds > 0 && len > maxSeconds)) {
                vc.classList.add('eu-hidden-video');
                vc.title = `Hidden by length filter: ${getLengthFilterLabel()}`;
            } else {
                vc.classList.remove('eu-hidden-video');
                if (vc.title && vc.title.startsWith('Hidden by length filter')) vc.title = '';
            }
        });
    }

    function createHiddenSlider() {
        if (!IS_ALBUM_PAGE) return;
        if (document.querySelector('.eu-hidden-slider')) return;

        const btn = document.createElement('button');
        btn.className = 'eu-hidden-slider';
        btn.dataset.count = String(getMinVideoSeconds() || 0);
        btn.innerHTML = ICONS.clock;
        btn.title = 'Min video length: hide videos shorter than this many seconds';

        btn.addEventListener('mouseenter', () => {
            const n = parseInt(btn.dataset.count);
            btn.innerHTML = n > 0 ? `${n}s` : 'OFF';
        });
        btn.addEventListener('mouseleave', () => { btn.innerHTML = ICONS.clock; });
        btn.addEventListener('click', () => {
            let n = parseInt(btn.dataset.count);
            n = (n + 5) % 105;
            if (n >= 100) n = 0;
            btn.dataset.count = n;
            STATE.hiddenSeconds = n;
            updateSetting('minVideoSeconds', n);
            updateSetting('hiddenSeconds', n);
            btn.innerHTML = n > 0 ? `${n}s` : 'OFF';
            applyHiddenFilter();
            toast(n > 0 ? `Minimum video length: ${n}s` : 'Minimum length filter off', 'info');
        });

        document.body.appendChild(btn);
    }

    /* ============================================================
     *  VIDEO.JS PLAYER CUSTOM CONTROLS
     * ============================================================ */
    const SPEEDS = [0.5, 1, 1.5, 2, 3, 5];

    function enhancePlayers() {
        if (typeof window.videojs === 'undefined') {
            // Wait for video.js to load
            setTimeout(enhancePlayers, 500);
            return;
        }

        document.querySelectorAll('.video-js').forEach(el => {
            if (el.dataset.euEnhanced) return;
            el.dataset.euEnhanced = '1';

            let player;
            try { player = window.videojs(el); }
            catch (e) { return; }

            player.ready(() => {
                const bar = player.controlBar?.el?.();
                if (!bar) return;

                // Speed
                let speedIdx = 1;
                const speedBtn = document.createElement('button');
                speedBtn.className = 'eu-player-btn';
                speedBtn.textContent = '1x';
                speedBtn.title = 'Playback speed';
                speedBtn.onclick = () => {
                    speedIdx = (speedIdx + 1) % SPEEDS.length;
                    player.playbackRate(SPEEDS[speedIdx]);
                    speedBtn.textContent = SPEEDS[speedIdx] + 'x';
                    toast(`Speed: ${SPEEDS[speedIdx]}x`, 'info', 1500);
                };

                // Download
                const dlBtn = document.createElement('button');
                dlBtn.className = 'eu-player-btn';
                dlBtn.innerHTML = ICONS.download;
                dlBtn.title = 'Download video';
                dlBtn.onclick = () => {
                    const src = player.currentSrc();
                    if (src) downloadSingle(src, getFilename(src));
                };

                // Flip
                let flipped = false;
                const flipBtn = document.createElement('button');
                flipBtn.className = 'eu-player-btn';
                flipBtn.innerHTML = ICONS.flip;
                flipBtn.title = 'Flip video';
                flipBtn.onclick = () => {
                    const v = el.querySelector('video');
                    flipped = !flipped;
                    if (v) v.style.transform = flipped ? 'scaleX(-1)' : '';
                    toast('Video flipped', 'info', 1500);
                };

                // Cinema
                const cineBtn = document.createElement('button');
                cineBtn.className = 'eu-player-btn';
                cineBtn.innerHTML = ICONS.cinema;
                cineBtn.title = 'Cinema mode';
                cineBtn.onclick = toggleCinema;

                // PiP
                const pipBtn = document.createElement('button');
                pipBtn.className = 'eu-player-btn';
                pipBtn.innerHTML = ICONS.pip;
                pipBtn.title = 'Picture-in-Picture';
                pipBtn.onclick = async () => {
                    try {
                        const v = el.querySelector('video');
                        if (document.pictureInPictureElement) { await document.exitPictureInPicture(); toast('PiP off', 'info', 1500); }
                        else if (v) { await v.requestPictureInPicture(); toast('PiP on', 'info', 1500); }
                    } catch (e) { toast('PiP not supported', 'error'); }
                };

                bar.appendChild(speedBtn);
                bar.appendChild(dlBtn);
                bar.appendChild(flipBtn);
                bar.appendChild(cineBtn);
                bar.appendChild(pipBtn);
            });
        });
    }

    /* ============================================================
     *  BULK DOWNLOAD MODAL
     * ============================================================ */
    function collectAllMediaUrls() {
        const urls = new Set();

        document.querySelectorAll('.media-group img, img.media, .album-image img').forEach(img => {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
            if (src && !src.includes('thumb') && !src.includes('logo') && !src.includes('avatar')) {
                try { urls.add(new URL(src, location.href).href); } catch (e) {}
            }
        });

        document.querySelectorAll('.media-group video, .video-js video, video, video source').forEach(v => {
            const src = v.src || v.getAttribute('src') || v.currentSrc;
            if (src) { try { urls.add(new URL(src, location.href).href); } catch (e) {} }
        });

        return Array.from(urls);
    }

    function isImageUrl(u) { return /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(u); }
    function isVideoUrl(u) { return /\.(mp4|webm|mov|avi|m3u8)(\?|$)/i.test(u); }

    function getPageTitle() {
        const el = document.querySelector('h1, .album-title');
        let title = el?.textContent?.trim() || document.title || 'Erome_Album';
        return sanitize(title) || 'Erome_Album';
    }

    function generateZipName() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 16);
        return `Erome_${stamp}_${getPageTitle()}.zip`;
    }

    function buildBulkModal() {
        if (document.getElementById('eu-bulk-modal')) return;

        const overlay = document.createElement('div');
        overlay.id = 'eu-bulk-modal';
        overlay.className = 'eu-modal-overlay';
        overlay.innerHTML = `
          <div class="eu-modal">
            <div class="eu-modal-header">
              <h3>${ICONS.download}<span>Bulk Download</span></h3>
              <button class="eu-modal-close">${ICONS.close}</button>
            </div>
            <div class="eu-modal-body">
              <div class="eu-option-group">
                <div class="eu-option-title">Media Type</div>
                <label class="eu-option"><input type="radio" name="eu-type" value="all" checked><span class="eu-radio"></span>All files</label>
                <label class="eu-option"><input type="radio" name="eu-type" value="images"><span class="eu-radio"></span>Images only</label>
                <label class="eu-option"><input type="radio" name="eu-type" value="videos"><span class="eu-radio"></span>Videos only</label>
              </div>
              <div class="eu-option-group">
                <div class="eu-option-title">Output</div>
                <label class="eu-option"><input type="checkbox" id="eu-zip" checked><span class="eu-check"></span>Package as ZIP</label>
                <label class="eu-option"><input type="checkbox" id="eu-zip-folders" ${SETTINGS.zipFolders ? 'checked' : ''}><span class="eu-check"></span>Folder ZIP by album/title</label>
                <label class="eu-option"><input type="checkbox" id="eu-skip-downloaded" ${SETTINGS.skipDownloadedInDownloads ? 'checked' : ''}><span class="eu-check"></span>Skip already downloaded media</label>
                <div class="eu-zip-preview" id="eu-zip-name"></div>
              </div>
              <div class="eu-option-group">
                <div class="eu-option-title">Stats</div>
                <div class="eu-zip-preview" id="eu-stats">Scanning…</div>
              </div>
              <button class="eu-btn-primary" id="eu-start-dl">${ICONS.download}<span>Start Download</span></button>
              <button class="eu-btn-secondary" id="eu-open-dlx" style="margin-top:10px;">Open Smart Download Manager</button>
              <div class="eu-progress-box">
                <div class="eu-progress-bar"><div class="eu-progress-fill" id="eu-progress-fill"></div></div>
                <div class="eu-progress-text" id="eu-progress-text">Ready</div>
              </div>
            </div>
          </div>`;
        document.body.appendChild(overlay);

        overlay.querySelector('.eu-modal-close').onclick = () => overlay.classList.remove('open');
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

        const refreshPreview = () => {
            document.getElementById('eu-zip-name').textContent = generateZipName();
            const urls = collectAllMediaUrls();
            const imgs = urls.filter(isImageUrl).length;
            const vids = urls.filter(isVideoUrl).length;
            document.getElementById('eu-stats').textContent = `Found ${urls.length} items (${imgs} images, ${vids} videos)`;
        };
        overlay.querySelectorAll('input[name="eu-type"]').forEach(r => r.addEventListener('change', refreshPreview));
        document.getElementById('eu-zip').addEventListener('change', refreshPreview);

        document.getElementById('eu-start-dl').onclick = () => bulkDownload(overlay);
        document.getElementById('eu-open-dlx').onclick = () => { overlay.classList.remove('open'); openDownloadManager(); };
        document.getElementById('eu-zip-folders').addEventListener('change', e => updateSetting('zipFolders', e.target.checked));
        document.getElementById('eu-skip-downloaded').addEventListener('change', e => updateSetting('skipDownloadedInDownloads', e.target.checked));

        // Refresh preview whenever opened
        overlay.dataset.refresh = '1';
        overlay.addEventListener('transitionstart', refreshPreview);
        overlay._refreshPreview = refreshPreview;
    }

    function openBulkModal() {
        buildBulkModal();
        const m = document.getElementById('eu-bulk-modal');
        m.classList.add('open');
        m._refreshPreview?.();
    }

    async function bulkDownload(overlay) {
        if (STATE.downloadInProgress) { toast('A download is already running', 'warning'); return; }

        const type = overlay.querySelector('input[name="eu-type"]:checked').value;
        const asZip = overlay.querySelector('#eu-zip').checked;
        const zipFolders = overlay.querySelector('#eu-zip-folders')?.checked ?? SETTINGS.zipFolders;
        const skipDownloaded = overlay.querySelector('#eu-skip-downloaded')?.checked ?? SETTINGS.skipDownloadedInDownloads;
        updateSetting('zipFolders', zipFolders);
        updateSetting('skipDownloadedInDownloads', skipDownloaded);
        const btn = overlay.querySelector('#eu-start-dl');
        const fill = overlay.querySelector('#eu-progress-fill');
        const text = overlay.querySelector('#eu-progress-text');

        let urls = collectAllMediaUrls();
        if (type === 'images') urls = urls.filter(isImageUrl);
        if (type === 'videos') urls = urls.filter(isVideoUrl);
        if (skipDownloaded) urls = urls.filter(u => !TRACKING.downloadedMedia.has(normalizeUrl(u)));

        if (urls.length === 0) { toast('No media found', 'error'); return; }

        STATE.downloadInProgress = true;
        btn.disabled = true;
        btn.innerHTML = `<span class="eu-spinner"></span><span>Working…</span>`;
        fill.style.width = '0%';
        text.textContent = `0 / ${urls.length}`;

        try {
            if (asZip && typeof JSZip !== 'undefined') {
                const zip = new JSZip();
                let ok = 0;
                for (let i = 0; i < urls.length; i++) {
                    const url = urls[i];
                    const baseName = `${String(i + 1).padStart(3, '0')}_${getFilename(url)}`;
                    const name = zipFolders ? `${getPageTitle()}/${baseName}` : baseName;
                    text.textContent = `Downloading ${i + 1}/${urls.length}: ${baseName.substring(0, 30)}`;
                    fill.style.width = `${(i / urls.length) * 100}%`;
                    try {
                        const blob = await downloadBlobWithRetry(url, SETTINGS.retryDownloads ? 2 : 1);
                        zip.file(name, await blob.arrayBuffer());
                        markDownloadedMedia(url, currentAlbumUrl());
                        ok++;
                    } catch (e) {
                        zip.file(`ERROR_${i + 1}.txt`, `URL: ${url}\nError: ${e}`);
                    }
                }
                text.textContent = 'Generating ZIP…';
                const zipBlob = await zip.generateAsync(
                    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
                    meta => { text.textContent = `Compressing: ${Math.round(meta.percent)}%`; fill.style.width = `${meta.percent}%`; }
                );
                if (typeof saveAs === 'function') saveAs(zipBlob, generateZipName());
                else {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(zipBlob);
                    a.download = generateZipName();
                    a.click();
                }
                fill.style.width = '100%';
                text.textContent = `Complete (${ok}/${urls.length})`;
                toast(`ZIP saved: ${ok}/${urls.length} files`, 'success');
            } else {
                let ok = 0;
                for (let i = 0; i < urls.length; i++) {
                    const url = urls[i];
                    const name = `${String(i + 1).padStart(3, '0')}_${getFilename(url)}`;
                    text.textContent = `Downloading ${i + 1}/${urls.length}`;
                    fill.style.width = `${(i / urls.length) * 100}%`;
                    try {
                        const blob = await downloadBlobWithRetry(url, SETTINGS.retryDownloads ? 2 : 1);
                        const u = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = u; a.download = name; a.style.display = 'none';
                        document.body.appendChild(a); a.click(); a.remove();
                        setTimeout(() => URL.revokeObjectURL(u), 5000);
                        markDownloadedMedia(url, currentAlbumUrl());
                        ok++;
                        await new Promise(r => setTimeout(r, SETTINGS.performanceMode === 'aggressive' ? 150 : 400));
                    } catch (e) { console.error(e); }
                }
                fill.style.width = '100%';
                text.textContent = `Complete (${ok}/${urls.length})`;
                decorateTrackingBadges();
                toast(`Downloaded ${ok}/${urls.length} files`, 'success');
            }
        } catch (err) {
            console.error(err);
            toast('Bulk download error', 'error');
        } finally {
            STATE.downloadInProgress = false;
            btn.disabled = false;
            btn.innerHTML = `${ICONS.download}<span>Start Download</span>`;
        }
    }

    /* ============================================================
     *  TIKTOK-STYLE VERTICAL SCROLL MODE — Phone-proportioned
     * ============================================================ */
    GM_addStyle(`
    .eu-tiktok-overlay {
        position: fixed; inset: 0;
        background: radial-gradient(circle at 50% 30%, #1a1a2e 0%, #000 70%);
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        animation: eu-fade-in .3s ease;
    }
    .eu-tiktok-overlay.open { display: flex; }

    /* TikTok layout - simple phone centered */

    /* Phone-shaped container (9:16 aspect ratio, like a real phone) */
    .eu-phone {
        position: relative;
        width: min(420px, 92vw);
        height: min(calc(420px * 16 / 9), 94vh);
        aspect-ratio: 9 / 16;
        background: #000;
        border-radius: 28px;
        overflow: hidden;
        box-shadow:
            0 0 0 8px #111,
            0 0 0 9px #2a2a2a,
            0 30px 80px rgba(138, 90, 204, .25),
            0 60px 120px rgba(0, 0, 0, .7);
        display: flex;
        flex-direction: column;
    }
    /* Phone notch */
    .eu-phone::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 110px;
        height: 22px;
        background: #0a0a0a;
        border-radius: 14px;
        z-index: 100;
    }
    @media (max-width: 520px) {
        .eu-phone {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            box-shadow: none;
            aspect-ratio: auto;
        }
        .eu-phone::before { display: none; }
    }

    /* Desktop Feed layout: same one-card scroll as mobile, but wide/fullscreen. */
    .eu-tiktok-overlay.eu-desktop-mode {
        align-items: stretch;
        justify-content: center;
        padding: 16px;
        background: radial-gradient(circle at 50% 20%, #24213a 0%, #090910 72%);
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-phone {
        width: min(1280px, calc(100vw - 32px));
        height: calc(100vh - 32px);
        aspect-ratio: auto;
        border-radius: 18px;
        box-shadow:
            0 0 0 1px rgba(138,90,204,.35),
            0 24px 90px rgba(0,0,0,.75),
            0 0 70px rgba(138,90,204,.22);
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-phone::before { display: none; }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-topbar {
        height: 74px;
        padding-top: 18px;
        padding-left: 24px;
        padding-right: 24px;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-title { font-size: 16px; }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-counter {
        top: 82px;
        left: 24px;
        font-size: 12px;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-item,
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-feed {
        height: 100%;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-media,
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-item video,
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-item img {
        object-fit: contain;
        background: #000;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-sidebar {
        right: 24px;
        bottom: 34px;
        gap: 12px;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-caption {
        left: 24px;
        right: 120px;
        bottom: 30px;
        margin-left: -24px;
        margin-right: -120px;
        padding-left: 24px;
        padding-right: 120px;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-caption .eu-tiktok-desc {
        font-size: 13px;
        max-width: 760px;
    }
    .eu-tiktok-overlay.eu-desktop-mode .eu-tiktok-duration-live {
        left: 24px;
        bottom: 96px;
    }
    .eu-tiktok-layout-toggle {
        background: rgba(138,90,204,.45);
        color: #fff;
        border: 1px solid rgba(255,255,255,.18);
        padding: 5px 10px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        backdrop-filter: blur(6px);
        transition: all .2s ease;
    }
    .eu-tiktok-layout-toggle:hover { background: rgba(138,90,204,.75); }

    .eu-tiktok-topbar {
        position: absolute;
        top: 0; left: 0; right: 0;
        padding-top: 36px;
        height: 86px;
        background: linear-gradient(180deg, rgba(0,0,0,.9), transparent);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding-left: 14px;
        padding-right: 14px;
        z-index: 20;
        pointer-events: none;
    }
    .eu-tiktok-topbar > * { pointer-events: auto; }
    .eu-tiktok-title {
        color: #fff;
        font-weight: 700;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .eu-tiktok-title span {
        border-bottom: 2px solid ${CONFIG.accent};
        padding-bottom: 2px;
    }
    .eu-tiktok-title svg { width: 16px; height: 16px; fill: #fff; }
    .eu-tiktok-brand-logo {
        height: 22px; width: auto;
        filter: drop-shadow(0 0 6px rgba(138,90,204,0.7));
        border-radius: 4px;
    }

    /* === Splash screen (shown when TikTok mode opens) === */
    .eu-tiktok-splash {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        background: linear-gradient(135deg, #0e0f17 0%, #14151f 50%, #2a1f3d 100%);
        z-index: 100;
        gap: 18px;
        animation: eu-splash-fade 1.8s ease forwards;
        animation-delay: 0.8s;
        pointer-events: none;
    }
    .eu-tiktok-splash-logo {
        max-width: 76%; width: 360px; height: auto;
        filter: drop-shadow(0 0 40px rgba(138,90,204,0.7));
        animation: eu-splash-pop .7s cubic-bezier(.2,.9,.3,1.2);
    }
    .eu-tiktok-splash-tag {
        color: #b39ad6; font-size: 13px; font-weight: 700;
        letter-spacing: 4px; text-transform: uppercase;
        animation: eu-splash-pop .9s cubic-bezier(.2,.9,.3,1.2);
    }
    .eu-tiktok-splash-dots {
        display: flex; gap: 8px;
    }
    .eu-tiktok-splash-dots span {
        width: 8px; height: 8px; border-radius: 50%;
        background: #8a5acc;
        animation: eu-splash-dot 1.2s ease-in-out infinite;
    }
    .eu-tiktok-splash-dots span:nth-child(2) { animation-delay: .2s; }
    .eu-tiktok-splash-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes eu-splash-pop {
        0% { opacity: 0; transform: scale(.6); }
        100% { opacity: 1; transform: scale(1); }
    }
    @keyframes eu-splash-dot {
        0%, 100% { opacity: 0.3; transform: translateY(0); }
        50%      { opacity: 1;   transform: translateY(-6px); }
    }
    @keyframes eu-splash-fade {
        0%   { opacity: 1; }
        85%  { opacity: 1; }
        100% { opacity: 0; visibility: hidden; pointer-events: none; }
    }
    .eu-tiktok-controls {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
    }
    .eu-tiktok-tab {
        background: rgba(255,255,255,.12);
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all .2s ease;
        backdrop-filter: blur(6px);
    }
    .eu-tiktok-tab:hover { background: rgba(255,255,255,.22); }
    .eu-tiktok-tab.active {
        background: ${CONFIG.accent};
        box-shadow: 0 0 12px rgba(138,90,204,.6);
    }
    .eu-tiktok-close {
        background: rgba(0,0,0,.65);
        color: #fff;
        border: none;
        width: 32px; height: 32px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .2s ease;
        backdrop-filter: blur(6px);
    }
    .eu-tiktok-close:hover { background: rgba(255,255,255,.2); }
    .eu-tiktok-close svg { width: 16px; height: 16px; fill: #fff; }

    .eu-tiktok-feed {
        flex: 1;
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
    }
    .eu-tiktok-feed::-webkit-scrollbar { display: none; }

    .eu-tiktok-item {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100%;
        scroll-snap-align: start;
        scroll-snap-stop: always;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
        overflow: hidden;
    }
    .eu-tiktok-media,
    .eu-tiktok-item video,
    .eu-tiktok-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-width: 100%;
        max-height: 100%;
        background: #000;
        display: block;
    }
    .eu-tiktok-item::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        box-shadow: inset 0 -140px 160px -40px rgba(0,0,0,.55), inset 0 70px 80px -40px rgba(0,0,0,.35);
    }

    /* Right sidebar — TikTok style */
    .eu-tiktok-sidebar {
        position: absolute;
        right: 10px;
        bottom: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        z-index: 5;
        max-height: calc(100% - 48px);
    }
    .eu-tiktok-user-link {
        color: #fff !important;
        text-decoration: none;
    }
    .eu-tiktok-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        color: #fff;
        cursor: pointer;
        transition: transform .15s ease;
    }
    .eu-tiktok-action:hover { transform: scale(1.12); }
    .eu-tiktok-action:active { transform: scale(.92); }
    .eu-tiktok-action .eu-tiktok-icon {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(0,0,0,.55);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255,255,255,.12);
        transition: all .2s ease;
    }
    .eu-tiktok-action .eu-tiktok-icon svg { width: 20px; height: 20px; fill: #fff; }
    .eu-tiktok-action.liked .eu-tiktok-icon { background: #ef4444; animation: eu-pulse .35s ease; }
    .eu-tiktok-action .eu-tiktok-lbl {
        font-size: 10px;
        font-weight: 700;
        text-shadow: 0 0 6px rgba(0,0,0,.95);
    }

    /* Bottom caption */
    .eu-tiktok-caption {
        position: absolute;
        left: 14px;
        right: 80px;
        bottom: 22px;
        color: #fff;
        z-index: 4;
        padding-bottom: 12px;
        background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
        padding-top: 40px; padding-left: 0; padding-right: 0;
        margin-left: -14px; margin-right: -80px;
        padding-left: 14px; padding-right: 80px;
    }
    .eu-tiktok-caption .eu-tiktok-user {
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 4px;
        text-shadow: 0 0 8px rgba(0,0,0,.95);
    }
    .eu-tiktok-caption .eu-tiktok-desc {
        font-size: 12px;
        line-height: 1.35;
        opacity: .92;
        text-shadow: 0 0 8px rgba(0,0,0,.95);
        max-height: 54px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
    }
    .eu-tiktok-caption .eu-tiktok-album {
        display: inline-block;
        margin-top: 6px;
        font-size: 11px;
        padding: 3px 8px;
        background: rgba(138,90,204,.4);
        border-radius: 8px;
        backdrop-filter: blur(6px);
        color: #fff;
    }

    .eu-tiktok-counter {
        position: absolute;
        top: 95px;
        left: 14px;
        background: rgba(0,0,0,.55);
        color: #fff;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
        z-index: 5;
        backdrop-filter: blur(6px);
    }

    .eu-tiktok-play-hint {
        position: absolute;
        width: 64px; height: 64px;
        background: rgba(0,0,0,.65);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity .2s ease;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
    }
    .eu-tiktok-play-hint.show { opacity: 1; }
    .eu-tiktok-play-hint svg { width: 32px; height: 32px; fill: #fff; }

    /* Video progress bar (at top of item) */
    .eu-tiktok-progress {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 3px;
        background: rgba(255,255,255,.12);
        z-index: 6;
    }
    .eu-tiktok-progress-fill {
        height: 100%;
        background: #fff;
        width: 0;
        transition: width .1s linear;
    }

    /* === Erome-native buttons === */
    .eu-tiktok-top {
        position: absolute; top: 14px; left: 14px; right: 70px;
        display: flex; align-items: center; gap: 8px;
        z-index: 10; pointer-events: none;
    }
    .eu-tiktok-views, .eu-tiktok-kind-pill {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgba(0,0,0,0.55); backdrop-filter: blur(8px);
        color: #fff; font-size: 11px; font-weight: 600;
        padding: 5px 10px; border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
    }
    .eu-tiktok-views svg, .eu-tiktok-kind-pill svg { width: 12px; height: 12px; fill: #fff; }
    .eu-tiktok-duration-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 0, 80, 0.85);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(6px);
        font-family: 'Courier New', monospace;
    }
    .eu-tiktok-duration-live {
        position: absolute;
        bottom: 80px;
        left: 14px;
        background: rgba(0, 0, 0, 0.85);
        color: #fff;
        padding: 5px 11px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Courier New', monospace;
        z-index: 6;
        border: 1px solid rgba(255, 255, 255, 0.15);
        pointer-events: none;
    }

    /* Avatar button (profile + follow plus sign) */
    .eu-tiktok-avatar {
        position: relative; width: 52px; height: 52px;
        border-radius: 50%; overflow: visible;
        border: 2px solid #fff; margin-bottom: 6px;
        display: block; flex-shrink: 0;
        transition: transform .2s ease;
    }
    .eu-tiktok-avatar:hover { transform: scale(1.08); }
    .eu-tiktok-avatar img {
        width: 100%; height: 100%; border-radius: 50%;
        object-fit: cover; background: #8a5acc;
        display: block;
    }
    .eu-tiktok-avatar-plus {
        position: absolute; bottom: -7px; left: 50%;
        transform: translateX(-50%);
        width: 20px; height: 20px; border-radius: 50%;
        background: #ff0050; color: #fff;
        font-size: 14px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        line-height: 1; border: 2px solid transparent;
    }

    /* Action button tweaks for Erome-native look */
    .eu-tiktok-action.faved .eu-tiktok-icon { background: #f59e0b; animation: eu-pulse .35s ease; }
    .eu-tiktok-action.faved .eu-tiktok-icon svg { fill: #fff; }
    .eu-tiktok-action-mini .eu-tiktok-icon {
        width: 36px !important; height: 36px !important;
        background: rgba(0,0,0,.55) !important;
    }
    .eu-tiktok-action-mini .eu-tiktok-icon svg { width: 16px !important; height: 16px !important; }
    .eu-tiktok-count {
        font-variant-numeric: tabular-nums;
        min-width: 20px; text-align: center;
    }

    /* Spinning music disc (TikTok-style) */
    .eu-tiktok-disc {
        width: 48px; height: 48px; border-radius: 50%;
        overflow: hidden; border: 6px solid #111;
        background: #000; flex-shrink: 0;
        animation: eu-spin 6s linear infinite;
        box-shadow: 0 2px 10px rgba(0,0,0,0.6);
        margin-top: 4px;
    }
    .eu-tiktok-disc img { width: 100%; height: 100%; object-fit: cover; }
    @keyframes eu-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* Bottom-left scrolling ticker (music row) */
    .eu-tiktok-ticker {
        display: flex; align-items: center; gap: 6px;
        color: #fff; font-size: 12px; opacity: .85;
        margin-top: 6px;
        white-space: nowrap; overflow: hidden;
    }
    .eu-tiktok-ticker svg { width: 13px; height: 13px; fill: #fff; flex-shrink: 0; }
    .eu-tiktok-ticker span {
        display: inline-block; animation: eu-ticker 12s linear infinite;
        padding-left: 0;
    }
    @keyframes eu-ticker {
        0%   { transform: translateX(0); }
        50%  { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    }

    /* "View Album on Erome" button — more prominent */
    .eu-tiktok-caption .eu-tiktok-album {
        display: inline-flex !important; align-items: center; gap: 6px;
        margin-top: 6px;
        background: rgba(138, 90, 204, 0.25);
        border: 1px solid rgba(138, 90, 204, 0.5);
        padding: 6px 12px; border-radius: 20px;
        font-size: 12px; font-weight: 600;
        text-decoration: none; color: #fff !important;
        transition: all .2s ease;
    }
    .eu-tiktok-caption .eu-tiktok-album:hover {
        background: rgba(138, 90, 204, 0.5);
        transform: translateY(-1px);
    }
    .eu-tiktok-caption .eu-tiktok-album svg { width: 12px; height: 12px; fill: #fff; }

    /* Loading spinner */
    .eu-tiktok-loading {
        color: #fff;
        text-align: center;
        padding: 24px;
        font-size: 13px;
        opacity: .7;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    .eu-tiktok-empty {
        color: #aaa;
        font-size: 13px;
        text-align: center;
        padding: 40px 20px;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    /* Phone hint */
    .eu-tiktok-hint {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,.5);
        font-size: 11px;
        text-align: center;
        z-index: 2;
        pointer-events: none;
        animation: eu-hint-bounce 2s ease infinite;
    }
    @keyframes eu-hint-bounce {
        0%, 100% { transform: translate(-50%, 0); opacity: .5; }
        50% { transform: translate(-50%, -6px); opacity: 1; }
    }

    /* Double-tap heart animation */
    .eu-tiktok-heart-pop {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: 120px;
        pointer-events: none;
        opacity: 0;
        z-index: 50;
    }
    .eu-tiktok-heart-pop.animate {
        animation: eu-heart-pop .8s ease;
    }
    @keyframes eu-heart-pop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        70% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    `);


    GM_addStyle(`
    /* ---------- Smart Premium v7.3 additions ---------- */
    .eu-tracking-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .2px;
        background: rgba(0,0,0,.84);
        color: #fff;
        border: 1px solid rgba(255,255,255,.12);
        z-index: 18;
        backdrop-filter: blur(8px);
        pointer-events: none;
    }
    .eu-tracking-badge.eu-downloaded { bottom: 34px; color: #d1fae5; border-color: rgba(74,222,128,.45); }
    .eu-track-filtered-out, .eu-search-filtered-out { display: none !important; }
    .eu-smart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .eu-smart-row.full { grid-template-columns: 1fr; }
    .eu-smart-field label { display: block; color: ${CONFIG.accentSoft}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 6px; }
    .eu-smart-field select, .eu-smart-field input[type="number"], .eu-smart-field input[type="text"] {
        width: 100%; padding: 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,.1);
        background: ${CONFIG.darker}; color: #fff; outline: none;
    }
    .eu-smart-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin-top: 6px; }
    .eu-smart-check { display: flex; align-items: center; gap: 8px; color: #eee; font-size: 13px; cursor: pointer; user-select: none; }
    .eu-smart-check input { accent-color: ${CONFIG.accent}; }
    .eu-smart-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .eu-btn-secondary {
        width: 100%; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12);
        background: ${CONFIG.darker}; color: #fff; cursor: pointer; font-weight: 800;
    }
    .eu-btn-secondary:hover { border-color: ${CONFIG.accent}; box-shadow: 0 0 15px rgba(138,90,204,.25); }
    .eu-status-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .eu-status-card { background: ${CONFIG.darker}; border-radius: 12px; padding: 12px; border: 1px solid rgba(255,255,255,.08); }
    .eu-status-card b { display: block; font-size: 20px; color: #fff; margin-bottom: 2px; }
    .eu-status-card span { color: ${CONFIG.accentSoft}; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .eu-feed-tools {
        position: absolute; top: 58px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 7px; z-index: 35; flex-wrap: wrap; justify-content: center;
        width: min(760px, calc(100vw - 24px)); pointer-events: none;
        opacity: 1; visibility: visible;
        transition: opacity .22s ease, transform .22s ease, visibility .22s ease;
    }
    .eu-feed-tools button, .eu-feed-tools .eu-feed-chip {
        pointer-events: auto; border: 1px solid rgba(255,255,255,.12); color: #fff;
        background: rgba(20,21,31,.72); backdrop-filter: blur(10px); border-radius: 999px;
        font-size: 11px; font-weight: 800; padding: 7px 10px; cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,.28);
    }
    .eu-feed-tools button:hover { border-color: ${CONFIG.accent}; background: rgba(138,90,204,.35); }
    .eu-feed-tools button.eu-active { border-color: ${CONFIG.accent}; background: rgba(138,90,204,.42); box-shadow: 0 0 18px rgba(138,90,204,.32); }
    .eu-feed-status {
        position: absolute; top: 98px; left: 50%; transform: translateX(-50%);
        color: ${CONFIG.accentSoft}; font-size: 11px; font-weight: 800; z-index: 34;
        background: rgba(0,0,0,.48); border: 1px solid rgba(255,255,255,.08); border-radius: 999px;
        padding: 5px 10px; backdrop-filter: blur(10px); pointer-events: none;
        opacity: 1; visibility: visible;
        transition: opacity .22s ease, transform .22s ease, visibility .22s ease;
    }
    .eu-tiktok-topbar,
    .eu-tiktok-tab,
    .eu-tiktok-layout-toggle,
    .eu-tiktok-title span,
    .eu-tiktok-close {
        transition: opacity .22s ease, transform .22s ease, background .22s ease, visibility .22s ease;
    }
    .eu-phone.eu-feed-controls-hidden .eu-feed-tools,
    .eu-phone.eu-feed-controls-hidden .eu-feed-status {
        opacity: 0; visibility: hidden; pointer-events: none;
        transform: translate(-50%, -12px);
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-tab,
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-layout-toggle {
        opacity: 0; visibility: hidden; pointer-events: none;
        transform: translateY(-10px);
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-title span {
        opacity: 0; visibility: hidden; transform: translateY(-6px);
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-brand-logo {
        opacity: .95;
        box-shadow: 0 0 16px rgba(138,90,204,.45);
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-topbar {
        background: linear-gradient(180deg, rgba(0,0,0,.24), transparent);
        pointer-events: none;
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-close,
    .eu-phone.eu-feed-controls-hidden .eu-feed-tools-toggle {
        visibility: visible; pointer-events: auto;
    }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-close { opacity: .72; }
    .eu-phone.eu-feed-controls-hidden .eu-tiktok-close:hover { opacity: 1; }
    .eu-feed-tools-toggle {
        position: absolute; top: 104px; right: 14px; z-index: 36;
        display: inline-flex; align-items: center; gap: 7px;
        height: 34px; padding: 5px 10px 5px 6px;
        border-radius: 999px; border: 1px solid rgba(255,255,255,.14);
        color: #fff; background: rgba(20,21,31,.72); backdrop-filter: blur(12px);
        box-shadow: 0 8px 26px rgba(0,0,0,.32), 0 0 20px rgba(138,90,204,.18);
        font-size: 11px; font-weight: 900; cursor: pointer;
        opacity: .72; transition: opacity .2s ease, transform .2s ease, background .2s ease;
    }
    .eu-feed-tools-toggle:hover { opacity: 1; transform: scale(1.04); background: rgba(138,90,204,.36); }
    .eu-feed-tools-toggle img { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; box-shadow: 0 0 10px rgba(138,90,204,.55); }
    .eu-feed-tools-toggle span { max-width: 48px; overflow: hidden; transition: max-width .18s ease, opacity .18s ease; }
    .eu-phone.eu-feed-controls-hidden .eu-feed-tools-toggle span { max-width: 0; opacity: 0; }
    .eu-phone.eu-feed-controls-hidden .eu-feed-tools-toggle:hover span { max-width: 48px; opacity: 1; }
    .eu-phone:not(.eu-feed-controls-hidden) .eu-feed-tools-toggle { opacity: .46; }
    .eu-desktop-mode .eu-feed-tools { top: 68px; }
    .eu-desktop-mode .eu-feed-status { top: 108px; }
    .eu-desktop-mode .eu-feed-tools-toggle { top: 118px; right: 24px; }
    .eu-fit-contain .eu-tiktok-media { object-fit: contain !important; }
    .eu-fit-cover .eu-tiktok-media { object-fit: cover !important; }
    .eu-fit-natural .eu-tiktok-media { object-fit: scale-down !important; max-width: 100%; max-height: 100%; }
    .eu-feed-badge {
        position: absolute; left: 18px; top: 88px; z-index: 12; border-radius: 999px;
        background: rgba(0,0,0,.58); color: #fff; border: 1px solid rgba(255,255,255,.12);
        padding: 5px 9px; font-size: 11px; font-weight: 900; backdrop-filter: blur(8px);
    }
    .eu-feed-badge.eu-feed-downloaded { top: 118px; color: #d1fae5; border-color: rgba(74,222,128,.45); }
    .eu-dlx-log {
        max-height: 160px; overflow: auto; margin-top: 12px; padding: 10px; background: ${CONFIG.darker};
        color: #ddd; border-radius: 10px; font: 11px/1.45 monospace; white-space: pre-wrap;
    }
    `);

    /* --- TikTok State --- */
    const TT = {
        items: [],          // All collected media items (flattened)
        seenUrls: new Set(), // Dedupe set
        albumQueue: [],     // Album URLs queued for preload
        albumSeen: new Set(), // Already preloaded album URLs
        loadingMore: false,
        listingNextPage: 2,  // Listing pages queued in the background for desktop feed
        listingLoading: false,
        listingStopped: false,
        listingEmptyHits: 0,
        listingSeenPages: new Set(),
        feedScopeMode: 'album',
        feedScopeLabel: '',
        feedScopeUrl: '',
        feedScopeTerms: [],
        io: null,           // IntersectionObserver
        currentAlbum: null
    };

    function extractMediaFromDoc(doc, type, albumMeta = {}) {
        const results = [];
        const add = (kind, url) => {
            if (!url || TT.seenUrls.has(url)) return;
            if (url.includes('thumb') || url.includes('avatar') || url.includes('logo')) return;
            TT.seenUrls.add(url);
            results.push({ kind, url, ...albumMeta });
        };

        if (type === 'videos' || type === 'all') {
            const addVideoSrc = (src) => {
                if (!src) return;
                src = String(src).trim().replace(/\\\//g, '/');
                if (src.startsWith('//')) src = 'https:' + src;
                if (/\.(mp4|webm|m3u8)(?:[?#]|$)/i.test(src)) add('video', src);
            };
            doc.querySelectorAll('.media-group video, .video-js video, video').forEach(v => {
                addVideoSrc(v.currentSrc || v.querySelector('source')?.src || v.src || v.getAttribute('src') || v.getAttribute('data-src') || v.dataset?.src);
            });
            doc.querySelectorAll('.media-group source, video source, source').forEach(s => {
                addVideoSrc(s.src || s.getAttribute('src') || s.getAttribute('data-src') || s.dataset?.src);
            });
            doc.querySelectorAll('a[href]').forEach(a => addVideoSrc(a.getAttribute('href')));
            const html = doc.documentElement?.innerHTML || '';
            html.match(/https?:\/\/[^"'<>\\\s]+?\.(?:mp4|webm|m3u8)(?:\?[^"'<>\\\s]*)?/gi)?.forEach(addVideoSrc);
        }

        if (type === 'photos' || type === 'all') {
            doc.querySelectorAll('.media-group img, .album-image img, img.img-front').forEach(img => {
                const src = img.src || img.getAttribute('data-src') || img.getAttribute('src');
                if (src) add('image', src.startsWith('//') ? 'https:' + src : src);
            });
        }

        return results;
    }

    function getAlbumMetaFromDoc(doc, fallbackUrl) {
        const userEl = doc.getElementById('user_name') || doc.querySelector('.username');
        const titleEl = doc.querySelector('.page-content h1, h1');

        // Try to pull like/favorite/view counts from Erome's native DOM
        const grabCount = (selector) => {
            const el = doc.querySelector(selector);
            if (!el) return '';
            const m = (el.textContent || '').match(/[\d,.]+[kKmM]?/);
            return m ? m[0] : '';
        };

        return {
            username: userEl?.textContent?.replace(/\s+/g, ' ').trim() || 'Erome',
            title: titleEl?.textContent?.trim() || 'Album',
            albumUrl: fallbackUrl || location.href,
            likeCount: grabCount('#like_count') || grabCount('.likes-count') || grabCount('.fa-heart + span') || '',
            favCount: grabCount('#favorites_count') || grabCount('.favorites-count') || grabCount('.fa-star + span') || '',
            viewCount: grabCount('#views_count') || grabCount('.views-count') || grabCount('.fa-eye + span') || ''
        };
    }

    function collectCurrentPageItems(type) {
        TT.seenUrls = new Set();
        // Listing/profile/search pages mostly contain thumbnails. For feed mode we fetch
        // the real album pages in the background instead of showing low-res thumbs.
        if (!IS_ALBUM_PAGE) {
            TT.currentAlbum = null;
            return [];
        }
        const meta = getAlbumMetaFromDoc(document, location.href);
        TT.currentAlbum = meta;
        return extractMediaFromDoc(document, type, meta);
    }

    function euCleanFeedUrl(href, baseUrl = location.href) {
        try {
            const u = new URL(href, baseUrl);
            u.hash = '';
            return u.href;
        } catch (e) { return ''; }
    }

    function normalizeFeedTerms(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/[^a-z0-9]+/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 3 && !['www', 'com', 'the', 'and', 'for', 'with', 'from', 'erome', 'page', 'search'].includes(w))
            .slice(0, 8);
    }

    function getFeedSearchPhrase() {
        try {
            const url = new URL(location.href);
            for (const key of ['q', 'query', 'search', 'term', 'keyword', 'keywords', 's']) {
                const val = url.searchParams.get(key);
                if (val && val.trim()) return val.trim();
            }
        } catch (e) {}

        const searchInput = document.querySelector('input[type="search"], input[name="q"], input[name="search"], input[name="query"]');
        if (searchInput?.value?.trim()) return searchInput.value.trim();

        const heading = document.querySelector('.page-content h1, h1, .search-title, .page-title');
        const h = heading?.textContent?.replace(/\s+/g, ' ').trim() || '';
        const m = h.match(/(?:search|results?)\s*(?:for)?\s*[:\-]?\s*(.+)$/i);
        return (m?.[1] || '').trim();
    }

    function resetFeedScope() {
        TT.feedScopeUrl = normalizeUrl(location.href);
        TT.feedScopeMode = IS_ALBUM_PAGE ? 'album' : 'listing';
        TT.feedScopeTerms = normalizeFeedTerms(getFeedSearchPhrase());
        if (IS_ALBUM_PAGE) {
            TT.feedScopeLabel = SETTINGS.allowRelatedAlbumExpansion !== false ? 'Album + related' : 'Current album only';
        } else if (TT.feedScopeTerms.length) {
            TT.feedScopeLabel = `Search lock: ${TT.feedScopeTerms.join(' ')}`;
        } else {
            TT.feedScopeLabel = SETTINGS.lockFeedToSearch !== false ? 'Search/listing lock' : 'Related expansion on';
        }
    }

    function albumCardMatchesFeedScope(album, href) {
        if (!album) return true;
        const text = `${album.textContent || ''} ${href || ''}`.toLowerCase();
        const q = (SETTINGS.albumSearch || '').trim().toLowerCase();
        if (q && !text.includes(q)) return false;
        if (SETTINGS.strictSearchTitleMatch && TT.feedScopeTerms?.length) {
            return TT.feedScopeTerms.some(term => text.includes(term));
        }
        if (album.classList?.contains('eu-search-filtered-out') || album.classList?.contains('eu-track-filtered-out')) return false;
        return true;
    }

    function collectAlbumLinksFromResultDoc(doc = document, baseUrl = location.href, source = 'listing') {
        const out = [];
        const localSeen = new Set();

        // For searches/listings, only trust actual album result cards. This prevents the
        // feed from drifting into related/suggested album links found inside fetched albums.
        let albumCards = Array.from(doc.querySelectorAll('#albums .album'));
        if (!albumCards.length) {
            albumCards = Array.from(doc.querySelectorAll('.page-content .album, .albums .album, .user-albums .album'));
        }

        if (albumCards.length) {
            albumCards.forEach(album => {
                const a = album.querySelector('a.album-link[href*="/a/"], a[href*="/a/"]');
                const href = a?.getAttribute('href');
                if (!href || !/\/a\//.test(href)) return;
                const abs = euCleanFeedUrl(href, baseUrl);
                if (!abs || localSeen.has(abs)) return;
                if (!albumCardMatchesFeedScope(album, abs)) return;
                localSeen.add(abs);
                out.push(abs);
            });
            // Listing/search pages should only use result cards. Album pages can still
            // fall back to older related-album links if the related section is not
            // built from .album cards.
            if (out.length || source !== 'album') return out;
        }

        // Album-page fallback: restore the old next-album behavior. This is never
        // used for locked search/listing feeds because buildNextAlbumQueue() blocks
        // source='album' there.
        if (source === 'album' && (SETTINGS.allowRelatedAlbumExpansion !== false || SETTINGS.lockFeedToSearch === false)) {
            doc.querySelectorAll('a.album-link[href*="/a/"], .album a[href*="/a/"], a[href*="/a/"]').forEach(a => {
                const abs = euCleanFeedUrl(a.getAttribute('href'), baseUrl);
                if (abs && !localSeen.has(abs)) { localSeen.add(abs); out.push(abs); }
            });
        }
        return out;
    }

    function buildNextAlbumQueue(doc = document, baseUrl = location.href, source = 'listing') {
        const lockedListing = !IS_ALBUM_PAGE && SETTINGS.lockFeedToSearch !== false;
        const albumRelatedDisabled = IS_ALBUM_PAGE && SETTINGS.allowRelatedAlbumExpansion === false;

        if (lockedListing && source === 'album') {
            console.log('[EU] Feed search lock: skipped related album links from fetched album');
            return 0;
        }
        if (albumRelatedDisabled && source === 'album') {
            console.log('[EU] Feed scope: album page related expansion is disabled');
            return 0;
        }

        const links = new Set(TT.albumQueue);
        const before = links.size;
        const currentAbs = euCleanFeedUrl(location.href, location.href);

        collectAlbumLinksFromResultDoc(doc, baseUrl, source).forEach(abs => {
            if (abs === currentAbs) return;
            if (TT.albumSeen.has(abs)) return;
            links.add(abs);
        });

        TT.albumQueue = Array.from(links);
        const added = Math.max(0, TT.albumQueue.length - before);
        const mode = lockedListing ? 'search/listing result' : 'related/expanded';
        console.log(`[EU] Feed queue: ${TT.albumQueue.length} ${mode} albums ready (${added} new)`);
        updateFeedStatus();
        return added;
    }

    function resetListingFeedPager() {
        const url = new URL(window.location.href);
        const currentPage = parseInt(url.searchParams.get('page'), 10) || 1;
        TT.listingNextPage = currentPage + 1;
        TT.listingLoading = false;
        TT.listingStopped = false;
        TT.listingEmptyHits = 0;
        TT.listingSeenPages = new Set();
    }

    async function loadNextListingPageIntoQueue() {
        if (IS_ALBUM_PAGE || TT.listingLoading || TT.listingStopped) return 0;

        const url = new URL(window.location.href);
        url.searchParams.set('page', TT.listingNextPage);
        const pageUrl = url.href;
        if (TT.listingSeenPages?.has(pageUrl)) {
            TT.listingNextPage++;
            return 0;
        }

        TT.listingLoading = true;
        TT.listingSeenPages?.add(pageUrl);

        try {
            const res = await fetch(pageUrl, { credentials: 'include' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const before = TT.albumQueue.length;
            buildNextAlbumQueue(doc, pageUrl, 'listing');
            TT.listingNextPage++;

            const added = Math.max(0, TT.albumQueue.length - before);
            if (added === 0) TT.listingEmptyHits++;
            else TT.listingEmptyHits = 0;

            if (TT.listingEmptyHits >= 2) TT.listingStopped = true;
            console.log(`[EU] Desktop feed queued ${added} albums from listing page ${TT.listingNextPage - 1}`);
            return added;
        } catch (e) {
            TT.listingStopped = true;
            console.warn('[EU] Desktop feed listing queue stopped:', e);
            return 0;
        } finally {
            TT.listingLoading = false;
        }
    }

    async function fetchAlbumPage(url) {
        try {
            const res = await fetch(url, { credentials: 'include' });
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc;
        } catch (e) {
            console.warn('[EU] Failed to preload album:', url, e);
            return null;
        }
    }

    async function preloadNextAlbum() {
        if (TT.loadingMore) return 0;
        if (TT.albumQueue.length === 0) {
            buildNextAlbumQueue(document, location.href, IS_ALBUM_PAGE ? 'album' : 'listing');
            if (TT.albumQueue.length === 0 && !IS_ALBUM_PAGE) {
                await loadNextListingPageIntoQueue();
            }
            if (TT.albumQueue.length === 0) return 0;
        }

        TT.loadingMore = true;
        showLoadingCard(true);

        const url = TT.albumQueue.shift();
        TT.albumSeen.add(url);
        const doc = await fetchAlbumPage(url);
        let added = 0;

        if (doc) {
            // Search/listing feeds stay locked to the original result pages. We only
            // discover related albums from fetched albums when the user disables the lock.
            if (IS_ALBUM_PAGE || SETTINGS.lockFeedToSearch === false) {
                buildNextAlbumQueue(doc, url, 'album');
            }

            const meta = getAlbumMetaFromDoc(doc, url);
            const newItems = extractMediaFromDoc(doc, STATE.tiktokType, meta);
            added = newItems.length;
            if (added > 0) {
                TT.items.push(...newItems);
                newItems.forEach((item, i) => appendTikTokCard(item, TT.items.length - added + i));
                updateTikTokCounter();
                updateFeedStatus();
                console.log(`[EU] Preloaded ${added} items from: ${meta.title}`);
            }
        }

        showLoadingCard(false);
        TT.loadingMore = false;
        updateFeedStatus();

        // If this album produced nothing useful, keep moving through the queue.
        // On listing/profile/search pages, silently pull the next result page too.
        if (added === 0) {
            if (TT.albumQueue.length > 0) return preloadNextAlbum();
            if (!IS_ALBUM_PAGE && !TT.listingStopped) {
                const queued = await loadNextListingPageIntoQueue();
                if (queued > 0) return preloadNextAlbum();
            }
        }

        return added;
    }

    function showLoadingCard(show) {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return;
        let card = feed.querySelector('.eu-tiktok-loading');
        if (show) {
            if (!card) {
                card = document.createElement('div');
                card.className = 'eu-tiktok-loading';
                const label = STATE.tiktokLayout === 'desktop'
                    ? 'Loading more albums without changing page…'
                    : 'Loading next album…';
                card.innerHTML = `<span class="eu-spinner"></span><span>${label}</span>`;
                feed.appendChild(card);
            }
        } else if (card) {
            card.remove();
        }
    }

    function updateTikTokCounter() {
        const el = document.getElementById('eu-tiktok-counter');
        if (!el) return;
        const idx = Math.min(STATE.tiktokIndex + 1, TT.items.length);
        el.textContent = `${idx} / ${TT.items.length}`;
        updateFeedStatus();
    }

    function appendTikTokCard(item, idx) {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return;
        feed.querySelector('.eu-tiktok-empty')?.remove();

        const el = document.createElement('div');
        el.className = 'eu-tiktok-item';
        el.dataset.idx = idx;
        el._euData = item;

        let mediaHTML;
        if (item.kind === 'video') {
            mediaHTML = `<video class="eu-tiktok-media" src="${item.url}" playsinline preload="metadata" ${SETTINGS.loopVideos !== false ? 'loop' : ''} ${SETTINGS.muteVideos ? 'muted' : ''}></video>`;
        } else {
            mediaHTML = `<img class="eu-tiktok-media" src="${item.url}" alt="" loading="lazy">`;
        }

        const descText = (item.title || '').replace(/[<>]/g, '');
        const kindEmoji = item.kind === 'video' ? '🎥' : '🖼️';

        const username = (item.username || 'Erome').replace(/[<>]/g, '');
        const avatarSeed = encodeURIComponent(username);
        const likeCount = item.likeCount || '';
        const favCount = item.favCount || '';
        const viewCount = item.viewCount || '';
        const albumHref = item.albumUrl || '#';

        el.innerHTML = `
            ${mediaHTML}
            <div class="eu-tiktok-play-hint">${ICONS.video}</div>
            <div class="eu-tiktok-heart-pop">❤️</div>
            ${TRACKING.seenAlbums.has(normalizeUrl(item.albumUrl || '')) ? '<div class="eu-feed-badge">Seen</div>' : ''}
            ${TRACKING.downloadedMedia.has(normalizeUrl(item.url)) ? '<div class="eu-feed-badge eu-feed-downloaded">Downloaded</div>' : ''}

            <div class="eu-tiktok-top">
                ${viewCount ? `<span class="eu-tiktok-views">${ICONS.eye}<span>${viewCount}</span></span>` : ''}
                <span class="eu-tiktok-kind-pill">${kindEmoji} ${item.kind === 'video' ? 'Video' : 'Photo'}</span>
                ${item.kind === 'video' ? `<span class="eu-tiktok-duration-pill" data-duration>⏱ <span class="eu-tt-dur-val">--:--</span></span>` : ''}
            </div>

            <div class="eu-tiktok-caption">
                <a class="eu-tiktok-user" href="${albumHref}" target="_blank" rel="noopener">@${username}</a>
                <div class="eu-tiktok-desc">${descText || `${kindEmoji} Media`}</div>
                ${item.albumUrl ? `<a class="eu-tiktok-album" href="${item.albumUrl}" target="_blank" rel="noopener">${ICONS.eye}<span>View Album on Erome</span></a>` : ''}
                <div class="eu-tiktok-ticker">
                    ${ICONS.music}<span>Erome · @${username}</span>
                </div>
            </div>

            <div class="eu-tiktok-sidebar">
                <a class="eu-tiktok-avatar" href="${albumHref}" target="_blank" rel="noopener" title="Visit @${username}">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=8a5acc" alt="${username}">
                    <span class="eu-tiktok-avatar-plus">+</span>
                </a>

                <div class="eu-tiktok-action" data-act="like" title="Like">
                    <div class="eu-tiktok-icon">${ICONS.heart}</div>
                    <div class="eu-tiktok-lbl eu-tiktok-count">${likeCount || 'Like'}</div>
                </div>

                <div class="eu-tiktok-action" data-act="favorite" title="Add to Favorites">
                    <div class="eu-tiktok-icon">${ICONS.star}</div>
                    <div class="eu-tiktok-lbl eu-tiktok-count">${favCount || 'Favorite'}</div>
                </div>

                <div class="eu-tiktok-action" data-act="comment" title="Comments">
                    <div class="eu-tiktok-icon">${ICONS.comment}</div>
                    <div class="eu-tiktok-lbl">Comments</div>
                </div>

                <div class="eu-tiktok-action" data-act="share" title="Share">
                    <div class="eu-tiktok-icon">${ICONS.share}</div>
                    <div class="eu-tiktok-lbl">Share</div>
                </div>

                <div class="eu-tiktok-action" data-act="download" title="Save">
                    <div class="eu-tiktok-icon">${ICONS.download}</div>
                    <div class="eu-tiktok-lbl">Save</div>
                </div>

                <div class="eu-tiktok-action" data-act="copy" title="Copy URL">
                    <div class="eu-tiktok-icon">${ICONS.copy}</div>
                    <div class="eu-tiktok-lbl">Copy</div>
                </div>

                <div class="eu-tiktok-action eu-tiktok-action-mini" data-act="report" title="Report">
                    <div class="eu-tiktok-icon">${ICONS.flag}</div>
                </div>

                <div class="eu-tiktok-disc">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=14151f" alt="">
                </div>
            </div>

            ${item.kind === 'video' ? '<div class="eu-tiktok-progress"><div class="eu-tiktok-progress-fill"></div></div>' : ''}
        `;

        // Actions — Erome-native buttons
        el.querySelectorAll('.eu-tiktok-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const act = btn.dataset.act;
                if (act === 'download') downloadSingle(item.url, getFilename(item.url), null, item.albumUrl);
                if (act === 'copy') {
                    navigator.clipboard?.writeText(item.url)
                        .then(() => toast('URL copied!', 'success', 1400))
                        .catch(() => toast('Copy failed', 'error'));
                }
                if (act === 'like') {
                    btn.classList.toggle('liked');
                    if (btn.classList.contains('liked')) {
                        showHeartPop(el);
                        toast('Liked \u2665', 'success', 1200);
                    }
                }
                if (act === 'favorite') {
                    btn.classList.toggle('faved');
                    if (btn.classList.contains('faved')) saveFavoriteItem(item);
                    toast(btn.classList.contains('faved') ? 'Added to local favorites \u2b50' : 'Removed from favorites', 'success', 1400);
                }
                if (act === 'comment') {
                    if (item.albumUrl) window.open(item.albumUrl + '#comments', '_blank');
                    else toast('Comments available on the full album page', 'info');
                }
                if (act === 'share') {
                    const shareUrl = item.albumUrl || item.url;
                    if (navigator.share) {
                        navigator.share({ title: `Erome \u00b7 @${username}`, url: shareUrl }).catch(() => {});
                    } else {
                        navigator.clipboard?.writeText(shareUrl)
                            .then(() => toast('Share link copied \ud83d\udce4', 'success', 1400))
                            .catch(() => toast('Copy failed', 'error'));
                    }
                }
                if (act === 'report') {
                    if (confirm('Open the full album page to report this content?') && item.albumUrl) {
                        window.open(item.albumUrl, '_blank');
                    }
                }
            });
        });

        // Double-tap to like (mobile gesture)
        let lastTap = 0;
        el.addEventListener('click', (e) => {
            if (e.target.closest('.eu-tiktok-sidebar') || e.target.closest('.eu-tiktok-album')) return;

            const now = Date.now();
            if (now - lastTap < 350) {
                // Double tap
                const likeBtn = el.querySelector('.eu-tiktok-action[data-act="like"]');
                if (likeBtn && !likeBtn.classList.contains('liked')) {
                    likeBtn.classList.add('liked');
                }
                showHeartPop(el);
            } else {
                // Single tap = play/pause for videos
                if (item.kind === 'video') {
                    const video = el.querySelector('video');
                    const hint = el.querySelector('.eu-tiktok-play-hint');
                    if (video) {
                        if (video.paused) { video.play().catch(() => {}); hint.classList.remove('show'); }
                        else { video.pause(); hint.classList.add('show'); }
                    }
                }
            }
            lastTap = now;
        });

        // Observe for autoplay
        if (TT.io) TT.io.observe(el);

        // Insert before loading card if present
        const loadingCard = feed.querySelector('.eu-tiktok-loading');
        if (loadingCard) feed.insertBefore(el, loadingCard);
        else feed.appendChild(el);

        // Video progress bar + duration display
        if (item.kind === 'video') {
            const video = el.querySelector('video');
            applyVideoPrefs(video);
            const fill = el.querySelector('.eu-tiktok-progress-fill');
            const durPill = el.querySelector('.eu-tt-dur-val');

            // Live elapsed/total time badge (bottom-left)
            const liveTime = document.createElement('div');
            liveTime.className = 'eu-tiktok-duration-live';
            liveTime.textContent = '00:00 / --:--';
            el.appendChild(liveTime);

            const fmtTime = (s) => {
                if (!isFinite(s) || s < 0) return '--:--';
                const m = Math.floor(s / 60);
                const sec = Math.floor(s % 60).toString().padStart(2, '0');
                return `${m}:${sec}`;
            };

            video?.addEventListener('loadedmetadata', () => {
                if (video.duration && isFinite(video.duration)) {
                    const seconds = Math.floor(video.duration);
                    item.duration = seconds;
                    if (filterOutFeedVideoByLength(item, el, seconds)) return;
                    if (durPill) durPill.textContent = fmtTime(video.duration);
                    liveTime.textContent = `00:00 / ${fmtTime(video.duration)}`;
                }
            });

            video?.addEventListener('timeupdate', () => {
                if (video.duration) {
                    fill.style.width = `${(video.currentTime / video.duration) * 100}%`;
                    liveTime.textContent = `${fmtTime(video.currentTime)} / ${fmtTime(video.duration)}`;
                }
            });
        }
    }

    function showHeartPop(cardEl) {
        const pop = cardEl.querySelector('.eu-tiktok-heart-pop');
        if (!pop) return;
        pop.classList.remove('animate');
        void pop.offsetWidth;
        pop.classList.add('animate');
    }

    /* ---------- Right Panel (2-column grid) - REMOVED ---------- */

    function setTikTokLayout(layout) {
        STATE.tiktokLayout = layout === 'desktop' ? 'desktop' : 'phone';
        updateSetting('defaultFeedLayout', STATE.tiktokLayout);
        const overlay = document.getElementById('eu-tiktok');
        if (!overlay) return;

        const isDesktop = STATE.tiktokLayout === 'desktop';
        overlay.classList.toggle('eu-desktop-mode', isDesktop);

        const btn = overlay.querySelector('.eu-tiktok-layout-toggle');
        if (btn) {
            btn.textContent = isDesktop ? 'Phone' : 'Desktop';
            btn.title = isDesktop ? 'Switch to phone layout' : 'Switch to desktop layout';
        }

        const title = overlay.querySelector('.eu-tiktok-title span');
        if (title) title.textContent = isDesktop ? 'Desktop Feed' : 'For You';
        applyFeedFitMode();
    }


    function applyVideoPrefs(video) {
        if (!video) return;
        video.loop = SETTINGS.loopVideos !== false;
        video.muted = !!SETTINGS.muteVideos;
        video.setAttribute('playsinline', '');
    }

    function applyFeedFitMode() {
        const overlay = document.getElementById('eu-tiktok');
        if (!overlay) return;
        overlay.classList.remove('eu-fit-contain', 'eu-fit-cover', 'eu-fit-natural');
        overlay.classList.add('eu-fit-' + (SETTINGS.fitMode || 'contain'));
        document.querySelectorAll('#eu-tiktok video').forEach(applyVideoPrefs);
        updateFeedTools();
    }

    function markCurrentFeedPosition() {
        if (!SETTINGS.autoResume || !STATE.tiktokMode) return;
        SETTINGS.lastFeed = {
            page: normalizeUrl(location.href),
            type: STATE.tiktokType,
            layout: STATE.tiktokLayout,
            index: STATE.tiktokIndex,
            savedAt: new Date().toISOString()
        };
        saveSettings();
    }

    function resumeFeedPosition() {
        if (!SETTINGS.autoResume || !SETTINGS.lastFeed) return;
        const last = SETTINGS.lastFeed;
        if (last.page !== normalizeUrl(location.href)) return;
        if (last.type !== STATE.tiktokType || last.layout !== STATE.tiktokLayout) return;
        const feed = document.getElementById('eu-tiktok-feed');
        const cards = feed?.querySelectorAll('.eu-tiktok-item');
        if (!cards || !cards.length) return;
        const idx = Math.min(Math.max(0, Number(last.index) || 0), cards.length - 1);
        if (idx > 0) {
            STATE.tiktokIndex = idx;
            setTimeout(() => cards[idx]?.scrollIntoView({ behavior: 'auto', block: 'start' }), 150);
        }
    }

    function getFeedScopeButtonLabel() {
        if (IS_ALBUM_PAGE) return SETTINGS.allowRelatedAlbumExpansion !== false ? 'Related On' : 'Current Only';
        return SETTINGS.lockFeedToSearch !== false ? 'Search Lock' : 'Related On';
    }

    function updateFeedTools() {
        const panel = document.getElementById('eu-feed-tools');
        if (!panel) return;
        const auto = panel.querySelector('[data-act="autoplay"] span');
        const mute = panel.querySelector('[data-act="mute"] span');
        const fit = panel.querySelector('[data-act="fit"] span');
        const scope = panel.querySelector('[data-act="scope"] span');
        const length = panel.querySelector('[data-act="length"] span');
        const pin = panel.querySelector('[data-act="pin"] span');
        const pinBtn = panel.querySelector('[data-act="pin"]');
        if (auto) auto.textContent = SETTINGS.autoplay ? 'Auto On' : 'Auto Off';
        if (mute) mute.textContent = SETTINGS.muteVideos ? 'Muted' : 'Sound';
        if (fit) fit.textContent = `Fit ${SETTINGS.fitMode || 'contain'}`;
        if (scope) scope.textContent = getFeedScopeButtonLabel();
        if (length) {
            length.textContent = getLengthFilterLabel();
            length.closest('button')?.classList.toggle('eu-active', getMinVideoSeconds() > 0 || getMaxVideoSeconds() > 0);
        }
        if (pin) pin.textContent = SETTINGS.feedControlsPinned ? 'Pinned' : (SETTINGS.feedControlsAutoHide === false ? 'Always On' : 'Auto Hide');
        if (pinBtn) pinBtn.classList.toggle('eu-active', SETTINGS.feedControlsPinned === true || SETTINGS.feedControlsAutoHide === false);
        updateFeedStatus();
    }

    function updateFeedStatus() {
        const el = document.getElementById('eu-feed-status');
        if (!el) return;
        const scope = TT.feedScopeLabel || (SETTINGS.lockFeedToSearch !== false ? 'Search/listing lock' : 'Related expansion');
        el.textContent = `Items ${TT.items.length} · Queue ${TT.albumQueue.length} · Page ${TT.listingNextPage || '-'} · ${scope} · ${getLengthFilterLabel()} · ${SETTINGS.performanceMode}`;
    }

    function rebuildFeedFromItems(scrollIndex = 0) {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return;
        if (TT.io) TT.io.disconnect();
        feed.innerHTML = '';
        TT.items.forEach((item, idx) => appendTikTokCard(item, idx));
        STATE.tiktokIndex = Math.min(scrollIndex, Math.max(0, TT.items.length - 1));
        updateTikTokCounter();
        applyFeedFitMode();
        updateFeedStatus();
        setTimeout(() => getCurrentCard()?.scrollIntoView({ behavior: 'auto', block: 'start' }), 80);
    }

    function skipCurrentAlbumInFeed() {
        const item = getCurrentItem();
        const album = item?.albumUrl;
        if (!album) { toast('No album to skip', 'warning'); return; }
        const before = TT.items.length;
        TT.items = TT.items.filter(x => x.albumUrl !== album);
        const removed = before - TT.items.length;
        rebuildFeedFromItems(Math.min(STATE.tiktokIndex, Math.max(0, TT.items.length - 1)));
        toast(`Skipped ${removed} item${removed === 1 ? '' : 's'} from album`, 'info');
        if (TT.items.length < 4) preloadNextAlbum();
    }

    function shuffleFeed() {
        for (let i = TT.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [TT.items[i], TT.items[j]] = [TT.items[j], TT.items[i]];
        }
        rebuildFeedFromItems(0);
        toast('Feed shuffled', 'success');
    }

    function cycleFitMode() {
        const modes = ['contain', 'cover', 'natural'];
        const next = modes[(modes.indexOf(SETTINGS.fitMode) + 1) % modes.length] || 'contain';
        updateSetting('fitMode', next);
        applyFeedFitMode();
        toast(`Fit mode: ${next}`, 'info');
    }

    let feedControlsTimer = null;

    function feedToolsShouldAutoHide() {
        return SETTINGS.feedControlsAutoHide !== false && SETTINGS.feedControlsPinned !== true;
    }

    function setFeedControlsVisible(visible, temporary = true, forceHide = false) {
        const overlay = document.getElementById('eu-tiktok');
        const phone = overlay?.querySelector('.eu-phone');
        if (!phone) return;
        const shouldHide = !visible && (forceHide || feedToolsShouldAutoHide());
        phone.classList.toggle('eu-feed-controls-hidden', shouldHide);
        const toggle = document.getElementById('eu-feed-tools-toggle');
        if (toggle) {
            toggle.title = shouldHide ? 'Show feed tools' : 'Hide feed tools';
            const label = toggle.querySelector('span');
            if (label) label.textContent = shouldHide ? 'Tools' : 'Hide';
        }
        if (visible && temporary && feedToolsShouldAutoHide()) scheduleFeedControlsHide();
    }

    function scheduleFeedControlsHide(delay = 2800) {
        clearTimeout(feedControlsTimer);
        const phone = document.querySelector('#eu-tiktok .eu-phone');
        if (!phone) return;
        if (!feedToolsShouldAutoHide()) {
            phone.classList.remove('eu-feed-controls-hidden');
            return;
        }
        feedControlsTimer = setTimeout(() => setFeedControlsVisible(false, false), delay);
    }

    function showFeedControlsTemp(delay = 2800) {
        setFeedControlsVisible(true, false);
        if (feedToolsShouldAutoHide()) scheduleFeedControlsHide(delay);
    }

    function installFeedControlsAutoHide(phone, panel) {
        if (!phone || phone.dataset.euFeedAutohide === '1') return;
        phone.dataset.euFeedAutohide = '1';

        panel?.addEventListener('mouseenter', () => clearTimeout(feedControlsTimer));
        panel?.addEventListener('mouseleave', () => scheduleFeedControlsHide(1400));
        panel?.addEventListener('click', () => scheduleFeedControlsHide(1800));

        const hideSoon = () => scheduleFeedControlsHide(650);
        const showFromTop = (e) => {
            const y = e.touches?.[0]?.clientY ?? e.clientY ?? 9999;
            const rect = phone.getBoundingClientRect();
            // Reveal only when the mouse rolls over the top control zone,
            // so the video stays clean during normal scrolling/watching.
            if (y - rect.top <= 155) showFeedControlsTemp(2400);
        };

        phone.addEventListener('wheel', hideSoon, { passive: true });
        phone.addEventListener('touchmove', hideSoon, { passive: true });
        phone.addEventListener('mousemove', showFromTop, { passive: true });

        const feed = phone.querySelector('#eu-tiktok-feed');
        feed?.addEventListener('scroll', () => scheduleFeedControlsHide(650), { passive: true });

        setTimeout(() => {
            if (feedToolsShouldAutoHide()) setFeedControlsVisible(false, false);
            else setFeedControlsVisible(true, false);
        }, 2600);
    }

    function enhanceFeedControls() {
        const overlay = document.getElementById('eu-tiktok');
        const phone = overlay?.querySelector('.eu-phone');
        if (!phone) return;
        if (!document.getElementById('eu-feed-tools')) {
            const panel = document.createElement('div');
            panel.id = 'eu-feed-tools';
            panel.className = 'eu-feed-tools';
            panel.innerHTML = `
                <button data-act="skip"><span>Skip Album</span></button>
                <button data-act="shuffle"><span>Shuffle</span></button>
                <button data-act="fit"><span>Fit ${SETTINGS.fitMode}</span></button>
                <button data-act="scope"><span>${getFeedScopeButtonLabel()}</span></button>
                <button data-act="length"><span>${getLengthFilterLabel()}</span></button>
                <button data-act="mute"><span>${SETTINGS.muteVideos ? 'Muted' : 'Sound'}</span></button>
                <button data-act="autoplay"><span>${SETTINGS.autoplay ? 'Auto On' : 'Auto Off'}</span></button>
                <button data-act="manager"><span>Downloads</span></button>
                <button data-act="status"><span>Status</span></button>
                <button data-act="pin"><span>${SETTINGS.feedControlsPinned ? 'Pinned' : (SETTINGS.feedControlsAutoHide === false ? 'Always On' : 'Auto Hide')}</span></button>
                <button data-act="hide"><span>Hide</span></button>`;
            phone.appendChild(panel);

            panel.addEventListener('click', e => {
                const btn = e.target.closest('button[data-act]');
                if (!btn) return;
                const act = btn.dataset.act;
                if (act === 'skip') skipCurrentAlbumInFeed();
                if (act === 'shuffle') shuffleFeed();
                if (act === 'fit') cycleFitMode();
                if (act === 'scope') {
                    if (IS_ALBUM_PAGE) {
                        updateSetting('allowRelatedAlbumExpansion', !(SETTINGS.allowRelatedAlbumExpansion !== false));
                        toast(SETTINGS.allowRelatedAlbumExpansion !== false ? 'Album feed will load next/related albums' : 'Album feed limited to current album', 'info');
                    } else {
                        updateSetting('lockFeedToSearch', !(SETTINGS.lockFeedToSearch !== false));
                        toast(SETTINGS.lockFeedToSearch !== false ? 'Feed locked to current search/listing' : 'Related album expansion enabled', 'info');
                    }
                    resetAndRenderFeed();
                }
                if (act === 'length') promptLengthFilter();
                if (act === 'mute') { updateSetting('muteVideos', !SETTINGS.muteVideos); document.querySelectorAll('#eu-tiktok video').forEach(applyVideoPrefs); updateFeedTools(); }
                if (act === 'autoplay') { updateSetting('autoplay', !SETTINGS.autoplay); updateFeedTools(); }
                if (act === 'manager') openDownloadManager();
                if (act === 'status') openStatusPanel();
                if (act === 'pin') {
                    updateSetting('feedControlsPinned', !SETTINGS.feedControlsPinned);
                    if (SETTINGS.feedControlsPinned) setFeedControlsVisible(true, false);
                    else scheduleFeedControlsHide(900);
                    updateFeedTools();
                    toast(SETTINGS.feedControlsPinned ? 'Feed tools pinned' : 'Feed tools will auto-hide', 'info');
                }
                if (act === 'hide') setFeedControlsVisible(false, false, true);
            });
        }
        if (!document.getElementById('eu-feed-tools-toggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'eu-feed-tools-toggle';
            toggle.className = 'eu-feed-tools-toggle';
            toggle.innerHTML = `<img src="${LOGO_ICON}" alt=""><span>Tools</span>`;
            toggle.title = 'Show feed tools';
            toggle.addEventListener('click', e => {
                e.stopPropagation();
                const isHidden = phone.classList.contains('eu-feed-controls-hidden');
                if (isHidden) showFeedControlsTemp(4200);
                else setFeedControlsVisible(false, false, true);
            });
            phone.appendChild(toggle);
        }
        if (!document.getElementById('eu-feed-status')) {
            const status = document.createElement('div');
            status.id = 'eu-feed-status';
            status.className = 'eu-feed-status';
            phone.appendChild(status);
        }
        installFeedControlsAutoHide(phone, document.getElementById('eu-feed-tools'));
        applyFeedFitMode();
        updateFeedStatus();
        if (feedToolsShouldAutoHide()) scheduleFeedControlsHide(2600);
        else setFeedControlsVisible(true, false);
    }

    function buildTikTokOverlay() {
        if (document.getElementById('eu-tiktok')) return;

        const overlay = document.createElement('div');
        overlay.id = 'eu-tiktok';
        overlay.className = 'eu-tiktok-overlay';
        overlay.innerHTML = `
          <div class="eu-phone">
            <div class="eu-tiktok-splash" id="eu-tiktok-splash">
              <img src="${LOGO_SPLASH}" alt="Erome" class="eu-tiktok-splash-logo">
              <div class="eu-tiktok-splash-tag">Ultimate Premium</div>
              <div class="eu-tiktok-splash-dots"><span></span><span></span><span></span></div>
            </div>
            <div class="eu-tiktok-topbar">
              <div class="eu-tiktok-title">
                <img src="${LOGO_ICON}" alt="Erome" class="eu-tiktok-brand-logo">
                <span>For You</span>
              </div>
              <div class="eu-tiktok-controls">
                <button class="eu-tiktok-tab" data-type="videos">Videos</button>
                <button class="eu-tiktok-tab" data-type="photos">Photos</button>
                <button class="eu-tiktok-tab" data-type="all">All</button>
                <button class="eu-tiktok-layout-toggle" title="Switch to desktop layout">Desktop</button>
                <button class="eu-tiktok-close" title="Close">${ICONS.close}</button>
              </div>
            </div>
            <div class="eu-tiktok-counter" id="eu-tiktok-counter">0 / 0</div>
            <div class="eu-tiktok-feed" id="eu-tiktok-feed"></div>
          </div>`;

        document.body.appendChild(overlay);

        overlay.querySelector('.eu-tiktok-close').addEventListener('click', closeTikTok);
        overlay.addEventListener('click', (e) => {
            // Click outside phone closes
            if (e.target === overlay) closeTikTok();
        });

        overlay.querySelectorAll('.eu-tiktok-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                STATE.tiktokType = tab.dataset.type;
                updateSetting('defaultFeedType', STATE.tiktokType);
                updateTikTokTabs();
                resetAndRenderFeed();
            });
        });

        overlay.querySelector('.eu-tiktok-layout-toggle')?.addEventListener('click', () => {
            setTikTokLayout(STATE.tiktokLayout === 'desktop' ? 'phone' : 'desktop');
        });

        // Setup IntersectionObserver once
        const feed = overlay.querySelector('#eu-tiktok-feed');
        TT.io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                const videoEl = card.querySelector('video');
                const idx = parseInt(card.dataset.idx);

                if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
                    STATE.tiktokIndex = idx;
                    updateTikTokCounter();
                    if (card._euData?.albumUrl) markSeenAlbum(card._euData.albumUrl);
                    if (videoEl) {
                        applyVideoPrefs(videoEl);
                        if (SETTINGS.autoplay !== false) {
                            videoEl.play().catch(() => {
                                // Autoplay with sound blocked — fall back to muted
                                videoEl.muted = true;
                                videoEl.play().catch(() => {});
                            });
                        } else {
                            videoEl.pause();
                        }
                    }
                    markCurrentFeedPosition();
                    decorateTrackingBadges();
                    // Preload next album when nearing the end
                    if (idx >= TT.items.length - 3) {
                        preloadNextAlbum();
                    }
                } else if (videoEl) {
                    videoEl.pause();
                }
            });
        }, { root: feed, threshold: [0, 0.65, 0.9] });

        // Scroll fallback for desktop wheel/trackpad: load ahead when nearing the end.
        let feedScrollDebounce;
        feed.addEventListener('scroll', () => {
            if (!STATE.tiktokMode) return;
            clearTimeout(feedScrollDebounce);
            feedScrollDebounce = setTimeout(() => {
                const nearEnd = feed.scrollTop + feed.clientHeight >= feed.scrollHeight - (feed.clientHeight * 2.2);
                if (nearEnd) preloadNextAlbum();
            }, 80);
        }, { passive: true });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!STATE.tiktokMode) return;
            if (e.key === 'Escape') closeTikTok();
            else if (e.key === 'ArrowDown' || e.key === 'j') { scrollTikTok(1); e.preventDefault(); }
            else if (e.key === 'ArrowUp' || e.key === 'k') { scrollTikTok(-1); e.preventDefault(); }
            else if (e.key === ' ') {
                const card = getCurrentCard();
                const video = card?.querySelector('video');
                if (video) {
                    if (video.paused) video.play(); else video.pause();
                    e.preventDefault();
                }
            }
            else if (e.key === 'd') {
                const item = getCurrentItem();
                if (item) downloadSingle(item.url, getFilename(item.url), null, item.albumUrl);
            }
            else if (e.key === 'l') {
                const card = getCurrentCard();
                card?.querySelector('.eu-tiktok-action[data-act="like"]')?.click();
            }
        });
    }

    function updateTikTokTabs() {
        document.querySelectorAll('.eu-tiktok-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.type === STATE.tiktokType);
        });
    }

    function getCurrentCard() {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return null;
        const cards = feed.querySelectorAll('.eu-tiktok-item');
        return cards[STATE.tiktokIndex] || cards[0] || null;
    }

    function getCurrentItem() {
        return getCurrentCard()?._euData || null;
    }

    function scrollTikTok(direction) {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return;
        const cards = feed.querySelectorAll('.eu-tiktok-item');
        const next = Math.max(0, Math.min(cards.length - 1, STATE.tiktokIndex + direction));
        cards[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (next >= cards.length - 3) preloadNextAlbum();
    }

    async function resetAndRenderFeed() {
        const feed = document.getElementById('eu-tiktok-feed');
        if (!feed) return;

        // Reset state
        TT.items = [];
        TT.seenUrls = new Set();
        TT.albumQueue = [];
        TT.albumSeen = new Set();
        TT.loadingMore = false;
        resetListingFeedPager();
        resetFeedScope();
        if (IS_ALBUM_PAGE) TT.albumSeen.add(euCleanFeedUrl(location.href, location.href));
        if (TT.io) TT.io.disconnect();
        STATE.tiktokIndex = 0;

        feed.innerHTML = '';

        // Album pages can render their own media immediately. Listing pages are queued
        // from album links and fetched in the background so the browser URL never changes.
        const pageItems = collectCurrentPageItems(STATE.tiktokType);
        TT.items = pageItems;
        pageItems.forEach((item, idx) => appendTikTokCard(item, idx));

        buildNextAlbumQueue(document, location.href, IS_ALBUM_PAGE ? 'album' : 'listing');
        if (!IS_ALBUM_PAGE && TT.albumQueue.length === 0) {
            await loadNextListingPageIntoQueue();
        }

        // If the current page had no real media, pull albums until the first usable
        // card appears. This is what makes desktop feed work from profile/search grids.
        let attempts = 0;
        while (TT.items.length === 0 && attempts < 12) {
            if (TT.albumQueue.length === 0 && !IS_ALBUM_PAGE && !TT.listingStopped) {
                await loadNextListingPageIntoQueue();
            }
            if (TT.albumQueue.length === 0) break;
            const added = await preloadNextAlbum();
            attempts++;
            if (added > 0) break;
        }

        if (TT.items.length === 0) {
            feed.innerHTML = `<div class="eu-tiktok-empty">
                <div style="font-size:44px;margin-bottom:14px;">📭</div>
                <div style="font-weight:600;margin-bottom:4px;">No ${STATE.tiktokType} found</div>
                <div style="font-size:11px;opacity:.6;">Try another tab, or turn Related On for next-album loading.</div>
            </div>`;
            const c = document.getElementById('eu-tiktok-counter');
            if (c) c.textContent = '0 / 0';
            return;
        }

        updateTikTokCounter();
        feed.scrollTop = 0;
        applyFeedFitMode();
        updateFeedStatus();
        setTimeout(resumeFeedPosition, 250);

        // Preload ahead without changing the current page/URL.
        if (TT.albumQueue.length > 0 || (!IS_ALBUM_PAGE && !TT.listingStopped)) {
            setTimeout(() => preloadNextAlbum(), STATE.tiktokLayout === 'desktop' ? 700 : 1500);
        }
    }

    function openTikTok(type, layout = 'phone') {
        buildTikTokOverlay();
        if (type) STATE.tiktokType = type;
        updateSetting('defaultFeedType', STATE.tiktokType);
        setTikTokLayout(layout);
        enhanceFeedControls();
        updateTikTokTabs();
        STATE.tiktokMode = true;
        document.getElementById('eu-tiktok').classList.add('open');
        document.body.style.overflow = 'hidden';
        resetAndRenderFeed();
        const msg = STATE.tiktokLayout === 'desktop'
            ? (SETTINGS.lockFeedToSearch !== false && !IS_ALBUM_PAGE
                ? 'Desktop feed — locked to this search/listing and pulls next result pages'
                : 'Desktop feed — scroll up/down, loads next albums without changing page')
            : 'TikTok mode — swipe up/down, tap to pause, double-tap to like';
        toast(msg, 'info', 3500);
    }

    function openDesktopFeed(type = 'all') {
        openTikTok(type, 'desktop');
    }

    function closeTikTok() {
        markCurrentFeedPosition();
        STATE.tiktokMode = false;
        const o = document.getElementById('eu-tiktok');
        if (o) {
            o.classList.remove('open');
            // Pause all videos
            o.querySelectorAll('video').forEach(v => v.pause());
        }
        document.body.style.overflow = '';
    }

    /* ============================================================
     *  FLOATING ACTION BUTTON (FAB)
     * ============================================================ */
    function buildFAB() {
        if (!document.querySelector('.eu-fab-bulk')) {
            const fab = document.createElement('button');
            fab.className = 'eu-fab eu-fab-bulk';
            fab.title = 'Bulk Download';
            fab.innerHTML = `${ICONS.download}<span class="eu-fab-badge" id="eu-fab-badge">0</span>`;
            fab.addEventListener('click', openBulkModal);
            document.body.appendChild(fab);
        }

        // Feed FAB — phone layout on small screens, desktop layout on desktop.
        if (!document.querySelector('.eu-fab-tiktok')) {
            const tt = document.createElement('button');
            tt.className = 'eu-fab eu-fab-tiktok';
            tt.title = 'Feed Mode';
            tt.style.bottom = '92px';
            tt.style.background = 'linear-gradient(135deg, #ff0050 0%, #8a5acc 50%, #00f2ea 100%)';
            tt.innerHTML = `<img src="${LOGO_ICON}" alt="Erome" style="width:32px;height:32px;border-radius:50%;object-fit:cover;box-shadow:0 0 8px rgba(0,0,0,0.4);">`;
            tt.addEventListener('click', () => {
                const layout = SETTINGS.defaultFeedLayout || (window.matchMedia('(min-width: 760px)').matches ? 'desktop' : 'phone');
                const type = SETTINGS.defaultFeedType || (IS_ALBUM_PAGE ? STATE.tiktokType : 'all');
                openTikTok(type, layout);
            });
            document.body.appendChild(tt);
        }
    }
    function updateFabBadge() {
        const badge = document.getElementById('eu-fab-badge');
        if (!badge) return;
        const n = collectAllMediaUrls().length;
        badge.textContent = n;
        badge.style.display = n > 0 ? 'flex' : 'none';
    }

    /* ============================================================
     *  HUB MENU (Twitter-style popup cards in navbar)
     * ============================================================ */

    function buildSettingsModal() {
        if (document.getElementById('eu-settings-modal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'eu-settings-modal';
        overlay.className = 'eu-modal-overlay';
        overlay.innerHTML = `
          <div class="eu-modal" style="width:620px;">
            <div class="eu-modal-header">
              <h3>${ICONS.settings}<span>Smart Premium Settings</span></h3>
              <button class="eu-modal-close">${ICONS.close}</button>
            </div>
            <div class="eu-modal-body">
              <div class="eu-smart-row">
                <div class="eu-smart-field"><label>Default Feed</label><select id="eu-set-feed-type">
                    <option value="all">All</option><option value="videos">Videos</option><option value="photos">Photos</option>
                </select></div>
                <div class="eu-smart-field"><label>Layout</label><select id="eu-set-feed-layout">
                    <option value="desktop">Desktop</option><option value="phone">Phone</option>
                </select></div>
              </div>
              <div class="eu-smart-row">
                <div class="eu-smart-field"><label>Performance</label><select id="eu-set-performance">
                    <option value="lite">Lite</option><option value="normal">Normal</option><option value="aggressive">Aggressive</option>
                </select></div>
                <div class="eu-smart-field"><label>Feed Fit</label><select id="eu-set-fit">
                    <option value="contain">Contain</option><option value="cover">Cover</option><option value="natural">Natural</option>
                </select></div>
              </div>
              <div class="eu-smart-row">
                <div class="eu-smart-field"><label>Min video length seconds</label><input id="eu-set-min-seconds" type="number" min="0" max="3600" step="5" placeholder="0 = off"></div>
                <div class="eu-smart-field"><label>Max video length seconds</label><input id="eu-set-max-seconds" type="number" min="0" max="3600" step="5" placeholder="0 = off"></div>
              </div>
              <div class="eu-smart-row">
                <div class="eu-smart-field"><label>Album search filter</label><input id="eu-set-album-search" type="text" placeholder="blank = off"></div>
                <div class="eu-smart-field"><label>Length filter</label><input disabled value="0 means off · applies to album page and feed videos"></div>
              </div>
              <div class="eu-option-group">
                <div class="eu-option-title">Toggles</div>
                <div class="eu-smart-checks">
                  <label class="eu-smart-check"><input id="eu-set-autoplay" type="checkbox"> Autoplay feed videos</label>
                  <label class="eu-smart-check"><input id="eu-set-mute" type="checkbox"> Start feed muted</label>
                  <label class="eu-smart-check"><input id="eu-set-loop" type="checkbox"> Loop videos</label>
                  <label class="eu-smart-check"><input id="eu-set-resume" type="checkbox"> Resume feed position</label>
                  <label class="eu-smart-check"><input id="eu-set-badges" type="checkbox"> Seen/download badges</label>
                  <label class="eu-smart-check"><input id="eu-set-hide-seen" type="checkbox"> Hide seen albums</label>
                  <label class="eu-smart-check"><input id="eu-set-hide-down" type="checkbox"> Hide downloaded albums</label>
                  <label class="eu-smart-check"><input id="eu-set-skip-down" type="checkbox"> Skip downloaded in downloads</label>
                  <label class="eu-smart-check"><input id="eu-set-folders" type="checkbox"> ZIP folders by album</label>
                  <label class="eu-smart-check"><input id="eu-set-retry" type="checkbox"> Retry failed downloads</label>
                  <label class="eu-smart-check"><input id="eu-set-dlbtns" type="checkbox"> Show media download buttons</label>
                  <label class="eu-smart-check"><input id="eu-set-lock-search" type="checkbox"> Lock feed to current search/listing</label>
                  <label class="eu-smart-check"><input id="eu-set-related" type="checkbox"> Allow related album expansion</label>
                  <label class="eu-smart-check"><input id="eu-set-strict-search" type="checkbox"> Strict search-word title filter</label>
                  <label class="eu-smart-check"><input id="eu-set-feed-auto-hide" type="checkbox"> Auto-hide feed tools row</label>
                  <label class="eu-smart-check"><input id="eu-set-feed-pinned" type="checkbox"> Keep feed tools pinned</label>
                </div>
              </div>
              <div class="eu-smart-actions">
                <button class="eu-btn-primary" id="eu-save-settings">${ICONS.check}<span>Save Settings</span></button>
                <button class="eu-btn-secondary" id="eu-reset-settings">Reset Defaults</button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.eu-modal-close').onclick = () => overlay.classList.remove('open');
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
        overlay.querySelector('#eu-save-settings').onclick = saveSettingsFromModal;
        overlay.querySelector('#eu-reset-settings').onclick = () => {
            if (!confirm('Reset Erome Ultimate settings to defaults? Tracking history is not deleted.')) return;
            Object.assign(SETTINGS, DEFAULT_SETTINGS);
            saveSettings();
            syncSettingsModal();
            applySettingsNow();
            toast('Settings reset', 'success');
        };
    }

    function syncSettingsModal() {
        const o = document.getElementById('eu-settings-modal');
        if (!o) return;
        o.querySelector('#eu-set-feed-type').value = SETTINGS.defaultFeedType || 'all';
        o.querySelector('#eu-set-feed-layout').value = SETTINGS.defaultFeedLayout || 'desktop';
        o.querySelector('#eu-set-performance').value = SETTINGS.performanceMode || 'normal';
        o.querySelector('#eu-set-fit').value = SETTINGS.fitMode || 'contain';
        o.querySelector('#eu-set-min-seconds').value = getMinVideoSeconds();
        o.querySelector('#eu-set-max-seconds').value = getMaxVideoSeconds();
        o.querySelector('#eu-set-album-search').value = SETTINGS.albumSearch || '';
        o.querySelector('#eu-set-autoplay').checked = SETTINGS.autoplay !== false;
        o.querySelector('#eu-set-mute').checked = !!SETTINGS.muteVideos;
        o.querySelector('#eu-set-loop').checked = SETTINGS.loopVideos !== false;
        o.querySelector('#eu-set-resume').checked = SETTINGS.autoResume !== false;
        o.querySelector('#eu-set-badges').checked = SETTINGS.showSeenBadges !== false;
        o.querySelector('#eu-set-hide-seen').checked = !!SETTINGS.hideSeen;
        o.querySelector('#eu-set-hide-down').checked = !!SETTINGS.hideDownloaded;
        o.querySelector('#eu-set-skip-down').checked = !!SETTINGS.skipDownloadedInDownloads;
        o.querySelector('#eu-set-folders').checked = SETTINGS.zipFolders !== false;
        o.querySelector('#eu-set-retry').checked = SETTINGS.retryDownloads !== false;
        o.querySelector('#eu-set-dlbtns').checked = SETTINGS.showDownloadButtons !== false;
        o.querySelector('#eu-set-lock-search').checked = SETTINGS.lockFeedToSearch !== false;
        o.querySelector('#eu-set-related').checked = SETTINGS.allowRelatedAlbumExpansion !== false;
        o.querySelector('#eu-set-strict-search').checked = SETTINGS.strictSearchTitleMatch === true;
        o.querySelector('#eu-set-feed-auto-hide').checked = SETTINGS.feedControlsAutoHide !== false;
        o.querySelector('#eu-set-feed-pinned').checked = SETTINGS.feedControlsPinned === true;
    }

    function saveSettingsFromModal() {
        const o = document.getElementById('eu-settings-modal');
        if (!o) return;
        updateSetting('defaultFeedType', o.querySelector('#eu-set-feed-type').value);
        updateSetting('defaultFeedLayout', o.querySelector('#eu-set-feed-layout').value);
        updateSetting('performanceMode', o.querySelector('#eu-set-performance').value);
        updateSetting('fitMode', o.querySelector('#eu-set-fit').value);
        const minSeconds = Math.max(0, Math.floor(Number(o.querySelector('#eu-set-min-seconds').value) || 0));
        const maxSeconds = Math.max(0, Math.floor(Number(o.querySelector('#eu-set-max-seconds').value) || 0));
        if (minSeconds > 0 && maxSeconds > 0 && minSeconds > maxSeconds) {
            toast('Min length cannot be higher than max length', 'error');
            return;
        }
        updateSetting('minVideoSeconds', minSeconds);
        updateSetting('hiddenSeconds', minSeconds);
        updateSetting('maxVideoSeconds', maxSeconds);
        updateSetting('albumSearch', o.querySelector('#eu-set-album-search').value.trim());
        updateSetting('autoplay', o.querySelector('#eu-set-autoplay').checked);
        updateSetting('muteVideos', o.querySelector('#eu-set-mute').checked);
        updateSetting('loopVideos', o.querySelector('#eu-set-loop').checked);
        updateSetting('autoResume', o.querySelector('#eu-set-resume').checked);
        updateSetting('showSeenBadges', o.querySelector('#eu-set-badges').checked);
        updateSetting('hideSeen', o.querySelector('#eu-set-hide-seen').checked);
        updateSetting('hideDownloaded', o.querySelector('#eu-set-hide-down').checked);
        updateSetting('skipDownloadedInDownloads', o.querySelector('#eu-set-skip-down').checked);
        updateSetting('zipFolders', o.querySelector('#eu-set-folders').checked);
        updateSetting('retryDownloads', o.querySelector('#eu-set-retry').checked);
        updateSetting('showDownloadButtons', o.querySelector('#eu-set-dlbtns').checked);
        updateSetting('lockFeedToSearch', o.querySelector('#eu-set-lock-search').checked);
        updateSetting('allowRelatedAlbumExpansion', o.querySelector('#eu-set-related').checked);
        updateSetting('strictSearchTitleMatch', o.querySelector('#eu-set-strict-search').checked);
        updateSetting('feedControlsAutoHide', o.querySelector('#eu-set-feed-auto-hide').checked);
        updateSetting('feedControlsPinned', o.querySelector('#eu-set-feed-pinned').checked);
        applySettingsNow();
        toast('Settings saved', 'success');
    }

    function applySettingsNow() {
        STATE.tiktokType = SETTINGS.defaultFeedType || STATE.tiktokType;
        STATE.tiktokLayout = SETTINGS.defaultFeedLayout || STATE.tiktokLayout;
        STATE.showDownloadButtons = SETTINGS.showDownloadButtons !== false;
        STATE.hiddenSeconds = getMinVideoSeconds();
        STATE.maxVideoSeconds = getMaxVideoSeconds();
        document.querySelectorAll('.eu-dl-btn').forEach(btn => { btn.style.display = STATE.showDownloadButtons ? '' : 'none'; });
        applyHiddenFilter();
        applyAlbumSearch();
        decorateTrackingBadges();
        applyFeedFitMode();
        updateFeedTools();
        if (document.getElementById('eu-tiktok')) {
            if (SETTINGS.feedControlsPinned || SETTINGS.feedControlsAutoHide === false) setFeedControlsVisible(true, false);
            else scheduleFeedControlsHide(900);
        }
    }

    function openSettingsModal() {
        buildSettingsModal();
        syncSettingsModal();
        document.getElementById('eu-settings-modal').classList.add('open');
    }

    function getStatusStats() {
        return {
            albums: document.querySelectorAll('.album').length,
            pageMedia: collectAllMediaUrls().length,
            feedItems: TT.items.length,
            queue: TT.albumQueue.length,
            seen: TRACKING.seenAlbums.size,
            downloaded: TRACKING.downloadedMedia.size,
            favorites: TRACKING.favorites.length,
            failures: DLX.failed.length,
            scope: TT.feedScopeLabel || (SETTINGS.lockFeedToSearch !== false ? 'Search/listing lock' : 'Related expansion')
        };
    }

    function buildStatusPanel() {
        if (document.getElementById('eu-status-modal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'eu-status-modal';
        overlay.className = 'eu-modal-overlay';
        overlay.innerHTML = `
          <div class="eu-modal" style="width:620px;">
            <div class="eu-modal-header">
              <h3>${ICONS.bell}<span>Status / Debug</span></h3>
              <button class="eu-modal-close">${ICONS.close}</button>
            </div>
            <div class="eu-modal-body">
              <div class="eu-status-grid" id="eu-status-grid"></div>
              <div class="eu-zip-preview" id="eu-status-line"></div>
              <div class="eu-smart-actions">
                <button class="eu-btn-primary" id="eu-refresh-now">${ICONS.check}<span>Refresh UI</span></button>
                <button class="eu-btn-secondary" id="eu-export-tracking">Export Tracking</button>
                <button class="eu-btn-secondary" id="eu-clear-seen">Clear Seen</button>
                <button class="eu-btn-secondary" id="eu-clear-downloaded">Clear Downloaded</button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.eu-modal-close').onclick = () => overlay.classList.remove('open');
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
        overlay.querySelector('#eu-refresh-now').onclick = () => { refreshAll(); updateStatusPanel(); toast('UI refreshed', 'success'); };
        overlay.querySelector('#eu-export-tracking').onclick = exportTrackingData;
        overlay.querySelector('#eu-clear-seen').onclick = () => {
            if (!confirm('Clear seen album history?')) return;
            TRACKING.seenAlbums.clear(); saveLimitedSet('eu_seen_albums_v1', TRACKING.seenAlbums); decorateTrackingBadges(); updateStatusPanel();
        };
        overlay.querySelector('#eu-clear-downloaded').onclick = () => {
            if (!confirm('Clear downloaded media/album history?')) return;
            TRACKING.downloadedMedia.clear(); TRACKING.downloadedAlbums.clear();
            saveLimitedSet('eu_downloaded_media_v1', TRACKING.downloadedMedia); saveLimitedSet('eu_downloaded_albums_v1', TRACKING.downloadedAlbums);
            decorateTrackingBadges(); updateStatusPanel();
        };
    }

    function updateStatusPanel() {
        const overlay = document.getElementById('eu-status-modal');
        if (!overlay) return;
        const s = getStatusStats();
        const cards = [
            ['Albums', s.albums], ['Page media', s.pageMedia], ['Feed items', s.feedItems], ['Queue', s.queue],
            ['Seen albums', s.seen], ['Downloaded', s.downloaded], ['Favorites', s.favorites], ['Failures', s.failures]
        ];
        overlay.querySelector('#eu-status-grid').innerHTML = cards.map(([label, val]) => `<div class="eu-status-card"><b>${val}</b><span>${label}</span></div>`).join('');
        overlay.querySelector('#eu-status-line').textContent = `Mode: ${SETTINGS.performanceMode} · Feed: ${SETTINGS.defaultFeedLayout}/${SETTINGS.defaultFeedType} · Scope: ${s.scope} · ${getLengthFilterLabel()} · Page: ${normalizeUrl(location.href)}`;
    }

    function openStatusPanel() {
        buildStatusPanel();
        updateStatusPanel();
        document.getElementById('eu-status-modal').classList.add('open');
    }

    function exportTrackingData() {
        const data = {
            exportedAt: new Date().toISOString(),
            settings: SETTINGS,
            seenAlbums: Array.from(TRACKING.seenAlbums),
            downloadedMedia: Array.from(TRACKING.downloadedMedia),
            downloadedAlbums: Array.from(TRACKING.downloadedAlbums),
            favorites: TRACKING.favorites
        };
        exportTextFile(`Erome_Ultimate_tracking_${Date.now()}.json`, JSON.stringify(data, null, 2));
    }

    function collectDownloadItems(source = 'auto', type = 'all') {
        let items = [];
        const feedOpen = STATE.tiktokMode && TT.items.length > 0;
        if ((source === 'feed') || (source === 'auto' && feedOpen)) {
            items = TT.items.map((item, idx) => ({
                url: item.url,
                kind: item.kind,
                albumUrl: item.albumUrl || '',
                title: item.title || `Feed_${idx + 1}`,
                index: idx + 1
            }));
        } else {
            items = collectAllMediaUrls().map((url, idx) => ({
                url,
                kind: isImageUrl(url) ? 'image' : 'video',
                albumUrl: currentAlbumUrl(),
                title: getPageTitle(),
                index: idx + 1
            }));
        }
        if (type === 'images') items = items.filter(i => i.kind === 'image' || isImageUrl(i.url));
        if (type === 'videos') items = items.filter(i => i.kind === 'video' || isVideoUrl(i.url));
        const seen = new Set();
        items = items.filter(i => {
            const clean = normalizeUrl(i.url);
            if (!clean || seen.has(clean)) return false;
            seen.add(clean);
            if (SETTINGS.skipDownloadedInDownloads && TRACKING.downloadedMedia.has(clean)) return false;
            return true;
        });
        return items;
    }

    function buildDownloadManager() {
        if (document.getElementById('eu-dlx-modal')) return;
        const overlay = document.createElement('div');
        overlay.id = 'eu-dlx-modal';
        overlay.className = 'eu-modal-overlay';
        overlay.innerHTML = `
          <div class="eu-modal" style="width:620px;">
            <div class="eu-modal-header">
              <h3>${ICONS.download}<span>Smart Download Manager</span></h3>
              <button class="eu-modal-close">${ICONS.close}</button>
            </div>
            <div class="eu-modal-body">
              <div class="eu-smart-row">
                <div class="eu-smart-field"><label>Source</label><select id="eu-dlx-source"><option value="auto">Auto/current feed</option><option value="page">Current page</option><option value="feed">Loaded feed queue</option></select></div>
                <div class="eu-smart-field"><label>Media Type</label><select id="eu-dlx-type"><option value="all">All</option><option value="images">Images</option><option value="videos">Videos</option></select></div>
              </div>
              <div class="eu-option-group">
                <div class="eu-option-title">Options</div>
                <div class="eu-smart-checks">
                  <label class="eu-smart-check"><input id="eu-dlx-zip" type="checkbox" checked> Package as ZIP</label>
                  <label class="eu-smart-check"><input id="eu-dlx-folders" type="checkbox"> Folder by album/title</label>
                  <label class="eu-smart-check"><input id="eu-dlx-skip" type="checkbox"> Skip downloaded</label>
                  <label class="eu-smart-check"><input id="eu-dlx-retry" type="checkbox"> Retry failures</label>
                </div>
              </div>
              <div class="eu-zip-preview" id="eu-dlx-stats">Scanning…</div>
              <div class="eu-smart-actions">
                <button class="eu-btn-primary" id="eu-dlx-start">${ICONS.download}<span>Start</span></button>
                <button class="eu-btn-secondary" id="eu-dlx-cancel">Cancel</button>
              </div>
              <div class="eu-progress-box">
                <div class="eu-progress-bar"><div class="eu-progress-fill" id="eu-dlx-fill"></div></div>
                <div class="eu-progress-text" id="eu-dlx-text">Ready</div>
              </div>
              <div class="eu-dlx-log" id="eu-dlx-log">No downloads started.</div>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.eu-modal-close').onclick = () => overlay.classList.remove('open');
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
        ['#eu-dlx-source', '#eu-dlx-type', '#eu-dlx-skip'].forEach(sel => overlay.querySelector(sel).addEventListener('change', updateDownloadManagerStats));
        overlay.querySelector('#eu-dlx-folders').checked = SETTINGS.zipFolders !== false;
        overlay.querySelector('#eu-dlx-skip').checked = !!SETTINGS.skipDownloadedInDownloads;
        overlay.querySelector('#eu-dlx-retry').checked = SETTINGS.retryDownloads !== false;
        overlay.querySelector('#eu-dlx-start').onclick = runDownloadManager;
        overlay.querySelector('#eu-dlx-cancel').onclick = () => { DLX.cancel = true; toast('Download cancel requested', 'warning'); };
    }

    function updateDownloadManagerStats() {
        const overlay = document.getElementById('eu-dlx-modal');
        if (!overlay) return;
        const oldSkip = SETTINGS.skipDownloadedInDownloads;
        SETTINGS.skipDownloadedInDownloads = overlay.querySelector('#eu-dlx-skip').checked;
        const items = collectDownloadItems(overlay.querySelector('#eu-dlx-source').value, overlay.querySelector('#eu-dlx-type').value);
        SETTINGS.skipDownloadedInDownloads = oldSkip;
        const imgs = items.filter(i => i.kind === 'image' || isImageUrl(i.url)).length;
        const vids = items.filter(i => i.kind === 'video' || isVideoUrl(i.url)).length;
        overlay.querySelector('#eu-dlx-stats').textContent = `Ready: ${items.length} items (${imgs} images, ${vids} videos). Feed loaded: ${TT.items.length}. Queue: ${TT.albumQueue.length}.`;
    }

    function openDownloadManager() {
        buildDownloadManager();
        updateDownloadManagerStats();
        document.getElementById('eu-dlx-modal').classList.add('open');
    }

    async function runDownloadManager() {
        if (DLX.running || STATE.downloadInProgress) { toast('A download is already running', 'warning'); return; }
        const overlay = document.getElementById('eu-dlx-modal');
        const source = overlay.querySelector('#eu-dlx-source').value;
        const type = overlay.querySelector('#eu-dlx-type').value;
        const asZip = overlay.querySelector('#eu-dlx-zip').checked;
        updateSetting('zipFolders', overlay.querySelector('#eu-dlx-folders').checked);
        updateSetting('skipDownloadedInDownloads', overlay.querySelector('#eu-dlx-skip').checked);
        updateSetting('retryDownloads', overlay.querySelector('#eu-dlx-retry').checked);
        const items = collectDownloadItems(source, type);
        const fill = overlay.querySelector('#eu-dlx-fill');
        const text = overlay.querySelector('#eu-dlx-text');
        const log = overlay.querySelector('#eu-dlx-log');
        if (!items.length) { toast('No downloadable items found', 'error'); return; }

        DLX.running = true; DLX.cancel = false; DLX.done = 0; DLX.ok = 0; DLX.total = items.length; DLX.failed = [];
        STATE.downloadInProgress = true;
        fill.style.width = '0%'; log.textContent = '';

        const addLog = line => { log.textContent += line + '\n'; log.scrollTop = log.scrollHeight; };
        try {
            if (asZip && typeof JSZip !== 'undefined') {
                const zip = new JSZip();
                for (let i = 0; i < items.length; i++) {
                    if (DLX.cancel) break;
                    const item = items[i];
                    const base = `${String(i + 1).padStart(4, '0')}_${getFilename(item.url)}`;
                    const folder = SETTINGS.zipFolders ? sanitize(item.title || getPageTitle()) + '/' : '';
                    text.textContent = `Downloading ${i + 1}/${items.length}: ${base}`;
                    fill.style.width = `${(i / items.length) * 100}%`;
                    try {
                        const blob = await downloadBlobWithRetry(item.url, SETTINGS.retryDownloads ? 2 : 1);
                        zip.file(folder + base, await blob.arrayBuffer());
                        markDownloadedMedia(item.url, item.albumUrl);
                        DLX.ok++;
                        addLog(`OK  ${base}`);
                    } catch (e) {
                        DLX.failed.push({ url: item.url, error: String(e) });
                        addLog(`ERR ${base} — ${e}`);
                    }
                    DLX.done++;
                }
                if (DLX.failed.length) {
                    zip.file('FAILED_DOWNLOADS.txt', DLX.failed.map(f => `${f.url}\n${f.error}\n`).join('\n'));
                }
                text.textContent = 'Generating ZIP…';
                const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }, meta => {
                    fill.style.width = `${meta.percent}%`;
                    text.textContent = `Compressing: ${Math.round(meta.percent)}%`;
                });
                if (!DLX.cancel) {
                    if (typeof saveAs === 'function') saveAs(zipBlob, generateZipName());
                    else {
                        const u = URL.createObjectURL(zipBlob);
                        const a = document.createElement('a');
                        a.href = u; a.download = generateZipName(); a.style.display = 'none';
                        document.body.appendChild(a); a.click(); a.remove();
                        setTimeout(() => URL.revokeObjectURL(u), 5000);
                    }
                }
            } else {
                for (let i = 0; i < items.length; i++) {
                    if (DLX.cancel) break;
                    const item = items[i];
                    const name = `${String(i + 1).padStart(4, '0')}_${getFilename(item.url)}`;
                    text.textContent = `Downloading ${i + 1}/${items.length}: ${name}`;
                    fill.style.width = `${(i / items.length) * 100}%`;
                    try {
                        const blob = await downloadBlobWithRetry(item.url, SETTINGS.retryDownloads ? 2 : 1);
                        const u = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = u; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
                        setTimeout(() => URL.revokeObjectURL(u), 5000);
                        markDownloadedMedia(item.url, item.albumUrl);
                        DLX.ok++;
                        addLog(`OK  ${name}`);
                    } catch (e) {
                        DLX.failed.push({ url: item.url, error: String(e) });
                        addLog(`ERR ${name} — ${e}`);
                    }
                    DLX.done++;
                    await new Promise(r => setTimeout(r, SETTINGS.performanceMode === 'aggressive' ? 120 : 350));
                }
                if (DLX.failed.length) exportTextFile(`FAILED_DOWNLOADS_${Date.now()}.txt`, DLX.failed.map(f => `${f.url}\n${f.error}\n`).join('\n'));
            }
            fill.style.width = '100%';
            text.textContent = DLX.cancel ? `Canceled (${DLX.ok}/${items.length})` : `Complete (${DLX.ok}/${items.length})`;
            toast(text.textContent, DLX.cancel ? 'warning' : 'success');
        } catch (e) {
            console.error('[EU] Download manager failed:', e);
            toast('Download manager error', 'error');
        } finally {
            DLX.running = false; STATE.downloadInProgress = false;
            decorateTrackingBadges(); updateDownloadManagerStats(); updateStatusPanel();
        }
    }

    function buildHubMenu(id, iconKey, items, title = '') {
        if (document.getElementById(id)) return null;
        const hub = document.createElement('div');
        hub.id = id;
        hub.className = 'eu-hub';
        hub.innerHTML = `
          <div class="eu-hub-btn" title="${title}">${ICONS[iconKey] || ICONS.settings}</div>
          <ul class="eu-hub-menu"></ul>`;
        const menu = hub.querySelector('.eu-hub-menu');
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'eu-hub-item';
            li.innerHTML = `${ICONS[item.icon] || ICONS.settings}<span>${item.label}</span>`;
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                item.action?.();
                hub.classList.remove('open');
            });
            menu.appendChild(li);
        });

        hub.querySelector('.eu-hub-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.eu-hub.open').forEach(h => { if (h !== hub) h.classList.remove('open'); });
            hub.classList.toggle('open');
        });

        return hub;
    }

    function installHubs() {
        const navToggle = document.querySelector('.navbar-toggle');
        if (!navToggle) return;
        const target = navToggle.parentNode;
        const ref = navToggle.nextSibling;

        // Privacy hub
        const privacyItems = [
            { label: 'Settings', icon: 'settings', action: openSettingsModal },
            { label: 'Status / Debug', icon: 'bell', action: openStatusPanel },
            { label: 'Smart Download Manager', icon: 'download', action: openDownloadManager },
            { label: 'Toggle NSFW Blur', icon: 'eye', action: toggleNSFW },
            { label: 'Toggle Hidden Filter', icon: 'clock', action: () => {
                const s = document.querySelector('.eu-hidden-slider');
                if (s) s.classList.toggle('visible');
                toast('Hidden filter ' + (s?.classList.contains('visible') ? 'on' : 'off'), 'info');
            } }
        ];
        const privacyHub = buildHubMenu('eu-privacy-hub', 'eye', privacyItems, 'Privacy');
        if (privacyHub) target.insertBefore(privacyHub, ref);

        // View hub (listing pages)
        if (!IS_ALBUM_PAGE) {
            const viewItems = [
                { label: 'Desktop Feed — All', icon: 'cinema', action: () => openDesktopFeed('all') },
                { label: 'Desktop Feed — Videos', icon: 'video', action: () => openDesktopFeed('videos') },
                { label: 'Desktop Feed — Photos', icon: 'photo', action: () => openDesktopFeed('photos') },
                { label: 'Search Loaded Albums', icon: 'eye', action: openAlbumSearch },
                { label: SETTINGS.lockFeedToSearch !== false ? 'Feed Search Lock: On' : 'Feed Search Lock: Off', icon: 'eye', action: () => { updateSetting('lockFeedToSearch', !(SETTINGS.lockFeedToSearch !== false)); toast(SETTINGS.lockFeedToSearch !== false ? 'Feed locked to current search/listing' : 'Feed can expand into related albums', 'info'); } },
                { label: SETTINGS.hideSeen ? 'Show Seen Albums' : 'Hide Seen Albums', icon: 'eye', action: () => { updateSetting('hideSeen', !SETTINGS.hideSeen); decorateTrackingBadges(); toast(SETTINGS.hideSeen ? 'Seen albums hidden' : 'Seen albums shown', 'info'); } },
                { label: SETTINGS.hideDownloaded ? 'Show Downloaded Albums' : 'Hide Downloaded Albums', icon: 'download', action: () => { updateSetting('hideDownloaded', !SETTINGS.hideDownloaded); decorateTrackingBadges(); toast(SETTINGS.hideDownloaded ? 'Downloaded albums hidden' : 'Downloaded albums shown', 'info'); } },
                { label: 'Sort by Views', icon: 'sort', action: () => sortAlbums('views') },
                { label: 'Sort by Video Count', icon: 'video', action: () => sortAlbums('videos') },
                { label: 'Sort by Photo Count', icon: 'photo', action: () => sortAlbums('photos') },
                { label: 'Toggle Sort Direction', icon: 'sort', action: () => {
                    STATE.sortAscending = !STATE.sortAscending;
                    sortAlbums(STATE.sortMode);
                } },
                { label: 'Video-Only Albums', icon: 'video', action: toggleVideoOnly }
            ];
            const viewHub = buildHubMenu('eu-view-hub', 'sort', viewItems, 'View & Sort');
            if (viewHub) target.insertBefore(viewHub, ref);
        }

        // Album hub (album pages)
        if (IS_ALBUM_PAGE) {
            const albumItems = [
                { label: 'TikTok Mode — Videos', icon: 'video', action: () => openTikTok('videos', 'phone') },
                { label: 'TikTok Mode — Photos', icon: 'photo', action: () => openTikTok('photos', 'phone') },
                { label: 'TikTok Mode — All', icon: 'cinema', action: () => openTikTok('all', 'phone') },
                { label: 'Desktop Feed — All', icon: 'cinema', action: () => openDesktopFeed('all') },
                { label: 'Desktop Feed — Videos', icon: 'video', action: () => openDesktopFeed('videos') },
                { label: 'Desktop Feed — Photos', icon: 'photo', action: () => openDesktopFeed('photos') },
                { label: SETTINGS.allowRelatedAlbumExpansion !== false ? 'Album Next Loading: On' : 'Album Next Loading: Off', icon: 'eye', action: () => { updateSetting('allowRelatedAlbumExpansion', !(SETTINGS.allowRelatedAlbumExpansion !== false)); toast(SETTINGS.allowRelatedAlbumExpansion !== false ? 'Album feed will load next albums' : 'Album feed limited to current album', 'info'); } },
                { label: 'Bulk Download…', icon: 'download', action: openBulkModal },
                { label: 'Smart Download Manager', icon: 'download', action: openDownloadManager },
                { label: 'Toggle Download Buttons', icon: 'upload', action: toggleDownloadButtons },
                { label: 'Toggle Photos', icon: 'photo', action: togglePhotos },
                { label: 'Toggle Videos', icon: 'video', action: toggleVideos },
                { label: 'Cinema Mode', icon: 'cinema', action: toggleCinema }
            ];
            const albumHub = buildHubMenu('eu-album-hub', 'settings', albumItems, 'Album Tools');
            if (albumHub) target.insertBefore(albumHub, ref);
        }

        // Close hubs on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.eu-hub.open').forEach(h => h.classList.remove('open'));
        });
    }

    /* ============================================================
     *  DISCLAIMER / ACCOUNT BYPASS
     * ============================================================ */
    function bypass() {
        const disc = document.getElementById('disclaimer');
        if (disc) {
            disc.remove();
            document.body.style.overflow = 'visible';
            try {
                if (typeof $ !== 'undefined') $.ajax({ type: 'POST', url: '/user/disclaimer', async: true });
                else fetch('/user/disclaimer', { method: 'POST' });
            } catch (e) {}
        }
        const needAcc = document.getElementById('needAccount');
        if (needAcc) needAcc.remove();
    }

    /* ============================================================
     *  INFINITE SCROLL (listing pages)
     * ============================================================ */
    function installInfiniteScroll() {
        if (IS_ALBUM_PAGE) return;
        if (!document.querySelector('.pagination')) return;

        const container = document.querySelector('#albums') ||
            document.querySelector('.user-albums') ||
            document.querySelector('.albums') ||
            document.querySelector('.page-content');
        if (!container) return;

        const url = new URL(window.location.href);
        const currentPage = parseInt(url.searchParams.get('page'), 10) || 1;
        let nextPage = currentPage + 1;
        let loading = false;
        let stopped = false;
        let emptyHits = 0;

        const albumKey = (album, baseUrl = location.href) => {
            const link = album.querySelector('a.album-link, a[href*="/a/"]');
            const href = link?.getAttribute('href') || link?.href;
            return href ? new URL(href, baseUrl).href : album.textContent.replace(/\s+/g, ' ').trim().slice(0, 200);
        };

        const seenAlbums = new Set(Array.from(document.querySelectorAll('.album')).map(a => albumKey(a)));

        const nextPageUrl = () => {
            url.searchParams.set('page', nextPage);
            return url.href;
        };

        async function loadNextPage() {
            if (loading || stopped) return;
            loading = true;

            const pageUrl = nextPageUrl();
            try {
                const res = await fetch(pageUrl, { credentials: 'include' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const albums = Array.from(doc.querySelectorAll('.album'));
                let added = 0;

                for (const album of albums) {
                    const key = albumKey(album, pageUrl);
                    if (!key || seenAlbums.has(key)) continue;
                    seenAlbums.add(key);
                    container.appendChild(document.importNode(album, true));
                    added++;
                }

                nextPage++;

                if (added === 0) emptyHits++;
                else emptyHits = 0;

                refreshAll();
                decorateTrackingBadges();
                applyAlbumSearch();
                if (SETTINGS.performanceMode !== 'lite') loadAlbumLikes();

                if (emptyHits >= 2) {
                    stopped = true;
                    window.removeEventListener('scroll', onScroll);
                    toast('Unlimited loading complete — no more new albums found', 'info', 3000);
                }
            } catch (e) {
                stopped = true;
                window.removeEventListener('scroll', onScroll);
                console.warn('[EU] Unlimited scroll stopped:', e);
                toast('Unlimited loading stopped — no more pages found', 'info', 3000);
            } finally {
                loading = false;
            }
        }

        function onScroll() {
            const docEl = document.documentElement;
            const nearBottom = window.innerHeight + window.scrollY >= docEl.scrollHeight - 1200;
            if (nearBottom) loadNextPage();
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ============================================================
     *  PERIODIC REFRESH — runs all decorators
     * ============================================================ */
    function refreshAll() {
        attachDownloadButtons();
        decorateAlbumCounts();
        decorateVideoDurations();
        applyNSFW();
        applyVideoOnly();
        applyHiddenFilter();
        decorateTrackingBadges();
        applyAlbumSearch();
        updateFabBadge();
        enhancePlayers();
    }

    /* ============================================================
     *  INITIALIZATION
     * ============================================================ */
    function init() {
        console.log(`[${CONFIG.brand}] v${CONFIG.version} initializing…`);

        bypass();
        installHubs();
        buildFAB();
        createHiddenSlider();
        if (IS_ALBUM_PAGE) markSeenAlbum(location.href);
        refreshAll();
        if (SETTINGS.performanceMode !== 'lite') loadAlbumLikes();
        installInfiniteScroll();
        applySettingsNow();

        // Periodic refresh for dynamic content; Lite mode scans less often.
        const refreshMs = SETTINGS.performanceMode === 'lite' ? 6500 : (SETTINGS.performanceMode === 'aggressive' ? 1200 : 3000);
        setInterval(() => { if (!document.hidden || SETTINGS.performanceMode !== 'lite') refreshAll(); }, refreshMs);

        // MutationObserver for real-time updates
        const mo = new MutationObserver(() => {
            clearTimeout(window._euDebounce);
            const delay = SETTINGS.performanceMode === 'lite' ? 900 : 300;
            window._euDebounce = setTimeout(refreshAll, delay);
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // Welcome toast
        setTimeout(() => {
            const n = collectAllMediaUrls().length;
            toast(`${CONFIG.brand} ready — ${n} media items detected`, 'success', 3500);
        }, 1200);

        console.log(`[${CONFIG.brand}] ready`);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', () => { setTimeout(refreshAll, 1000); });

    // Expose API for debugging
    window.eromeUltimate = {
        state: STATE,
        config: CONFIG,
        collectAllMediaUrls,
        openBulkModal,
        openTikTok,
        openDesktopFeed,
        openSettingsModal,
        openStatusPanel,
        openDownloadManager,
        tracking: TRACKING,
        settings: SETTINGS,
        toast,
        refreshAll,
        resetFeedScope,
        buildNextAlbumQueue
    };
})();
