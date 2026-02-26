'use strict';

const AUTO_SEND_FLAG = 'iskconAutoSend';

function getSendUrl(phone, text) {
  const clean = phone.replace(/\D/g, '');
  return 'https://web.whatsapp.com/send?phone=' + encodeURIComponent(clean) + '&text=' + encodeURIComponent(text);
}

function findSendButton() {
  const selectors = [
    'button[data-icon="send"]',
    'button[aria-label="Send"]',
    'span[data-icon="send"]',
    '[data-testid="send"]',
    'button[aria-label="Send message"]',
    '.compose-btn-send',
    '[data-icon="send"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const btn = el.closest ? el.closest('button') : el;
      if (btn) return btn;
      return el;
    }
  }
  const all = document.querySelectorAll('button');
  for (const b of all) {
    const span = b.querySelector('span[data-icon="send"]');
    if (span) return b;
  }
  return null;
}

function tryClickSend() {
  const btn = findSendButton();
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

function scheduleAutoSend() {
  const maxWait = 15000;
  const step = 500;
  let elapsed = 0;
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  const id = setInterval(() => {
    elapsed += step;
    if (tryClickSend()) {
      clearInterval(id);
      try { sessionStorage.removeItem(AUTO_SEND_FLAG); } catch (e) {}
      runtime.runtime.sendMessage({ action: 'contentDone' }).catch(() => {});
      return;
    }
    if (elapsed >= maxWait) {
      clearInterval(id);
      try { sessionStorage.removeItem(AUTO_SEND_FLAG); } catch (e) {}
      runtime.runtime.sendMessage({ action: 'contentDone' }).catch(() => {});
    }
  }, step);
}

function checkAutoSend() {
  try {
    if (sessionStorage.getItem(AUTO_SEND_FLAG) === '1') {
      setTimeout(scheduleAutoSend, 2000);
    }
  } catch (e) {}
}

(function () {
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'sendOne') {
      try { sessionStorage.setItem(AUTO_SEND_FLAG, '1'); } catch (e) {}
      const url = getSendUrl(msg.phone, msg.text);
      window.location.href = url;
      sendResponse({ ok: true });
    }
    return true;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAutoSend);
  } else {
    checkAutoSend();
  }
})();
