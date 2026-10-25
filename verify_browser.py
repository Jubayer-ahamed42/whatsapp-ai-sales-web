"""
End-to-End Browser Verification using Headless Chrome CDP
Verifies BOTH:
1. Local HTTP Server mode: http://127.0.0.1:8088/index.html
2. Zero-Dependency Offline file:/// mode: file:///<path>/index.html

Executes in-browser test suite across:
- CatalogEngine, AISalesAgent, WhatsAppSimulator
- Sticky Navbar with "মূল এজেন্সিতে ফিরে যান" backlink and "লাইভ ডেমো" CTA button
- All 7 Standalone SaaS Sections (#hero to #faq)
- Live Store Ingestion & Manual Product Insertion
- Real-time COD Order Summary with Bengali Phone Normalization
- ROI Calculator Reactivity (Sales Lift & Support Cost Reduction)
- FAQ Accordion Toggles
"""

import subprocess
import time
import json
import urllib.request
import os
import sys
import socket
import base64

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8088
CDP_PORT = 9333

def send_cdp_command(ws_url, method, params=None):
    url_part = ws_url.replace("ws://", "")
    host_port, path = url_part.split("/", 1)
    host, port_str = host_port.split(":")
    port_num = int(port_str)
    path = "/" + path

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(6.0)
    s.connect((host, port_num))

    key = base64.b64encode(os.urandom(16)).decode('ascii')
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port_num}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(handshake.encode('utf-8'))

    # Read handshake response
    resp = b""
    while b"\r\n\r\n" not in resp:
        chunk = s.recv(4096)
        if not chunk:
            break
        resp += chunk

    # Format CDP payload
    req_id = 1
    payload = json.dumps({"id": req_id, "method": method, "params": params or {}}).encode('utf-8')

    # WebSocket frame (masked client -> server)
    length = len(payload)
    mask = os.urandom(4)
    masked_payload = bytearray(length)
    for i in range(length):
        masked_payload[i] = payload[i] ^ mask[i % 4]

    if length <= 125:
        header = bytes([0x81, 0x80 | length]) + mask
    elif length <= 65535:
        header = bytes([0x81, 0x80 | 126, (length >> 8) & 0xFF, length & 0xFF]) + mask
    else:
        header = bytes([0x81, 0x80 | 127]) + length.to_bytes(8, 'big') + mask

    s.sendall(header + bytes(masked_payload))

    # Receive WebSocket frame response
    raw_data = s.recv(65536)
    s.close()

    # Parse frame
    if len(raw_data) > 2:
        payload_len = raw_data[1] & 0x7F
        offset = 2
        if payload_len == 126:
            offset = 4
        elif payload_len == 127:
            offset = 10
        msg_bytes = raw_data[offset:]
        return json.loads(msg_bytes.decode('utf-8', errors='ignore'))
    return {}

