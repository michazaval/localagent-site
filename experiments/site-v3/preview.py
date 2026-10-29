"""Local-only, bounded static preview. Python 3 standard library; no installation."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8770)
    parser.add_argument('--minutes', type=int, choices=range(1, 121), default=30)
    parser.add_argument('--open', action='store_true', help='Open the comparison gallery')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    timer = Timer(args.minutes * 60, server.shutdown)
    timer.daemon = True
    url = f'http://127.0.0.1:{args.port}/experiments/site-v3/'
    print(f'{url}\nLocal preview expires in {args.minutes} minutes. Ctrl+C stops it.', flush=True)
    timer.start()
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        timer.cancel()
        server.server_close()

if __name__ == '__main__':
    main()
