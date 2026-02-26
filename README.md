# ISKCON WhatsApp Message Sender (Firefox Extension)

A Firefox extension that sends personalized Hare Krishna messages to contacts from an Excel/CSV file, with gender-based greetings and a configurable delay between messages.

## Features

- **Upload contacts**: CSV file with columns **Name**, **Phone Number**, **Gender** (Male/Female).
- **Dynamic greeting**: First line is auto-generated:
  - **Male** → `Hare Krishna <Name> Prabhu,`
  - **Female** → `Hare Krishna <Name> Mata Ji,`
- **Custom message**: Compose the main message in the popup; it appears after the greeting.
- **Configurable delay**: Set seconds between each send (5–300) to keep usage responsible.

## Setup

### 1. Prepare your contacts file

- **CSV**: Use columns `Name`, `Phone Number`, `Gender` (exact headers or close variants).
- **Excel**: In Excel, use the same columns, then **File → Save As → CSV (Comma delimited)** and upload the CSV.

Example CSV:

```csv
Name,Phone Number,Gender
Shyam,919876543210,Male
Radha,919876543211,Female
```

- Phone numbers must include **country code** (e.g. 91 for India), no `+`.
- Gender: `Male` / `Female` (or M/F).

### 2. Install the extension in Firefox

1. Open Firefox and go to `about:debugging`.
2. Click **This Firefox** → **Load Temporary Add-on**.
3. Select the **manifest.json** file inside this project folder.
4. The extension icon will appear in the toolbar (or in the menu).

### 3. Use the extension

1. **Open WhatsApp Web**: Go to [web.whatsapp.com](https://web.whatsapp.com) and log in in a tab.
2. Click the extension icon to open the popup.
3. **Upload** your CSV (or export Excel to CSV and upload).
4. **Type** your message in the text box.
5. Set **delay** (e.g. 30 seconds).
6. Click **Start sending**.
7. The extension will open the chat for each contact, pre-fill the message, and send it after the delay. Keep the WhatsApp Web tab active.

To stop, click **Stop** in the popup.

## Message format

Each message is sent as:

```
Hare Krishna <Name> Prabhu,

<Your message body>
```

or

```
Hare Krishna <Name> Mata Ji,

<Your message body>
```

depending on the **Gender** column.

## Project structure

```
├── manifest.json       # Extension manifest
├── popup/
│   ├── popup.html      # Popup UI
│   ├── popup.css       # Styles
│   └── popup.js        # CSV parsing, greeting logic, UI
├── background/
│   └── background.js   # Queue and delay between sends
├── content/
│   └── content.js      # Runs on WhatsApp Web; opens chat and sends
└── README.md
```

## Notes

- You must be logged in at [web.whatsapp.com](https://web.whatsapp.com) in a tab before starting.
- If the send button is not clicked (e.g. WhatsApp Web layout changed), you may need to send manually once per contact; the extension will still advance after the delay.
- Use delays of 15–60 seconds (or more) to avoid rate limits and stay within respectful usage.

## License

Use for personal/devotional use. Ensure compliance with WhatsApp’s Terms of Service.
