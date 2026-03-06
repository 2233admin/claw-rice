# ClawProxy Phase 1 — Clash Verge Rev Global Extension Script

Drop-in global extension script for [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev). Works with any subscription — never crashes.

## Features

- **Node Quality Profiling** — Parses multiplier tags (×0.5, 2x, 1.5倍), tiers nodes by cost, kicks >3x nodes
- **Auto Region Detection** — 8 regions (HK/SG/JP/US/TW/KR/UK/DE) with emoji + icon
- **7 Functional Groups**:
  - 💰 Trading — 5-level fallback chain (JP→SG→HK→budget→DIRECT)
  - 🤖 AI — OpenAI/Claude/Gemini/Cursor/DeepSeek/Mistral via community rule-set
  - 📺 Streaming — YouTube/Netflix/Disney+/Spotify/Twitch via GEOSITE
  - ⬇️ Download — GitHub/Docker/npm/PyPI load-balanced across nodes
  - 💬 Social — Telegram(GEOIP)/Discord/Twitter/Reddit fallback
  - 🎮 Gaming — Steam/Epic/PlayStation ultra-low tolerance (20ms)
  - 🛡️ Economy — Budget mode using only ≤1x multiplier nodes
- **Remote Rule-Providers** — Auto-updated community rule-sets (DustinWin/MetaCubeX)
- **GEOSITE/GEOIP Matching** — Replaces hundreds of manual domain rules with one-liners
- **Ad Blocking + Anti-Tracking** — `category-ads-all` + `tracker` GEOSITE rules
- **DNS Optimization** — fake-ip, split domestic/foreign DNS, anti-pollution fallback-filter
- **Full Clash Meta Support** — sniffer, NTP, TUN-ready, UDP-enabled, TCP-concurrent

## Install

1. Open Clash Verge Rev → Subscriptions → Global Extension Script
2. Paste the contents of `clawproxy-global-extend.js`
3. Enable the toggle → Update subscription

## Configuration

Toggle features at the top of the script:

```javascript
const features = {
  trading: true,      // Crypto exchanges
  ai: true,           // AI platforms
  streaming: true,    // YouTube/Netflix/Spotify
  download: true,     // GitHub/Docker/npm
  social: true,       // Telegram/Discord/Twitter
  gaming: true,       // Steam/Epic/PlayStation
  economy: true,      // Low-multiplier budget mode
  ads: true,          // Ad blocking
  tracker: true,      // Anti-tracking
  apple: true,        // Apple services
  microsoft: true,    // Microsoft services
  google: true,       // Google services
};
```

## How It Works

```
Subscription nodes
  ↓
Node cleaning (filter info nodes, parse multiplier)
  ↓
Region grouping (auto-detect by name/emoji)
  ↓
Functional groups (conditional creation, empty-safe)
  ↓
Rules injection (GEOSITE/GEOIP + rule-providers + manual)
  ↓
DNS/Sniffer/Profile optimization
  ↓
Final config (never crashes, defensive checks throughout)
```

## Why Not Just Use dahaha-365's Script?

That script is excellent (we learned from it). Ours adds:

- **Trading-specific 5-level fallback chain** with dedicated budget fallback group
- **Multiplier-aware node tiering** (cheap vs premium vs excluded)
- **Feature toggles** — disable what you don't need
- **Defensive-first design** — every group/rule checks existence before referencing
- **English codebase** — easier for international contributors

## Credits

- [dahaha-365/懒人脚本](https://gist.github.com/dahaha-365/0b8beb613f8d1ee656fe1f21e1a07959) — Architecture inspiration
- [DustinWin/ruleset_geodata](https://github.com/DustinWin/ruleset_geodata) — Rule-set source
- [Koolson/Qure](https://github.com/Koolson/Qure) — Icons
- [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) — The client

## License

MIT
