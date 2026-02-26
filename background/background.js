'use strict';

let queue = [];
let delaySecondsList = [3];
let timerId = null;
let stopped = false;

function getRandomDelay() {
  if (!delaySecondsList.length) return 3;
  return delaySecondsList[Math.floor(Math.random() * delaySecondsList.length)];
}

function notifyPopup(payload) {
  try {
    (typeof browser !== 'undefined' ? browser : chrome).runtime.sendMessage(payload).catch(() => {});
  } catch (e) {}
}

function sendNext() {
  if (stopped || !queue.length) {
    if (!queue.length) {
      notifyPopup({ action: 'sendingDone', text: 'All messages sent.' });
    }
    return;
  }
  const item = queue.shift();
  const total = queue.length + 1;
  notifyPopup({
    action: 'sendingStatus',
    text: `Sending ${total - queue.length} of ${total}…`,
    className: 'sending'
  });
  (typeof browser !== 'undefined' ? browser : chrome).tabs.query({ url: '*://web.whatsapp.com/*' }, (tabs) => {
    if (stopped) return;
    if (!tabs || !tabs.length) {
      notifyPopup({
        action: 'sendingStatus',
        text: 'Please open WhatsApp Web (web.whatsapp.com) in a tab and try again.',
        className: 'error'
      });
      notifyPopup({ action: 'sendingStopped', text: 'Open WhatsApp Web and start again.' });
      return;
    }
    (typeof browser !== 'undefined' ? browser : chrome).tabs.sendMessage(tabs[0].id, {
      action: 'sendOne',
      phone: item.phone,
      text: item.text
    }).then(() => {}).catch((err) => {
      notifyPopup({
        action: 'sendingStatus',
        text: 'Could not reach WhatsApp tab. Ensure web.whatsapp.com is open and reload the page.',
        className: 'error'
      });
      notifyPopup({ action: 'sendingStopped', text: 'Error. Open/reload WhatsApp Web and try again.' });
    });
  });
}

function onContentDone() {
  if (stopped) return;
  if (queue.length === 0) {
    notifyPopup({ action: 'sendingDone', text: 'All messages sent.' });
    return;
  }
  const delaySec = getRandomDelay();
  timerId = setTimeout(() => sendNext(), delaySec * 1000);
}

(function () {
  const runtime = typeof browser !== 'undefined' ? browser : chrome;
  runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'startSending') {
      stopped = false;
      queue = msg.queue || [];
      const raw = msg.delaySecondsList || msg.delaySeconds;
      delaySecondsList = Array.isArray(raw)
        ? raw.map(s => Math.max(1, Math.min(300, Number(s) || 3)))
        : [Math.max(1, Math.min(300, Number(raw) || 3))];
      if (!delaySecondsList.length) delaySecondsList = [3];
      if (timerId) clearTimeout(timerId);
      timerId = null;
      sendNext();
      sendResponse({ ok: true });
    } else if (msg.action === 'stopSending') {
      stopped = true;
      if (timerId) clearTimeout(timerId);
      timerId = null;
      queue = [];
      notifyPopup({ action: 'sendingStopped', text: 'Stopped.' });
      sendResponse({ ok: true });
    } else if (msg.action === 'contentDone') {
      onContentDone();
      sendResponse({ ok: true });
    }
    return true;
  });
})();
