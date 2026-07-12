(function() {
  const originalAlert = window.alert;

  window.alert = function(message) {
    // Prevent multiple modals stacking infinitely
    const existingModal = document.getElementById('qs-custom-alert-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'qs-custom-alert-overlay';
    
    // Check if the page is in dark mode or light mode to match theme
    // The theme is usually set on the html element via data-theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgStr = isDark ? '#212121' : '#ffffff';
    const textStr = isDark ? '#ffffff' : '#0f172a';
    const subTextStr = isDark ? '#e0e0e0' : '#475569';
    const borderStr = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';

    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      opacity: 0;
      transition: opacity 0.2s ease;
      padding: 20px;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: ${bgStr};
      color: ${textStr};
      width: 100%;
      max-width: 400px;
      border-radius: 16px;
      padding: 32px 24px 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid ${borderStr};
      transform: scale(0.95) translateY(10px);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      text-align: center;
    `;

    // Determine icon based on message content (success vs error/info)
    let iconSvg = '';
    const msgLower = String(message).toLowerCase();
    if (msgLower.includes('success') || msgLower.includes('saved') || msgLower.includes('copied')) {
      // Success Icon
      iconSvg = `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#10B981" stroke-width="2" fill="none" style="margin: 0 auto 16px; display: block; background: rgba(16,185,129,0.1); padding: 12px; border-radius: 50%;"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('wrong') || msgLower.includes('banned') || msgLower.includes('invalid')) {
      // Error Icon
      iconSvg = `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#ef4444" stroke-width="2" fill="none" style="margin: 0 auto 16px; display: block; background: rgba(239,68,68,0.1); padding: 12px; border-radius: 50%;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      // Info Icon
      iconSvg = `<svg viewBox="0 0 24 24" width="48" height="48" stroke="#0ea5e9" stroke-width="2" fill="none" style="margin: 0 auto 16px; display: block; background: rgba(14,165,233,0.1); padding: 12px; border-radius: 50%;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    card.innerHTML = `
      ${iconSvg}
      <h3 style="margin: 0 0 8px; font-size: 1.25rem; font-weight: 800;">Notice</h3>
      <p style="margin: 0 0 24px; font-size: 0.95rem; color: ${subTextStr}; line-height: 1.5; white-space: pre-wrap;">${message}</p>
      <button id="qs-alert-ok-btn" style="width: 100%; padding: 12px; border-radius: 9999px; background: #0ea5e9; color: white; border: none; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s; font-family: inherit;">OK</button>
    `;

    overlay.appendChild(card);
    (document.body || document.documentElement).appendChild(overlay);

    // Trigger animations
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      card.style.transform = 'scale(1) translateY(0)';
    });

    const closeAlert = () => {
      overlay.style.opacity = '0';
      card.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(() => overlay.remove(), 200);
    };

    const btn = card.querySelector('#qs-alert-ok-btn');
    btn.addEventListener('click', closeAlert);
    
    // Hover effect for button
    btn.addEventListener('mouseover', () => btn.style.background = '#0284c7');
    btn.addEventListener('mouseout', () => btn.style.background = '#0ea5e9');

    // Focus button for enter-key to dismiss
    setTimeout(() => btn.focus(), 100);
  };
})();
