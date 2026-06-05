import SwiftUI
import WebKit

struct SVGView: UIViewRepresentable {
    let slug: String

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.backgroundColor = .clear
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard let url = Bundle.main.url(forResource: slug, withExtension: "svg", subdirectory: "illustrations") else {
            webView.loadHTMLString("", baseURL: nil)
            return
        }

        let html = """
        <!doctype html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: transparent; }
            img { width: 100%; height: 100%; object-fit: cover; display: block; }
          </style>
        </head>
        <body><img src="\(url.lastPathComponent)" alt=""></body>
        </html>
        """
        webView.loadHTMLString(html, baseURL: url.deletingLastPathComponent())
    }
}
