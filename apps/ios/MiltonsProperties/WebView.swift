//
//  WebView.swift
//  Milton's Properties
//
//  Hosts the portfolio desk. The web layer owns all state; this wrapper only
//  loads it, keeps navigation inside the app, and hands external links to Safari.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {

    /// File in the app bundle to load, without extension.
    let resource: String

    /// Set true by the coordinator if the bundle resource is missing.
    @Binding var loadFailed: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()

        // Video/audio would otherwise demand a user gesture. Harmless here,
        // and saves a surprise if a walkthrough video is added later.
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator

        // The page draws its own background (--paper). Matching it here stops
        // a white flash on launch and on rubber-band scroll.
        let paper = UIColor(red: 0.961, green: 0.965, blue: 0.957, alpha: 1)
        webView.isOpaque = false
        webView.backgroundColor = paper
        webView.scrollView.backgroundColor = paper

        // The masthead is position:sticky; letting the scroll view inset it
        // again would double the top padding.
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.showsHorizontalScrollIndicator = false

        // Enable Safari Web Inspector against the simulator or a tethered device.
        #if DEBUG
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        #endif

        load(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // State lives in the web layer, so there is nothing to push down.
    }

    private func load(into webView: WKWebView) {
        guard let url = Bundle.main.url(forResource: resource, withExtension: "html", subdirectory: "Web")
                ?? Bundle.main.url(forResource: resource, withExtension: "html") else {
            // Almost always means the Web folder was added as a group instead of
            // a folder reference, so the file never made it into the bundle.
            DispatchQueue.main.async { self.loadFailed = true }
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    // MARK: - Coordinator

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private let parent: WebView

        init(_ parent: WebView) {
            self.parent = parent
        }

        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            // Local files and the Google Fonts stylesheet stay in the web view.
            if url.isFileURL || url.host == "fonts.googleapis.com" || url.host == "fonts.gstatic.com" {
                decisionHandler(.allow)
                return
            }

            // Anything a user actually taps — a real listing link, a mailto, a
            // dispute form — belongs in Safari or Mail, not trapped in here.
            if navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }

            decisionHandler(.allow)
        }

        // window.open() has no chrome in a wrapper, so route it out too.
        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                UIApplication.shared.open(url)
            }
            return nil
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.loadFailed = true
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.loadFailed = true
        }
    }
}