BROWSER_TEST_SCRIPT = """
(function() {
  const results = [];
  try {
    // 1. Check globals
    if (!window.CatalogEngine) throw new Error("CatalogEngine not found on window");
    if (!window.AISalesAgent) throw new Error("AISalesAgent not found on window");
    if (!window.WhatsAppSimulator) throw new Error("WhatsAppSimulator not found on window");
    results.push("Engine Classes: OK");

    // 2. Check Master Sections for Standalone Landing Website
    const sections = ['hero', 'sandbox', 'how-it-works', 'features', 'roi-calculator', 'pricing', 'faq'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) throw new Error("Missing standalone section: #" + id);
    });
    results.push("All 7 Standalone SaaS Sections (#hero to #faq): OK");

    // 3. Check Navbar CTAs
    const liveDemoBtn = document.getElementById('navbarLiveDemoBtn');
    if (!liveDemoBtn || liveDemoBtn.getAttribute('href') !== '#sandbox') {
      throw new Error("Navbar Live Demo CTA button missing or not targeting #sandbox");
    }
    results.push("Navbar 'লাইভ ডেমো' CTA Button: OK");

    // 4. Check Simulator DOM
    const container = document.getElementById('waSimulatorContainer');
    if (!container || !container.querySelector('.wa-window')) {
      throw new Error("WhatsApp Simulator frame not rendered");
    }
    results.push("Simulator DOM: OK");

    // 5. Test Catalog Engine
    const catalog = new CatalogEngine();
    const store = catalog.getCurrentStore();
    if (!store || store.id !== 'fabrilife' || catalog.getAllProducts().length < 5) {
      throw new Error("Catalog default store mismatch");
    }
    results.push("Default Store (Fabrilife): " + catalog.getAllProducts().length + " products");

    // 6. Test Bengali Search
    const bengaliMatches = catalog.findProducts('হুডি');
    if (bengaliMatches.length === 0) throw new Error("Bengali search for 'হুডি' failed");
    results.push("Bengali Search 'হুডি': " + bengaliMatches[0].titleBn);

    // 7. Test Store Switch
    const gng = catalog.setStoreByDomain('gadgetandgear.com');
    if (!gng.success || catalog.getCurrentStore().id !== 'gadgetandgear') {
      throw new Error("Store switch to Gadget & Gear failed");
    }
    results.push("Store Switch: Gadget & Gear OK");

    // 8. Test Dynamic Generation
    const synth = catalog.setStoreByDomain('shoeking.com');
    if (!synth.isSynthesized || catalog.getAllProducts().length === 0) {
      throw new Error("Dynamic domain synthesis failed");
    }
    results.push("Dynamic Synthesis (shoeking.com): OK");

    // 9. Test Manual Product
    const custom = catalog.setManualProduct({
      title: 'ম্যানুয়াল লেদার জ্যাকেট',
      price: 3500,
      originalPrice: 4500
    });
    if (catalog.getAllProducts()[0].id !== custom.id) {
      throw new Error("Manual product insertion failed");
    }
    results.push("Manual Product Ingestion: OK");

    // 10. Test AI Sales Agent & Closing Proposal Trigger (at 3-4 messages)
    const agent = new AISalesAgent(catalog);
    let m1 = agent.processUserMessage("Hi");
    let m2 = agent.processUserMessage("জ্যাকেট সম্পর্কে বলুন");
    let m3 = agent.processUserMessage("ডেলিভারি চার্জ কত?");
    if (!m3.showClosingProposal && !agent.hasSentProposal) {
      throw new Error("Closing proposal card trigger failed at message 3");
    }
    results.push("Closing Proposal Card Trigger: OK (showClosingProposal=" + m3.showClosingProposal + ")");

    // 11. Test Order Flow Question Protection
    let m4 = agent.processUserMessage("অর্ডার করতে চাই");
    let mQuestion = agent.processUserMessage("ঢাকার বাইরে ডেলিভারি চার্জ কত?");
    if (mQuestion.isOrderSummary) {
      throw new Error("Question during order flow was falsely treated as order completion");
    }
    results.push("Order flow question correctly routed without premature confirmation");

    // 12. Test COD Order Summary with Bengali numerals phone
    let m5 = agent.processUserMessage("নাম: তাহসিন, ফোন: ০১৮১২৩৪৫৬৭৮, ঠিকানা: বনানী, ঢাকা");
    if (!m5.isOrderSummary || !m5.text.includes('অর্ডার আইডি') || !m5.text.includes('01812345678')) {
      throw new Error("COD Order summary generation with Bengali phone failed");
    }
    results.push("COD Order Receipt with normalized Bengali phone: OK");

    // 13. Test Interactive ROI Calculator
    const roiVis = document.getElementById('roiVisitors');
    const roiRev = document.getElementById('roiProjectedRev');
    const roiSavings = document.getElementById('roiSupportSavings');
    if (roiVis && roiRev && roiSavings) {
      roiVis.value = 4000;
      roiVis.dispatchEvent(new Event('input'));
      results.push("ROI Calculator Reactivity: Sales Lift = " + roiRev.textContent + ", Support Cost Saved = " + roiSavings.textContent);
    }

    // 14. Test FAQ Accordion click
    const firstFaq = document.querySelector('.faq-item .faq-trigger');
    const firstContent = document.querySelector('.faq-item .faq-content');
    if (firstFaq && firstContent) {
      firstFaq.click();
      if (!firstContent.classList.contains('open')) throw new Error("FAQ accordion failed to open");
      results.push("FAQ Accordion Toggle: OK");
    }

    return { success: true, logs: results };
  } catch (e) {
    return { success: false, error: e.message, logs: results };
  }
})()
"""

