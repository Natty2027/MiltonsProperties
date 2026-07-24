//
//  ContentView.swift
//  Milton's Properties
//

import SwiftUI

struct ContentView: View {
    @State private var loadFailed = false

    private static let paper = Color(red: 0.961, green: 0.965, blue: 0.957)
    private static let ink   = Color(red: 0.063, green: 0.110, blue: 0.169)

    var body: some View {
        ZStack {
            Self.paper.ignoresSafeArea()

            if loadFailed {
                failureState
            } else {
                WebView(resource: "index", loadFailed: $loadFailed)
                    .ignoresSafeArea()
            }
        }
    }

    // A blank white screen tells you nothing at 11pm. This tells you exactly
    // which build step was missed.
    private var failureState: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("The portfolio desk didn't load")
                .font(.system(size: 21, weight: .semibold))
                .foregroundStyle(Self.ink)

            Text("index.html isn't in the app bundle. In Xcode, check that the Web folder appears under Build Phases → Copy Bundle Resources. If you dragged it in, re-add it with \"Create folder references\" rather than \"Create groups.\"")
                .font(.system(size: 14))
                .foregroundStyle(Self.ink.opacity(0.7))

            Button("Try again") {
                loadFailed = false
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 18)
            .padding(.vertical, 10)
            .background(Self.ink)
            .padding(.top, 4)
        }
        .frame(maxWidth: 420, alignment: .leading)
        .padding(28)
    }
}

#Preview {
    ContentView()
}
