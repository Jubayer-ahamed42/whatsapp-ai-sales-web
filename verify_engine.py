"""
Comprehensive Verification Suite for WhatsApp AI Sales Rep Sandbox (সেলস ইঞ্জিন)
Verifies:
1. Catalog Engine logic, presets, dynamic domain synthesis, manual product ingestion
2. Bengali inflected product search, Banglish queries, stopword stripping
3. AI Sales Rep Conversational Engine: greetings, size/color checks, objection handling,
   order-flow question routing, Bengali phone normalization, COD receipt, and closing proposal trigger
4. Python Local Server endpoints (/api/health, /api/scrape, static delivery)
5. Executes natively in Node.js if present, or in Headless Chrome via CDP if Node is absent.
"""

import os
import sys
import json
import time
import shutil
import socket
import base64
import urllib.request
import subprocess

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

JS_TEST_SUITE = """
(function() {
    const results = [];
    try {
        if (!window.CatalogEngine) throw new Error("CatalogEngine not loaded on window");
        if (!window.AISalesAgent) throw new Error("AISalesAgent not loaded on window");

        const catalog = new CatalogEngine();
        results.push("CatalogEngine initialized successfully");

        // 1. Default Store check (Fabrilife)
        const defaultStore = catalog.getCurrentStore();
        if (defaultStore.id !== 'fabrilife' || catalog.getAllProducts().length < 5) {
            throw new Error("Default store is not Fabrilife with 5+ products");
        }
        results.push("Default Store (Fabrilife) loaded with " + catalog.getAllProducts().length + " products");

        // 2. Bengali inflected product search
        const q1 = "হুডিটার প্রাইস কত?";
        const m1 = catalog.findProducts(q1);
        if (m1.length === 0 || !m1[0].title.includes('Hoodie')) {
            throw new Error("Failed Bengali inflected search for: " + q1);
        }
        results.push("Bengali Inflected Search ('" + q1 + "') matched: " + m1[0].titleBn);

        const q2 = "পাঞ্জাবির সাইজ কি কি আছে?";
        const m2 = catalog.findProducts(q2);
        if (m2.length === 0 || !m2[0].title.includes('Panjabi')) {
            throw new Error("Failed Bengali inflected search for: " + q2);
        }
        results.push("Bengali Inflected Search ('" + q2 + "') matched: " + m2[0].titleBn);

        // 3. Banglish query search
        const q3 = "hoodie ta koto?";
        const m3 = catalog.findProducts(q3);
        if (m3.length === 0 || !m3[0].title.includes('Hoodie')) {
            throw new Error("Failed Banglish search for: " + q3);
        }
        results.push("Banglish Search ('" + q3 + "') matched: " + m3[0].titleBn);

        // 4. Store Switch (Gadget & Gear)
        const gng = catalog.setStoreByDomain('gadgetandgear.com');
        if (!gng.success || catalog.getCurrentStore().id !== 'gadgetandgear') {
            throw new Error("Store switch to Gadget & Gear failed");
        }
        const airpods = catalog.findProducts('AirPods');
        if (airpods.length === 0) throw new Error("Failed searching AirPods in Gadget & Gear");
        results.push("Store switch (Gadget & Gear) matched: " + airpods[0].title);

        // 5. Dynamic Domain Synthesis (Shoe & Tech)
        const shoes = catalog.setStoreByDomain('apexshoes.com');
        if (!shoes.isSynthesized || catalog.getCurrentStore().category !== 'Footwear & Shoes') {
            throw new Error("Footwear domain synthesis failed for apexshoes.com");
        }
        results.push("Dynamic Domain Synthesis (apexshoes.com) -> Footwear & Shoes OK");

        const tech = catalog.setStoreByDomain('startech.com.bd');
        if (!tech.isSynthesized || catalog.getCurrentStore().category !== 'Electronics & Gadgets') {
            throw new Error("Tech domain synthesis failed for startech.com.bd");
        }
        results.push("Dynamic Domain Synthesis (startech.com.bd) -> Electronics & Gadgets OK");

        // 6. Manual Custom Product Ingestion
        const custom = catalog.setManualProduct({
            title: 'ম্যানুয়াল লেদার জ্যাকেট',
            price: 3500,
            originalPrice: 4500,
            category: 'Leather Apparel',
            specs: '100% Genuine Leather'
        });
        if (catalog.getAllProducts()[0].id !== custom.id) {
            throw new Error("Manual product not placed at head of active inventory");
        }
        results.push("Manual Product Ingestion verified: " + custom.title);

        // 7. AISalesAgent Conversational Tests
        const agent = new AISalesAgent(catalog);
        results.push("AISalesAgent initialized");

        // Greeting
        const rGreeting = agent.processUserMessage("আসসালামু আলাইকুম");
        if (!rGreeting.text.includes("ওয়ালাইকুমুস সালাম")) {
            throw new Error("Greeting intent failed");
        }
        results.push("Greeting handled correctly");

        // Specific Size / Color inquiry
        const rSize = agent.processUserMessage("এই প্রোডাক্টের সাইজ ও কালার কি স্টকে আছে?");
        if (!rSize.text.includes("সাইজ") || !rSize.text.includes("কালার") || !rSize.productCard) {
            throw new Error("Size/Color inquiry intent failed");
        }
        results.push("Size/Color inquiry handled with product details: " + rSize.productCard.title);

        // Price Objection / Banglish discount
        const rDiscount = agent.processUserMessage("koto rakhba bhai? kicu kom koren");
        if (!rDiscount.text.includes("ডিসকাউন্ট") && !rDiscount.text.includes("অফার")) {
            throw new Error("Banglish discount objection handling failed");
        }
        results.push("Banglish discount objection handled consultatively");

        // Order Intent Trigger
        const rOrder = agent.processUserMessage("আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই!");
        if (!agent.currentOrderState.inProgress || !rOrder.text.includes("ক্যাশ অন ডেলিভারিতে অর্ডার করতে")) {
            throw new Error("Direct order intent trigger failed");
        }
        results.push("Order intent triggered COD collection state");

        // Question inside order flow (MUST NOT prematurely confirm order!)
        const rQuestion = agent.processUserMessage("ঢাকার বাইরে ডেলিভারি পেতে কতদিন লাগবে ভাই?");
        if (rQuestion.isOrderSummary) {
            throw new Error("FATAL BUG: Question inside order flow was wrongly treated as order summary!");
        }
        if (!rQuestion.text.includes("ঢাকার বাইরে") || !rQuestion.text.includes("ডেলিভারি")) {
            throw new Error("Delivery question inside order flow was not answered!");
        }
        results.push("Order-flow question safely routed without premature confirmation");

        // Genuine Address submission with Bengali numerals phone number
        const rComplete = agent.processUserMessage("নাম: তানভীর আহমেদ, ফোন: ০১৭১১২২৩৩৪৪, ঠিকানা: বাড়ি ১২, রোড ৫, বনানী, ঢাকা");
        if (!rComplete.isOrderSummary || !rComplete.text.includes("01711223344") || !rComplete.text.includes("অর্ডার আইডি")) {
            throw new Error("COD Order summary with Bengali phone failed");
        }
        results.push("COD Order confirmation generated with normalized phone & order ID");

        // Closing Proposal trigger check
        if (!agent.hasSentProposal && !rComplete.showClosingProposal) {
            throw new Error("Closing proposal card was not triggered after 3-4 interactions / order completion");
        }
        results.push("In-Chat Conversion Closing Proposal Card triggered successfully");

        return { success: true, logs: results };
    } catch(err) {
        return { success: false, error: err.message, logs: results };
    }
})()
"""

