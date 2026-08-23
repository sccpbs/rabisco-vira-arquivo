// Listas de imagens
const faseAImages = [
  'imagens/1 fase A/ANTHONY.webp','imagens/1 fase A/ARTHUR.webp','imagens/1 fase A/ELISA.webp',
  'imagens/1 fase A/ELOAH.webp','imagens/1 fase A/ENZO.webp','imagens/1 fase A/ERICK.webp',
  'imagens/1 fase A/GABRIEL.webp','imagens/1 fase A/HEITOR.webp','imagens/1 fase A/JOAQUIM.webp',
  'imagens/1 fase A/JOSE.webp','imagens/1 fase A/JULIA.webp','imagens/1 fase A/LAURA.webp',
  'imagens/1 fase A/LIAN.webp','imagens/1 fase A/MARIA THEREZA.webp','imagens/1 fase A/MAYA.webp',
  'imagens/1 fase A/NICOLLY.webp','imagens/1 fase A/RAVI.webp','imagens/1 fase A/SAMUEL.webp',
  'imagens/1 fase A/THAUANNY.webp'
];

const faseBImages = [
  'imagens/1 fase B/ANA ALICE.webp','imagens/1 fase B/ANA LAURA.webp','imagens/1 fase B/BIANCA.webp',
  'imagens/1 fase B/GAEL .webp','imagens/1 fase B/HEITOR.webp','imagens/1 fase B/HELENA .webp',
  'imagens/1 fase B/LORENZO.webp','imagens/1 fase B/MARIA RITA .webp','imagens/1 fase B/MARIAH.webp',
  'imagens/1 fase B/MIGUEL.webp','imagens/1 fase B/THEO.webp'
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
