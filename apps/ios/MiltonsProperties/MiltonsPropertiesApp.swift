//
//  MiltonsPropertiesApp.swift
//  Milton's Properties
//
//  Sirius Financial Solutions LLC
//

import SwiftUI

@main
struct MiltonsPropertiesApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                // The web layer is light-only by design. Without this, iOS dark mode
                // tints the status bar text white against a light masthead.
                .preferredColorScheme(.light)
        }
    }
}
