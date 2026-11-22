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
    closeTitle: 'Stäng (Esc)',
    zoomTitle: 'Zooma',
    arrowPrevTitle: 'Föregående',
    arrowNextTitle: 'Nästa',
    errorMsg: 'Bilden kunde inte laddas'
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
