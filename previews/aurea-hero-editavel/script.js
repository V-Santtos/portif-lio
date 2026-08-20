const hero = document.querySelector('.hero');
const media = document.querySelector('.hero__video');
const line = document.querySelector('.architecture-line');
const cursor = document.querySelector('.cursor');
const links = document.querySelectorAll('a, button');

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;

  const px = (mouseX / innerWidth - 0.5);
  const py = (mouseY / innerHeight - 0.5);
  media.style.transform = `scale(1.035) translate(${px * -8}px, ${py * -5}px)`;
  line.style.transform = `translate(${px * 10}px, ${py * 7}px)`;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.16;
  cursorY += (mouseY - cursorY) * 0.16;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

hero.addEventListener('mouseenter', () => cursor.classList.add('is-media'));
hero.addEventListener('mouseleave', () => cursor.classList.remove('is-media'));
links.forEach((link) => {
  link.addEventListener('mouseenter', () => {
    cursor.classList.remove('is-media');
    cursor.classList.add('is-link');
  });
  link.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-link');
    cursor.classList.add('is-media');
  });
});

function animateMetric(element) {
  const target = Number(element.dataset.value);
  const hasPlus = element.dataset.plus === 'true';
  const duration = 1800;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${hasPlus ? '+' : ''}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

setTimeout(() => {
  document.querySelectorAll('[data-value]').forEach(animateMetric);
}, 1100);

media.addEventListener('error', () => {
  hero.classList.add('video-unavailable');
});
