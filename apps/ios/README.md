# Milton's Properties — iOS

SwiftUI shell hosting the portfolio desk in a `WKWebView`. Same pattern as the Yu-Gi-Oh Lab wrapper: the web layer owns all state, Swift just loads it and keeps navigation sane.

Requires Xcode 15 or later. Targets iOS 17, iPhone and iPad.

---

## Build it — pick one path

### Path A: Xcode only, no tools to install (5 minutes)

1. Xcode → **File → New → Project → iOS → App**
2. Product Name **MiltonsProperties**, Interface **SwiftUI**, Language **Swift**. Save it somewhere outside this folder.
3. Delete the generated `ContentView.swift` (Move to Trash).
4. Drag `MiltonsPropertiesApp.swift`, `ContentView.swift` and `WebView.swift` from `MiltonsProperties/` into the Xcode project navigator. Tick **Copy items if needed** and your app target.
5. **This step is the one that breaks builds.** Drag the whole `Web` folder in and choose **Create folder references** — *not* Create groups. The folder must appear **blue** in the navigator. Blue means the files ship inside the bundle; yellow means they don't, and you'll get the "didn't load" screen.
6. Drag in `Info.plist` and `Assets.xcassets`, replacing the generated ones.
7. Select the project → target → **Signing & Capabilities**, pick your team. Bundle identifier is `com.sirius.MiltonsProperties`.
8. ⌘R.

### Path B: XcodeGen, one command

```bash
brew install xcodegen
cd apps/ios
xcodegen generate
open MiltonsProperties.xcodeproj
```

Set your team under Signing & Capabilities, then ⌘R. `project.yml` already declares `Web` as a folder reference, so step 5 above can't go wrong.

---

## What's in here

```
MiltonsProperties/
├── project.yml                  XcodeGen spec (Path B)
├── MiltonsProperties/
│   ├── MiltonsPropertiesApp.swift   @main, pins light mode
│   ├── ContentView.swift            Root view + a real failure state
│   ├── WebView.swift                WKWebView wrapper
│   ├── Info.plist
│   ├── Assets.xcassets/             App icon, accent, launch color
│   └── Web/
│       └── index.html               The entire app
└── Docs/
    ├── build-plan.md            Architecture, integrations, compliance
    └── features.md              Differentiating feature spec
```

To change anything you see on screen, edit `Web/index.html`. No recompile needed for content work — just re-run.

---

## Notes worth knowing before you hit build

**Fonts need a connection on first launch.** Bricolage Grotesque and IBM Plex load from Google Fonts. Offline, the CSS falls back to system faces and everything still lays out correctly — it just looks less like itself. If you want true offline fidelity, download the `.woff2` files into `Web/fonts/`, swap the `@import` for `@font-face` rules, and the app never touches the network again. Worth doing before any client demo where wifi is uncertain.

**State resets on every launch.** Everything lives in a JS object in memory. That's deliberate for a prototype: every demo starts clean and you can't corrupt it mid-pitch. When you wire the real API this all gets replaced anyway.

**Debugging.** Run on the simulator, then Safari → Develop → Simulator → index.html for a full Web Inspector. `isInspectable` is already set under `#if DEBUG`.

**Safe areas are handled in CSS**, not Swift — `viewport-fit=cover` plus `env(safe-area-inset-*)`. The web view deliberately ignores safe areas so the masthead can run under the status bar the way a native nav bar would.

---

## Before this goes to the App Store

Two things to have in hand:

**Guideline 4.2, minimum functionality.** Review is unfriendly to apps that are only a website in a wrapper. This build is perfect for TestFlight, client demos and your cousin's pitches. For public release, give it something a browser can't do — push notifications for approval requests is the obvious one and it's already the product's core loop. Camera capture for the move-in condition photos is the second. Both are genuine native capability, not box-ticking.

**App Privacy.** Once screening is wired in you'll be collecting identifiers, financial info and contact info. That needs an accurate privacy nutrition label and a published privacy policy URL. Worth drafting alongside the FCRA consent form since a lawyer is reviewing that anyway.

Neither applies to the current build, which collects nothing and sends nothing.
