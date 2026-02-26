(function () {
  'use strict';

  const runtime = typeof browser !== 'undefined' ? browser : chrome;

  if (window.location.search.indexOf('tab=1') !== -1) {
    document.body.classList.add('in-tab');
  }

  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileName = document.getElementById('fileName');
  const previewList = document.getElementById('previewList');
  const messageBody = document.getElementById('messageBody');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusEl = document.getElementById('status');
  const openInTabBtn = document.getElementById('openInTabBtn');

  let contacts = [];
  const GREETING_MALE = 'Prabhu Ji';
  const GREETING_FEMALE = 'Mata Ji';

  function setStatus(text, className) {
    statusEl.textContent = text;
    statusEl.className = 'status' + (className ? ' ' + className : '');
  }

  function normalizePhone(num) {
    if (num == null) return '';
    const s = String(num).replace(/\D/g, '');
    return s || '';
  }

  function normalizeGender(val) {
    if (val == null) return '';
    const v = String(val).trim().toLowerCase();
    if (v === 'female' || v === 'f' || v === 'mata' || v === 'mata ji') return 'Female';
    if (v === 'male' || v === 'm' || v === 'prabhu') return 'Male';
    return v ? 'Male' : ''; // default to Male if something else
  }

  function buildGreeting(name, gender) {
    const title = gender === 'Female' ? GREETING_FEMALE : GREETING_MALE;
    return `Hare Krishna ${name || 'Devotee'} ${title},`;
  }

  function buildFullMessage(name, gender, body) {
    const greeting = buildGreeting(name, gender);
    const bodyText = (body || '').trim();
    return bodyText ? `${greeting}\n\n${bodyText}` : greeting;
  }

  function parseCSV(text) {
    const rows = [];
    let cur = '';
    let row = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = false;
        } else cur += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',' || c === '\t') { row.push(cur); cur = ''; }
        else if (c === '\r' && text[i + 1] === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; }
        else if (c === '\n' || c === '\r') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else cur += c;
      }
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function parseFile(file) {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return Promise.reject(new Error('Please save your Excel file as CSV (Comma delimited) and upload the CSV.'));
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const text = (e.target.result || '').trim();
          const rows = parseCSV(text);
          if (!rows.length) {
            reject(new Error('File is empty'));
            return;
          }
          const header = rows[0].map(h => String(h || '').trim().toLowerCase());
          const nameIdx = header.findIndex(h => h === 'name' || h === 'names');
          const phoneIdx = header.findIndex(h => h === 'phone' || h === 'phone number' || h === 'phonenumber' || h === 'number' || h === 'mobile');
          const genderIdx = header.findIndex(h => h === 'gender' || h === 'sex');
          if (nameIdx < 0 || phoneIdx < 0) {
            reject(new Error('Required columns not found. Use: Name, Phone Number, Gender'));
            return;
          }
          const out = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const name = row[nameIdx] != null ? String(row[nameIdx]).trim() : '';
            const phone = normalizePhone(row[phoneIdx]);
            const gender = normalizeGender(genderIdx >= 0 ? row[genderIdx] : '');
            if (!phone) continue;
            out.push({ name: name || 'Devotee', phone, gender: gender || 'Male' });
          }
          resolve(out);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (openInTabBtn) {
    openInTabBtn.addEventListener('click', () => {
      const url = runtime.runtime.getURL('popup/popup.html') + '?tab=1';
      runtime.tabs.create({ url: url });
    });
  }

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    setStatus('Loading…', '');
    try {
      contacts = await parseFile(file);
      fileName.textContent = file.name + ' — ' + contacts.length + ' contact(s)';
      if (previewList) {
        previewList.hidden = false;
        previewList.innerHTML = '<ul>' + contacts.slice(0, 15).map(c =>
          `<li>${c.name} — ${c.phone} — ${c.gender}</li>`
        ).join('') + (contacts.length > 15 ? '<li>… and ' + (contacts.length - 15) + ' more</li>' : '') + '</ul>';
      }
      startBtn.disabled = contacts.length === 0;
      setStatus(contacts.length ? 'Ready to send.' : 'No valid contacts in file.', '');
    } catch (e) {
      setStatus('Error: ' + (e.message || 'Invalid file'), 'error');
      contacts = [];
      startBtn.disabled = true;
    }
  });

  function parseDelayInput(str) {
    const parts = (str || '').split(/[\s,]+/).filter(Boolean);
    const nums = parts.map(p => Math.max(1, Math.min(300, parseInt(p, 10) || 1)));
    return nums.length ? nums : [3];
  }

  startBtn.addEventListener('click', () => {
    const body = messageBody.value.trim();
    const delayInput = document.getElementById('delayInput');
    const delayList = parseDelayInput(delayInput ? delayInput.value : '3, 3, 5');
    const queue = contacts.map(c => ({
      phone: c.phone,
      text: buildFullMessage(c.name, c.gender, body)
    }));
    if (!queue.length) {
      setStatus('No contacts to send.', 'error');
      return;
    }
    setStatus('Opening WhatsApp Web…', 'sending');
    startBtn.disabled = true;
    stopBtn.hidden = false;
    runtime.runtime.sendMessage({
      action: 'startSending',
      queue,
      delaySecondsList: delayList
    });
  });

  stopBtn.addEventListener('click', () => {
    runtime.runtime.sendMessage({ action: 'stopSending' });
    stopBtn.hidden = true;
    startBtn.disabled = false;
    setStatus('Stopped.', '');
  });

  runtime.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'sendingStatus') {
      setStatus(msg.text || '', msg.className || '');
    }
    if (msg.action === 'sendingDone') {
      startBtn.disabled = false;
      stopBtn.hidden = true;
      setStatus(msg.text || 'All messages sent.', '');
    }
    if (msg.action === 'sendingStopped') {
      startBtn.disabled = false;
      stopBtn.hidden = true;
      setStatus(msg.text || 'Stopped.', '');
    }
  });
})();
