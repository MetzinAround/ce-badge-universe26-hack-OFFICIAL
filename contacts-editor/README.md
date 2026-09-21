# Badge Contact Editor

This is the standalone web companion for `badge/apps/contacts`.

```bash
npm install
npm run dev
```

The site listens on port 3200. The badge generates its QR code locally, without WiFi. Web Bluetooth requires HTTPS or localhost: use `CONTACT_EDITOR_URL = "https://contacts.example.com"` for a deployed editor, or open `http://localhost:3200` in Arc on the same computer running the site. A plain `http://<LAN-IP>:3200` page can load but cannot access Bluetooth.

The website only exchanges data directly with the selected badge. It has no dependency on either existing badge editor.
