// Listas de imagens
const faseAImages = [
  'imagens/1 fase A/anthony.webp','imagens/1 fase A/arthur.webp','imagens/1 fase A/elisa.webp',
  'imagens/1 fase A/eloah.webp','imagens/1 fase A/enzo.webp','imagens/1 fase A/erick.webp',
  'imagens/1 fase A/gabriel;.webp','imagens/1 fase A/heitor.webp','imagens/1 fase A/joaquim.webp',
  'imagens/1 fase A/jose.webp','imagens/1 fase A/julia.webp','imagens/1 fase A/laura.webp',
  'imagens/1 fase A/lian.webp','imagens/1 fase A/maria thereza.webp','imagens/1 fase A/maya.webp',
  'imagens/1 fase A/nicolly.webp','imagens/1 fase A/ravi.webp','imagens/1 fase A/samuel.webp',
  'imagens/1 fase A/thauanny.webp'
];

const faseBImages = [
  'imagens/1 fase B/ana alice.webp','imagens/1 fase B/ana laura.webp','imagens/1 fase B/bianca.webp',
  'imagens/1 fase B/gael .webp','imagens/1 fase B/heitor.webp','imagens/1 fase B/helena .webp',
  'imagens/1 fase B/lorenzo.webp','imagens/1 fase B/maria rita .webp','imagens/1 fase B/mariah.webp',
  'imagens/1 fase B/miguel.webp','imagens/1 fase B/theo.webp'
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
