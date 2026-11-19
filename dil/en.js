// dil/en.js — İngilizce sözlük: KAYNAK DİL. Diğer diller bu dosyadan çevrilir; yorumlardaki notlar (yer, uzunluk sınırı) çevirmen içindir.
// Düz anahtar → metin. {ad} yer tutucudur, aynen kalır. HTML etiketleri (<b>…</b>) korunur. Çoğul: anahtar_one / anahtar_other
// (gerekirse _zero, _two, _few, _many eklenir; Intl.PluralRules kategorileri). Terimler: dil/TERIMLER.md.
DIL_SOZLUK['en']={

  // ---- ui: ortak arayüz ----
  "ui.gold": "{n} gold", // {n}: sayı (biçimli)
  "ui.goldPlus": "+{n} gold",
  "ui.goldShort": "{n} gold short",
  "ui.seals_one": "{n} seal",
  "ui.seals_other": "{n} seals",
  "ui.sealsPlus_one": "+{n} seal", // bildirim
  "ui.sealsPlus_other": "+{n} seals", // bildirim
  "ui.tokens_one": "{n} extra-move token",
  "ui.tokens_other": "{n} extra-move tokens",
  "ui.pctPlus": "+{n}%", // yüzde biçimi; dilin kuralına göre (fr: "+{n} %")
  "ui.now": "Now: {x}",
  "ui.none": "None yet",
  "ui.nextLevel": "Next: {x}",
  "ui.maxLevel": "Max level",
  "ui.full": "Maxed", // satır düğmesi, ≤8
  "ui.upNext": "Up next", // rozet, ≤12
  "ui.voyage": "Voyage {n}", // hap, ≤14
  "ui.replay": "replay", // "Yolculuk 3 · tekrar" eki, ≤8
  "ui.cancel": "Cancel", // düğme, ≤14
  "ui.close": "Close", // düğme, ≤14
  "ui.back": "Back", // düğme, ≤14
  "ui.save": "Save", // düğme, ≤14
  "ui.great": "Great!", // düğme, ≤14
  "ui.toMap": "Back to map", // düğme, ≤16
  "ui.retry": "Try again", // düğme, ≤16
  "ui.notEnough": "not enough gold", // küçük düğme alt yazısı
  "ui.forGold": "{x}: {gold} gold",
  "ui.useToken_one": "Use token ({n})", // düğme, ≤18
  "ui.useToken_other": "Use token ({n})", // düğme, ≤18
  "ui.fx.combo": "COMBO ×{x}", // kanvas duyurusu (büyük harf), ≤14
  "ui.moves": "Moves", // madalyon içi, ≤6
  "ui.map": "Map", // ekran okuyucu etiketi
  "ui.restart": "Restart", // ekran okuyucu etiketi
  "ui.captain": "Captain", // ekran okuyucu etiketi

  // ---- start: açılış ekranı ----
  "meta.desc": "Muson: sail from port to port, pack your hold, sink pirates and build your company town.",
  "start.sub": "Ride the monsoon from port to port, sink pirates and build your company town.",
  "start.play": "Play", // büyük düğme, ≤14
  "start.continue": "Continue", // büyük düğme, ≤14

  // ---- settings: ayarlar ----
  "settings.title": "Settings",
  "settings.sfx": "Sound effects",
  "settings.music": "Music",
  "settings.on": "On", // düğme 104 px, ≤8
  "settings.off": "Off", // düğme 104 px, ≤8
  "settings.language": "Language",
  "settings.reset": "Reset", // düğme, ≤12
  "settings.privacy": "Privacy policy",
  "settings.resetTitle": "Start over?",
  "settings.resetText": "All progress, gold, cargo, your company town, businesses and ship upgrades will be deleted.",
  "settings.resetKeepPaid": "Your sound settings stay; gold bought in the shop is deleted too.",
  "settings.resetKeep": "Your sound settings stay.",

  // ---- privacy: uygulama içi gizlilik özeti (Yayin/gizlilik-politikasi.html ile aynı içerik) ----
  "privacy.title": "Privacy",
  "privacy.p1": "<b>Muson</b> (IronLane Studios) collects no personal data, needs no account and sends no data over the internet.",
  "privacy.p2": "Your game progress (gold, voyages, ship, company town, sound settings) is stored only on this device. If Android's own backup is on, this data may be included in your Google backup.",
  "privacy.p3": "The game has no ads, analytics, third-party services or purchases. If any of these is added, this policy will be updated.",
  "privacy.p4": "To delete your data, use <b>Reset</b> in Settings or uninstall the app.",
  "privacy.p5": "Effective: November 17, 2026. The full text and contact details are at the privacy policy link on the store page.",
  // web sitesi sürümü (window.__WEB): p2, p4, p5 tarayıcıya göre
  "privacy.web.p2": "Your game progress (gold, voyages, ship, company town, sound settings) is stored only in this browser on this device.",
  "privacy.web.p4": "To delete your data, use <b>Reset</b> in Settings or clear this site's data in your browser.",
  "privacy.web.p5": "Effective: November 18, 2026.",

  // ---- map: harita ----
  "map.company": "Company", // alt düğme (üçü yan yana), ≤10
  "map.shipyard": "Shipyard", // alt düğme ve ekran başlığı, ≤10
  "map.sail": "Set sail", // alt düğme, ≤12
  "map.continue": "Continue", // alt düğme, ≤12
  "map.home": "Home port", // harita rozeti, ≤14
  "map.pirate": "Pirates", // ipucu (title)
  "map.badge.pirate": "At sea: pirates", // harita rozeti, ≤16
  "map.badge.sale": "Ready to sell", // harita rozeti, ≤16
  "map.tip.welcome": "<b>You captain a small merchant ship.</b> Pack your hold at the departure port; you earn gold when you sell the cargo in the destination city. Pirates block your way every third voyage. Every sale also earns seals, and seals build your company town.",
  "map.tip.resumeBattle": "Unfinished voyage: <b>{from} → {to}</b>. Your hold is full and pirates block the way.",
  "map.tip.resumeSale": "Unfinished voyage: <b>{from} → {to}</b>. Your hold is full and the cargo is waiting to be sold.",
  "map.tip.next": "Next voyage: <b>{from} → {to}</b>{extra}.", // {extra}: " · ⚔ yolda korsan" ve/veya " · ⭐ koşul adı" (hazır gelir)
  "map.tip.pirate": "pirates ahead",
  "map.tip.pricey": "{city} pays top price for <b>{good}</b>.", // {good}: malın cümle içi biçimi (goods.*.s)
  "map.tip.replay": "Tap a city you have passed to replay that voyage.",

  // ---- voyage: yol sahnesi ve korsan penceresi ----
  "voyage.sailed.title": "Under sail",
  "voyage.sailed.text": "A fair wind and calm seas. The {city} market awaits.",
  "voyage.sailed.dock": "Enter port", // düğme, ≤16
  "voyage.fx.repelled": "Repelled!", // kanvas büyük yazı, ≤12
  "voyage.fx.pirates": "Pirates!", // kanvas büyük yazı, ≤12
  "battle.pre.title": "Pirates!",
  "battle.pre.def": "Your defense: {n}", // hap, ≤18
  "battle.pre.pirate": "Pirate: {n}", // hap, ≤14
  "battle.pre.strong": "Your ship is strong enough to drive this pirate off without a fight. Fight for the full loot, or auto-defend: your cargo stays safe and half the loot (~{gold} gold) is yours.",
  "battle.pre.weak": "Black flag on the horizon! Sink them and your cargo is safe; lose and they take 30% of every good. Upgrade your ship at the Shipyard to drive pirates off without a fight.",
  "battle.pre.auto": "Auto-defend", // düğme, ≤16
  "battle.pre.fight": "Fight", // düğme, ≤12
  "battle.auto.title": "Pirate repelled",
  "battle.auto.half": "Half the loot",
  "battle.auto.cargo": "Cargo",
  "battle.auto.safe": "safe",
  "battle.toPort": "Continue to port", // düğme, ≤18

  // ---- load: yükleme ekranı (blok oyunu) ----
  "load.tip.1": "<b>No gold here yet.</b> Drag a piece; every full line is loaded into the hold.", // kaptan balonu (kısa)
  "load.tip.2": "<b>Pure line:</b> 7 cells of one good make it first-rate (2×), all 8 make it 3×.", // kaptan balonu (kısa)
  "load.tip.3": "Extra cargo sells too. Every move left is a <b>+1%</b> bonus.", // kaptan balonu (kısa)
  "load.tip.4": "<b>Three goods:</b> now 6 matching cells make a pure line.", // kaptan balonu (kısa)
  "load.tip.7": "<b>Water and spices</b> in the same line? The spices get wet.", // kaptan balonu (kısa)
  "load.say.saf.0": "Lovely stowing!", // kaptan balonu, ≤20
  "load.say.saf.1": "Spotless line!",
  "load.say.saf.2": "That's the way!",
  "load.say.islak.0": "The spices are getting wet!",
  "load.say.az.0": "Almost there!",
  "load.say.kombo.0": "Combo!",
  "load.say.kombo.1": "Loading fast!",
  "load.say.kilit.0": "Lock broken!",
  "load.say.kilit.1": "The chain snapped!",
  "load.say.kirik.0": "Porcelain broke!",
  "load.say.kirik.1": "Careful, gunpowder!",
  "load.say.ozel.0": "Special order done!",
  "load.say.bos.0": "Fill those lines!",
  "load.say.bos.1": "The wind is with us.",
  "load.say.bos.2": "The hold is waiting!",
  "load.say.sail": "Let's set sail!",
  "load.hold_one": "Hold: {n} crate", // hap, ≤16
  "load.hold_other": "Hold: {n} crates", // hap, ≤16
  "load.pure": "Pure lines {a}/{b}", // çip, ≤16
  "load.pure.title": "Pure lines needed for a Master stow", // ipucu (title)
  "load.wet.title": "Wet spices", // ipucu (title)
  "load.broken.title": "Broken porcelain (unsellable)", // ipucu (title)
  "load.special.title": "Special order: hit it for +{p}% on the sale", // ipucu (title)
  "load.pricey": "{good} sells high here", // ipucu (title)
  "load.pirate": "Pirates ahead", // ipucu (title)
  "load.tray": "Next cargo", // kanvas, küçük yazı, ≤16
  "load.fx.plus": "+{n} {good}", // kanvas; {good}: cümle içi biçim (goods.*.s)
  "load.fx.fullPure": "PERFECT LINE", // kanvas duyurusu (büyük harf), ≤14
  "load.fx.pure": "FIRST-RATE", // kanvas duyurusu, ≤14
  "load.fx.wet": "Spices got wet", // kanvas duyurusu, ≤16
  "load.fx.lock": "LOCK BROKEN", // kanvas duyurusu, ≤14
  "load.fx.broken": "Porcelain broke", // kanvas duyurusu, ≤16
  "load.fx.special": "SPECIAL ORDER", // kanvas duyurusu, ≤14 (sonuna " ✓" eklenir)
  "load.fx.space": "SPACE CLEARED", // kanvas duyurusu, ≤14
  "load.fx.moves_one": "+{n} MOVE", // kanvas duyurusu, ≤12
  "load.fx.moves_other": "+{n} MOVES", // kanvas duyurusu, ≤12
  "load.lose.moves_one": "+{n} move", // küçük düğme alt yazısı
  "load.lose.moves_other": "+{n} moves", // küçük düğme alt yazısı
  "load.lose.space": "clear hold space", // küçük düğme alt yazısı
  "load.lose.windTitle": "The wind turned",
  "load.lose.fullTitle": "Hold jammed",
  "load.lose.windText": "Out of moves before the minimum cargo was loaded.",
  "load.lose.fullText": "No room left for the pieces on the dock.",
  "load.lose.loaded": "Loaded: {list}.",
  "load.stow.usta": "Master stow",
  "load.stow.duzgun": "Neat stow",
  "load.stow.daginik": "Messy stow",
  "load.win.title": "Hold ready · {x}",
  "load.win.q": "first-rate {n}",
  "load.win.broken": "broken {n}",
  "load.win.wet": "wet {n}",
  "load.win.early_one": "Early arrival ({n} move left)",
  "load.win.early_other": "Early arrival ({n} moves left)",
  "load.win.special": "Special order: {x}",
  "load.win.missed": "missed",
  "load.win.bonus": "{name} bonus (on sale)",
  "load.win.gradeLine": "{x} (on sale)",
  "load.win.text": "No gold yet: you'll sell this cargo at the <b>{city}</b> market.",
  "load.win.sail": "Set sail", // düğme, ≤14
  "load.leave.title": "Leave port?",
  "load.leave.text": "Progress on this load will be lost; the voyage won't count as started.",

  // ---- cond: rota koşulları (yolculuk çeşitliliği) ----
  "cond.eski.name": "Old Cargo", // yükleme rozeti ve harita rozeti, ≤16
  "cond.eski.tip": "There are <b>old crates</b> in the hold: they don't count as cargo and leave when their line fills up.",
  "cond.kilit.name": "Locked Crate", // rozet, ≤16
  "cond.kilit.tip": "<b>Locked crate:</b> fill the rest of its line to break the lock and load the goods inside.",
  "cond.porselen.name": "Fragile Goods", // rozet, ≤16
  "cond.porselen.tip": "<b>Porcelain</b> is worth double, but it breaks if delivered in the same line as gunpowder.",
  "cond.acele.name": "Rush Delivery", // rozet, ≤16
  "cond.acele.tip": "<b>Rush delivery:</b> fewer moves, but a +30% bonus on the sale.",
  "cond.ozel.name": "Special Order", // rozet, ≤16
  "cond.ozel.tip": "<b>Special order:</b> hit the starred goal too for a +25% bonus on the sale.",
  "cond.buyuk.name": "Big Order", // rozet, ≤16
  "cond.buyuk.tip": "<b>Big order:</b> more cargo and more moves; +20% bonus on the sale.",
  "cond.target": "Goal: <b>{x}</b>.",
  "cond.ozel.cift_one": "{n} line in one move", // özel sipariş hedefi (hap), ≤22
  "cond.ozel.cift_other": "{n} lines in one move", // özel sipariş hedefi (hap), ≤22
  "cond.ozel.saf_one": "{n} pure line", // özel sipariş hedefi (hap), ≤22
  "cond.ozel.saf_other": "{n} pure lines", // özel sipariş hedefi (hap), ≤22
  "cond.ozel.hamle_one": "{n} move to spare", // özel sipariş hedefi (hap), ≤22
  "cond.ozel.hamle_other": "{n} moves to spare", // özel sipariş hedefi (hap), ≤22

  // ---- battle: korsan savaşı ----
  "battle.title": "Pirate battle {n}", // küçük yazı, ≤18
  "battle.broadside": "Broadside −{n}", // gösterge, ≤16
  "battle.evade": "Evade", // gösterge, ≤10
  "battle.fire": "Fire!", // düğme 86 px, ≤7
  "battle.attackIn": "Attack in", // rozet, ≤10
  "battle.atkMoves_one": "move · power {p}", // rozet, ≤16; {n} sayı rozetin ortasında ayrıca yazar
  "battle.atkMoves_other": "moves · power {p}", // rozet, ≤16; {n} sayı rozetin ortasında ayrıca yazar
  "battle.tip.1": "<b>Swipe:</b> match 3 stones. Cannonballs hit, planks repair, gunpowder loads <b>Fire!</b>", // kaptan balonu (kısa)
  "battle.tip.2": "Match 4 for <b>chain shot</b> (clears a line), 5 for a <b>powder keg</b> (clears 3×3).", // kaptan balonu (kısa)
  "battle.win.title": "Pirate sunk!",
  "battle.win.loot": "Loot gold",
  "battle.win.movesLeft_one": "Moves left: {n} × {b}",
  "battle.win.movesLeft_other": "Moves left: {n} × {b}",
  "battle.win.hull": "Hull left",
  "battle.win.replay": "The loot counts toward this voyage's total; whatever beats your best goes to your chest when you sell.",
  "battle.win.added": "Loot added to your chest.",
  "battle.win.safe": "Your cargo is safe; next stop {city}.",
  "battle.lose.title": "Pirates are raiding the hold",
  "battle.lose.hull": "Your hull gave out.",
  "battle.lose.moves": "Out of moves, and the pirate is still afloat.",
  "battle.lose.text": "If you go on, they take <b>30% of every good</b> (regular quality first). Try again and you lose nothing.",
  "battle.lose.save": "save your cargo", // küçük düğme alt yazısı
  "battle.lose.give": "Give up cargo", // düğme, ≤18
  "battle.leave.title": "Retreat?",
  "battle.leave.text": "The voyage waits here and your cargo stays in the hold; the battle restarts when you return.",
  "battle.fx.dodge": "DODGED!", // kanvas duyurusu, ≤12
  "battle.fx.hullDmg": "−{n} hull", // kanvas, ≤10
  "battle.fx.attack": "ATTACK −{n}", // kanvas duyurusu, ≤12
  "battle.fx.heal": "+{n} hull", // kanvas, ≤10
  "battle.fx.bomb": "POWDER KEG", // kanvas duyurusu, ≤14
  "battle.fx.chain": "CHAIN SHOT", // kanvas duyurusu, ≤14
  "battle.fx.bombReady": "Keg ready", // kanvas duyurusu, ≤14
  "battle.fx.chainReady": "Chain ready", // kanvas duyurusu, ≤14
  "battle.fx.shuffled": "SHUFFLED", // kanvas duyurusu, ≤14
  "battle.fx.broadside": "BROADSIDE −{n}", // kanvas duyurusu, ≤14

  // ---- pirate: korsan kaptanları (uydurma ad; her dilde anlamlı ve komik) ve sözleri ----
  "pirate.name.0": "Salty Whiskers", // plaka, ≤16
  "pirate.name.1": "Blind Gull",
  "pirate.name.2": "Crooked Cutlass",
  "pirate.name.3": "Soggy Beard",
  "pirate.name.4": "Cracked Barrel",
  "pirate.name.5": "Grumpy Mussel",
  "pirate.name.6": "Creaky Plank",
  "pirate.name.7": "Sleepless Mackerel",
  "pirate.name.8": "Bent Anchor",
  "pirate.name.9": "Rusty-Tooth Ned",
  "pirate.name.10": "Cloudhead",
  "pirate.name.11": "Dozy Octopus",
  "pirate.say.bas.0": "Drop your cargo!", // balon, ≤24
  "pirate.say.bas.1": "These waters are mine!",
  "pirate.say.bas.2": "Surrender, trader!",
  "pirate.say.bas.3": "How full's your hold?",
  "pirate.say.ates.0": "Fire!", // balon, ≤24
  "pirate.say.ates.1": "Cannons ready!",
  "pirate.say.ates.2": "Now you'll see!",
  "pirate.say.ates.3": "Take aim!",
  "pirate.say.vurul.0": "Argh, my ship!", // balon, ≤24
  "pirate.say.vurul.1": "That hurt!",
  "pirate.say.vurul.2": "Hold on now!",

  // ---- sale: varış ve satış ----
  "sale.tip": "<b>{city} market.</b> {e} {good} sells high here (×1.5). ★ first-rate (2×), ★★ perfect (3×), 💦 wet (unsellable){extra}.", // {extra}: porselen varsa sale.tipPorcelain
  "sale.tipPorcelain": ", 🏺 porcelain 2×, 💔 broken (unsellable)",
  "sale.col.good": "Goods", // tablo başlığı, ≤8
  "sale.col.qty": "Qty", // tablo başlığı, ≤6
  "sale.col.price": "Price", // tablo başlığı, ≤6
  "sale.col.total": "Total", // tablo başlığı, ≤6
  "sale.empty": "Hold empty",
  "sale.subtotal": "Goods total",
  "sale.grade": "Grade: {g}",
  "sale.early": "Early arrival",
  "sale.k.acele": "Rush bonus",
  "sale.k.ozelOk": "Special order ✓",
  "sale.k.ozelFail": "Special order missed",
  "sale.k.buyuk": "Big order bonus",
  "sale.k.eski": "Old cargo bonus",
  "sale.k.broken": "Broken porcelain: {n}",
  "sale.k.bonus": "{name} bonus",
  "sale.unsellable": "unsellable",
  "sale.allSafe": "all intact",
  "sale.market": "Port: Market",
  "sale.reward": "Sale reward",
  "sale.autoDef": "Pirate auto-repelled",
  "sale.cargoSafe": "cargo safe",
  "sale.rescued": "Cargo saved",
  "sale.noLoot": "no plunder",
  "sale.plunder": "Pirate plunder",
  "sale.loot": "Pirate loot",
  "sale.inChest": "(in chest)",
  "sale.added": "Added to chest",
  "sale.addedReplay": "Added to chest (above your best)",
  "sale.total": "Sale total",
  "sale.sell": "Sell · {gold} gold", // büyük düğme, ≤22

  // ---- port: şirket ekranı (kasaba, inşa, işletmeler) ----
  "port.company": "Company", // küçük üst yazı (büyük harf)
  "port.rename": "Rename company", // ekran okuyucu etiketi
  "port.level": "Level {n} · {title}",
  "port.businesses": "Businesses", // bölüm başlığı (büyük harf), ≤14
  "port.businessesHint": "bought with gold", // ≤18
  "port.town": "Town {a}/{b}",
  "port.done": "Your town is complete!",
  "port.soon": "New region coming soon.",
  "port.doneText": "Every building is up; your company has earned the title <b>{title}</b>. New region coming soon.",
  "port.nextBuild": "Next build · {a}/{b}", // küçük üst yazı (büyük harf), ≤22
  "port.build": "Build", // düğme 104 px, ≤10
  "port.sealsMore_one": "{n} more seal", // düğme 104 px, ≤14
  "port.sealsMore_other": "{n} more seals", // düğme 104 px, ≤14
  "port.gift": "Reward: {x}",
  "port.sealHint": "Every sale earns seals: {a} 1, {b} 2, {c} 3.", // {a} {b} {c}: derece adları (grade.*)
  "port.built": "{name} built · +{gift}", // bildirim, tek satır
  "port.backSeals_one": "<b>{n} seal</b> for your past voyages", // bildirim, tek satır
  "port.backSeals_other": "<b>{n} seals</b> for your past voyages", // bildirim, tek satır
  "port.buy": "Buy", // satır düğmesi 84 px, ≤8
  "port.toShip": "To ship ›", // küçük hap düğme, ≤12
  "port.name.title": "Company name",
  "port.name.text_one": "Shown on the map and in your town. Up to {n} letter.",
  "port.name.text_other": "Shown on the map and in your town. Up to {n} letters.",
  "company.default": "Muson Trading Co.", // varsayılan şirket adı, ≤20 harf ("Muson" çevrilmez)

  // ---- title: şirket unvanları (seviyeye göre) ----
  "title.acemi": "Novice Trader",
  "title.liman": "Harbor Trader",
  "title.kumpanya": "Company Owner",
  "title.lonca": "Guildmaster",
  "title.efendi": "Lord of the Seas",

  // ---- building: kasaba yapıları (mühürle inşa) ----
  "building.bayrak": "Flagpole", // kart başlığı, ≤22
  "building.ev1": "Clerk's House",
  "building.cesme": "Fountain Square",
  "building.kumpanya": "Company HQ",
  "building.bahce": "Garden",
  "building.han": "Inn",
  "building.ev2": "Merchant's House",
  "building.degirmen": "Windmill",
  "building.lonca": "Guild Hall",
  "building.fener": "Lighthouse",
  "building.kumpanya2": "Expand Company HQ",

  // ---- business: altınla alınan işletmeler (şirket ekranı) ----
  "business.depo.name": "Warehouse", // satır başlığı, ≤12
  "business.depo.eff": "Daily gift {n} gold", // tek satır, ≤28
  "business.pazar.name": "Market",
  "business.pazar.eff": "Sale total +{n}%",
  "business.tersane.name": "Shipyard",
  "business.tersane.eff": "Ship upgrades {n}% off",
  "business.dokum.name": "Foundry",
  "business.dokum.eff": "Broadside +{n} damage",

  // ---- ship: tersane (gemi geliştirmeleri) ----
  "ship.defense": "Defense",
  "ship.tier.tekne": "Merchant Boat", // levha, ≤18
  "ship.tier.kalyon": "Galleon",
  "ship.tier.savasKalyonu": "War Galleon",
  "ship.tier.amiral": "Flagship",
  "ship.next_one": "{n} upgrade to <b>{name}</b>",
  "ship.next_other": "{n} upgrades to <b>{name}</b>",
  "ship.maxTier": "Your ship is fully upgraded",
  "ship.upgrade": "Upgrade", // satır düğmesi 92 px, ≤10
  "ship.newShip": "New ship: {name}!",
  "ship.part.govde.name": "Hull", // satır başlığı, ≤12
  "ship.part.govde.eff": "Hull +{n} in battle",
  "ship.part.toplar.name": "Cannons",
  "ship.part.toplar.eff": "Cannonball damage +{n}%",
  "ship.part.ambar.name": "Hold",
  "ship.part.ambar.eff_one": "+{n} move when loading",
  "ship.part.ambar.eff_other": "+{n} moves when loading",

  // ---- shop: mağaza / hediye ----
  "shop.title": "Shop", // ekran başlığı ve düğme, ≤10
  "shop.gift": "Gifts", // ekran başlığı ve düğme, ≤10
  "shop.note.demo": "Test version: no real payment is taken.",
  "shop.note.offline": "The store can't be reached right now.",
  "shop.note.loading": "Store loading…",
  "shop.note.play": "Purchases are made through Google Play.",
  "shop.free": "Free", // bölüm başlığı (büyük harf)
  "shop.daily": "Daily gift",
  "shop.dailyText": "{n} gold every day. Grows with your Warehouse.",
  "shop.claim": "Claim", // satır düğmesi 96 px, ≤8
  "shop.tomorrow": "Tomorrow", // satır düğmesi 96 px, ≤10
  "shop.claimed": "claimed", // düğme alt yazısı, ≤10
  "shop.packs": "Gold packs", // bölüm başlığı (büyük harf)
  "shop.packTokens_one": "{gold} gold + {n} extra-move token. One time only.",
  "shop.packTokens_other": "{gold} gold + {n} extra-move tokens. One time only.",
  "shop.demoTag": "test", // etiket, ≤10
  "shop.best": "best value", // etiket, ≤12
  "shop.tokens": "Extra-move tokens: <b>{n}</b> (used for rescues)",
  "shop.restore": "Restore purchases",
  "shop.buyGold": "Get gold", // düğme, ≤12
  "shop.pack.kese": "Pouch", // ≤14
  "shop.pack.sandik": "Crate",
  "shop.pack.hazine": "Treasure",
  "shop.pack.baslangic": "Starter pack",
  "shop.demo.text": "<b>Test version:</b> no real payment is taken. Add this pack for free?",
  "shop.demo.add": "Add", // düğme, ≤12
  "shop.msg.pending": "Payment pending; your gold will be added once it goes through.", // bildirim, tek satır
  "shop.msg.got": "{name}: +{gold} gold",
  "shop.msg.gotTokens_one": "{name}: +{gold} gold and {n} token",
  "shop.msg.gotTokens_other": "{name}: +{gold} gold and {n} tokens",
  "shop.msg.cancelled": "Purchase cancelled.",
  "shop.msg.failed": "Payment failed, please try again.",
  "shop.msg.demoRestore": "Nothing to restore in the test version.",
  "shop.msg.restoreFail": "Couldn't restore, please try again.",
  "shop.msg.restored": "Your purchases have been checked.",

  // ---- grade: istif derecesi ----
  "grade.usta": "Master", // rozet, ≤10
  "grade.duzgun": "Neat", // rozet, ≤10
  "grade.daginik": "Messy", // rozet, ≤10

  // ---- goods: mallar (ad = başlık biçimi; .s = cümle içi biçim, ör. "+3 baharat", "… baharat malını pahalı alır") ----
  "goods.baharat": "Spices", // çip ve tablo, ≤10
  "goods.baharat.s": "spices",
  "goods.su": "Water",
  "goods.su.s": "water",
  "goods.tuz": "Salt",
  "goods.tuz.s": "salt",
  "goods.ipek": "Silk",
  "goods.ipek.s": "silk",
  "goods.kahve": "Coffee",
  "goods.kahve.s": "coffee",
  "goods.barut": "Gunpowder",
  "goods.barut.s": "gunpowder",
  "goods.tavuk": "Chickens",
  "goods.tavuk.s": "chickens",
  "goods.cay": "Tea",
  "goods.cay.s": "tea",
  "goods.porselen": "Porcelain",
  "goods.porselen.s": "porcelain",

  // ---- city: şehirler (her dilde anlamlı ve eğlenceli; sırayla rotada) ----
  "city.karanfil": "Clove Isle", // ≤18 (uzunsa alt satıra geçer)
  "city.tuzburnu": "Salt Point",
  "city.ipek": "Silk Cove",
  "city.cay": "Tea Terrace",
  "city.fener": "Lighthouse Harbor",
  "city.mercan": "Coral Shore",
  "city.kehribar": "Amber Bay",
  "city.sandal": "Dinghy Cape",
  "city.lacivert": "Indigo Harbor",
  "city.tarcin": "Cinnamon Island",
  "city.ruzgarli": "Windy Keep",
  "city.sedef": "Pearl Cove",
  "city.kumsaati": "Hourglass Harbor",
  "city.yosun": "Kelp Isle",
  "city.bakir": "Copper Cape",
  "city.firtina": "Storm Cove",
};