def send_cdp_evaluate(ws_url, expression):
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

    resp = b""
    while b"\r\n\r\n" not in resp:
        chunk = s.recv(4096)
        if not chunk:
            break
        resp += chunk

    payload = json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": expression, "returnByValue": True}}).encode('utf-8')
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

    raw_data = b""
    while True:
        chunk = s.recv(4096)
        if not chunk:
            break
        raw_data += chunk
        if len(raw_data) > 2:
            plen = raw_data[1] & 0x7F
            off = 4 if plen == 126 else (10 if plen == 127 else 2)
            total_len = (int.from_bytes(raw_data[2:4], 'big') if plen == 126 else (int.from_bytes(raw_data[2:10], 'big') if plen == 127 else plen)) + off
            if len(raw_data) >= total_len:
                break
    s.close()

    plen = raw_data[1] & 0x7F
    off = 4 if plen == 126 else (10 if plen == 127 else 2)
    return json.loads(raw_data[off:].decode('utf-8', errors='ignore'))

def run_js_test_cdp():
    print("\n--- [1] Testing JavaScript Engines via Headless Chrome CDP ---")
    cdp_port = 9488
    chrome_proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={cdp_port}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"file:///{BASE_DIR.replace(os.sep, '/')}/index.html"
    ])
    time.sleep(2.5)

    try:
        targets_url = f"http://127.0.0.1:{cdp_port}/json"
        with urllib.request.urlopen(targets_url, timeout=5) as resp:
            targets = json.loads(resp.read().decode('utf-8'))
            page_target = next((t for t in targets if t.get('type') == 'page'), targets[0])
            ws_url = page_target['webSocketDebuggerUrl']

        res = send_cdp_evaluate(ws_url, JS_TEST_SUITE)
        val = res.get('result', {}).get('result', {}).get('value', {})

        for log in val.get('logs', []):
            print("  ✓", log)

        if not val.get('success'):
            print("❌ JS Test Suite Failed:", val.get('error'))
            return False

        print("\n>>> ALL IN-BROWSER JS TESTS PASSED PERFECTLY! <<<")
        return True
    finally:
        chrome_proc.terminate()
        chrome_proc.wait()

