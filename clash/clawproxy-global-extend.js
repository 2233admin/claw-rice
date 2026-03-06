// ============================================================
// ClawProxy Phase 1 — Clash Verge Rev Global Extension Script
// https://github.com/2233admin/claw-rice
//
// Features:
//   - Node quality profiling (multiplier-aware tiering)
//   - Auto region detection (8+ regions)
//   - 7 functional groups (Trading/AI/Streaming/Download/Social/Gaming/Economy)
//   - Multi-level fallback chains (5-tier for trading)
//   - Remote rule-providers (auto-updated, community-maintained)
//   - GEOSITE/GEOIP matching (replaces manual domain lists)
//   - Ad blocking + tracker rejection
//   - Full DNS optimization (fake-ip, split DNS, anti-pollution)
//   - Sniffer, NTP, TUN-ready, UDP-enabled
//   - Defensive: never crashes regardless of subscription content
// ============================================================

// Toggle features on/off
const features = {
  trading: true,      // Crypto exchanges
  ai: true,           // AI platforms
  streaming: true,    // YouTube/Netflix/Spotify/Disney+
  download: true,     // GitHub/Docker/npm/PyPI
  social: true,       // Telegram/Discord/Twitter/Reddit
  gaming: true,       // Steam/Epic/PlayStation/Nintendo
  economy: true,      // Low-multiplier budget mode
  ads: true,          // Ad blocking
  tracker: true,      // Anti-tracking
  apple: true,        // Apple services
  microsoft: true,    // Microsoft services
  google: true,       // Google services
};

