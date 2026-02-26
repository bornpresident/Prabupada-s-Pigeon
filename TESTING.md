# Quick test guide

## 1. Load the extension in Firefox

1. Open **Firefox**.
2. In the address bar type: **`about:debugging`** → Enter.
3. Click **"This Firefox"** (or "This Nightly") in the left sidebar.
4. Click **"Load Temporary Add-on…"**.
5. Go to this folder: `ISKCON PROJECT 2`
6. Select **`manifest.json`** (not the folder) → Open.
7. The extension **"ISKCON WhatsApp Message Sender"** should appear in the list. You may see a puzzle-piece icon in the toolbar; the add-on might be under the menu (⋮) → More tools → Extensions.

## 2. Test the popup (no WhatsApp needed)

1. Click the extension icon (or find it under the puzzle piece / menu).
2. **Upload CSV**: Click "Choose Excel file" and select `sample-contacts.csv`.
   - You should see: "sample-contacts.csv — 4 contact(s)" and a short preview list.
3. **Message**: Type something in the text box, e.g. "Hope you're doing well."
4. **Delay**: Leave at 30 seconds (or set 10 for quicker testing).
5. **Start sending** should become enabled. Do not click it yet if you want to only test the popup.

## 3. Test with WhatsApp Web (full flow)

1. Open a new tab and go to **https://web.whatsapp.com**.
2. Log in (scan QR if needed).
3. Open the extension popup again.
4. Upload `sample-contacts.csv`, enter a message, set delay (e.g. 15–30 seconds).
5. Click **Start sending**.
6. The WhatsApp tab should navigate to the first contact’s chat with the message pre-filled; the extension will try to click Send. After the delay, it moves to the next contact.

**Tip:** Use a small delay (e.g. 15 s) and 1–2 test contacts (edit the CSV to one or two rows) so you can confirm behavior quickly.

## 4. If something fails

- **"Please open WhatsApp Web"**: Make sure the tab is exactly `https://web.whatsapp.com` and the page has finished loading.
- **Message not sending**: WhatsApp Web’s layout may have changed; the Send button selector in `content/content.js` might need updating (inspect the Send button and adjust `findSendButton()`).
- **Popup won’t open**: Check `about:debugging` for errors and ensure you selected `manifest.json` when loading the add-on.
