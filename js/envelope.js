/**
 * ============================================================
 * envelope.js — Contact card modal + Discord webhook
 * ============================================================
 */

(function initContactModal() {

  const DISCORD_WEBHOOK = 'https://discordapp.com/api/webhooks/1491726173548449922/abw-EtyN76-vnpug4I2bN4-ONdpYMfMJAalsykSaRlz57m_j4DS44GWBuNHx9GBsiOif';

  const triggerBtn = document.getElementById('btn-envelope-trigger');
  const overlay    = document.getElementById('contact-modal-overlay');
  const closeBtn   = document.getElementById('contact-card-close');
  const form       = document.getElementById('env-contact-form');
  const feedback   = document.getElementById('env-feedback');
  const submitBtn  = document.getElementById('env-submit-btn');

  if (!triggerBtn || !overlay) return;

  /* ── Open / Close ───────────────────────────────── */
  function openModal() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = form.querySelector('.env-input');
      if (first) first.focus();
    }, 350);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      form.reset();
      clearFeedback();
      submitBtn.disabled    = false;
      submitBtn.textContent = '🚀 Envoyer le message';
    }, 300);
  }

  triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Click on overlay backdrop closes modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  /* ── Feedback helpers ───────────────────────────── */
  function showFeedback(type, message) {
    feedback.textContent = message;
    feedback.className   = 'env-feedback ' + type;
  }

  function clearFeedback() {
    feedback.className   = 'env-feedback';
    feedback.textContent = '';
  }

  /* ── Budget ─────────────────────────────────────── */
  function getBudget() {
    const checked = form.querySelector('input[name="budget"]:checked');
    return checked ? checked.value : 'Non précisé';
  }

  /* ── Form submit → Discord ──────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nom    = document.getElementById('env-nom').value.trim();
    const projet = document.getElementById('env-projet').value.trim();
    const budget = getBudget();

    if (!nom || !projet) {
      showFeedback('error', '⚠ Merci de remplir tous les champs.');
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = '⏳ Envoi en cours…';
    clearFeedback();

    const now = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const payload = {
      username:   'Alexdev — Portfolio Contact',
      embeds: [{
        title:  '📨 Nouveau message depuis le portfolio',
        color:  0xff00ff,
        fields: [
          { name: '👤 Nom',        value: `\`\`${nom}\`\``,    inline: true  },
          { name: '🚀 Projet',     value: `\`\`${projet}\`\``, inline: true  },
          { name: '💰 Budget',     value: `\`\`${budget}\`\``, inline: false },
        ],
        footer: { text: `Alexdev Portfolio • ${now}` },
      }],
    };

    try {
      const res = await fetch(DISCORD_WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) {
        submitBtn.textContent = '✓ Message envoyé !';
        showFeedback('success', '✓ Message reçu ! Réponse sous 24h.');
        setTimeout(closeModal, 2800);
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (err) {
      console.error('[Discord webhook]', err);
      showFeedback('error', '✗ Erreur réseau. Réessayez plus tard.');
      submitBtn.disabled    = false;
      submitBtn.textContent = '🚀 Envoyer le message';
    }
  });

})();
