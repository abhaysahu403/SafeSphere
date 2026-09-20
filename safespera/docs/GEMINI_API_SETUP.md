# Gemini API Key Setup Guide

## ✅ What I've Done

I've refactored your chat system to use **environment variables** instead of hardcoded API keys. This is much more secure and prevents keys from being exposed in your code.

## 🔑 How to Get a New API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Delete** the suspended key (if still there)
3. Click **"Create API Key"**
4. Copy the new key

## 🛡️ Important: Add API Restrictions

To prevent your key from being abused again:

1. In Google AI Studio, click on your API key
2. Go to **"API restrictions"**
3. Select **"HTTP referrers (web sites)"**
4. Add these referrers:
   - `http://localhost:8000/*`
   - `http://127.0.0.1:8000/*`
   - `https://yourdomain.com/*` (when you deploy)

## 📝 Setup Instructions

### Step 1: Update Your .env File

Open `safespera-old/safespera/.env` and replace the placeholder with your new key(s):

```env
# Gemini AI API Keys (comma-separated for rotation)
GEMINI_API_KEYS=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

**For single key:**
```env
GEMINI_API_KEYS=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**For multiple keys (rotation):**
```env
GEMINI_API_KEYS=AIzaSyKEY1,AIzaSyKEY2,AIzaSyKEY3
```

### Step 2: Restart Your Django Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
python manage.py runserver
```

### Step 3: Test the Chat

1. Go to http://localhost:8000/chat/
2. Send a test message
3. It should work now!

## 🔒 Security Benefits

✅ **No keys in code** - Keys are in `.env` which is gitignored
✅ **Easy rotation** - Just update `.env`, no code changes needed
✅ **Multiple keys** - Automatic rotation if one hits quota
✅ **Safe to commit** - Your code can be pushed to GitHub safely

## 🚨 Never Do This Again

❌ Don't hardcode API keys in HTML/JS files
❌ Don't commit `.env` files to Git
❌ Don't share API keys in screenshots or messages

## ✅ What's Changed

1. **`.env` file** - Now stores your API keys securely
2. **`views.py`** - Reads keys from environment and passes to template
3. **`chat.html`** - Uses Django template variable instead of hardcoded keys

## 🆘 Troubleshooting

**Error: "GEMINI_API_KEYS not found"**
- Make sure you updated the `.env` file
- Restart your Django server

**Error: "API key suspended"**
- You need to create a NEW key in Google AI Studio
- The old key cannot be reactivated

**Chat not working**
- Check browser console (F12) for errors
- Verify the key is correct in `.env`
- Make sure there are no extra spaces in the key

## 📞 Need Help?

If you're still having issues, let me know and I'll help you debug!
