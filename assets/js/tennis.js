/* ==========================================================================
   Grand Slam — interactive layer for the tennis-launch homepage.

   Everything here is DOM surgery applied on top of the mirrored Shopify page,
   rather than edits to the 1.1MB of markup. Two reasons:
     * the theme lazy-loads and re-renders, so declarative patches get clobbered
     * deleting this one <script> tag reverts the page completely

   EDIT THE CONFIG BLOCK BELOW — copy, prices, links and image paths all live
   there, so you should never need to touch the logic underneath it.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- CONFIG -- */
  var CONFIG = {

    // Announcement bar — rotates through these, in order.
    // Slot B is ALLOCATION scarcity, not permanent scarcity: there will be
    // more stock later, so it must never say "never again" or "no restock".
    // "500 on this drop, first come first served" is the true claim.
    announcements: [
      'Grand Slam Sale 🎾 Final minutes to save up to 50% off on last few items ' +
      '🎾 No coupon needed.',
      'NEW: Tennis Collection 🎾500 Only. First come, first served.'
    ],
    announcementDelay: 5000,

    // Hero slideshow — a deliberate sequence, not a grab-bag:
    // three tennis campaign shots, then two of the usual range.
    //
    // `pos` is the CSS object-position for that slide. Slides 1-3 are PORTRAIT
    // campaign shots dropping into a WIDE hero, so they centre-crop hard;
    // nudging the focal point up keeps the product and the model's hands in
    // frame. Tune these numbers per slide if a crop looks off.
    heroSlides: [
      { src: 'assets/img/tennis/hero-1.jpg', pos: 'center 38%',
        alt: 'SMASH wand vibrator on the pink court' },
      { src: 'assets/img/tennis/hero-2.jpg', pos: 'center 45%',
        alt: 'ACE in both colourways, racquet and sneakers courtside' },
      { src: 'assets/img/tennis/hero-3.jpg', pos: 'center 45%',
        alt: 'ACE massagers in a basket of tennis balls' },
      { src: 'assets/img/tennis/hero-4.jpg', pos: 'center center',
        alt: 'Lem, Berri and Avo on white linen' },
      { src: 'assets/img/tennis/hero-5.jpg', pos: 'center center',
        alt: 'The Hello Nancy range' }
    ],
    heroDelay: 4500,

    // The split CTA that replaces the single hero button.
    // Tennis carries the deep green and is the highlighted action: it is the
    // campaign the traffic is being bought for.
    // /collections/tennis was a guess and 404s on the live store. The real
    // handle, confirmed from collections.json, is below.
    heroButtons: [
      { label: 'Shop Bestsellers', href: '/collections/best-sellers', style: 'secondary' },
      { label: 'Shop Tennis Collection',
        href: '/collections/tennis-collection-limited-edition', style: 'tennis' }
    ],

    // Line-up cards: EMPTY on purpose. The best-sellers grid keeps all four
    // original products (Lem / Tutti Frutti / Avo / Berri) exactly as they
    // are. ACE and SMASH get their own band instead — see tennisCollection.
    // The swap mechanism below still works if a card ever needs overriding:
    //   'handle': { title, desc, price, compare, save, image, limited }
    cards: {},

    limitedLabel: 'LIMITED EDITION',

    /* ---------------------------------------------------------------------
       TENNIS COLLECTION band — injected directly after the best-sellers grid.

       Four layouts are built; switch with `variant` below, or use the picker
       that appears bottom-right when previewing on localhost.
         'duo'       two equal lifestyle cards, overlaid copy + Shop Now
         'editorial' full-bleed image left, copy panel right
         'banner'    wide hero strip, then two compact shoppable cards
         'diptych'   two images bridged by a centred title plate
       --------------------------------------------------------------------- */
    tennisCollection: {
      variant: 'duo',
      eyebrow: 'LIMITED EDITION · 500 ONLY',
      heading: 'Tennis Collection',
      sub: 'Two new ways to play. Built for the court, made for your nightstand.',
      collectionHref: '/collections/tennis-collection-limited-edition',
      // SMASH first, ACE second (Momo, 2026-08-24).
      products: [
        {
          name: 'SMASH',
          kicker: 'Wand Vibrator',
          line: 'Deep, rumbly power with a flexible head.',
          price: '$129', compare: '$229',
          href: '/products/smash-wand-vibrator',
          image: 'assets/img/tennis/collection-smash.jpg'
        },
        {
          name: 'ACE',
          kicker: 'Air Suction Massager',
          line: 'Air-pulse pleasure with no learning curve.',
          price: '$99', compare: '$199',
          href: '/products/ace-air-suction-massager',
          image: 'assets/img/tennis/collection-ace.jpg'
        }
      ],
      wideImage: 'assets/img/tennis/collection-wide.jpg'
    }
  };

  /* -------------------------------------------------------------- utils -- */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // The theme runs lazysizes: it swaps data-src into src on its own schedule
  // and would undo a naive src assignment. Clear every source attribute and
  // strip the lazy classes so our image is final.
  function forceImage(img, src, alt) {
    ['srcset', 'data-srcset', 'data-src', 'data-sizes', 'sizes'].forEach(function (a) {
      img.removeAttribute(a);
    });
    img.className = img.className
      .replace(/\b(lazyload|lazyloading|lazyloaded|lazyautosizes|ls-is-cached|blur-up)\b/g, '')
      .trim();
    img.setAttribute('loading', 'eager');
    img.src = src;
    if (alt) img.alt = alt;
  }

  /* ----------------------------------------------- 1. announcement bar --- */
  function buildAnnouncementRotator() {
    var bar = document.querySelector('.shopify-section--announcement-bar');
    if (!bar || CONFIG.announcements.length === 0) return;

    // Reuse the theme's own bar element so its sticky positioning, height
    // observer and colour tokens all keep working; only the text rotates.
    var host = bar.querySelector('.announcement-bar') || bar;

    var rotator = document.createElement('div');
    rotator.className = 'gs-ann';
    CONFIG.announcements.forEach(function (text, i) {
      var slide = document.createElement('div');
      slide.className = 'gs-ann__slide' + (i === 0 ? ' is-active' : '');
      slide.innerHTML = text;
      rotator.appendChild(slide);
    });

    // Hide whatever the theme rendered, then mount ours in the same box.
    Array.prototype.forEach.call(host.children, function (c) { c.style.display = 'none'; });
    host.appendChild(rotator);

    var slides = rotator.querySelectorAll('.gs-ann__slide');
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, CONFIG.announcementDelay);
  }

  /* ------------------------------------------------------ 2. hero media -- */
  function buildHeroSlideshow() {
    var hero = document.querySelector('[id*="g_video_hero"]');
    if (!hero) return;

    var video = hero.querySelector('video');
    if (!video) return;

    // Mount the slideshow in the video's own slot so the hero keeps exactly
    // the height and crop it has today.
    var slot = video.parentElement;
    var box = document.createElement('div');
    box.className = 'gs-hero';

    CONFIG.heroSlides.forEach(function (s, i) {
      var img = document.createElement('img');
      img.className = 'gs-hero__slide' + (i === 0 ? ' is-active' : '');
      img.src = s.src;
      img.alt = s.alt || '';
      img.loading = i === 0 ? 'eager' : 'lazy';
      if (s.pos) img.style.objectPosition = s.pos;
      // A missing file must not leave a blank slide in the rotation: hide it
      // and drop it from the sequence so the hero only cycles real images.
      img.onerror = function () {
        img.classList.add('is-missing');
        img.dataset.missing = '1';
      };
      box.appendChild(img);
    });

    var dots = document.createElement('div');
    dots.className = 'gs-hero__dots';
    CONFIG.heroSlides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'gs-hero__dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', function () { show(i); });
      dots.appendChild(d);
    });
    box.appendChild(dots);

    // Stop every hero video: they still hold the old campaign footage.
    hero.querySelectorAll('video').forEach(function (v) {
      try { v.pause(); } catch (e) {}
      v.style.display = 'none';
    });
    slot.appendChild(box);

    var slides = box.querySelectorAll('.gs-hero__slide');
    var dotEls = dots.querySelectorAll('.gs-hero__dot');
    var cur = 0;

    // Step forward past any slide whose file failed to load, so a not-yet-
    // supplied photo never shows as a blank frame. Bounded by slides.length
    // so an all-missing set cannot spin forever.
    function nextReal(from, dir) {
      var n = from;
      for (var tries = 0; tries < slides.length; tries++) {
        n = (n + dir + slides.length) % slides.length;
        if (!slides[n].dataset.missing) return n;
      }
      return from;
    }

    function show(n) {
      var target = (n + slides.length) % slides.length;
      if (slides[target].dataset.missing) target = nextReal(target, 1);
      slides[cur].classList.remove('is-active');
      dotEls[cur].classList.remove('is-active');
      cur = target;
      slides[cur].classList.add('is-active');
      dotEls[cur].classList.add('is-active');
      // Hide dots for slides that will never display.
      for (var i = 0; i < slides.length; i++) {
        dotEls[i].style.display = slides[i].dataset.missing ? 'none' : '';
      }
    }

    var timer = setInterval(function () { show(cur + 1); }, CONFIG.heroDelay);
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
  }

  /* -------------------------------------------------------- 3. hero CTA -- */
  function buildSplitCta() {
    var hero = document.querySelector('[id*="g_video_hero"]');
    if (!hero) return;
    var btn = hero.querySelector('a[href*="/collections/"]');
    if (!btn) return;

    var row = document.createElement('div');
    row.className = 'gs-cta';

    CONFIG.heroButtons.forEach(function (b) {
      // Clone the theme's own button so typography and height match exactly,
      // then restyle via a modifier class rather than re-implementing it.
      var a = btn.cloneNode(true);
      a.href = b.href;
      a.classList.add('gs-cta__btn', 'gs-cta__btn--' + b.style);
      var label = a.querySelector('.js-button-text') || a;
      label.textContent = b.label;
      row.appendChild(a);
    });

    btn.parentNode.insertBefore(row, btn);
    btn.style.display = 'none';
  }

  /* ----------------------------------------------------- 4. line-up cards */
  function restyleCards() {
    var items = document.querySelectorAll('.ACC_HN_Home_23-product-item');
    if (!items.length) return;

    Array.prototype.forEach.call(items, function (item) {
      var spec = CONFIG.cards[item.dataset.productHandle];
      if (!spec) return;                       // cards 1 and 2 stay untouched

      var info = item.querySelector('.ACC_HN_Home_23-product-info');
      if (info) {
        var titleEl = info.querySelector('a');
        if (titleEl) titleEl.textContent = spec.title;

        var descEl = info.querySelector('.ACC_HN_Home_23-product-short-description');
        if (descEl) descEl.textContent = spec.desc;

        var priceWrap = info.querySelector('.ACC_HN_Home_23-product-price-wrapper');
        if (priceWrap) {
          var spans = priceWrap.querySelectorAll('span');
          if (spans[0]) spans[0].textContent = spec.price;
          var cmp = priceWrap.querySelector('.ACC_HN_Home_23-product-compare-price');
          if (cmp) cmp.textContent = spec.compare;
        }
      }

      // The "Save $X" flash is rendered from the theme's own product data, so
      // it has to be restated whenever we override the prices above.
      if (spec.save) {
        var flash = Array.prototype.filter.call(
          item.querySelectorAll('*'),
          function (e) { return e.children.length === 0 && /^save\s*\$/i.test(e.textContent.trim()); }
        )[0];
        if (flash) flash.textContent = spec.save;
      }

      var img = item.querySelector('.ACC_HN_Home_23-product-image');
      if (img && spec.image) forceImage(img, spec.image, spec.title);

      if (spec.limited) {
        var wrap = item.querySelector('.ACC_HN_Home_23-product-image-wrapper') || item;
        if (!wrap.querySelector('.gs-limited')) {
          wrap.classList.add('gs-has-limited');
          var flag = document.createElement('span');
          flag.className = 'gs-limited';
          flag.textContent = CONFIG.limitedLabel;
          wrap.appendChild(flag);
        }
      }
    });
  }

  /* ------------------------------------------- 5. TENNIS COLLECTION band -- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function priceHTML(p) {
    return '<span class="gs-tc__price">' + esc(p.price) + '</span>' +
           '<span class="gs-tc__was">' + esc(p.compare) + '</span>';
  }

  // Each renderer returns the inner markup for one layout.
  var LAYOUTS = {
    // Two equal lifestyle cards, copy overlaid, Shop Now bottom-left.
    duo: function (c) {
      return c.products.map(function (p) {
        return '' +
          '<a class="gs-tc__tile" href="' + esc(p.href) + '">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' +
            '<span class="gs-tc__scrim"></span>' +
            '<span class="gs-tc__body">' +
              '<span class="gs-tc__kicker">' + esc(p.kicker) + '</span>' +
              '<span class="gs-tc__name">' + esc(p.name) + '</span>' +
              '<span class="gs-tc__line">' + esc(p.line) + '</span>' +
              '<span class="gs-tc__btn">Shop Now &rarr;</span>' +
            '</span>' +
          '</a>';
      }).join('');
    },

    // Full-bleed image left, copy panel right.
    editorial: function (c) {
      // Lead with the first product (the campaign shot); list both in order.
      var p = c.products[0], q = c.products[1];
      return '' +
        '<div class="gs-tc__ed">' +
          '<a class="gs-tc__edimg" href="' + esc(p.href) + '">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></a>' +
          '<div class="gs-tc__edpanel">' +
            '<p class="gs-tc__kicker">' + esc(c.eyebrow) + '</p>' +
            '<h3 class="gs-tc__edhead">Advantage: you.</h3>' +
            '<p class="gs-tc__line">' + esc(c.sub) + '</p>' +
            '<ul class="gs-tc__list">' +
              '<li><strong>' + esc(p.name) + '</strong> ' + esc(p.kicker) +
                ' &middot; ' + priceHTML(p) + '</li>' +
              '<li><strong>' + esc(q.name) + '</strong> ' + esc(q.kicker) +
                ' &middot; ' + priceHTML(q) + '</li>' +
            '</ul>' +
            '<a class="gs-tc__cta" href="' + esc(c.collectionHref) + '">Shop the collection</a>' +
          '</div>' +
        '</div>';
    },

    // Wide strip, then two compact shoppable cards.
    banner: function (c) {
      return '' +
        '<a class="gs-tc__banner" href="' + esc(c.collectionHref) + '">' +
          '<img src="' + esc(c.wideImage) + '" alt="' + esc(c.heading) + '">' +
          '<span class="gs-tc__scrim"></span>' +
          '<span class="gs-tc__bannercopy">' +
            '<span class="gs-tc__kicker">' + esc(c.eyebrow) + '</span>' +
            '<span class="gs-tc__name">' + esc(c.heading) + '</span>' +
          '</span>' +
        '</a>' +
        '<div class="gs-tc__row">' +
          c.products.map(function (p) {
            return '' +
              '<a class="gs-tc__card" href="' + esc(p.href) + '">' +
                '<span class="gs-tc__cardimg"><img src="' + esc(p.image) +
                  '" alt="' + esc(p.name) + '">' +
                  '<span class="gs-limited">' + esc(CONFIG.limitedLabel) + '</span></span>' +
                '<span class="gs-tc__cardbody">' +
                  '<span class="gs-tc__name">' + esc(p.name) + '</span>' +
                  '<span class="gs-tc__line">' + esc(p.kicker) + '</span>' +
                  '<span class="gs-tc__prices">' + priceHTML(p) + '</span>' +
                '</span>' +
              '</a>';
          }).join('') +
        '</div>';
    },

    // Two images bridged by a centred title plate.
    diptych: function (c) {
      return '' +
        '<div class="gs-tc__dip">' +
          c.products.map(function (p) {
            return '<a class="gs-tc__diphalf" href="' + esc(p.href) + '">' +
              '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' +
              '<span class="gs-tc__diplabel">' + esc(p.name) +
                ' <em>' + esc(p.price) + '</em></span></a>';
          }).join('') +
          '<div class="gs-tc__plate">' +
            '<span class="gs-tc__kicker">' + esc(c.eyebrow) + '</span>' +
            '<span class="gs-tc__platehead">' + esc(c.heading) + '</span>' +
            '<a class="gs-tc__cta" href="' + esc(c.collectionHref) + '">Shop Now &rarr;</a>' +
          '</div>' +
        '</div>';
    }
  };

  function renderTennisCollection(variant) {
    var c = CONFIG.tennisCollection;
    var host = document.querySelector('.gs-tc');
    if (!host) return;
    host.setAttribute('data-variant', variant);
    var showHead = variant === 'duo' || variant === 'editorial';
    host.innerHTML =
      '<div class="gs-tc__inner">' +
        (showHead && variant === 'duo'
          ? '<div class="gs-tc__head">' +
              '<p class="gs-tc__kicker">' + esc(c.eyebrow) + '</p>' +
              '<h2 class="gs-tc__heading">' + esc(c.heading) + '</h2>' +
              '<p class="gs-tc__sub">' + esc(c.sub) + '</p>' +
            '</div>'
          : '') +
        '<div class="gs-tc__stage">' + LAYOUTS[variant](c) + '</div>' +
      '</div>';
  }

  function buildTennisCollection() {
    var best = document.querySelector('.shopify-section--best-sellers');
    if (!best || document.querySelector('.gs-tc')) return;

    var sec = document.createElement('section');
    sec.className = 'shopify-section gs-tc';
    best.parentNode.insertBefore(sec, best.nextSibling);
    renderTennisCollection(CONFIG.tennisCollection.variant);

    // Local-preview only: a picker so the layouts can be compared in place.
    // Never renders on a real storefront.
    if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    var pick = document.createElement('div');
    pick.className = 'gs-tc__picker';
    pick.innerHTML = '<span>Tennis band layout</span>' +
      Object.keys(LAYOUTS).map(function (k) {
        return '<button type="button" data-v="' + k + '"' +
          (k === CONFIG.tennisCollection.variant ? ' class="is-on"' : '') +
          '>' + k + '</button>';
      }).join('');
    pick.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (!b) return;
      renderTennisCollection(b.dataset.v);
      pick.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      document.querySelector('.gs-tc').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    document.body.appendChild(pick);
  }

  /* --------------------------------------------------------------- boot -- */
  ready(function () {
    buildAnnouncementRotator();
    buildHeroSlideshow();
    buildSplitCta();
    restyleCards();
    buildTennisCollection();

    // The best-sellers grid is re-rendered by the theme's own script after
    // first paint, which would wipe the card edits. Re-apply on mutation.
    var grid = document.querySelector('.ACC_HN_Home_23-products-container');
    if (grid && window.MutationObserver) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; restyleCards(); });
      }).observe(grid, { childList: true, subtree: true });
    }
  });
})();