// Region definitions
const regions = [
  { code: "HK", emoji: "\u{1F1ED}\u{1F1F0}", label: "Hong Kong",
    reg: /香港|HK|Hong\s*Kong|\u{1F1ED}\u{1F1F0}/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Hong_Kong.png" },
  { code: "SG", emoji: "\u{1F1F8}\u{1F1EC}", label: "Singapore",
    reg: /新加坡|SG|Singapore|\u{1F1F8}\u{1F1EC}|狮城/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Singapore.png" },
  { code: "JP", emoji: "\u{1F1EF}\u{1F1F5}", label: "Japan",
    reg: /日本|JP|Japan|\u{1F1EF}\u{1F1F5}|东京|大阪/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Japan.png" },
  { code: "US", emoji: "\u{1F1FA}\u{1F1F8}", label: "United States",
    reg: /美国|US|United\s*States|\u{1F1FA}\u{1F1F8}|洛杉矶|硅谷|西雅图|达拉斯/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/United_States.png" },
  { code: "TW", emoji: "\u{1F1F9}\u{1F1FC}", label: "Taiwan",
    reg: /台湾|TW|Taiwan|\u{1F1F9}\u{1F1FC}/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/China.png" },
  { code: "KR", emoji: "\u{1F1F0}\u{1F1F7}", label: "Korea",
    reg: /韩国|KR|Korea|\u{1F1F0}\u{1F1F7}|首尔/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Korea.png" },
  { code: "UK", emoji: "\u{1F1EC}\u{1F1E7}", label: "United Kingdom",
    reg: /英国|UK|United\s*Kingdom|\u{1F1EC}\u{1F1E7}|伦敦/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/United_Kingdom.png" },
  { code: "DE", emoji: "\u{1F1E9}\u{1F1EA}", label: "Germany",
    reg: /德国|DE|Germany|\u{1F1E9}\u{1F1EA}|法兰克福/iu,
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Germany.png" },
];

// DNS config
const chinaDNS = ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"];
const foreignDNS = ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"];

// Proxy group shared options
const groupBase = {
  interval: 300,
  timeout: 3000,
  url: "http://cp.cloudflare.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false,
};

// Rule provider shared options
const rpBase = { type: "http", format: "mrs", interval: 86400 };
const rpYaml = { type: "http", format: "yaml", interval: 86400 };

// ============================================================
function main(config) {
  if (!config) return config;
  if (!config.proxies) config.proxies = [];
  if (!config["proxy-groups"]) config["proxy-groups"] = [];
  if (!config.rules) config.rules = [];

  // === Node cleaning ===
  const infoKeywords = /剩余|流量|过期|官网|公告|联系|重置|到期|套餐|维护|暂停|Traffic|Expire|Days|GB|Reset|Subscribe|Maintenance/i;

  function parseMultiplier(name) {
    const m = name.match(/[×xX](\d+\.?\d*)|(\d+\.?\d*)[×xX倍]/);
    return m ? parseFloat(m[1] || m[2]) : 1.0;
  }

  const cleanProxies = config.proxies.filter(p => p.name && !infoKeywords.test(p.name));
  if (cleanProxies.length === 0) return config;

  // Enable UDP on all proxies
  cleanProxies.forEach(p => { p.udp = true; });

  const realNames = cleanProxies.map(p => p.name);
  const cheapNames = cleanProxies.filter(p => parseMultiplier(p.name) <= 1.0).map(p => p.name);

  // Add a DIRECT proxy entry
  if (!config.proxies.find(p => p.name === "DIRECT" || p.type === "direct")) {
    config.proxies.push({ name: "direct-entry", type: "direct", udp: true });
  }

  // === Region groups ===
  const regionGroupMap = {};
  const regionNodeMap = {};
  const regionGroupNames = [];

  regions.forEach(r => {
    const nodes = realNames.filter(n => r.reg.test(n));
    if (nodes.length === 0) return;
    regionNodeMap[r.code] = nodes;
    const gName = r.emoji + " " + r.code;
    regionGroupMap[r.code] = gName;
    regionGroupNames.push(gName);
    config["proxy-groups"].push({
      ...groupBase, name: gName, type: "url-test",
      proxies: nodes, tolerance: 50, icon: r.icon
    });
  });

  function pickGroups(codes) { return codes.map(c => regionGroupMap[c]).filter(Boolean); }
  function pickNodes(codes) { return codes.flatMap(c => regionNodeMap[c] || []); }

  // === Functional groups ===
  const funcGroups = [];
  const ruleProviders = {};
  const rules = [];

  // --- Trading ---
  if (features.trading) {
    const chain = pickGroups(["JP", "SG", "HK"]);
    if (chain.length > 0) {
      const fbNodes = cheapNames.length > 3 ? cheapNames : realNames;
      config["proxy-groups"].push({
        ...groupBase, name: "\u{1F4B0} Trading Fallback", type: "url-test",
        proxies: fbNodes.slice(0, 20), tolerance: 30, hidden: true,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Cryptocurrency.png"
      });
      funcGroups.push({
        ...groupBase, name: "\u{1F4B0} Trading", type: "fallback",
        proxies: [...chain, "\u{1F4B0} Trading Fallback", "DIRECT"],
        interval: 60,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Cryptocurrency.png"
      });
      // Trading domains (no good GEOSITE for crypto, use manual)
      rules.push(
        "DOMAIN-SUFFIX,binance.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,binance.me,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,binance.cloud,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,binance.co,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,binance.us,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,bnbstatic.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,okx.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,okx-dns.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,okex.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,bybit.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,bybitapi.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,tradingview.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,metamask.io,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,etherscan.io,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,coingecko.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,coinmarketcap.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,dexscreener.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,dextools.io,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,uniswap.org,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,gate.io,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,kraken.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,kucoin.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,mexc.com,\u{1F4B0} Trading",
        "DOMAIN-SUFFIX,bitget.com,\u{1F4B0} Trading"
      );
    }
  }

  // --- AI (use community rule-set) ---
  if (features.ai) {
    const chain = pickGroups(["US", "JP", "SG", "KR", "UK", "DE"]);
    if (chain.length > 0) {
      funcGroups.push({
        ...groupBase, name: "\u{1F916} AI", type: "select", proxies: chain,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/ChatGPT.png"
      });
      ruleProviders["ai"] = {
        ...rpBase, behavior: "domain",
        url: "https://fastly.jsdelivr.net/gh/DustinWin/ruleset_geodata@clash-ruleset/ai.mrs",
        path: "./ruleset/ai.mrs"
      };
      rules.push(
        "RULE-SET,ai,\u{1F916} AI",
        "DOMAIN-SUFFIX,cursor.sh,\u{1F916} AI",
        "DOMAIN-SUFFIX,cursor.com,\u{1F916} AI",
        "DOMAIN-SUFFIX,v0.dev,\u{1F916} AI",
        "DOMAIN-SUFFIX,vercel.ai,\u{1F916} AI"
      );
    }
  }

  // --- Streaming (GEOSITE) ---
  if (features.streaming) {
    const chain = pickGroups(["HK", "TW", "SG", "JP", "US", "KR"]);
    if (chain.length > 0) {
      funcGroups.push({
        ...groupBase, name: "\u{1F4FA} Streaming", type: "url-test",
        proxies: chain, tolerance: 100,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/YouTube.png"
      });
      rules.push(
        "GEOSITE,youtube,\u{1F4FA} Streaming",
        "GEOSITE,netflix,\u{1F4FA} Streaming",
        "GEOSITE,disney,\u{1F4FA} Streaming",
        "GEOSITE,spotify,\u{1F4FA} Streaming",
        "GEOSITE,bahamut,\u{1F4FA} Streaming",
        "GEOSITE,hbo,\u{1F4FA} Streaming",
        "DOMAIN-SUFFIX,twitch.tv,\u{1F4FA} Streaming",
        "DOMAIN-SUFFIX,ttvnw.net,\u{1F4FA} Streaming"
      );
    }
  }

  // --- Download (load-balance) ---
  if (features.download) {
    const dlNodes = pickNodes(["US", "SG", "HK", "JP", "TW"]);
    const dlProxies = dlNodes.length > 2 ? dlNodes : realNames;
    if (dlProxies.length > 0) {
      funcGroups.push({
        ...groupBase, name: "\u{2B07}\u{FE0F} Download", type: "load-balance",
        strategy: "consistent-hashing", proxies: dlProxies.slice(0, 30),
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Download.png"
      });
      ruleProviders["applications"] = {
        ...rpYaml, behavior: "classical", format: "text",
        url: "https://fastly.jsdelivr.net/gh/DustinWin/ruleset_geodata@clash-ruleset/applications.list",
        path: "./ruleset/applications.list"
      };
      rules.push(
        "RULE-SET,applications,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,github.com,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,githubassets.com,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,githubusercontent.com,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,github.io,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,docker.io,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,docker.com,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,npmjs.org,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,pypi.org,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,crates.io,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,huggingface.co,\u{2B07}\u{FE0F} Download",
        "DOMAIN-SUFFIX,hf.co,\u{2B07}\u{FE0F} Download"
      );
    }
  }

  // --- Social (GEOSITE + GEOIP) ---
  if (features.social) {
    const chain = pickGroups(["HK", "SG", "JP", "TW"]);
    if (chain.length > 0) {
      funcGroups.push({
        ...groupBase, name: "\u{1F4AC} Social", type: "fallback",
        proxies: chain, interval: 120,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Telegram.png"
      });
      rules.push(
        "GEOIP,telegram,\u{1F4AC} Social",
        "GEOSITE,whatsapp,\u{1F4AC} Social",
        "GEOSITE,line,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,discord.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,discord.gg,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,discordapp.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,twitter.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,x.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,twimg.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,reddit.com,\u{1F4AC} Social",
        "DOMAIN-SUFFIX,redd.it,\u{1F4AC} Social"
      );
    }
  }

  // --- Gaming ---
  if (features.gaming) {
    const chain = pickGroups(["HK", "JP", "TW", "KR", "SG"]);
    if (chain.length > 0) {
      funcGroups.push({
        ...groupBase, name: "\u{1F3AE} Gaming", type: "url-test",
        proxies: chain, tolerance: 20, interval: 120,
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Game.png"
      });
      rules.push(
        "GEOSITE,category-games@cn,DIRECT",
        "GEOSITE,category-games,\u{1F3AE} Gaming"
      );
    }
  }

  // --- Economy mode ---
  if (features.economy && cheapNames.length > 0) {
    funcGroups.push({
      ...groupBase, name: "\u{1F6E1}\u{FE0F} Economy", type: "url-test",
      proxies: cheapNames.slice(0, 20), interval: 600,
      icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Bypass.png"
    });
  }

  // --- Ads + Tracker ---
  if (features.ads) {
    rules.unshift("GEOSITE,category-ads-all,REJECT");
  }
  if (features.tracker) {
    rules.unshift("GEOSITE,tracker,REJECT");
  }

  // --- Apple ---
  if (features.apple) {
    rules.push("GEOSITE,apple-cn,DIRECT");
  }

  // --- Microsoft ---
  if (features.microsoft) {
    rules.push(
      "GEOSITE,microsoft@cn,DIRECT",
      "GEOSITE,microsoft,DIRECT"
    );
    // Copilot -> AI if AI group exists
    if (funcGroups.find(g => g.name === "\u{1F916} AI")) {
      rules.splice(rules.indexOf("GEOSITE,microsoft,DIRECT"), 0,
        "DOMAIN-SUFFIX,copilot.microsoft.com,\u{1F916} AI"
      );
    }
  }

  // --- Google ---
  if (features.google) {
    const target = funcGroups.find(g => g.name === "\u{1F4FA} Streaming")
      ? "\u{1F4FA} Streaming" : "DIRECT";
    rules.push("GEOSITE,google," + target);
  }

  // --- Bing direct ---
  rules.push(
    "DOMAIN-SUFFIX,bing.com,DIRECT",
    "DOMAIN-KEYWORD,bing,DIRECT"
  );

  // --- Final rules ---
  rules.push(
    "GEOSITE,private,DIRECT",
    "GEOIP,private,DIRECT,no-resolve",
    "GEOSITE,cn,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",
    "MATCH,GLOBAL"
  );

  // === Assemble proxy-groups ===
  config["proxy-groups"].push(...funcGroups);

  const funcGroupNames = funcGroups.map(g => g.name);
  const allGroupNames = new Set(config["proxy-groups"].map(g => g.name));

  // Create a GLOBAL catch-all group
  config["proxy-groups"].unshift({
    ...groupBase, name: "GLOBAL", type: "select",
    proxies: [...funcGroupNames, ...regionGroupNames, "DIRECT"],
    icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color/Proxy.png"
  });

  // Inject functional groups into existing select groups
  config["proxy-groups"].forEach(g => {
    if (g.type === "select" && g.proxies && g.proxies.length > 3) {
      if (g.name !== "GLOBAL" && !funcGroupNames.includes(g.name) && !regionGroupNames.includes(g.name)) {
        g.proxies = [...funcGroupNames, ...g.proxies];
      }
    }
  });

  // === Rules & rule-providers ===
  config.rules = rules;
  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    ...ruleProviders
  };

  // === DNS ===
  config.dns = {
    enable: true,
    listen: ":53",
    ipv6: true,
    "prefer-h3": true,
    "use-hosts": true,
    "use-system-hosts": true,
    "respect-rules": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
      "*", "+.lan", "+.local",
      "*.binance.com", "*.okx.com", "*.bybit.com",
    ],
    "default-nameserver": chinaDNS,
    nameserver: foreignDNS,
    "proxy-server-nameserver": foreignDNS,
    "nameserver-policy": {
      "geosite:private": "system",
      "geosite:cn,steam@cn,category-games@cn,microsoft@cn,apple@cn": chinaDNS,
    },
  };

  // === Global settings ===
  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["mode"] = "rule";
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["keep-alive-interval"] = 1800;
  config["find-process-mode"] = "strict";
  config["geodata-mode"] = true;
  config["geodata-loader"] = "memconservative";
  config["geo-auto-update"] = true;
  config["geo-update-interval"] = 24;

  // === Sniffer ===
  config.sniffer = {
    enable: true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": false,
    sniff: {
      TLS: { ports: [443, 8443] },
      HTTP: { ports: [80, "8080-8880"] },
      QUIC: { ports: [443, 8443] }
    },
    "skip-domain": ["Mijia Cloud", "+.push.apple.com", "+.oray.com"]
  };

  // === NTP ===
  config.ntp = { enable: true, "write-to-system": false, server: "cn.ntp.org.cn" };

  // === Profile ===
  config.profile = { "store-selected": true, "store-fake-ip": true };

  return config;
}
