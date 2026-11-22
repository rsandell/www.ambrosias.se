// Bildvisare för fotoalbumen (PhotoSwipe 5, lokalt i assets/vendor/photoswipe).
// Sidan innehåller albumdata som JSON (#photo-data). Miniatyrlänkar (data-pswp-index)
// och knappen "Visa alla bilder" (data-pswp-open) öppnar samma bildvisare.
import PhotoSwipe from '../vendor/photoswipe/photoswipe.esm.min.js';
import PhotoSwipeLightbox from '../vendor/photoswipe/photoswipe-lightbox.esm.min.js';

(function () {
  var dataEl = document.getElementById('photo-data');
  if (!dataEl) return;
  var albums;
  try { albums = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var items = [];
  albums.forEach(function (a) {
    a.photos.forEach(function (p) {
      items.push({ src: p.s, width: p.w, height: p.h, msrc: p.m, alt: a.t, album: a });
    });
  });
  if (!items.length) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lightbox = new PhotoSwipeLightbox({
    dataSource: items,
    pswpModule: PhotoSwipe,
    showHideAnimationType: 'fade',
    showAnimationDuration: reduced ? 0 : 250,
    hideAnimationDuration: reduced ? 0 : 250,
    zoomAnimationDuration: reduced ? 0 : 250,
    bgOpacity: 0.92,
    loop: true,
    closeTitle: 'Stäng (Esc)',
    zoomTitle: 'Zooma',
    arrowPrevTitle: 'Föregående',
    arrowNextTitle: 'Nästa',
    errorMsg: 'Bilden kunde inte laddas'
  });

  // ---- Bildspel och helskärm (WP 3.5) ----
  var INTERVALS = [3, 5, 8];
  var STORE_KEY = 'ambrosias.bildspel.intervall';
  var seconds = 5;
  try {
    var saved = parseInt(localStorage.getItem(STORE_KEY), 10);
    if (INTERVALS.indexOf(saved) >= 0) seconds = saved;
  } catch (e) {}

  var fsEnabled = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  var fsElement = function () { return document.fullscreenElement || document.webkitFullscreenElement; };

  var ICON = function (d) {
    return '<svg class="pswp__icn" aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 32 32">' + d + '</svg>';
  };
  var ICON_PLAY = ICON('<path d="M11 8v16l13-8z" fill="currentColor"/>');
  var ICON_PAUSE = ICON('<path d="M10 8h4v16h-4zM18 8h4v16h-4z" fill="currentColor"/>');
  var ICON_FS_ON = ICON('<path d="M8 13V8h5M24 13V8h-5M8 19v5h5M24 19v5h-5" fill="none" stroke="currentColor" stroke-width="2.2"/>');
  var ICON_FS_OFF = ICON('<path d="M13 8v5H8M19 8v5h5M13 24v-5H8M19 24v-5h5" fill="none" stroke="currentColor" stroke-width="2.2"/>');

  lightbox.on('uiRegister', function () {
    var pswp = lightbox.pswp;
    var playing = false, timer = null, live = null, playBtn = null, intBtn = null, fsBtn = null;
    var many = function () { return pswp.getNumItems() > 1; };
    var say = function (t) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 50); } };

    var clear = function () { if (timer) { clearTimeout(timer); timer = null; } };
    var expected = -1; // indexet bildspelet själv går till
    var schedule = function () {
      clear();
      if (!playing || document.hidden) return;
      timer = setTimeout(function () {
        timer = null;
        if (!playing) return;
        expected = (pswp.currIndex + 1) % pswp.getNumItems();
        pswp.next();
      }, seconds * 1000);
    };
    var renderPlay = function () {
      if (!playBtn) return;
      playBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      var t = playing ? 'Pausa bildspel' : 'Starta bildspel';
      playBtn.title = t;
      playBtn.setAttribute('aria-label', t);
    };
    var setPlaying = function (on, announce) {
      if (on === playing) return;
      playing = on;
      renderPlay();
      if (on) schedule(); else clear();
      if (announce !== false) say(on ? 'Bildspel startat' : 'Bildspel pausat');
    };

    // Ett byte av bild som bildspelet inte själv orsakade pausar det.
    pswp.on('change', function () {
      if (!playing) return;
      if (pswp.currIndex === expected) { expected = -1; schedule(); } else { setPlaying(false); }
    });

    // Zoom pausar
    pswp.on('zoomPanUpdate', function (e) {
      var s = e.slide;
      if (playing && s && s === pswp.currSlide && s.currZoomLevel > s.zoomLevels.initial + 0.001) setPlaying(false);
    });

    var onVisibility = function () { if (document.hidden) clear(); else if (playing) schedule(); };
    var onKey = function (e) {
      if (e.key !== ' ' && e.code !== 'Space') return;
      if (!many()) return;
      if (e.target === playBtn) return; // knappen hanterar själv
      e.preventDefault();
      setPlaying(!playing);
    };
    var onFs = function () {
      if (!fsBtn) return;
      var on = !!fsElement();
      fsBtn.innerHTML = on ? ICON_FS_OFF : ICON_FS_ON;
      fsBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var t = on ? 'Avsluta helskärm' : 'Helskärm';
      fsBtn.title = t;
      fsBtn.setAttribute('aria-label', t);
    };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    pswp.on('close', function () {
      setPlaying(false, false);
      if (fsElement()) { var x = document.exitFullscreen || document.webkitExitFullscreen; if (x) try { x.call(document); } catch (e) {} }
    });
    pswp.on('destroy', function () {
      clear();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    });

    pswp.ui.registerElement({
      name: 'bildspel-status', order: 1, isButton: false, appendTo: 'root',
      onInit: function (el) {
        live = el;
        el.className += ' pswp__sr-only';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
      }
    });
    pswp.ui.registerElement({
      name: 'bildspel-play', order: 6, isButton: true, appendTo: 'bar', html: ICON_PLAY,
      onInit: function (el) {
        playBtn = el;
        el.type = 'button';
        if (!many()) { el.hidden = true; return; }
        renderPlay();
        el.addEventListener('click', function () { setPlaying(!playing); });
      }
    });
    pswp.ui.registerElement({
      name: 'bildspel-intervall', order: 7, isButton: true, appendTo: 'bar', html: '',
      onInit: function (el) {
        intBtn = el;
        el.type = 'button';
        if (!many()) { el.hidden = true; return; }
        var render = function () {
          el.textContent = seconds + ' s';
          el.title = 'Tid per bild: ' + seconds + ' sekunder (klicka för att byta)';
          el.setAttribute('aria-label', 'Tid per bild: ' + seconds + ' sekunder. Byt tid.');
        };
        render();
        el.addEventListener('click', function () {
          seconds = INTERVALS[(INTERVALS.indexOf(seconds) + 1) % INTERVALS.length];
          try { localStorage.setItem(STORE_KEY, String(seconds)); } catch (e) {}
          render();
          say('Tid per bild ' + seconds + ' sekunder');
          if (playing) schedule();
        });
      }
    });
    if (fsEnabled) {
      pswp.ui.registerElement({
        name: 'helskarm', order: 8, isButton: true, appendTo: 'bar', html: ICON_FS_ON,
        onInit: function (el) {
          fsBtn = el;
          el.type = 'button';
          onFs();
          el.addEventListener('click', function () {
            if (fsElement()) {
              (document.exitFullscreen || document.webkitExitFullscreen).call(document);
            } else {
              var r = pswp.element.requestFullscreen || pswp.element.webkitRequestFullscreen;
              try { var p = r.call(pswp.element); if (p && p.catch) p.catch(function () {}); } catch (e) {}
            }
          });
        }
      });
    }
  });

  // Bildtext: albumtitel (länk till albumet), fotograf och position
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'album-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: function (el, pswp) {
        el.className += ' pswp__album-caption';
        pswp.on('change', function () {
          var a = pswp.currSlide && pswp.currSlide.data.album;
          el.textContent = '';
          if (!a) return;
          var link = document.createElement('a');
          link.href = a.u;
          link.textContent = a.t;
          el.appendChild(link);
          el.appendChild(document.createTextNode(' · ' + a.p + ' · ' + (pswp.currIndex + 1) + ' / ' + pswp.getNumItems()));
        });
      }
    });
  });
  lightbox.init();

  document.querySelectorAll('a[data-pswp-index]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      lightbox.loadAndOpen(parseInt(a.getAttribute('data-pswp-index'), 10));
    });
  });
  document.querySelectorAll('[data-pswp-open]').forEach(function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      lightbox.loadAndOpen(parseInt(b.getAttribute('data-pswp-open'), 10) || 0);
    });
  });
})();
