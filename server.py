"""
Instant WhatsApp AI Sales Rep Sandbox - Local Server
Author: Jubayer Ahamed (Be Smart With AI)

Usage:
    python server.py [port]
Default Port: 8085
"""

import http.server
import socketserver
import os
import sys
import json
import urllib.request
import urllib.parse
import re
import socket
import ipaddress

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8085
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def is_safe_url(target_url):
    """
    SSRF Protection: Validates target URL against private IPs, localhost,
    and metadata services.
    """
    try:
        parsed = urllib.parse.urlparse(target_url)
        if parsed.scheme not in ('http', 'https'):
            return False, "Only HTTP and HTTPS protocols are allowed"
        
        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid target host"
        
        # Block internal/cloud metadata names
        blocked_names = {
            'localhost', 'loopback', 'metadata.google.internal',
            'instance-data', '169.254.169.254'
        }
        if hostname.lower() in blocked_names:
            return False, "Access to internal hostnames is prohibited"

        # Resolve IP and verify it is not private/reserved
        try:
            ip_str = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(ip_str)
            if (ip_obj.is_private or ip_obj.is_loopback or 
                ip_obj.is_link_local or ip_obj.is_reserved or 
                ip_obj.is_multicast):
                return False, "Access to private or local IP addresses is prohibited"
        except socket.gaierror:
            return False, "Hostname could not be resolved"

        return True, ""
    except Exception:
        return False, "URL validation error"

class SalesEngineHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'app': 'WhatsApp AI Sales Rep Sandbox'}).encode('utf-8'))
            return

        # Scrape endpoint for real-time live domain catalog inspection
        if path == '/api/scrape':
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get('url', [''])[0].strip()
            if not target_url:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing url parameter'}).encode('utf-8'))
                return

            if not target_url.startswith(('http://', 'https://')):
                target_url = 'https://' + target_url

            # SSRF Security Validation
            is_safe, reason = is_safe_url(target_url)
            if not is_safe:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': f'Security policy blocked target: {reason}'}).encode('utf-8'))
                return

            scraped_data = self.scrape_site(target_url)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(scraped_data, ensure_ascii=False).encode('utf-8'))
            return

        super().do_GET()

    def scrape_site(self, url):
        result = {
            'url': url,
            'title': '',
            'description': '',
            'ogImage': '',
            'products': [],
            'platform': 'custom'
        }
        
        # 1. Try Shopify standard public API: /products.json?limit=8
        base_url = url.rstrip('/')
        try:
            shopify_url = base_url + '/products.json?limit=8'
            s_req = urllib.request.Request(
                shopify_url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
            )
            with urllib.request.urlopen(s_req, timeout=3.5) as s_resp:
                if s_resp.status == 200:
                    s_data = json.loads(s_resp.read().decode('utf-8', errors='ignore'))
                    if 'products' in s_data and isinstance(s_data['products'], list) and len(s_data['products']) > 0:
                        result['platform'] = 'shopify'
                        for idx, sp in enumerate(s_data['products'][:8]):
                            p_title = sp.get('title', 'Shopify Product')
                            p_variant = (sp.get('variants') or [{}])[0]
                            p_price = float(p_variant.get('price') or 990)
                            p_compare = float(p_variant.get('compare_at_price') or (p_price * 1.25))
                            p_img = ''
                            if sp.get('images') and len(sp['images']) > 0:
                                p_img = sp['images'][0].get('src', '')
                            clean_desc = re.sub(r'<[^>]+>', ' ', sp.get('body_html') or '')
                            clean_desc = ' '.join(clean_desc.split())[:120]
                            result['products'].append({
                                'id': f"shopify-{sp.get('id', idx)}",
                                'title': p_title,
                                'titleBn': p_title,
                                'price': int(p_price),
                                'originalPrice': int(p_compare) if p_compare > p_price else int(p_price * 1.25),
                                'discountPercent': int(round((1 - p_price / p_compare) * 100)) if p_compare > p_price else 20,
                                'category': sp.get('product_type') or 'Store Collection',
                                'image': p_img or 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
                                'specs': clean_desc or '১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি গ্যারান্টি।',
                                'shortDesc': clean_desc or p_title,
                                'inStock': True,
                                'stockCount': 25,
                                'rating': 4.88,
                                'reviewsCount': 75
                            })
        except Exception:
            pass

        # 2. Scrape HTML metadata (OpenGraph & Schema.org)
        try:
            req = urllib.request.Request(
                url,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
            )
            with urllib.request.urlopen(req, timeout=4.5) as response:
                html = response.read().decode('utf-8', errors='ignore')

                # Extract title
                title_match = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                if not title_match:
                    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
                if title_match:
                    result['title'] = title_match.group(1).strip()

                # Extract meta description
                desc_match = re.search(r'<meta[^>]*property=["\']og:description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                if not desc_match:
                    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                if desc_match:
                    result['description'] = desc_match.group(1).strip()

                # Extract og:image
                og_img = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
                if og_img:
                    result['ogImage'] = og_img.group(1).strip()
        except Exception:
            result['error'] = 'Unable to reach or parse target store'

        return result

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SalesEngineHandler) as httpd:
        print("=" * 60)
        print("🚀 WhatsApp AI Sales Rep Sandbox Server is Live!")
        print(f"👉 Local URL: http://localhost:{PORT}")
        print(f"👉 Directory: {BASE_DIR}")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")

if __name__ == '__main__':
    run()
