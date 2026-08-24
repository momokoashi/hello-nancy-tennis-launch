/* ==========================================================================
   Grand Slam v2 — stronger tennis vibe, video hero, almost no copy.

   Loads AFTER tennis-collection.js (both are `defer`, so order is preserved).
   v1 builds the page; this file replaces the hero still with a full-bleed
   video and lets the footage carry the mood instead of headline copy.

   Division of labour with tennis-v2.css:
     * anything that HIDES existing copy lives in the CSS. v1 keeps a
       MutationObserver on the product grid and re-dresses cards when the theme
       re-renders, so JS that removed text would get undone. CSS always wins.
     * this file only builds the video, which nothing else touches.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    // Ordered by preference. The first source that loads is used, so a missing
    // or still-rendering file simply falls through to the next one, and the
    // poster still shows if none of them load.
    sources: [
      'assets/img/tennis/hero-court.mp4',
      'assets/img/tennis/hero-clay.mp4'
    ],
    // Shown before the video plays and if every source fails — the banner
    // still, so the hero is never an empty black box.
    poster: 'assets/img/tennis/banner.jpg',

    // Deliberately tiny. The whole point of v2 is that the film does the work.
    // The collection name is the big type; the brand line sits under it.
    eyebrow: 'Limited edition · 500 only',
    line: 'Tennis Collection',
    tagline: 'Game. Set. O.',
    // No CTA: this hero sits ON the collection page, so "shop the collection"
    // would link to the page the reader is already on. Set `cta` to bring the
    // button back if this hero is ever reused elsewhere.
    cta: null
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  function buildVideoHero() {
    var hero = document.querySelector('.collection-hero-section');
    if (!hero || hero.querySelector('.gs-v2-hero')) return;

    hero.classList.add('gs-v2');

    var stage = document.createElement('div');
    stage.className = 'gs-v2-hero';

    var vid = document.createElement('video');
    vid.className = 'gs-v2-hero__video';
    // These four attributes together are what makes a hero video autoplay on
    // mobile Safari and Chrome. Drop any one of them and it silently refuses.
    vid.muted = true;
    vid.defaultMuted = true;      // needed before the element is in the DOM
    vid.autoplay = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.setAttribute('muted', '');
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.preload = 'auto';
    vid.poster = CONFIG.poster;

    CONFIG.sources.forEach(function (src) {
      var s = document.createElement('source');
      s.src = src;
      s.type = 'video/mp4';
      vid.appendChild(s);
    });

    // If every source 404s the element stays on its poster; mark it so the CSS
    // can stop reserving space for controls.
    vid.addEventListener('error', function () {
      stage.classList.add('is-poster-only');
    }, true);

    var overlay = document.createElement('div');
    overlay.className = 'gs-v2-hero__overlay';
    overlay.innerHTML =
      '<span class="gs-v2-hero__eyebrow"></span>' +
      '<h1 class="gs-v2-hero__line"></h1>' +
      (CONFIG.tagline ? '<p class="gs-v2-hero__tagline"></p>' : '') +
      (CONFIG.cta ? '<a class="gs-v2-hero__cta"></a>' : '');
    overlay.querySelector('.gs-v2-hero__eyebrow').textContent = CONFIG.eyebrow;
    overlay.querySelector('.gs-v2-hero__line').textContent = CONFIG.line;
    if (CONFIG.tagline) {
      overlay.querySelector('.gs-v2-hero__tagline').textContent = CONFIG.tagline;
    }
    if (CONFIG.cta) {
      var cta = overlay.querySelector('.gs-v2-hero__cta');
      cta.textContent = CONFIG.cta.label;
      cta.href = CONFIG.cta.href;
    }

    stage.appendChild(vid);
    stage.appendChild(overlay);

    // Mount as the hero section's first child, ahead of the parallax block the
    // CSS hides, so the video occupies the band on its own.
    hero.insertBefore(stage, hero.firstChild);

    // Some browsers ignore the autoplay attribute until a play() call.
    var p = vid.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { stage.classList.add('is-paused'); });
    }
  }

  // Give the grid an anchor so the hero CTA can scroll to the products.
  function anchorGrid() {
    var list = document.querySelector('product-list');
    if (list && !document.getElementById('gs-shop')) {
      var a = document.createElement('span');
      a.id = 'gs-shop';
      list.parentNode.insertBefore(a, list);
    }
  }

  ready(function () {
    // Scopes every "strip the copy" rule in tennis-v2.css to this page only,
    // so v1 keeps its full copy for side-by-side comparison.
    document.body.classList.add('gs-v2-page');
    buildVideoHero();
    anchorGrid();
  });
})();