def run_js_test():
    node_path = shutil.which('node')
    if node_path:
        print("\n--- [1] Testing JavaScript CatalogEngine & AISalesAgent via Node.js ---")
        test_file = os.path.join(BASE_DIR, 'test_runner.js')
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(f"global.window = global; require('./js/catalogEngine.js'); require('./js/aiSalesAgent.js'); const res = {JS_TEST_SUITE}; console.log(JSON.stringify(res)); if(!res.success) process.exit(1);")
        try:
            res = subprocess.run([node_path, test_file], cwd=BASE_DIR, capture_output=True, text=True)
            print(res.stdout)
            if res.returncode == 0:
                return True
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)
    
    # Fallback to headless Chrome CDP
    return run_js_test_cdp()

def run_server_test():
    print("\n--- [2] Testing Python Local Server & Endpoints ---")
    port = 8095
    server_proc = subprocess.Popen([sys.executable, 'server.py', str(port)], cwd=BASE_DIR)
    time.sleep(1.5)

    try:
        # 1. Test health endpoint
        health_url = f"http://127.0.0.1:{port}/api/health"
        with urllib.request.urlopen(health_url, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('status') == 'ok':
                print("  ✓ Server health check passed:", data)
            else:
                raise Exception("Server returned unexpected health response: " + str(data))

        # 2. Test scrape endpoint
        scrape_url = f"http://127.0.0.1:{port}/api/scrape?url=example.com"
        with urllib.request.urlopen(scrape_url, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("  ✓ Scrape endpoint passed: Title =", data.get('title'))

        # 3. Test static index.html serving
        index_url = f"http://127.0.0.1:{port}/index.html"
        with urllib.request.urlopen(index_url, timeout=3) as resp:
            content = resp.read().decode('utf-8')
            if 'Be Smart With AI' in content and 'waSimulatorContainer' in content:
                print("  ✓ index.html successfully served by local server.")
            else:
                raise Exception("index.html missing key content when served via server")

    finally:
        server_proc.terminate()
        server_proc.wait()
        print("  ✓ Server stopped cleanly.")

    return True

if __name__ == '__main__':
    ok1 = run_js_test()
    ok2 = run_server_test()

    if ok1 and ok2:
        print("\n" + "=" * 60)
        print("🌟 ALL VERIFICATION TESTS PASSED WITH 100% SUCCESS! 🌟")
        print("=" * 60 + "\n")
    else:
        sys.exit(1)
