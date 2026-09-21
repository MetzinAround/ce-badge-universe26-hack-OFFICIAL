"use client";

import { useEffect, useRef, useState } from "react";

const SERVICE = "a4310e0d-4c66-4a25-9ef3-7d8a35c5c501";
const RX = "a4310e0d-4c66-4a25-9ef3-7d8a35c5c502";
const TX = "a4310e0d-4c66-4a25-9ef3-7d8a35c5c503";

function validLinkedIn(value) {
  return /^https:\/\/(www\.)?linkedin\.com\//i.test(value.trim());
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim().length));
}

function encodeFrame(message) {
  const body = new TextEncoder().encode(JSON.stringify(message));
  const frame = new Uint8Array(4 + body.length);
  new DataView(frame.buffer).setUint32(0, body.length, false);
  frame.set(body, 4);
  return frame;
}

export default function ContactEditor() {
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState({ name: "", linkedin: "" });
  const [count, setCount] = useState(0);
  const [csv, setCsv] = useState("");
  const [rx, setRx] = useState(null);
  const [pass, setPass] = useState("");
  const notifyRef = useRef(null);
  const notifyListenerRef = useRef(null);
  const bufferRef = useRef(new Uint8Array());
  const passRef = useRef("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("pass") || "";
    setPass(value);
    passRef.current = value;
    if (value) window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const handle = (message) => {
    if (message.type === "profile") {
      setProfile(message.profile || { name: "", linkedin: "" });
      setCount(message.contacts || 0);
    }
    if (message.type === "saved") {
      setProfile(message.profile);
      setNotice("Saved to badge.");
    }
    if (message.type === "contacts") setCsv(message.csv || "");
    if (message.type === "unauthorized") {
      setNotice("");
      setError("Incorrect badge password. Check the code on the badge's pairing page (or scan its QR) and try again.");
    }
    if (message.type === "error") {
      setNotice("");
      setError(message.detail || "Badge rejected the request.");
    }
  };

  const onNotify = (event) => {
    const value = event.target.value;
    const incoming = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const prior = bufferRef.current;
    const merged = new Uint8Array(prior.length + incoming.length);
    merged.set(prior);
    merged.set(incoming, prior.length);
    let rest = merged;
    while (rest.length >= 4) {
      const length = new DataView(rest.buffer, rest.byteOffset, 4).getUint32(0, false);
      if (rest.length < length + 4) break;
      try {
        handle(JSON.parse(new TextDecoder().decode(rest.slice(4, length + 4))));
      } catch {
        setError("Badge sent an unreadable response.");
      }
      rest = rest.slice(length + 4);
    }
    bufferRef.current = rest;
  };

  useEffect(() => () => {
    if (notifyRef.current && notifyListenerRef.current) notifyRef.current.removeEventListener("characteristicvaluechanged", notifyListenerRef.current);
  }, []);

  const writeFrame = async (characteristic, message) => {
    const frame = encodeFrame({ ...message, pass: passRef.current });
    for (let index = 0; index < frame.length; index += 180) {
      const part = frame.slice(index, index + 180);
      if (characteristic.writeValueWithoutResponse) await characteristic.writeValueWithoutResponse(part);
      else await characteristic.writeValue(part);
    }
  };

  const send = async (message) => {
    if (!rx) throw new Error("Connect to your Contacts badge first.");
    await writeFrame(rx, message);
  };

  const connect = async () => {
    if (!window.isSecureContext) {
      setError("Web Bluetooth needs HTTPS or localhost. Arc works when this editor is opened at https://… or http://localhost:3200.");
      return;
    }
    if (!navigator.bluetooth) {
      setError("This browser did not expose Web Bluetooth in this tab. Arc is supported when opened in a secure context.");
      return;
    }
    setStatus("connecting");
    setError("");
    setNotice("");
    try {
      const device = await navigator.bluetooth.requestDevice({ filters: [{ services: [SERVICE] }], optionalServices: [SERVICE] });
      device.addEventListener("gattserverdisconnected", () => {
        setStatus("disconnected");
        setRx(null);
        if (notifyRef.current && notifyListenerRef.current) notifyRef.current.removeEventListener("characteristicvaluechanged", notifyListenerRef.current);
        notifyRef.current = null;
        notifyListenerRef.current = null;
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE);
      const write = await service.getCharacteristic(RX);
      const notify = await service.getCharacteristic(TX);
      await notify.startNotifications();
      bufferRef.current = new Uint8Array();
      notify.addEventListener("characteristicvaluechanged", onNotify);
      notifyRef.current = notify;
      notifyListenerRef.current = onNotify;
      setRx(write);
      setStatus("connected");
      await writeFrame(write, { cmd: "hello" });
      await writeFrame(write, { cmd: "get_contacts" });
    } catch (reason) {
      setStatus("disconnected");
      if (reason?.name !== "NotFoundError") setError(String(reason?.message || reason));
    }
  };

  const save = async () => {
    setError("");
    if (!profile.name.trim() || !validLinkedIn(profile.linkedin)) {
      setError("Enter your name and a full https://linkedin.com/... profile URL.");
      return;
    }
    try {
      setNotice("Saving to badge…");
      await send({ cmd: "save_profile", profile });
    } catch (reason) {
      setError(String(reason?.message || reason));
    }
  };

  const refresh = async () => {
    setError("");
    try {
      await send({ cmd: "get_contacts" });
    } catch (reason) {
      setError(String(reason?.message || reason));
    }
  };

  const clear = async () => {
    setError("");
    if (!window.confirm("Clear all saved contacts on this badge? For testing only — this cannot be undone.")) return;
    try {
      setNotice("Clearing contacts…");
      await send({ cmd: "clear_contacts" });
      setNotice("Contacts cleared.");
    } catch (reason) {
      setError(String(reason?.message || reason));
    }
  };

  const download = () => {
    if (!csv) return;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const rows = csv ? parseCsv(csv).slice(1) : [];

  return (
    <>
      <nav className="border-b border-edge bg-[#010409]">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-3">
          <svg viewBox="0 0 16 16" width="28" height="28" fill="currentColor" className="text-mist">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-mist">GitHub Universe</span>
          <span className="text-edge">/</span>
          <span className="text-sm text-faded">Badge Contacts</span>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8 border-b border-edge pb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-phosphor">badge contacts</p>
          <h1 className="mt-3 text-lg font-medium text-mist">Your contact card</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-faded">Scan the QR on your Contacts badge, connect here over Bluetooth, and save the card you want to share. Arc works when this page is served over HTTPS or opened at localhost. Names and LinkedIn URLs never go in secrets.py.</p>
        </header>

        <section className="rounded-md border border-edge bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-mist">{status === "connected" ? "Badge connected" : status === "connecting" ? "Choosing a badge…" : "No badge connected"}</div>
            <button onClick={connect} disabled={status === "connecting"} className="rounded-md bg-phosphor px-4 py-2 text-sm font-medium text-ink disabled:opacity-40">{status === "connected" ? "Reconnect" : "Connect over Bluetooth"}</button>
          </div>
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-[0.18em] text-faded">Badge password</label>
            <input
              value={pass}
              onChange={(event) => { const value = event.target.value.trim(); setPass(value); passRef.current = value; }}
              className="mt-2 w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm font-mono tracking-widest text-mist focus:border-phosphor focus:outline-none"
              placeholder="6-character code from the badge pairing page"
            />
            <p className="mt-1 text-xs text-faded">Auto-filled when you open this page from the badge&apos;s QR code. Type it here if you opened the page manually — the badge rejects every request without it.</p>
          </div>
          {error && <p className="mt-3 text-sm text-bad">{error}</p>}
          {notice && <p className="mt-3 text-sm text-good">{notice}</p>}
        </section>

        <section className="mt-6 rounded-md border border-edge bg-panel p-5">
          <label className="block text-xs uppercase tracking-[0.18em] text-faded">Name</label>
          <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="mt-2 w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm text-mist focus:border-phosphor focus:outline-none" placeholder="Your name" />
          <label className="mt-5 block text-xs uppercase tracking-[0.18em] text-faded">LinkedIn profile URL</label>
          <input value={profile.linkedin} onChange={(event) => setProfile({ ...profile, linkedin: event.target.value })} className="mt-2 w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm text-mist focus:border-phosphor focus:outline-none" placeholder="https://www.linkedin.com/in/you" />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={save} disabled={status !== "connected"} className="rounded-md bg-phosphor px-4 py-2 text-sm font-medium text-ink disabled:opacity-40">Save to badge</button>
            <span className="text-xs text-faded">{count} contact{count === 1 ? "" : "s"} saved on this badge</span>
          </div>
        </section>

        <section className="mt-6 rounded-md border border-edge p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-mist">Saved contacts</h2>
              <p className="mt-1 text-xs text-faded">A preview of the contacts.csv stored on the badge.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={refresh} disabled={status !== "connected"} className="rounded-md border border-edge px-3 py-1.5 text-xs text-mist hover:border-phosphor hover:text-phosphor disabled:opacity-40">Refresh</button>
              <button onClick={download} disabled={!csv} className="rounded-md border border-edge px-3 py-1.5 text-xs text-mist hover:border-phosphor hover:text-phosphor disabled:opacity-40">Download CSV</button>
              <button onClick={clear} disabled={status !== "connected"} className="rounded-md border border-bad/40 px-3 py-1.5 text-xs text-bad hover:border-bad hover:bg-bad/10 disabled:opacity-40">Clear (test)</button>
            </div>
          </div>
          {rows.length > 0 ? (
            <div className="mt-4 overflow-x-auto rounded-md border border-edge">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-edge bg-panel">
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-faded">Name</th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-faded">LinkedIn</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((cells, index) => (
                    <tr key={index} className="border-b border-edge last:border-b-0">
                      <td className="px-3 py-2 text-mist">{cells[0]}</td>
                      <td className="px-3 py-2">
                        {validLinkedIn(cells[1] || "") ? (
                          <a href={cells[1]} target="_blank" rel="noreferrer" className="text-phosphor hover:underline">{cells[1].replace(/^https:\/\/(www\.)?/, "")}</a>
                        ) : (
                          <span className="text-faded">{cells[1]}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-faded">{status === "connected" ? (csv ? "No contacts saved yet — go swap some cards." : "Loading contacts…") : "Connect to your badge to preview its contacts."}</p>
          )}
        </section>

        <p className="mt-6 text-xs leading-relaxed text-faded">To exchange: both people hold A + C while close, then each presses A once the badges show a matching code name after making a private link. The app displays no identity until both confirmations are received. Press C to cancel before transfer.</p>

        <footer className="mt-10 border-t border-edge pt-5 text-xs text-faded">
          <p>© GitHub, Inc. · GitHub Universe</p>
        </footer>
      </main>
    </>
  );
}
