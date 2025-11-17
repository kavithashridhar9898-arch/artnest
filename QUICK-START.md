# 🚀 Quick Start - Access ArtNest from Other Devices

## Option 1: Double-Click Start (Easiest)

1. **Run the script:**
   ```
   Double-click: start-network.bat
   ```

2. **Update config (one-time setup):**
   - The script will open `config.js` automatically
   - Replace `YOUR_IP` with the IP shown in the terminal
   - Change `CURRENT_MODE: 'LOCAL_URL'` to `CURRENT_MODE: 'NETWORK_URL'`
   - Save and close

3. **Access from any device:**
   - Open browser on any device (phone, laptop, tablet)
   - Go to: `http://YOUR_IP:8080`
   - Example: `http://192.168.1.100:8080`

---

## Option 2: Manual Start

### Step 1: Start Backend
```bash
cd backend
npm start
```
**Note the Network IP shown in terminal** (e.g., `192.168.1.100:3000`)

### Step 2: Start Frontend (in new terminal)
```bash
cd frontend
http-server -p 8080 -c-1
```

If you don't have `http-server`:
```bash
npm install -g http-server
```

Or use Python:
```bash
python -m http.server 8080
```

### Step 3: Update Config (one-time)
Open `frontend/js/config.js`:
```javascript
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:3000',
  NETWORK_URL: 'http://192.168.1.100:3000', // ← YOUR IP HERE
  CURRENT_MODE: 'NETWORK_URL' // ← Change this
};
```

---

## 🔥 Troubleshooting

### Can't Connect from Other Devices?

**1. Check Firewall**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="ArtNest Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="ArtNest Frontend" dir=in action=allow protocol=TCP localport=8080
```

**2. Verify Same Network**
- All devices must be on the same WiFi network
- Check your phone/laptop WiFi settings

**3. Check IP Address**
```bash
ipconfig
```
Look for "IPv4 Address" under your active connection

**4. Test Backend**
Open in browser: `http://YOUR_IP:3000`
- Should see: "Cannot GET /"
- This is normal - backend is working

---

## 📱 Access from Different Devices

| Device | How to Access |
|--------|--------------|
| **Another Laptop** | Open browser → `http://YOUR_IP:8080` |
| **Phone/Tablet** | Connect to same WiFi → Browser → `http://YOUR_IP:8080` |
| **Same Computer** | Use `http://localhost:8080` |

---

## 🌐 Deploy to Internet (Cloud)

For access from anywhere (not just local network):

### Recommended: Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
cd frontend
vercel
```

**Backend (Render):**
1. Create account at [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add environment variables (DATABASE_URL, JWT_SECRET)

**Update config.js:**
```javascript
NETWORK_URL: 'https://your-backend.onrender.com', // Your Render URL
```

---

## 💡 Tips

- **Development:** Use `CURRENT_MODE: 'LOCAL_URL'`
- **Network Testing:** Use `CURRENT_MODE: 'NETWORK_URL'`
- **Production:** Use cloud URLs

- **Database:** Make sure MySQL is running
- **Ports:** Backend=3000, Frontend=8080

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "npm: command not found" | Install Node.js from [nodejs.org](https://nodejs.org) |
| "Cannot connect to database" | Start MySQL service, check credentials in `.env` |
| "Port 3000 already in use" | Kill process: `npx kill-port 3000` |
| "ERR_CONNECTION_REFUSED" | Check firewall, verify IP address |
| "Login not working" | Verify API_BASE_URL matches backend IP |

---

## ✅ Quick Checklist

- [ ] MySQL service running
- [ ] Backend started (`cd backend && npm start`)
- [ ] Frontend started (`cd frontend && http-server -p 8080`)
- [ ] config.js updated with correct IP
- [ ] CURRENT_MODE set to 'NETWORK_URL'
- [ ] Firewall allows ports 3000 and 8080
- [ ] Other device on same WiFi network

---

**Need Help?** Check `DEPLOYMENT.md` for detailed documentation.
