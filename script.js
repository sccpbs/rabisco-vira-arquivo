// Listas de imagens
const faseAImages = [
  'imagens/1 fase a/anthony.webp',
  'imagens/1 fase a/arthur.webp',
  'imagens/1 fase a/elisa.webp',
  'imagens/1 fase a/eloah.webp',
  'imagens/1 fase a/enzo.webp',
  'imagens/1 fase a/erick.webp',
  'imagens/1 fase a/gabriel.webp',
  'imagens/1 fase a/heitor.webp',
  'imagens/1 fase a/joaquim.webp',
  'imagens/1 fase a/jose.webp',
  'imagens/1 fase a/julia.webp',
  'imagens/1 fase a/laura.webp',
  'imagens/1 fase a/lian.webp',
  'imagens/1 fase a/maria thereza.webp',
  'imagens/1 fase a/maya.webp',
  'imagens/1 fase a/nicolly.webp',
  'imagens/1 fase a/ravi.webp',
  'imagens/1 fase a/samuel.webp',
  'imagens/1 fase a/thauanny.webp'
];

const faseBImages = [
  'imagens/1 fase b/ana alice.webp',
  'imagens/1 fase b/ana laura.webp',
  'imagens/1 fase b/bianca.webp',
  'imagens/1 fase b/gael .webp',
  'imagens/1 fase b/heitor.webp',
  'imagens/1 fase b/helena .webp',
  'imagens/1 fase b/lorenzo.webp',
  'imagens/1 fase b/maria rita .webp',
  'imagens/1 fase b/mariah.webp',
  'imagens/1 fase b/miguel.webp',
  'imagens/1 fase b/theo.webp'
];

// Criador de carrossel
function createCarousel(list, imgId, key) {
  let idx = 0;
  const imgEl = document.getElementById(imgId);

  function show() {
    if (!list.length) {
      imgEl.src = '';
      imgEl.alt = 'Sem imagens';
      return;
    }
    const original = list[idx];
    imgEl.alt = `Imagem ${idx + 1} de ${list.length}`;

    tryLoadVariants(original, resolved =>
      resolved ? (imgEl.src = resolved) : (imgEl.src = '', imgEl.alt = 'Imagem não encontrada')
    );
  }

  document.querySelectorAll(`.carousel-btn[data-target="${key}"]`)
    .forEach(btn => {
      btn.addEventListener('click', () => {
        idx = btn.classList.contains('prev')
          ? (idx - 1 + list.length) % list.length
          : (idx + 1) % list.length;
        show();
      });
    });

  imgEl.style.cursor = 'zoom-in';
  show();

  return {
    next() { idx = (idx + 1) % list.length; show(); },
    prev() { idx = (idx - 1 + list.length) % list.length; show(); },
    getImgEl: () => imgEl,
    getList: () => list
  };
}

// Referências globais
const carousels = {};
let lightboxEl, lightboxImg, lightboxClose;
let lightboxOpen = false;
let currentKey = null;

// Lightbox
function openLightbox(src, alt, key) {
  if (!lightboxEl) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightboxEl.classList.add('open');
  lightboxEl.setAttribute('aria-hidden', 'false');
  lightboxOpen = true;
  currentKey = key;
}

function closeLightbox() {
  lightboxEl.classList.remove('open');
  lightboxEl.setAttribute('aria-hidden', 'true');
  lightboxOpen = false;
  currentKey = null;
  setTimeout(() => { lightboxImg.src = ''; }, 200);
}

function lightboxNext() {
  if (!currentKey) return;
  carousels[currentKey].next();
  lightboxImg.src = carousels[currentKey].getImgEl().src;
}

function lightboxPrev() {
  if (!currentKey) return;
  carousels[currentKey].prev();
  lightboxImg.src = carousels[currentKey].getImgEl().src;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carousels.a = createCarousel(faseAImages, 'img-fase-a', 'a');
  carousels.b = createCarousel(faseBImages, 'img-fase-b', 'b');

  lightboxEl = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightbox-img');
  lightboxClose = document.getElementById('lightbox-close');

  const imgA = document.getElementById('img-fase-a');
  const imgB = document.getElementById('img-fase-b');

  imgA.addEventListener('click', () => imgA.src && openLightbox(imgA.src, imgA.alt, 'a'));
  imgB.addEventListener('click', () => imgB.src && openLightbox(imgB.src, imgB.alt, 'b'));

  lightboxClose.addEventListener('click', closeLightbox);

  lightboxEl.addEventListener('click', ev => {
    if (ev.target === lightboxEl) closeLightbox();
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && lightboxOpen) closeLightbox();
    if (!lightboxOpen) return;
    if (ev.key === 'ArrowRight') lightboxNext();
    if (ev.key === 'ArrowLeft') lightboxPrev();
  });
});

// API de debug
window._gallery = { carousels, openLightbox, closeLightbox, lightboxNext, lightboxPrev };

// Tentativa de corrigir nomes de arquivos
function tryLoadVariants(path, cb) {
  if (!path) return cb(null);

  const variants = Array.from(new Set([
    path,
    path.trim(),
    path.replace(/\s+/g, ' '),
    path.replace(/\s+\./g, '.'),
    path.replace(/\s+/g, '_'),
    path.replace(/\s+/g, '-'),
    path.replace(/([^\/]+)$/m, m => m.toLowerCase())
  ]));

  let i = 0;

  function tryNext() {
    if (i >= variants.length) return cb(null);

    const candidate = variants[i++];
    const test = new Image();

    test.onload = () => cb(encodeURI(candidate));
    test.onerror = () => setTimeout(tryNext, 10);

    try { test.src = encodeURI(candidate); }
    catch { setTimeout(tryNext, 10); }
  }

  tryNext();
}
