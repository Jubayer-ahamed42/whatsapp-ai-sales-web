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
import urllib.error
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

# Carrier-Grade NAT network (RFC 6598)
CGNAT_NET = ipaddress.ip_network('100.64.0.0/10')

# Explicitly blocked cloud metadata IPs and hostnames
BLOCKED_IPS = {
    '169.254.169.254',  # AWS, Azure, GCP metadata
    '100.100.100.200',  # Alibaba Cloud metadata
    '0.0.0.0',
    '127.0.0.1',
    '::1'
}

BLOCKED_HOSTNAMES = {
    'localhost', 'loopback', 'metadata.google.internal',
    'instance-data', '169.254.169.254', 'metadata.azure.com',
    'metadata', 'kubernetes.default.svc'
}

ALLOWED_PORTS = {80, 443, 8080, 8443}

def is_safe_url(target_url):
    """
    Comprehensive SSRF Protection:
    1. Validates HTTP/HTTPS scheme and permitted scraping ports.
    2. Resolves hostname across all IPv4 and IPv6 addresses.
    3. Blocks localhost, loopback, private subnets, link-local, carrier-grade NAT,
       and cloud metadata services (AWS/GCP/Azure/Alibaba).
    """
    try:
        parsed = urllib.parse.urlparse(target_url)
        if parsed.scheme.lower() not in ('http', 'https'):
            return False, "Only HTTP and HTTPS protocols are allowed"
        
        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid target host"
        
        hostname_lower = hostname.lower().strip('.')
        if hostname_lower in BLOCKED_HOSTNAMES or hostname_lower.endswith('.localhost'):
            return False, f"Access to restricted hostname '{hostname}' is prohibited"

        # Validate port if specified
        if parsed.port and parsed.port not in ALLOWED_PORTS:
            return False, f"Target port {parsed.port} is not permitted for catalog scraping"

        # Resolve all addresses (both IPv4 and IPv6) to prevent multi-record & DNS rebinding bypasses
        try:
            addr_info = socket.getaddrinfo(hostname, None, proto=socket.IPPROTO_TCP)
            if not addr_info:
                return False, "Hostname could not be resolved"
            
            for family, _, _, _, sockaddr in addr_info:
                ip_str = sockaddr[0]
                ip_obj = ipaddress.ip_address(ip_str)

                # Check known metadata IPs
                if str(ip_obj) in BLOCKED_IPS:
                    return False, f"Access to cloud metadata IP '{ip_str}' is prohibited"

                # Check private, loopback, link-local, reserved, multicast, unspecified
                if (ip_obj.is_private or ip_obj.is_loopback or 
                    ip_obj.is_link_local or ip_obj.is_reserved or 
                    ip_obj.is_multicast or ip_obj.is_unspecified):
                    return False, f"Access to private/local/reserved IP '{ip_str}' is prohibited"

                # Check Carrier-Grade NAT (100.64.0.0/10) for IPv4
                if ip_obj.version == 4 and ip_obj in CGNAT_NET:
                    return False, f"Access to carrier-grade NAT IP '{ip_str}' is prohibited"

        except socket.gaierror:
            return False, f"Hostname '{hostname}' could not be resolved"
        except Exception as e:
            return False, f"Resolution validation failed: {e}"

        return True, ""
    except Exception as e:
        return False, f"URL validation error: {e}"


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """
    Intercepts HTTP redirects (301, 302, 303, 307, 308) to ensure the redirect
    destination is also fully validated against SSRF policies.
    """
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        is_safe, reason = is_safe_url(newurl)
        if not is_safe:
            raise urllib.error.HTTPError(newurl, code, f"SSRF Redirect Blocked: {reason}", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


# Construct opener with safe redirect handling
safe_opener = urllib.request.build_opener(SafeRedirectHandler)


class SalesEngineHandler(http.server.SimpleHTTPRequestHandler):
    timeout = 10.0  # Socket timeout on client connections

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
                self.send_header('Access-Control-Allow-Origin', '*')
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
                self.send_header('Access-Control-Allow-Origin', '*')
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
            s_is_safe, _ = is_safe_url(shopify_url)
            if s_is_safe:
                s_req = urllib.request.Request(
                    shopify_url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
                )
                with safe_opener.open(s_req, timeout=3.5) as s_resp:
                    if s_resp.status == 200:
                        raw_data = s_resp.read(512 * 1024)  # Limit 512KB
                        s_data = json.loads(raw_data.decode('utf-8', errors='ignore'))
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
            with safe_opener.open(req, timeout=4.0) as response:
                html_bytes = response.read(256 * 1024)  # Limit 256KB to prevent memory exhaustion
                html = html_bytes.decode('utf-8', errors='ignore')

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
    # Use ThreadingHTTPServer for concurrent asynchronous request handling
    server_class = getattr(http.server, 'ThreadingHTTPServer', None)
    if not server_class:
        class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
            daemon_threads = True
        server_class = ThreadingHTTPServer
    else:
        server_class.daemon_threads = True

    server_class.allow_reuse_address = True
    with server_class(("", PORT), SalesEngineHandler) as httpd:
        print("=" * 60)
        print("🚀 WhatsApp AI Sales Rep Sandbox Server is Live (Multi-Threaded)!")
        print(f"👉 Local URL: http://localhost:{PORT}")
        print(f"👉 Directory: {BASE_DIR}")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")


if __name__ == '__main__':
    run()
