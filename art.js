/* Tìm về Chúa - minh họa SVG gốc (do tác giả trang vẽ) */
(function () {
  const G = 'url(#gGold)', B = 'url(#gBlue)', R = 'url(#gRed)';
  const star = (cx, cy, r, f) => {
    let p = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      p += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return `<path d="${p}Z" fill="${f || G}"/>`;
  };
  const rays = (cx, cy, r1, r2, n, w, col, op) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      s += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(1)}" y1="${(cy + r1 * Math.sin(a)).toFixed(1)}" x2="${(cx + r2 * Math.cos(a)).toFixed(1)}" y2="${(cy + r2 * Math.sin(a)).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op || 1}"/>`;
    }
    return s;
  };

  const cross = (cls) => `<svg class="${cls || ''}" viewBox="0 0 120 170" role="img" aria-label="Thánh giá">
    ${rays(60, 62, 30, 58, 24, 1.6, '#c9a227', 0.45)}
    <path d="M52 10h16v40h40v16H68v76H52V66H12V50h40z" fill="${G}" stroke="#8a6a12" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="60" cy="58" r="9" fill="#8f1d2c" stroke="#8a6a12" stroke-width="1.2"/>
    <circle cx="60" cy="58" r="3.4" fill="#fff3c4"/>
    <circle cx="60" cy="10" r="4" fill="${G}" stroke="#8a6a12"/><circle cx="12" cy="58" r="4" fill="${G}" stroke="#8a6a12"/>
    <circle cx="108" cy="58" r="4" fill="${G}" stroke="#8a6a12"/><circle cx="60" cy="142" r="4" fill="${G}" stroke="#8a6a12"/>
    <path d="M20 160h80" stroke="#c9a227" stroke-width="2" stroke-linecap="round"/></svg>`;

  const trinity = (cls) => `<svg class="${cls || ''}" viewBox="0 0 300 280" role="img" aria-label="Chúa Ba Ngôi">
    <g stroke="#8a6a12" stroke-width="3" fill="none"><path d="M150 40 L48 218 L252 218 Z" stroke-linejoin="round"/>
    <line x1="150" y1="40" x2="150" y2="136"/><line x1="48" y1="218" x2="150" y2="136" /><line x1="252" y1="218" x2="150" y2="136"/></g>
    <g fill="#fff" stroke="#8a6a12" stroke-width="3">
      <circle cx="150" cy="40" r="34"/><circle cx="48" cy="218" r="34"/><circle cx="252" cy="218" r="34"/>
      <circle cx="150" cy="136" r="32" fill="#fff7df"/></g>
    <g font-family="Cormorant Garamond, Georgia, serif" font-weight="700" text-anchor="middle" fill="#6b1420">
      <text x="150" y="37" font-size="13">PATER</text><text x="150" y="53" font-size="9" fill="#555">Chúa Cha</text>
      <text x="48" y="215" font-size="13">FILIUS</text><text x="48" y="231" font-size="9" fill="#555">Chúa Con</text>
      <text x="252" y="212" font-size="10.5">SPIRITUS</text><text x="252" y="224" font-size="10.5">SANCTUS</text><text x="252" y="240" font-size="8.5" fill="#555" font-weight="400">Chúa Thánh Thần</text>
      <text x="150" y="141" font-size="16">DEUS</text></g>
    <g font-family="Cormorant Garamond, Georgia, serif" font-size="11" font-style="italic" text-anchor="middle" fill="#8a6a12">
      <text x="86" y="108" transform="rotate(-60 86 108)">non est</text><text x="214" y="108" transform="rotate(60 214 108)">non est</text><text x="150" y="258">non est</text>
      <text x="136" y="88" transform="rotate(90 136 88)">est</text><text x="98" y="190" transform="rotate(-30 98 190)">est</text><text x="202" y="190" transform="rotate(30 202 190)">est</text></g></svg>`;

  const jesus = (cls) => `<svg class="${cls || ''}" viewBox="0 0 240 330" role="img" aria-label="Thánh Tâm Chúa Giêsu">
    <ellipse cx="120" cy="170" rx="104" ry="155" fill="#fff8e3" stroke="#c9a227" stroke-width="2"/>
    ${rays(120, 195, 36, 76, 28, 2, '#e3b94a', 0.9)}
    <path d="M92 118 C60 150 46 250 38 318 H202 C194 250 180 150 148 118 Z" fill="#fff" stroke="#d8d0c0" stroke-width="1.5"/>
    <path d="M148 112 C196 150 200 260 204 318 H150 C158 250 150 190 120 160 Z" fill="${B}" stroke="#1d3768" stroke-width="1.5"/>
    <path d="M92 112 C70 150 60 230 54 318 H90 C92 250 96 200 120 160 Z" fill="#a82636" opacity=".95"/>
    <path d="M120 124 L120 318" stroke="#e8dec6" stroke-width="2"/>
    <ellipse cx="120" cy="82" rx="33" ry="40" fill="#4f3220"/>
    <path d="M96 96 C92 140 110 150 120 150 C130 150 148 140 144 96 Z" fill="#4f3220"/>
    <circle cx="120" cy="76" r="50" fill="${G}" stroke="#8a6a12" stroke-width="2"/>
    <circle cx="120" cy="76" r="43" fill="#fff2c4"/>
    <g fill="#b3283a"><rect x="114" y="28" width="12" height="24"/><rect x="78" y="70" width="24" height="12"/><rect x="138" y="70" width="24" height="12"/></g>
    <ellipse cx="120" cy="84" rx="20" ry="26" fill="#f3d6b4"/>
    <path d="M100 74 C102 58 138 58 140 74 C132 66 108 66 100 74Z" fill="#4f3220"/>
    <path d="M100 96 C104 124 136 124 140 96 C134 108 106 108 100 96Z" fill="#4f3220"/>
    <ellipse cx="111" cy="82" rx="3.2" ry="2" fill="#2d1b10"/><ellipse cx="129" cy="82" rx="3.2" ry="2" fill="#2d1b10"/>
    <path d="M120 84 v10 h-3" fill="none" stroke="#b98a62" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M112 104 q8 4 16 0" fill="none" stroke="#7a3b2a" stroke-width="2" stroke-linecap="round"/>
    <path d="M118 150 C100 134 100 118 110 118 C114 118 118 121 120 124" fill="none"/>
    <g transform="translate(120 190)">
      <circle r="27" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-dasharray="4 3"/>
      <path d="M0 24 C-34 -2 -22 -28 -8 -24 C-3 -22 0 -18 0 -14 C0 -18 3 -22 8 -24 C22 -28 34 -2 0 24Z" fill="${R}" stroke="#6b1420" stroke-width="1.5"/>
      <path d="M-4 -30 C-12 -42 -2 -48 0 -58 C2 -48 12 -42 4 -30 C2 -34 -2 -34 -4 -30Z" fill="#f08a24" stroke="#c4571a" stroke-width="1"/>
      <path d="M0 -12 V8 M-6 -4 H6" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M60 188 C42 176 40 160 48 150" fill="none" stroke="#f3d6b4" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="46" cy="146" rx="8" ry="11" fill="#f3d6b4"/>
    <path d="M180 188 C192 200 190 212 182 218" fill="none" stroke="#f3d6b4" stroke-width="9" stroke-linecap="round"/></svg>`;

  const mary = (cls) => `<svg class="${cls || ''}" viewBox="0 0 240 330" role="img" aria-label="Đức Mẹ Maria">
    <ellipse cx="120" cy="170" rx="104" ry="155" fill="#eef3fb" stroke="#9db4dc" stroke-width="2"/>
    ${[...Array(12)].map((_, i) => { const a = Math.PI + (Math.PI * (i + .5)) / 12; return star(120 + 66 * Math.cos(a), 84 + 66 * Math.sin(a), 6.5); }).join('')}
    <circle cx="120" cy="86" r="42" fill="${G}" opacity=".9"/>
    <path d="M120 44 C80 44 68 84 64 124 C58 200 40 262 28 322 H212 C200 262 182 200 176 124 C172 84 160 44 120 44Z" fill="${B}" stroke="#c9a227" stroke-width="3"/>
    <path d="M120 120 C96 130 84 170 80 322 H160 C156 170 144 130 120 120Z" fill="#fff" stroke="#d3dbe9" stroke-width="1.5"/>
    <path d="M120 52 C92 52 86 84 86 108 C92 124 104 130 120 130 C136 130 148 124 154 108 C154 84 148 52 120 52Z" fill="#fff" stroke="#c9d3e6"/>
    <ellipse cx="120" cy="92" rx="19" ry="25" fill="#f4dcc0"/>
    <path d="M110 86 q4 3 8 0 M122 86 q4 3 8 0" fill="none" stroke="#5b3a24" stroke-width="2" stroke-linecap="round"/>
    <path d="M120 90 v9" stroke="#c49a74" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M113 108 q7 4 14 0" fill="none" stroke="#a5523f" stroke-width="2" stroke-linecap="round"/>
    <path d="M104 118 H136" stroke="#c9a227" stroke-width="2"/>
    <path d="M96 176 C100 150 140 150 144 176" fill="none" stroke="#f4dcc0" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="120" cy="156" rx="13" ry="9" fill="#f4dcc0"/>
    <g fill="#c9a227" stroke="#8a6a12" stroke-width=".6">${[...Array(9)].map((_, i) => `<circle cx="${120 + (i % 2 ? 2 : -2)}" cy="${166 + i * 14}" r="3"/>`).join('')}</g>
    <path d="M120 292 v10 M114 297 h12" stroke="#8a6a12" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(60 304)"><circle r="6" fill="#fff" stroke="#e7c0c9"/><circle r="2.5" fill="#d85a78"/></g><g transform="translate(180 304)"><circle r="6" fill="#fff" stroke="#e7c0c9"/><circle r="2.5" fill="#d85a78"/></g></svg>`;

  const joseph = (cls) => `<svg class="${cls || ''}" viewBox="0 0 240 330" role="img" aria-label="Thánh cả Giuse">
    <ellipse cx="120" cy="170" rx="104" ry="155" fill="#f7f1e6" stroke="#cdb98e" stroke-width="2"/>
    <circle cx="120" cy="82" r="46" fill="${G}" stroke="#8a6a12" stroke-width="2"/><circle cx="120" cy="82" r="39" fill="#fff2c4"/>
    <path d="M92 124 C60 160 52 250 46 322 H194 C188 250 180 160 148 124Z" fill="#7a5230" stroke="#4a301a" stroke-width="1.5"/>
    <path d="M120 124 C104 150 100 230 98 322 H142 C140 230 136 150 120 124Z" fill="#e6d3a6"/>
    <ellipse cx="120" cy="84" rx="20" ry="26" fill="#f0cfa8"/>
    <path d="M99 78 C100 52 140 52 141 78 C132 66 108 66 99 78Z" fill="#6b4a2a"/>
    <path d="M100 96 C103 128 137 128 140 96 C134 112 106 112 100 96Z" fill="#6b4a2a"/>
    <ellipse cx="111" cy="84" rx="3" ry="2" fill="#2d1b10"/><ellipse cx="129" cy="84" rx="3" ry="2" fill="#2d1b10"/>
    <path d="M112 104 q8 4 16 0" fill="none" stroke="#7a3b2a" stroke-width="2" stroke-linecap="round"/>
    <path d="M178 330 V120" stroke="#8a6a12" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(178 118)"><path d="M0 0 C-10 -8 -12 -26 0 -40 C12 -26 10 -8 0 0Z" fill="#fff" stroke="#c8c8c8"/><path d="M0 0 C-22 -4 -28 -20 -22 -30 C-10 -24 -4 -12 0 0Z" fill="#fff" stroke="#c8c8c8"/><path d="M0 0 C22 -4 28 -20 22 -30 C10 -24 4 -12 0 0Z" fill="#fff" stroke="#c8c8c8"/><circle cy="-8" r="2.5" fill="#e3b94a"/></g>
    <ellipse cx="160" cy="200" rx="9" ry="12" fill="#f0cfa8"/></svg>`;

  const dove = (cls) => `<svg class="${cls || ''}" viewBox="0 0 200 180" role="img" aria-label="Chúa Thánh Thần">
    ${rays(100, 70, 44, 86, 30, 2.4, '#e3b94a', 0.85)}
    <circle cx="100" cy="70" r="38" fill="#fff8e3" stroke="#e3b94a" stroke-width="2"/>
    <path d="M62 72 C70 36 108 26 134 40 C122 44 116 52 118 60 C140 56 150 72 138 82 C150 82 154 92 146 98 C118 110 84 104 62 72Z" fill="#fff" stroke="#9aa7bd" stroke-width="2" stroke-linejoin="round"/>
    <path d="M88 52 C100 36 124 36 134 44 C118 46 108 54 104 66 C98 62 92 58 88 52Z" fill="#e9eef7" stroke="#9aa7bd" stroke-width="1.5"/>
    <path d="M62 72 C48 70 38 78 34 90 C46 88 54 86 66 84Z" fill="#fff" stroke="#9aa7bd" stroke-width="2"/>
    <circle cx="136" cy="46" r="2.2" fill="#2d2d2d"/><path d="M140 46 l9 3 l-9 3z" fill="#e0a030"/>
    <path d="M30 136 q20 -22 44 -6 q22 14 48 -4" fill="none" stroke="#2f6b3a" stroke-width="3" stroke-linecap="round"/><g fill="#2f6b3a"><ellipse cx="52" cy="124" rx="6" ry="3" transform="rotate(-30 52 124)"/><ellipse cx="94" cy="130" rx="6" ry="3" transform="rotate(20 94 130)"/></g></svg>`;

  const chalice = (cls) => `<svg class="${cls || ''}" viewBox="0 0 200 230" role="img" aria-label="Bí tích Thánh Thể">
    ${rays(100, 66, 48, 90, 28, 2.4, '#e3b94a', 0.85)}
    <circle cx="100" cy="66" r="42" fill="#fff" stroke="#c9a227" stroke-width="3"/>
    <text x="100" y="74" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-weight="700" font-size="26" fill="#8f1d2c">IHS</text>
    <path d="M88 40h24M100 28v12" stroke="#8f1d2c" stroke-width="3" stroke-linecap="round"/>
    <path d="M52 118 H148 C148 160 128 172 100 172 C72 172 52 160 52 118Z" fill="${G}" stroke="#8a6a12" stroke-width="2"/>
    <rect x="94" y="170" width="12" height="26" fill="${G}" stroke="#8a6a12"/><ellipse cx="100" cy="186" rx="14" ry="6" fill="${G}" stroke="#8a6a12"/>
    <path d="M56 214 C60 196 140 196 144 214Z" fill="${G}" stroke="#8a6a12" stroke-width="2"/>
    <path d="M52 118 H148" stroke="#8a6a12" stroke-width="2"/><path d="M70 134 C74 150 84 158 100 160" stroke="#fff7d4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;

  const rosary = (cls) => {
    let beads = '';
    const cx = 100, cy = 82, rx = 64, ry = 66;
    for (let i = 0; i < 55; i++) {
      const a = Math.PI / 2 + (2 * Math.PI * (i + 3)) / 59, big = i % 11 === 0;
      beads += `<circle cx="${(cx + rx * Math.cos(a)).toFixed(1)}" cy="${(cy + ry * Math.sin(a)).toFixed(1)}" r="${big ? 5.2 : 3.4}" fill="${big ? '#8f1d2c' : '#b3283a'}" stroke="#6b1420" stroke-width=".8"/>`;
    }
    let tail = '';
    for (let i = 0; i < 5; i++) tail += `<circle cx="100" cy="${156 + i * 11}" r="${i === 0 ? 5.2 : 3.4}" fill="#b3283a" stroke="#6b1420" stroke-width=".8"/>`;
    return `<svg class="${cls || ''}" viewBox="0 0 200 260" role="img" aria-label="Chuỗi Mân Côi">${beads}${tail}
      <path d="M94 210h12v12h12v10h-12v22h-12v-22H82v-10h12z" fill="${G}" stroke="#8a6a12" stroke-width="1.2"/>
      <circle cx="100" cy="150" r="9" fill="#fff" stroke="#c9a227" stroke-width="2"/><text x="100" y="154" text-anchor="middle" font-size="10" font-weight="700" fill="#2a4d8f" font-family="Georgia,serif">M</text></svg>`;
  };

  const lamb = (cls) => `<svg class="${cls || ''}" viewBox="0 0 200 170" role="img" aria-label="Chiên Thiên Chúa">
    <circle cx="96" cy="70" r="52" fill="#fff8e3" stroke="#e3b94a" stroke-width="2"/>
    <ellipse cx="92" cy="92" rx="44" ry="30" fill="#fff" stroke="#9aa7bd" stroke-width="2"/>
    <g fill="#fff" stroke="#9aa7bd" stroke-width="1.5"><circle cx="64" cy="82" r="11"/><circle cx="78" cy="70" r="12"/><circle cx="96" cy="68" r="12"/><circle cx="114" cy="72" r="11"/><circle cx="124" cy="86" r="10"/><circle cx="58" cy="98" r="9"/></g>
    <ellipse cx="134" cy="66" rx="14" ry="12" fill="#fff" stroke="#9aa7bd" stroke-width="2"/><circle cx="138" cy="63" r="1.8" fill="#222"/>
    <path d="M142 56 q10 -4 8 6" fill="#fff" stroke="#9aa7bd" stroke-width="1.5"/>
    <g stroke="#9aa7bd" stroke-width="3" stroke-linecap="round"><path d="M70 118v26M88 120v26M108 120v26M124 116v26"/></g>
    <circle cx="134" cy="48" r="11" fill="none" stroke="${G}" stroke-width="2.4"/><path d="M134 40v16M128 46h12" stroke="#8f1d2c" stroke-width="2"/>
    <path d="M148 140V30" stroke="#8a6a12" stroke-width="3"/><path d="M148 34h30l-8 9 8 9h-30z" fill="#fff" stroke="#8f1d2c" stroke-width="2"/><path d="M158 38v12M153 43h10" stroke="#8f1d2c" stroke-width="2"/></svg>`;

  const fish = (cls) => `<svg class="${cls || ''}" viewBox="0 0 180 100" role="img" aria-label="Ichthys"><path d="M10 50 C40 8 110 8 150 50 C110 92 40 92 10 50Z" fill="none" stroke="#2a4d8f" stroke-width="5" stroke-linejoin="round"/><path d="M150 50 L172 30 M150 50 L172 70" stroke="#2a4d8f" stroke-width="5" stroke-linecap="round"/><circle cx="46" cy="44" r="4" fill="#2a4d8f"/></svg>`;

  const chiro = (cls) => `<svg class="${cls || ''}" viewBox="0 0 120 120" role="img" aria-label="Chi-Rô"><circle cx="60" cy="60" r="54" fill="#fff" stroke="#c9a227" stroke-width="3"/><g stroke="#8f1d2c" stroke-width="7" stroke-linecap="round" fill="none"><path d="M60 24v72"/><path d="M60 24c28 0 28 30 0 30"/><path d="M34 40l52 40M86 40L34 80"/></g><text x="22" y="66" font-size="17" font-weight="700" fill="#2a4d8f" font-family="Georgia,serif">α</text><text x="90" y="66" font-size="17" font-weight="700" fill="#2a4d8f" font-family="Georgia,serif">ω</text></svg>`;

  const bible = (cls) => `<svg class="${cls || ''}" viewBox="0 0 200 150" role="img" aria-label="Kinh Thánh">
    <path d="M100 38 C80 26 40 26 14 36 V128 C40 118 80 118 100 130Z" fill="#fff" stroke="#8a6a12" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M100 38 C120 26 160 26 186 36 V128 C160 118 120 118 100 130Z" fill="#fffdf6" stroke="#8a6a12" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M24 50 C48 44 70 46 92 54 M24 64 C48 58 70 60 92 68 M24 78 C48 72 70 74 92 82 M24 92 C48 86 70 88 92 96 M108 54 C130 46 152 44 176 50 M108 68 C130 60 152 58 176 64 M108 82 C130 74 152 72 176 78 M108 96 C130 88 152 86 176 92" stroke="#cdbd96" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M12 130 C40 122 80 122 100 134 C120 122 160 122 188 130" fill="none" stroke="#8f1d2c" stroke-width="5" stroke-linecap="round"/>
    <path d="M94 4h12v18h14v12h-14v10H94V34H80V22h14z" fill="${G}" stroke="#8a6a12" stroke-width="1.5"/></svg>`;

  const heart = (cls) => `<svg class="${cls || ''}" viewBox="0 0 120 140"><path d="M60 128 C8 82 24 36 52 40 C56 40 60 44 60 50 C60 44 64 40 68 40 C96 36 112 82 60 128Z" fill="${R}" stroke="#6b1420" stroke-width="2"/><path d="M52 40 C44 24 58 18 60 6 C62 18 76 24 68 40 C64 34 56 34 52 40Z" fill="#f08a24"/><path d="M60 58v34M48 72h24" stroke="#fff3c4" stroke-width="5" stroke-linecap="round"/></svg>`;

  const divider = () => `<div class="divider" aria-hidden="true"><span></span><svg viewBox="0 0 40 40"><path d="M17 3h6v13h13v6H23v15h-6V22H4v-6h13z" fill="#c9a227"/></svg><span></span></div>`;

  /* Chân dung cách điệu cho mục Danh nhân */
  const GL = {
    pope: '<path d="M-14 -4 L0 -22 L14 -4Z M0 -22v-6M-3 -26h6" fill="#fff" stroke="#8a6a12" stroke-width="1.5"/>',
    apostle: '<path d="M-10 6h20v14h-20z" fill="#8f1d2c"/><path d="M0 8v10M-4 12h8" stroke="#fff3c4" stroke-width="1.6"/>',
    martyr: '<path d="M0 22 C-4 8 -2 -4 6 -16 M6 -16 l-8 8 M6 -16 l-1 10 M6 -16 l8 4" stroke="#2f6b3a" stroke-width="2" fill="none" stroke-linecap="round"/>',
    saint: '<path d="M0 22 C-12 14 -12 2 -4 -2 C-1 -3 0 0 0 2 C0 0 1 -3 4 -2 C12 2 12 14 0 22Z" fill="#b3283a"/>',
    holy: '<path d="M-12 20 V4 M12 20 V4 M-12 4 L0 -6 L12 4" stroke="#8a6a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    viet: '<path d="M-14 20 C-6 8 6 8 14 20" stroke="#8f1d2c" stroke-width="2.4" fill="none"/><path d="M0 -6 l4 8 h-8z" fill="#c9a227"/>'
  };
  const COL = { pope: '#f2e7c9', apostle: '#e6ecf8', martyr: '#f9e1e4', saint: '#eaf3e8', holy: '#e9eefb', viet: '#fbe8dc' };
  const avatar = (cat, letter) => `<svg viewBox="0 0 100 100" class="avatar" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="${COL[cat] || '#f4f4f4'}" stroke="#c9a227" stroke-width="2"/>
    <circle cx="50" cy="34" r="22" fill="none" stroke="${G}" stroke-width="3"/>
    <circle cx="50" cy="36" r="12" fill="#f2d9bd"/>
    <path d="M20 94 C20 64 36 56 50 56 C64 56 80 64 80 94Z" fill="${cat === 'pope' ? '#fff' : cat === 'martyr' ? '#a82636' : cat === 'holy' ? '#2a4d8f' : cat === 'viet' ? '#8f1d2c' : '#6b4a2a'}" stroke="#00000022"/>
    <g transform="translate(50 76) scale(.8)">${GL[cat] || ''}</g></svg>`;

  window.ART = { cross, trinity, jesus, mary, joseph, dove, chalice, rosary, lamb, fish, chiro, bible, heart, divider, avatar, star };
})();