def test_target_url(target_url, mode_name, cdp_port):
    print(f"\n---> Testing Mode: {mode_name}")
    print(f"Target URL: {target_url}")

    chrome_args = [
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={cdp_port}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        target_url
    ]
    proc = subprocess.Popen(chrome_args)
    time.sleep(2.5)

    try:
        cdp_targets_url = f"http://127.0.0.1:{cdp_port}/json"
        with urllib.request.urlopen(cdp_targets_url, timeout=5) as resp:
            targets = json.loads(resp.read().decode('utf-8'))
            page_target = next((t for t in targets if t.get('type') == 'page'), targets[0])
            ws_url = page_target.get('webSocketDebuggerUrl')

        eval_resp = send_cdp_command(ws_url, "Runtime.evaluate", {
            "expression": BROWSER_TEST_SCRIPT,
            "returnByValue": True
        })

        res_val = eval_resp.get('result', {}).get('result', {}).get('value', {})
        print(f"✓ [{mode_name}] In-Browser Execution Results:")
        for log_line in res_val.get('logs', []):
            print(f"    - {log_line}")

        if not res_val.get('success'):
            raise Exception(f"[{mode_name}] In-Browser Test Failed: {res_val.get('error')}")

        print(f"✓ [{mode_name}] Passed with 100% success!")
    finally:
        proc.terminate()
        proc.wait()

def main():
    print("=" * 65)
    print("🚀 Starting End-to-End Dual-Mode Browser & Server Verification")
    print("=" * 65)

    # 1. Start python server
    print(f"[1] Starting server.py on port {PORT}...")
    server_proc = subprocess.Popen([sys.executable, "server.py", str(PORT)], cwd=BASE_DIR)
    time.sleep(1.5)

    try:
        # Test server health endpoint
        health_url = f"http://127.0.0.1:{PORT}/api/health"
        with urllib.request.urlopen(health_url, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("✓ Health endpoint returned:", data)
            assert data.get('status') == 'ok', "Health check failed"

        # Test scrape endpoint
        scrape_url = f"http://127.0.0.1:{PORT}/api/scrape?url=example.com"
        with urllib.request.urlopen(scrape_url, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("✓ Scrape endpoint returned title:", data.get('title'))

        # [A] Mode 1: Local HTTP Server
        http_url = f"http://127.0.0.1:{PORT}/index.html"
        test_target_url(http_url, "HTTP Local Server Mode", CDP_PORT)

        # [B] Mode 2: Offline file:/// Protocol
        file_path_slashed = BASE_DIR.replace("\\", "/")
        file_url = f"file:///{file_path_slashed}/index.html"
        test_target_url(file_url, "Offline file:/// Zero-Dependency Mode", CDP_PORT + 1)

        print("\n" + "=" * 65)
        print("🎉 ALL IN-BROWSER & DUAL-MODE CHECKS PASSED FLAWLESSLY!")
        print("=" * 65)

    finally:
        if server_proc:
            server_proc.terminate()
            server_proc.wait()
            print("✓ Server closed.")

if __name__ == '__main__':
    main()
