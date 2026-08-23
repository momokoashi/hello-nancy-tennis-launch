/* ==========================================================================
   Grand Slam — interactive layer for the tennis collection page.

   DOM surgery over the mirrored Shopify markup, so deleting this one <script>
   reverts the page. Jobs, in order:

     1. hero      — same section, same styling; new copy and new base image
     2. the drop  — Ace, Smash and the Grand Slam Bundle as the first 3 cards
     3. bestsellers — the grid filtered to the nine Momo listed, under a heading
     4. editorial — a wide courtside band before the footer

   IMPORTANT: the three tennis cards are CLONES. An earlier version took over
   Avo's and Berri's cards, which cannot work now — both of those products have
   to appear in the bestsellers grid as themselves.

   All prices, copy and image paths come from the live products (fetched from
   hellonancy.com) and live in CONFIG below.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------- CONFIG -- */
  var CONFIG = {
    hero: {
      src: 'assets/img/tennis/banner.jpg',
      heading: 'Game. Set. Finish.',
      // `subHighlight` renders in ball-yellow so the scarcity number carries
      // over the photograph instead of disappearing into it.
      sub: 'Two new ways to play. Limited edition —',
      subHighlight: '500 units only.'
    },

    /* The review carousel.
       Real customer reviews supplied by Momo. Only the ones listed here are
       shown — every remaining slide in the theme's carousel is hidden, so the
       band never falls back to the old Lem reviews. Add more entries as they
       come in and the carousel controls reappear automatically.

       `stars: true` keeps the 5-star rating visible. Leave it off for anything
       that is brand copy rather than a genuine review — a star rating on a
       tagline reads as a testimonial that nobody actually gave. */
    quotes: [
      {
        text: 'I have never had anything this strong that didn’t leave me numb. ' +
              'Twenty minutes in and it still felt good, not just loud. Completely obsessed.',
        label: '— Marisol D.',
        stars: true
      }
    ],

    // Live product data — titles, prices and imagery all match the real PDPs.
    drop: [
      {
        title: 'Ace Air Suction Massager',
        desc: 'Soft pulses of air where you’re most sensitive. No buzzing, no direct contact.',
        price: '$99.00 USD', compare: '$199.00 USD', badge: 'Save $100.00',
        image: 'assets/img/tennis/ace-0.jpg',
        href: '/products/ace-air-suction-massager',
        limited: true, order: 1
      },
      {
        title: 'Smash Wand Vibrator',
        desc: 'Deep, rumbly vibrations with a flexible head that keeps the power where you want it.',
        price: '$129.00 USD', compare: '$229.00 USD', badge: 'Save $100.00',
        image: 'assets/img/tennis/smash-0.jpg',
        href: '/products/smash-wand-vibrator',
        limited: true, order: 2
      },
      {
        title: 'Grand Slam Bundle',
        desc: 'Ace and Smash, finally playing doubles. One serves, one finishes.',
        price: '$199.00 USD', compare: '$398.00 USD', badge: 'Save $199.00',
        image: 'assets/img/tennis/bundle-0.jpg',
        href: '/products/grand-slam-bundle',
        limited: true, bundle: true, order: 3
      }
    ],

    // The bestsellers grid, in Momo's order. Anything not listed is hidden.
    bestsellers: [
      'lem', 'avo-clitoral-massager', 'tutti-frutti-bundle', 'berri',
      'snack-pack', 'kalii', 'lolly-mini-wand', 'gii-glow', 'lubricant'
    ],
    bestsellersHeading: 'Bestsellers',
    bestsellersSub: 'The ones everyone’s already talking about.',

    dropHeading: 'The Tennis Collection',
    dropKicker: 'New · Limited edition · 500 only',

    // Wide editorial band before the footer.
    editorial: {
      image: 'assets/img/tennis/smash-3.jpg',
      kicker: 'Courtside',
      heading: 'Not every match ends in straight sets.',
      body: 'Two toys, over an hour of runtime each, and a motor that holds its ' +
            'power as the battery drops. Play the long game.',
      // No CTA: this band sits ON the collection page, so "Shop the collection"
      // would point at the page the reader is already on. Set `cta` and `href`
      // to bring the button back if this band is ever reused elsewhere.
      cta: null,
      href: null
    },

    limitedLabel: 'Limited edition',

    // Sections to drop, matched loosely on id so a template-id change does not
    // break them. NOTE: the section whose class is "press" is the CUSTOMER
    // REVIEW carousel, not the logo strip — it stays. The "As seen on" logos
    // are the `instant_` section.
    hideSections: ['instant_', 'experts_say', 'product_table', 'faq_', 'collection_info']
  };

  /* -------------------------------------------------------------- utils -- */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  // The theme serves responsive images. Clearing srcset is not enough when the
  // <img> sits inside a <picture>: a <source> beats img.src outright, so the
  // attribute updates while the browser keeps painting the original.
  function forceImage(img, src, alt) {
    var pic = img.parentElement;
    if (pic && pic.tagName === 'PICTURE') {
      pic.querySelectorAll('source').forEach(function (s) { s.remove(); });
    }
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

  // <sale-price> is "<span class=sr-only>Sale price</span>$99.00 USD" — replace
  // only the visible text node so the screen-reader label survives.
  function setPriceText(el, text) {
    if (!el) return;
    var done = false;
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        if (!done) { n.textContent = text; done = true; }
        else { n.textContent = ''; }
      }
    });
    if (!done) el.appendChild(document.createTextNode(text));
  }

  function handleOf(card) {
    var a = card.querySelector('a[href*="/products/"]');
    return a ? a.getAttribute('href').split('/products/')[1].split(/[?#]/)[0] : '';
  }

  function bandHeading(text, sub, kicker, order) {
    var el = document.createElement('div');
    el.className = 'gs-band-head';
    el.style.order = order;
    el.innerHTML =
      (kicker ? '<span class="gs-band-head__kicker"></span>' : '') +
      '<h2 class="gs-band-head__title"></h2>' +
      (sub ? '<p class="gs-band-head__sub"></p>' : '');
    if (kicker) el.querySelector('.gs-band-head__kicker').textContent = kicker;
    el.querySelector('.gs-band-head__title').textContent = text;
    if (sub) el.querySelector('.gs-band-head__sub').textContent = sub;
    return el;
  }

  function dressCard(card, spec) {
    var titleLink = card.querySelector('.product-card__title a');
    if (titleLink) titleLink.textContent = spec.title;

    var desc = card.querySelector('.product-card__short-description');
    if (desc) desc.textContent = spec.desc;

    setPriceText(card.querySelector('sale-price'), spec.price);
    setPriceText(card.querySelector('compare-at-price'), spec.compare);

    var badge = card.querySelector('on-sale-badge');
    if (badge) badge.textContent = spec.badge;

    var img = card.querySelector('.product-card__figure img');
    if (img && spec.image) forceImage(img, spec.image, spec.title);

    card.querySelectorAll('a[href*="/products/"]').forEach(function (a) {
      a.href = spec.href;
    });

    // The theme's generated .order-N-<id> class wins on specificity; inline beats it.
    card.style.order = spec.order;
    card.style.display = '';

    var fig = card.querySelector('.product-card__figure') || card;
    var old = fig.querySelector('.gs-limited');
    if (old) old.remove();
    if (spec.limited) {
      fig.classList.add('gs-has-limited');
      var flag = document.createElement('span');
      flag.className = 'gs-limited';
      flag.textContent = CONFIG.limitedLabel;
      fig.appendChild(flag);
    }
    card.classList.toggle('gs-bundle-card', !!spec.bundle);
    card.classList.toggle('gs-tennis-card', !spec.bundle);
  }

  /* ------------------------------------------------------------ 1. hero -- */
  function buildHero() {
    var hero = document.querySelector('.collection-hero-section');
    if (!hero) return;

    var h = hero.querySelector('h1, h2, [class*="title"]');
    if (h) h.textContent = CONFIG.hero.heading;

    // This hero has no subtitle slot of its own — querySelector('p') finds
    // nothing, so the scarcity line silently went nowhere. Create one under the
    // heading instead, and reuse it on re-runs.
    if (h && CONFIG.hero.sub) {
      var sub = hero.querySelector('.gs-hero-sub');
      if (!sub) {
        sub = document.createElement('p');
        sub.className = 'gs-hero-sub';
        h.parentNode.insertBefore(sub, h.nextSibling);
      }
      sub.textContent = CONFIG.hero.sub;
      if (CONFIG.hero.subHighlight) {
        var em = document.createElement('strong');
        em.className = 'gs-hero-sub__count';
        em.textContent = ' ' + CONFIG.hero.subHighlight;
        sub.appendChild(em);
      }
    }

    // Only swap the artwork once the replacement is known to load — otherwise
    // a missing file leaves an empty band, which is worse than the original.
    var probe = new Image();
    probe.onload = function () {
      var imgs = [...hero.querySelectorAll('img')].filter(function (i) {
        return !/\.svg($|\?)/.test(i.currentSrc || i.src || '');
      });
      imgs.sort(function (a, b) {
        return (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight);
      });
      if (imgs[0]) {
        forceImage(imgs[0], CONFIG.hero.src, CONFIG.hero.heading);
        // Tag the banner specifically. The band also contains the small
        // check-circle trust icons, and a blanket `.gs-collection-hero img`
        // rule blew those up to fill the section.
        imgs[0].classList.add('gs-banner-img');
      }
      hero.classList.add('gs-collection-hero');
    };
    probe.onerror = function () {
      console.info('[grand-slam] ' + CONFIG.hero.src + ' missing — keeping original banner.');
    };
    probe.src = CONFIG.hero.src;
  }

  /* --------------------------------------------- 2 + 3. the product grid -- */
  function buildGrid() {
    var list = document.querySelector('product-list');
    if (!list) return;

    var cards = [...list.querySelectorAll('product-card')];
    if (!cards.length) return;

    var template = cards[0];

    // --- bestsellers: show the nine, in order; hide everything else --------
    cards.forEach(function (c) {
      if (c.classList.contains('gs-drop-card')) return;   // ours, handled below
      var idx = CONFIG.bestsellers.indexOf(handleOf(c));
      if (idx === -1) {
        c.style.display = 'none';
      } else {
        c.style.display = '';
        c.style.order = 11 + idx;
      }
    });

    // --- the drop: three cloned cards at the top --------------------------
    if (!list.querySelector('.gs-drop-card')) {
      CONFIG.drop.forEach(function (spec) {
        var card = template.cloneNode(true);
        card.classList.add('gs-drop-card');
        // A clone carries the template's generated order-N class; strip it so
        // only our inline order applies.
        card.className = card.className.replace(/\border-\d+-\d+\b/g, '').trim();
        dressCard(card, spec);
        list.appendChild(card);
      });
    } else {
      // Re-render happened: re-dress the existing clones.
      var mine = [...list.querySelectorAll('.gs-drop-card')];
      mine.forEach(function (card, i) {
        if (CONFIG.drop[i]) dressCard(card, CONFIG.drop[i]);
      });
    }

    // --- the two band headings -------------------------------------------
    if (!list.querySelector('.gs-band-head')) {
      list.appendChild(bandHeading(CONFIG.dropHeading, null, CONFIG.dropKicker, 0));
      list.appendChild(bandHeading(CONFIG.bestsellersHeading, CONFIG.bestsellersSub, null, 10));
    }
  }

  /* ------------------------------------------------------- 4. editorial -- */
  function buildEditorial() {
    if (document.querySelector('.gs-editorial')) return;
    var anchor = document.querySelector('.shopify-section--footer') ||
                 document.querySelector('[class*="footer"]');
    if (!anchor) return;

    var e = CONFIG.editorial;
    var band = document.createElement('section');
    band.className = 'gs-editorial';
    band.innerHTML =
      '<img class="gs-editorial__bg" alt="">' +
      '<div class="gs-editorial__inner">' +
        '<span class="gs-editorial__kicker"></span>' +
        '<h2 class="gs-editorial__heading"></h2>' +
        '<p class="gs-editorial__body"></p>' +
        (e.cta ? '<a class="gs-editorial__cta"></a>' : '') +
      '</div>';
    band.querySelector('.gs-editorial__bg').src = e.image;
    band.querySelector('.gs-editorial__kicker').textContent = e.kicker;
    band.querySelector('.gs-editorial__heading').textContent = e.heading;
    band.querySelector('.gs-editorial__body').textContent = e.body;
    if (e.cta) {
      var cta = band.querySelector('.gs-editorial__cta');
      cta.textContent = e.cta;
      cta.href = e.href;
    }

    anchor.parentNode.insertBefore(band, anchor);
  }

  /* ---------------------------------------------------------- 5. quotes -- */
  function buildQuotes() {
    var sec = [...document.querySelectorAll('.shopify-section')]
      .find(function (s) { return s.id && s.id.indexOf('press_') !== -1; });
    if (!sec || !CONFIG.quotes || !CONFIG.quotes.length) return;

    sec.classList.add('gs-quotes');

    var slides = [...sec.querySelectorAll('.press__list-item')];

    // Show only as many slides as we have real reviews for. The theme ships
    // eight; anything past our list would otherwise still be showing the old
    // Lem reviews. Hidden rather than removed so adding entries brings them
    // straight back.
    slides.forEach(function (slide, i) {
      slide.style.display = i < CONFIG.quotes.length ? '' : 'none';
    });
    sec.classList.toggle('gs-quotes--single', CONFIG.quotes.length < 2);

    slides.slice(0, CONFIG.quotes.length).forEach(function (slide, i) {
      var spec = CONFIG.quotes[i];

      // The author line is the only reliably-classed node; the quote itself is
      // whichever text element in the slide is longest.
      var author = slide.querySelector('.press__author');
      if (author) {
        // Remember the real name once, so the fallback below can put the slide
        // back exactly as it was if the quote body cannot be found.
        if (!('gsOrigAuthor' in slide.dataset)) {
          slide.dataset.gsOrigAuthor = author.textContent.trim();
        }
        author.textContent = spec.label;
      }

      // The quote is a <blockquote>. An earlier version searched only
      // p/span/div, so it silently missed it and replaced the author alone —
      // leaving a real customer's review signed with a product name, which is
      // worse than not touching the section at all. Query blockquote first and
      // fail loudly rather than half-applying.
      var quoteEl = slide.querySelector('blockquote') ||
        [...slide.querySelectorAll('p, span, div')]
          .filter(function (e) {
            return e.children.length === 0 && e !== author &&
                   e.textContent.trim().length > 20;
          })
          .sort(function (a, b) {
            return b.textContent.trim().length - a.textContent.trim().length;
          })[0];

      if (quoteEl) {
        quoteEl.textContent = spec.text;
      } else {
        // Could not find the quote: revert the label so the slide stays a
        // coherent original review rather than a mislabelled one.
        if (author) author.textContent = slide.dataset.gsOrigAuthor || '';
        console.warn('[grand-slam] quote body not found in slide ' + i +
                     ' — left the original review intact.');
        return;
      }

      // Stars stay only for genuine reviews. On brand copy a 5-star rating
      // would imply a rating nobody actually gave.
      var rating = slide.querySelector('.rating');
      if (rating) rating.style.display = spec.stars ? '' : 'none';
    });
  }

  /* ------------------------------------------------------- 6. hide bands -- */
  function hideSections() {
    CONFIG.hideSections.forEach(function (frag) {
      document.querySelectorAll('.shopify-section').forEach(function (s) {
        if (s.id && s.id.indexOf(frag) !== -1) s.style.display = 'none';
      });
    });
  }

  /* --------------------------------------------------------------- boot -- */
  ready(function () {
    hideSections();
    buildHero();
    buildGrid();
    buildQuotes();
    buildEditorial();

    var list = document.querySelector('product-list');
    if (list && window.MutationObserver) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; buildGrid(); });
      }).observe(list, { childList: true });
    }
  });
})();
