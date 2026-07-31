// =========================================================
// Scroll progress bar (every page)
// =========================================================
const scrollProgress = document.getElementById('scrollProgress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = percent + '%';
  });
}

// =========================================================
// Chat assistant — calls YOUR backend (server.js), which
// talks to Claude. The API key lives only on the server,
// never here — this file only ever calls your own endpoint.
// =========================================================
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatQuick = document.getElementById('chatQuick');

if (chatToggle && chatPanel) {
  // Change this to your deployed backend URL once it's hosted
  // (Render, Railway, etc). For local testing it's this:
  const CHAT_API_URL = 'http://localhost:3000/api/chat';

  let conversationHistory = [];

  function addMessage(text, who) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg--${who}`;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return el;
  }

  async function sendToClaude(userText) {
    const typingEl = addMessage('…', 'bot');
    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
        }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      typingEl.textContent = data.reply;
      conversationHistory.push({ role: 'user', content: userText });
      conversationHistory.push({ role: 'assistant', content: data.reply });
      // keep history short so requests stay cheap and fast
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
    } catch (err) {
      typingEl.textContent = "Couldn't reach the assistant right now — try the WhatsApp button instead.";
    }
  }

  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) chatInput.focus();
  });
  chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

  if (chatQuick) {
    chatQuick.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        addMessage(btn.textContent, 'user');
        sendToClaude(btn.textContent);
      });
    });
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = chatInput.value.trim();
    if (!val) return;
    addMessage(val, 'user');
    chatInput.value = '';
    sendToClaude(val);
  });
}

// =========================================================
// Feedback page — star rating + mailto submission
// =========================================================
const starRating = document.getElementById('starRating');
if (starRating) {
  const stars = starRating.querySelectorAll('.star');
  const ratingInput = document.getElementById('fbRating');

  function setStars(value) {
    stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= value));
    ratingInput.value = value;
  }

  stars.forEach(star => {
    star.addEventListener('click', () => setStars(Number(star.dataset.value)));
  });
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  const feedbackStatus = document.getElementById('feedbackStatus');
  const YOUR_EMAIL = 'aradhyasaloda@gmail.com';

  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fbName').value.trim();
    const rating = document.getElementById('fbRating').value;
    const shootType = document.getElementById('fbShoot').value.trim();
    const message = document.getElementById('fbMessage').value.trim();

    if (rating === '0') {
      feedbackStatus.textContent = 'Please select a star rating first.';
      return;
    }

    const subject = `Feedback from ${name} (${rating}★)`;
    const body = `Shoot type: ${shootType || 'Not specified'}\nRating: ${rating} / 5\n\n${message}\n\n— ${name}`;
    const mailtoLink = `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    feedbackStatus.textContent = 'Opening your email app…';
    window.location.href = mailtoLink;

    setTimeout(() => {
      feedbackStatus.textContent = 'Thanks for the feedback!';
    }, 1200);
  });
}

// =========================================================
// Mobile nav toggle (every page)
// =========================================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav__links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// =========================================================
// Filmstrip — only present on index.html
// =========================================================
const filmstripTrack = document.getElementById('filmstripTrack');
if (filmstripTrack) {
  const filmTags = [
    'jaipur,portrait', 'jaipur,bazaar', 'jaipur,amberfort', 'jaipur,citypalace',
    'jaipur,market', 'jaipur,nahargarh', 'jaipur,pinkcity', 'jaipur,jantarmantar'
  ];
  const frames = filmTags.map((tag, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `
      <div class="filmstrip__frame">
        <img src="https://loremflickr.com/300/380/${tag}" alt="" loading="lazy">
        <span>${num}A</span>
      </div>`;
  }).join('');
  filmstripTrack.innerHTML = frames + frames; // duplicate for seamless loop
}

// =========================================================
// Contact sheet: scroll reveal + filters + lightbox
// only present on work.html
// =========================================================
const sheetFrames = document.querySelectorAll('.frame');
if (sheetFrames.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  sheetFrames.forEach(frame => revealObserver.observe(frame));

  const filterButtons = document.querySelectorAll('.filter');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      sheetFrames.forEach(frame => {
        const match = filter === 'all' || frame.dataset.cat === filter;
        frame.classList.toggle('hide', !match);
        if (match) {
          frame.classList.remove('in-view');
          requestAnimationFrame(() => frame.classList.add('in-view'));
        }
      });
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  sheetFrames.forEach(frame => {
    frame.addEventListener('click', () => {
      const img = frame.querySelector('img');
      const caption = frame.querySelector('.frame__exif').textContent;
      lightboxImg.src = img.src.replace(/\/\d+\/\d+\//, '/1400/1750/');
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() { lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// =========================================================
// Contact form — only present on contact.html
// Opens the visitor's email client with a pre-filled message
// addressed to you. No backend or third-party service needed.
// =========================================================
const form = document.getElementById('contactForm');
if (form) {
  const formStatus = document.getElementById('formStatus');
  const YOUR_EMAIL = 'aradhyasaloda@gmail.com';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const subject = `Shoot inquiry from ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;
    const mailtoLink = `mailto:${YOUR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formStatus.textContent = 'Opening your email app…';
    window.location.href = mailtoLink;

    setTimeout(() => {
      formStatus.textContent = "If nothing opened, email me directly at aradhyasaloda@gmail.com";
    }, 1200);
  });
}