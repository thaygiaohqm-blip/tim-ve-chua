/* Tìm về Chúa: ứng dụng một trang, định tuyến bằng #tên */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const app = $('#app');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }
  };
  let mode = store.get('lang', 'both'); if (!['both', 'ben', 'vi', 'en'].includes(mode)) mode = 'both';
  let lang = mode === 'ben' ? 'both' : mode, ben = mode === 'ben', ENP = lang === 'en' || ben;
  const setMode = m => { mode = m; lang = m === 'ben' ? 'both' : m; ben = m === 'ben'; ENP = lang === 'en' || ben; store.set('lang', m); document.body.classList.toggle('ben', ben); };
  document.body.classList.toggle('ben', ben);
  let BOOKS = [];
  const cache = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]/g, '');

  /* ---- Hiển thị song ngữ ---- */
  const H = (vi, en, a) => lang === 'both' ? (ben ? `${esc(en)}<span class="sub"${a || ''}>${esc(vi)}</span>` : `${esc(vi)}<span class="sub"${a || ''}>${esc(en)}</span>`) : esc(lang === 'vi' ? vi : en);
  const P = (vi, en, cls) => { const pv = `<p class="${cls || ''}"><span class="vi">${esc(vi)}</span></p>`, pe = `<p class="en">${esc(en)}</p>`; return lang === 'both' ? (ben ? pe + pv.replace('<p class="' + (cls || '') + '">', '<p class="' + (cls || '') + ' vi2">') : pv + pe) : `<p class="${cls || ''}${lang === 'en' ? ' en' : ''}">${esc(lang === 'vi' ? vi : en)}</p>`; };
  const I = (vi, en) => lang === 'both' ? `<span class="pair">${ben ? `<span class="en">${esc(en)}</span><span class="vi">${esc(vi)}</span>` : `<span class="vi">${esc(vi)}</span><span class="en">${esc(en)}</span>`}</span>` : esc(lang === 'vi' ? vi : en);
  const L = (vi, en) => lang === 'vi' ? vi : lang === 'en' ? en : ben ? en + ' / ' + vi : vi + ' / ' + en;
  const BI = (vi, en, cls) => lang === 'both' ? (ben ? `<div class="en${cls ? ' ' + cls : ''}">${esc(en)}</div><div class="vi${cls ? ' ' + cls : ''}">${esc(vi)}</div>` : `<div class="vi${cls ? ' ' + cls : ''}">${esc(vi)}</div><div class="en${cls ? ' ' + cls : ''}">${esc(en)}</div>`) : lang === 'vi' ? `<div class="vi${cls ? ' ' + cls : ''}">${esc(vi)}</div>` : `<div class="en${cls ? ' ' + cls : ''}">${esc(en)}</div>`;

  const bk = id => BOOKS.find(b => b.id === id);
  const bname = id => { const b = bk(id); return b ? (lang === 'both' ? (ben ? b.en + ' · ' + b.vi : b.vi + ' · ' + b.en) : lang === 'en' ? b.en : b.vi) : id; };
  function refLink(r) {
    const p = r.split('.'); const id = p[0], ch = p[1], vs = p.slice(2).join('.').replace('.', ':');
    return `<a href="#bible-${id}-${ch}-${(vs.split(/[-:]/)[0]) || 1}">${esc(bname(id))} ${esc(ch)}${vs ? ':' + esc(vs) : ''}</a>`;
  }
  const refs = a => a && a.length ? `<div class="refs">${a.map(refLink).join('')}</div>` : '';

  /* ---- Điều hướng ---- */
  const TABS = [['home', 'Trang chủ', 'Home'], ['bible', 'Kinh Thánh', 'Bible'], ['calendar', 'Lịch Công giáo', 'Calendar'], ['definitions', 'Định nghĩa', 'Definitions'], ['catechism', 'Giáo lý', 'Catechism'], ['people', 'Danh nhân', 'Saints & People'], ['mass', 'Thánh lễ', 'Mass'], ['homily', 'Bài giảng', 'Homilies'], ['prayers', 'Sách kinh', 'Prayers & Books'], ['quiz', 'Kiểm tra', 'Quiz']];
  function drawTabs(cur) {
    $('#tabs').innerHTML = TABS.map(t => `<a href="#${t[0]}"${t[0] === cur ? ' aria-current="page"' : ''}>${ENP ? t[2] : t[1]}</a>`).join('');
    $$('.langsw button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === mode));
  }
  $('#brandCross').innerHTML = ART.cross('');
  $$('.langsw button').forEach(b => b.addEventListener('click', () => { const keepM = mdl; setMode(b.dataset.lang); route(true).then(() => { if (keepM) { mdl = keepM; renderModal(); } }); }));

  async function loadBooks() {
    if (BOOKS.length) return;
    BOOKS = await (await fetch('data/books.json')).json();
  }
  async function loadBook(id) {
    if (cache[id]) return cache[id];
    const r = await fetch(`data/bible/${id}.json`);
    if (!r.ok) throw new Error('Không tải được sách');
    return (cache[id] = await r.json());
  }

  /* ---- Lịch: tính ngày ---- */
  const UTC = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
  const addD = (dt, n) => new Date(dt.getTime() + n * 864e5);
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return UTC(y, mo, da);
  }
  function advent1(y) { const x = UTC(y, 12, 25); const dow = x.getUTCDay(); const fourth = addD(x, dow === 0 ? -7 : -dow); return addD(fourth, -21); }
  function epiphanySunday(y) { let d = UTC(y, 1, 2); while (d.getUTCDay() !== 0) d = addD(d, 1); return d; }
  function dateFor(rule, y) {
    if (/^\d+-\d+$/.test(rule)) { const p = rule.split('-'); return UTC(y, +p[0], +p[1]); }
    const m = rule.match(/^E([+-]\d+)$/); if (m) return addD(easter(y), +m[1]);
    if (rule === 'EPI') return epiphanySunday(y);
    if (rule === 'BAP') { const e = epiphanySunday(y); return e.getUTCDate() >= 7 ? addD(e, 1) : addD(e, 7); }
    if (rule === 'ADV1') return advent1(y);
    if (rule === 'XTK') return addD(advent1(y), -7);
    if (rule === 'HF') { const x = UTC(y, 12, 25); return x.getUTCDay() === 0 ? UTC(y, 12, 30) : addD(x, 7 - x.getUTCDay()); }
    return UTC(y, 1, 1);
  }
  const yearEvents = y => CAL.map(e => ({ d: dateFor(e[0], y), e })).sort((a, b) => a.d - b.d);
  const COLN = { white: ['Trắng', 'White'], red: ['Đỏ', 'Red'], green: ['Xanh', 'Green'], violet: ['Tím', 'Violet'], rose: ['Hồng', 'Rose'], gold: ['Vàng', 'Gold'] };
  const TYPEN = { lord: ['Lễ Chúa', 'Lord'], mary: ['Đức Mẹ', 'Mary'], saint: ['Các thánh', 'Saints'], season: ['Mùa phụng vụ', 'Season'], viet: ['Việt Nam', 'Vietnam'] };
  const WD = ['Chúa nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  function seasonOn(dt) {
    const y = dt.getUTCFullYear(), E = easter(y), ash = addD(E, -46), triStart = addD(E, -3), pent = addD(E, 49), adv = advent1(y), bap = dateFor('BAP', y);
    if (dt >= adv) return 0; if (dt <= bap) return 1; if (dt >= ash && dt < triStart) return 3; if (dt >= triStart && dt < E) return 4; if (dt >= E && dt <= pent) return 5; return 2;
  }
  /* khi dt thuộc 25/12-31/12 */
  function seasonIdx(dt) { const y = dt.getUTCFullYear(); if (dt >= UTC(y, 12, 25)) return 1; return seasonOn(dt); }
  const now = () => { const n = new Date(); return UTC(n.getFullYear(), n.getMonth() + 1, n.getDate()); };

  /* ---- TRANG CHỦ ---- */
  const VOD = [['Matt', 6, 33], ['John', 3, 16], ['Ps', 23, 1], ['Rom', 8, 28], ['Isa', 41, 10], ['Josh', 1, 9], ['Prov', 3, 5], ['Phil', 4, 13], ['1John', 4, 8], ['Matt', 11, 28], ['John', 14, 6], ['Ps', 46, 1], ['Jer', 29, 11], ['Gal', 5, 22]];
  async function home() {
    const t = now(), si = seasonIdx(t), S = SEASONS[si];
    const todays = yearEvents(t.getUTCFullYear()).filter(x => +x.d === +t);
    const day = Math.floor((t - UTC(t.getUTCFullYear(), 1, 1)) / 864e5), v = VOD[day % VOD.length];
    let vhtml = '';
    try { const d = await loadBook(v[0]); const c = d.c[v[1] - 1]; vhtml = `<div class="verse-card"><span class="tag">${L('Lời Chúa hôm nay', 'Verse of the day')}</span>${(() => { const a = lang !== 'en' && c.vi[v[2] - 1] ? `<q class="vi">${esc(c.vi[v[2] - 1])}</q>` : '', e = lang !== 'vi' ? `<q class="en">${esc(c.en[v[2] - 1] || '')}</q>` : ''; return ben ? e + a : a + e; })()}<cite>${esc(bname(v[0]))} ${v[1]}:${v[2]}</cite></div>`; } catch (e) { /* bỏ qua */ }
    const tiles = [['bible', ART.bible, 'Kinh Thánh', 'Bible', 'Toàn văn 73 sách, song ngữ, có giải thích', 'Full text, bilingual, with commentary'], ['calendar', ART.chiro, 'Lịch Công giáo', 'Catholic Calendar', 'Các lễ trong năm, bài đọc và lịch sử', 'Feasts, readings and history'], ['definitions', ART.fish, 'Định nghĩa', 'Definitions', 'Thuật ngữ Kinh Thánh và đức tin', 'Biblical and faith terms'], ['catechism', ART.dove, 'Giáo lý', 'Catechism', 'Tóm lược Sách Giáo Lý Hội Thánh', 'Catechism of the Catholic Church outline'], ['people', ART.heart, 'Danh nhân', 'Saints & People', 'Đức Mẹ, thánh Giuse, tông đồ, giáo hoàng, thánh', 'Mary, Joseph, apostles, popes, saints'], ['prayers', ART.rosary, 'Sách kinh', 'Prayers & Books', 'Kinh thường dùng, Mân Côi, Đàng Thánh Giá', 'Prayers, Rosary, Stations of the Cross'], ['quiz', ART.lamb, 'Kiểm tra', 'Quiz', 'Trắc nghiệm dễ, trung bình, khó', 'Easy, medium and hard questions']];
    return `<section class="hero">
      <div class="hero-text"><h1>${H('Tìm về Chúa', 'Seeking the Lord')}</h1>
        <p class="lead">${I('“Hãy tìm kiếm Nước Thiên Chúa và đức công chính của Người trước đã, còn tất cả những thứ kia, Người sẽ thêm cho.” (Mt 6,33)', 'Seek first the kingdom of God and his righteousness, and all these things will be given to you. (Matt 6:33)')}</p>
        <div class="chips"><a class="btn" href="#bible">${L('Đọc Kinh Thánh', 'Read the Bible')}</a> <a class="btn alt" href="#quiz">${L('Làm bài kiểm tra', 'Take a quiz')}</a></div>${vhtml}</div>
      <div class="hero-art" aria-hidden="false">${ART.mary('side')}${ART.jesus('')}${ART.joseph('side')}</div></section>
      <div class="today"><span class="dot c-${S.col}"></span><div><b>${L('Hôm nay', 'Today')}: ${WD[t.getUTCDay()]}, ${t.getUTCDate()}/${t.getUTCMonth() + 1}/${t.getUTCFullYear()}</b><br>${I(S.vi, S.en)}${todays.length ? ' · ' + todays.map(x => `<a href="#calendar">${esc(lang === 'en' ? x.e[2] : x.e[1])}</a>`).join(', ') : ''}</div></div>
      <div class="grid">${tiles.map(t => `<a class="tile" href="#${t[0]}">${t[1]('')}<div><b>${ENP ? t[3] : t[2]}</b><span>${ENP ? t[5] : t[4]}</span></div></a>`).join('')}</div>
      ${ART.divider()}
      <section class="feature">${ART.trinity('')}<div><h2>${H('Chúa Ba Ngôi', 'The Holy Trinity')}</h2>${P('Một Thiên Chúa duy nhất trong ba Ngôi: Chúa Cha là Đấng Sáng Tạo, Chúa Con là Đấng Cứu Chuộc, Chúa Thánh Thần là Đấng Thánh Hóa. Ba Ngôi cùng một bản tính, cùng một vinh quang. Dấu Thánh Giá mà ta làm mỗi ngày là lời tuyên xưng đức tin ấy.', 'One God in three Persons: the Father Creator, the Son Redeemer, the Holy Spirit Sanctifier. They share one nature and one glory. The Sign of the Cross we make each day is a profession of this faith.')}<div class="refs"><a href="#bible-Matt-28-19">Mt 28:19</a><a href="#bible-2Cor-13-13">2 Cr 13:13</a><a href="#definitions">${L('Định nghĩa', 'Definition')}</a></div></div></section>
      <section class="feature">${ART.chalice('')}<div><h2>${H('Thánh Thể và Lời Chúa', 'Eucharist and the Word')}</h2>${P('Hội Thánh sống nhờ hai bàn tiệc: Lời Chúa và Mình Máu Chúa Kitô. Trang web này giúp bạn đọc và hiểu Lời Chúa bằng hai thứ tiếng, học hỏi giáo lý, và đồng hành với các dịp lễ trong năm phụng vụ.', 'The Church lives from two tables: the Word of God and the Body and Blood of Christ. This site helps you read and understand the Word in two languages, learn the faith and walk with the feasts of the liturgical year.')}</div></section>`;
  }

  /* ---- KINH THÁNH ---- */
  const DEU = ['Tob', 'Jdt', 'Wis', 'Sir', 'Bar', '1Macc', '2Macc'];
  const OWN = { Dan: [3, 4, 13, 14], Esth: [10, 11, 12, 13, 14, 15, 16] };
  const isOwn = (id, ch) => DEU.includes(id) || (OWN[id] || []).includes(ch);
  let hl = null; /* câu cần nhấn mạnh sau khi nhảy tham chiếu */
  function bibleIndex() {
    const sec = t => `<div class="bk-grid">${BOOKS.filter(b => b.t === t).map(b => `<a class="bk${DEU.includes(b.id) ? ' deu' : ''}" href="#bible-${b.id}" style="text-decoration:none;color:inherit">${esc(b.vi)}<small>${esc(b.en)}${DEU.includes(b.id) ? ' *' : ''}</small></a>`).join('')}</div>`;
    return `<div class="page-title">${ART.bible('')}<div><h1>${H('Kinh Thánh', 'The Holy Bible')}</h1>${P('Toàn văn 73 sách: tiếng Anh (Douay-Rheims) và tiếng Việt (bản 1925).', 'Full text of 73 books: English (Douay-Rheims) and Vietnamese (1925 version).')}</div></div>
    <form id="jump" class="reader-bar"><input type="text" id="jumpIn" placeholder="${L('Tìm theo địa chỉ, ví dụ: Gioan 3:16 hoặc John 3:16', 'Go to a reference, e.g. John 3:16')}" aria-label="Địa chỉ Kinh Thánh"><button class="btn" type="submit">${L('Đi', 'Go')}</button></form><div id="jumpMsg" class="note" hidden></div>${(() => { const l = store.get('last', ''); const m = l.match(/^(.+)-(\d+)$/); return m && bk(m[1]) ? `<p><a class="btn alt" href="#bible-${l}" style="text-decoration:none;display:inline-block">${L('Tiếp tục đọc: ', 'Continue: ')}${esc(bname(m[1]))} ${m[2]}</a></p>` : ''; })()}
    <div class="note">${L('Sách đánh dấu * (nét đứt) là các sách Đệ nhị kinh điển của Kinh Thánh Công giáo. Vì bản tiếng Việt chuẩn (Nhóm Phiên Dịch các Giáo Phận Việt Nam) còn trong phạm vi bản quyền nên không thể sao chép, tiếng Việt của các sách này là bản tự dịch của trang từ Douay-Rheims, chưa phải bản chuẩn của Giáo hội. Bản Việt 1925 là bản Tin Lành, nên một số tên riêng khác với bản Công giáo.', 'Books marked * (dashed) are the deuterocanonical books of the Catholic Bible. The standard Vietnamese Catholic text is still under copyright and cannot be copied, so the Vietnamese for these books is this site’s own translation from the Douay-Rheims, not the Church’s standard version. The 1925 Vietnamese text is a Protestant version, so some proper names differ from Catholic usage.')}</div>
    <h3>${H('Cựu Ước (46 sách)', 'Old Testament (46 books)')}</h3>${sec('OT')}<h3>${H('Tân Ước (27 sách)', 'New Testament (27 books)')}</h3>${sec('NT')}`;
  }
  function parseJump(s) {
    const m = s.trim().match(/^(.+?)[\s]+(\d+)(?:\s*[:,.\s]\s*(\d+))?$/); if (!m) return null;
    const key = norm(m[1]); const b = BOOKS.find(x => norm(x.id) === key || norm(x.en) === key || norm(x.vi) === key) || BOOKS.find(x => norm(x.en).startsWith(key) || norm(x.vi).startsWith(key));
    return b ? { id: b.id, ch: +m[2], v: m[3] ? +m[3] : null } : null;
  }
  function bookPage(id) {
    const b = bk(id), intro = INTRO[id];
    return `<p><a href="#bible">← ${L('Tất cả các sách', 'All books')}</a></p><h2>${H(b.vi, b.en)}</h2>
    ${intro ? `<div class="intro">${P(intro[0], intro[1])}</div>` : ''}
    ${!b.vi_ok ? `<div class="note">${L('Sách Đệ nhị kinh điển: hiện chỉ có tiếng Anh.', 'Deuterocanonical book: English text only for now.')}</div>` : ''}
    <h3>${L('Chọn chương', 'Choose a chapter')}</h3><div class="ch-grid">${Array.from({ length: b.n }, (_, i) => `<button type="button" data-go="${id}-${i + 1}">${i + 1}</button>`).join('')}</div>`;
  }
  function verseRows(en, vi, mode, ps) {
    const rows = []; const n = Math.max(en.length, vi.length);
    const inR = k => ps.some(p => (p[2] > 1 || p[3] < n) && k >= p[2] && k <= p[3]);
    for (let k = 1; k <= n; k++) {
      const e = en[k - 1], v = vi[k - 1];
      let body = '';
      if (mode === 'both') body = ben ? (e ? `<span class="en">${esc(e)}</span>` : '') + (v ? `<span class="vi">${esc(v)}</span>` : '') : (v ? `<span class="vi">${esc(v)}</span>` : '') + (e ? `<span class="en">${esc(e)}</span>` : '');
      else if (mode === 'vi') body = `<span class="vi">${esc(v || '')}</span>`;
      else body = `<span class="en" style="font-style:normal;color:inherit">${esc(e || '')}</span>`;
      rows.push(`<div class="vrow${(inR(k) || hl === k) ? ' hl' : ''}" id="v-${mode}-${k}"><span class="vnum">${k}</span><div class="vtext">${body}</div></div>`);
      ps.filter(p => p[3] === k).forEach(p => rows.push(comm(p)));
    }
    return rows.join('');
  }
  function comm(p) {
    const vs = p[2] === p[3] || p[3] >= 99 ? '' : ` · ${p[2]}-${p[3]}`;
    const notes = (p[8] || []).map(n => { const a = lang !== 'en' ? `<div class="vi"><b>${L('Câu', 'v.')} ${n[0]}:</b> ${esc(n[1])}</div>` : '', c = lang !== 'vi' ? `<div class="en"><b>v. ${n[0]}:</b> ${esc(n[2])}</div>` : ''; return `<div class="vnote">${ben ? c + a : a + c}</div>`; }).join('');
    return `<details class="comm"><summary>${L('Giải thích', 'Commentary')}: ${lang === 'both' ? (ben ? esc(p[5]) + ' / ' + esc(p[4]) : esc(p[4]) + ' / ' + esc(p[5])) : esc(lang === 'en' ? p[5] : p[4])}${esc(vs)}</summary><div class="body">${P(p[6], p[7])}${notes}</div></details>`;
  }
  async function chapterPage(id, chap) {
    const b = bk(id); const d = await loadBook(id);
    if (chap < 1 || chap > d.c.length) return bookPage(id);
    const c = d.c[chap - 1];
    const ps = PASS.filter(p => p[0] === id && p[1] === chap).map(p => p.slice()).map(p => { if (p[3] > Math.max(c.en.length, c.vi.length)) p[3] = Math.max(c.en.length, c.vi.length); return p; });
    const hasVi = c.vi.length > 0, aligned = hasVi && c.en.length === c.vi.length;
    store.set('last', id + '-' + chap);
    let body = '';
    if (lang === 'en' || (!hasVi && lang !== 'en')) {
      body = (!hasVi && lang !== 'en' ? `<div class="note">${L('Chương này chưa có bản tiếng Việt thuộc phạm vi công cộng; hiển thị tiếng Anh.', 'No public-domain Vietnamese text for this chapter; showing English.')}</div>` : '') + verseRows(c.en, [], 'en', ps);
    } else if (lang === 'vi') body = verseRows([], c.vi, 'vi', ps);
    else if (aligned) body = verseRows(c.en, c.vi, 'both', ps);
    else body = `<div class="note">${L('Hai bản đánh số câu khác nhau ở chương này nên được hiển thị riêng.', 'The two texts number verses differently in this chapter, so they are shown separately.')}</div>${ben ? `<div class="col-title">English</div>${verseRows(c.en, [], 'en', [])}<div class="col-title">Tiếng Việt</div>${verseRows([], c.vi, 'vi', [])}` : `<div class="col-title">Tiếng Việt</div>${verseRows([], c.vi, 'vi', [])}<div class="col-title">English</div>${verseRows(c.en, [], 'en', [])}`}${ps.map(comm).join('')}`;
    const prev = chap > 1 ? `${id}-${chap - 1}` : (() => { const i = BOOKS.findIndex(x => x.id === id); return i > 0 ? `${BOOKS[i - 1].id}-${BOOKS[i - 1].n}` : null; })();
    const next = chap < d.c.length ? `${id}-${chap + 1}` : (() => { const i = BOOKS.findIndex(x => x.id === id); return i < BOOKS.length - 1 ? `${BOOKS[i + 1].id}-1` : null; })();
    const intro = chap === 1 && INTRO[id] ? `<div class="intro">${P(INTRO[id][0], INTRO[id][1])}</div>` : '';
    const opts = BOOKS.map(x => `<option value="${x.id}"${x.id === id ? ' selected' : ''}>${esc(bname(x.id))}</option>`).join('');
    const chopts = d.c.map((_, i) => `<option value="${i + 1}"${i + 1 === chap ? ' selected' : ''}>${L('Chương', 'Chapter')} ${i + 1}</option>`).join('');
    return `<p><a href="#bible">← ${L('Tất cả các sách', 'All books')}</a> · <a href="#bible-${id}">${esc(bname(id))}</a></p>
    <div class="reader-bar"><select id="selBook" aria-label="Sách">${opts}</select><select id="selCh" aria-label="Chương">${chopts}</select></div>
    <div class="reader"><h2>${H(b.vi + ' ' + chap, b.en + ' ' + chap)}</h2>${chap === 1 ? '' : ''}${intro}${body}</div>
    <div class="pager"><button class="btn alt" type="button" data-go="${prev || ''}" ${prev ? '' : 'disabled'}>← ${L('Trước', 'Previous')}</button><button class="btn" type="button" data-go="${next || ''}" ${next ? '' : 'disabled'}>${L('Sau', 'Next')} →</button></div>
    ${isOwn(id, chap) ? `<div class="note">${L('Tiếng Việt của chương này là <b>bản tự dịch của trang</b> từ Douay-Rheims, không phải bản chuẩn của Giáo hội. Xin đối chiếu với bản chuẩn tại <a href="https://www.vatican.va/archive/ENG0839/_INDEX.HTM" target="_blank" rel="noopener">Vatican</a> hoặc <a href="https://hdgmvietnam.com/chi-tiet/kinh-thanh-tron-bo-1" target="_blank" rel="noopener">hdgmvietnam.com</a>.', 'The Vietnamese for this chapter is <b>this site’s own translation</b> from the Douay-Rheims, not the Church’s standard version. Please compare with the standard text at <a href="https://www.vatican.va/archive/ENG0839/_INDEX.HTM" target="_blank" rel="noopener">the Vatican</a> or <a href="https://hdgmvietnam.com/chi-tiet/kinh-thanh-tron-bo-1" target="_blank" rel="noopener">hdgmvietnam.com</a>.')}</div>` : ''}
    <div class="srcnote">${L('Tiếng Anh: Douay-Rheims 1899. Tiếng Việt: bản 1925. Các ô “Giải thích” là phần chú giải của trang này.', 'English: Douay-Rheims 1899. Vietnamese: 1925 version. “Commentary” boxes are this site’s own notes.')}</div>`;
  }

  /* ---- LỊCH ---- */
  let calYear = new Date().getFullYear(), calMonth = new Date().getMonth() + 1, calType = 'all', calDay = null;
  function evCard(x, open) {
    const e = x.e, d = x.d, cn = COLN[e[4]] || COLN.white, tn = TYPEN[e[3]] || ['', ''];
    return `<div class="ev" id="ev-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${esc(e[0])}"><div class="date"><b>${d.getUTCDate()}</b><i>${esc(WD[d.getUTCDay()])}</i></div>
    <details${open ? ' open' : ''}><summary>${H(e[1], e[2], '')}<div style="margin-top:4px"><span class="tag">${esc(e[5])}</span> <span class="tag">${L(tn[0], tn[1])}</span> <span class="tag"><span class="col c-${e[4]}"></span>${L('Màu ' + cn[0].toLowerCase(), cn[1])}</span></div></summary>
    <div class="hist">${P(e[7], e[8])}<b>${L('Bài đọc Kinh Thánh', 'Scripture readings')}</b>${refs(e[6])}</div></details></div>`;
  }
  function monthGrid(y, m, evs) {
    const first = UTC(y, m, 1).getUTCDay(), dim = new Date(Date.UTC(y, m, 0)).getUTCDate(); const t = now();
    const mapD = {}; evs.forEach(x => { if (x.d.getUTCMonth() + 1 === m) (mapD[x.d.getUTCDate()] = mapD[x.d.getUTCDate()] || []).push(x); });
    let cells = ''; for (let i = 0; i < first; i++) cells += '<td></td>';
    for (let d = 1; d <= dim; d++) {
      const es = mapD[d] || [], isT = +UTC(y, m, d) === +t;
      cells += `<td><button type="button" data-day="${d}" aria-label="${d}/${m}${es.length ? ': ' + es.length : ''}" style="width:100%;min-height:46px;border:1px solid ${calDay === d ? '#8f1d2c' : '#e9e1cf'};background:${isT ? '#f6ecd0' : '#fff'};border-radius:8px;padding:2px"><b style="font-size:.9rem">${d}</b><div style="display:flex;gap:2px;justify-content:center;flex-wrap:wrap">${es.slice(0, 3).map(x => `<span class="col c-${x.e[4]}" style="margin:0"></span>`).join('')}</div></button></td>`;
      if ((first + d) % 7 === 0 && d < dim) cells += '</tr><tr>';
    }
    return `<table style="width:100%;border-collapse:separate;border-spacing:3px;table-layout:fixed;text-align:center"><thead><tr>${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(w => `<th style="font-size:.78rem;color:#6a6572">${w}</th>`).join('')}</tr></thead><tbody><tr>${cells}</tr></tbody></table>`;
  }
  function calendarPage() {
    const evs = yearEvents(calYear), E = easter(calYear), ash = addD(E, -46);
    const f = evs.filter(x => calType === 'all' || x.e[3] === calType);
    const MN = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    let list = '';
    for (let m = 1; m <= 12; m++) {
      const a = f.filter(x => x.d.getUTCMonth() + 1 === m); if (!a.length) continue;
      list += `<section class="month" id="m-${m}"><h3>${MN[m - 1]} ${calYear}</h3>${a.map(x => evCard(x)).join('')}</section>`;
    }
    const dayEv = calDay ? evs.filter(x => x.d.getUTCMonth() + 1 === calMonth && x.d.getUTCDate() === calDay) : [];
    return `<div class="page-title">${ART.chiro('')}<div><h1>${H('Lịch Công giáo', 'Catholic Calendar')}</h1>${P('Các mùa phụng vụ, lễ trọng, lễ kính và ngày nhớ các thánh trong năm, kèm bài đọc Kinh Thánh và lịch sử ra đời của từng dịp.', 'Liturgical seasons, solemnities, feasts and memorials of the year, with Scripture readings and the history behind each occasion.')}</div></div>
    <div class="cal-head"><label for="yr"><b>${L('Năm', 'Year')}</b></label><button class="btn alt" type="button" id="yPrev" aria-label="Năm trước">←</button><input type="number" id="yr" min="1583" max="2999" value="${calYear}"><button class="btn alt" type="button" id="yNext" aria-label="Năm sau">→</button></div>
    <div class="note">${L('Năm ' + calYear + ': Thứ Tư Lễ Tro ' + ash.getUTCDate() + '/' + (ash.getUTCMonth() + 1) + ', Chúa nhật Phục Sinh ' + E.getUTCDate() + '/' + (E.getUTCMonth() + 1) + ', Mùa Vọng bắt đầu ' + advent1(calYear).getUTCDate() + '/' + (advent1(calYear).getUTCMonth() + 1) + '.', calYear + ': Ash Wednesday ' + ash.getUTCDate() + '/' + (ash.getUTCMonth() + 1) + ', Easter ' + E.getUTCDate() + '/' + (E.getUTCMonth() + 1) + ', Advent begins ' + advent1(calYear).getUTCDate() + '/' + (advent1(calYear).getUTCMonth() + 1) + '.')}</div>
    <h2>${H('Xem theo tháng', 'Month view')}</h2>
    <div class="cal-head"><button class="btn alt" type="button" id="mPrev" aria-label="Tháng trước">←</button><b>${MN[calMonth - 1]} ${calYear}</b><button class="btn alt" type="button" id="mNext" aria-label="Tháng sau">→</button></div>
    ${monthGrid(calYear, calMonth, evs)}
    <div style="margin-top:8px">${calDay ? (dayEv.length ? dayEv.map(x => evCard(x, true)).join('') : `<p class="note">${L('Ngày ' + calDay + ' không có lễ đặc biệt trong danh sách này (Mùa: ' + SEASONS[seasonIdx(UTC(calYear, calMonth, calDay))].vi + ').', 'No special feast on the ' + calDay + 'th in this list (Season: ' + SEASONS[seasonIdx(UTC(calYear, calMonth, calDay))].en + ').')}</p>`) : `<p class="en">${L('Chạm vào một ngày để xem lễ trong ngày.', 'Tap a day to see its celebrations.')}</p>`}</div>
    ${ART.divider()}
    <h2>${H('Các mùa phụng vụ', 'Liturgical seasons')}</h2><div class="seasons">${SEASONS.map(s => `<div class="season" style="border-left-color:${{ violet: '#6b3fa0', white: '#d4a72c', green: '#2f8a46', red: '#c0222f' }[s.col]}"><h3 style="margin:0">${H(s.vi, s.en)}</h3>${P(s.vv, s.ee)}<details><summary class="en" style="cursor:pointer">${L('Lịch sử', 'History')}</summary>${P(s.hv, s.he)}</details></div>`).join('')}</div>
    ${ART.divider()}
    <h2>${H('Các ngày lễ trong năm', 'Feasts through the year')}</h2>
    <div class="chips" role="group" aria-label="Lọc">${[['all', 'Tất cả', 'All'], ...Object.entries(TYPEN).map(([k, v]) => [k, v[0], v[1]])].map(c => `<button type="button" class="chip" data-type="${c[0]}" aria-pressed="${calType === c[0]}">${L(c[1], c[2])}</button>`).join('')}</div>
    ${list}`;
  }

  /* ---- ĐỊNH NGHĨA ---- */
  function defsPage(q) {
    return `<div class="page-title">${ART.fish('')}<div><h1>${H('Định nghĩa', 'Definitions')}</h1>${P('Giải thích các thuật ngữ thường gặp trong Kinh Thánh và đời sống đức tin.', 'Plain explanations of terms found in Scripture and the life of faith.')}</div></div>
    <input type="search" id="dq" placeholder="${L('Tìm thuật ngữ…', 'Search terms…')}" value="${esc(q || '')}" aria-label="Tìm thuật ngữ"><div id="dlist">${defsList(q)}</div>`;
  }
  function defsList(q) {
    const items = DEFS.slice().sort((a, b) => a[0].localeCompare(b[0], 'vi'));
    const f = q ? items.filter(d => norm(d[0] + d[1] + d[2] + d[3]).includes(norm(q))) : items;
    return `<p class="en">${f.length} / ${items.length}</p>${f.map(d => `<details class="acc"><summary>${H(d[0], d[1], ' style="margin-left:6px"')}</summary><div class="body">${P(d[2], d[3])}${refs(d[4])}</div></details>`).join('') || `<p>${L('Không có kết quả.', 'No results.')}</p>`}`;
  }

  /* ---- GIÁO LÝ (mở rộng) ---- */
  let ctab = 'memo';
  function catPage(q) {
    const T = [['memo', 'Học thuộc', 'Memorize'], ['qa', 'Hỏi đáp & Hôn nhân', 'Q&A & Marriage'], ['outline', 'Tóm lược CCC', 'CCC outline']];
    return `<div class="page-title">${ART.dove('')}<div><h1>${H('Giáo lý Công giáo', 'Catholic Catechism')}</h1>${P('Các bài giáo lý căn bản người Công giáo thường học thuộc (Tin Kính, Mười Điều Răn, Bảy Bí tích…), phần hỏi đáp giáo lý hôn nhân, và tóm lược theo Sách Giáo Lý Hội Thánh Công Giáo (CCC).', 'The basic catechism lists Catholics memorize (Creed, Ten Commandments, Seven Sacraments…), Q&A including marriage teaching, and an outline of the Catechism of the Catholic Church (CCC).')}</div></div>
    <div class="chips">${T.map(t => `<button class="chip" type="button" data-ctab="${t[0]}" aria-pressed="${ctab === t[0]}">${L(t[1], t[2])}</button>`).join('')}</div>
    <div class="note">${L('Đây là bản tóm lược do trang biên soạn; văn bản đọc thuộc theo cách diễn đạt phổ biến ở Việt Nam. Toàn văn Sách Giáo Lý có bản quyền của Tòa Thánh nên không đăng lại ở đây; bản tiếng Anh chính thức đọc tại ', 'This is a summary written for this site; memorized wording follows common usage. The full Catechism is copyrighted by the Holy See and is not reproduced here; read the official English text at ')}<a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM">vatican.va</a>.</div>
    <input type="search" id="cq" placeholder="${L('Tìm trong giáo lý…', 'Search the catechism…')}" value="${esc(q || '')}" aria-label="Tìm trong giáo lý">
    <div id="clist">${catList(q)}</div>`;
  }
  function catList(q) {
    const hit = a => !q || norm(a.join(' ')).includes(norm(q));
    if (ctab === 'memo') {
      return CATLISTS.filter(x => !q || norm(JSON.stringify(x)).includes(norm(q))).map((x, k) => `<details class="acc"${q ? ' open' : ''}><summary>${H(x[0], x[1], ' style="margin-left:6px"')}<span class="tag" style="margin-left:auto">${esc(x[2])}</span></summary><div class="body"><ol class="memo">${x[3].map(l => `<li>${I(l[0], l[1])}</li>`).join('')}</ol></div></details>`).join('') || `<p>${L('Không có kết quả.', 'No results.')}</p>`;
    }
    if (ctab === 'qa') {
      return CATQA.map(g => { const its = g.items.filter(i => hit(i)); if (!its.length) return ''; return `<h2 style="margin-top:22px">${H(g.vi, g.en)}</h2>${its.map(i => `<details class="acc"${q ? ' open' : ''}><summary>${H(i[0], i[1], ' style="margin-left:6px"')}</summary><div class="body">${P(i[2], i[3])}</div></details>`).join('')}`; }).join('') || `<p>${L('Không có kết quả.', 'No results.')}</p>`;
    }
    return CAT.map(part => { const its = part.items.filter(i => hit(i)); if (!its.length) return ''; return `<h2 style="margin-top:22px">${H(part.vi, part.en)}</h2>${its.map(i => `<details class="acc"${q ? ' open' : ''}><summary>${H(i[0], i[1], ' style="margin-left:6px"')}<span class="tag" style="margin-left:auto">${esc(i[2])}</span></summary><div class="body">${P(i[3], i[4])}</div></details>`).join('')}`; }).join('') || `<p>${L('Không có kết quả.', 'No results.')}</p>`;
  }


  /* ---- DANH NHÂN ---- */
  let pCat = 'all';
  function peoplePage(q) {
    return `<div class="page-title">${ART.heart('')}<div><h1>${H('Danh nhân Công giáo', 'Saints & People of the Church')}</h1>${P('Đức Mẹ, thánh Giuse, các tông đồ, giáo hoàng, các thánh và các vị tử đạo, trong đó có các thánh Việt Nam.', 'Mary, Joseph, the apostles, popes, saints and martyrs, including the Vietnamese saints.')}</div></div>
    <div class="chips">${PEOPLE_CATS.map(c => `<button type="button" class="chip" data-cat="${c[0]}" aria-pressed="${pCat === c[0]}">${L(c[1], c[2])}</button>`).join('')}</div>
    <input type="search" id="pq" placeholder="${L('Tìm theo tên…', 'Search by name…')}" value="${esc(q || '')}" aria-label="Tìm danh nhân"><div id="plist">${peopleList(q)}</div>`;
  }
  function peopleList(q) {
    const f = PEOPLE.filter(p => (pCat === 'all' || p[0] === pCat) && (!q || norm(p.join(' ')).includes(norm(q))));
    const feat = pCat === 'all' && !q ? `<div class="feature">${ART.jesus('')}<div><h2>${H('Chúa Giêsu Kitô', 'Jesus Christ')}</h2>${P('Con Thiên Chúa làm người, sinh bởi Đức Trinh Nữ Maria tại Bêlem, rao giảng Nước Trời, chịu chết trên thập giá và sống lại ngày thứ ba. Ngài là trung tâm của Kinh Thánh và của mọi đời sống Kitô hữu. Thánh Tâm Chúa tượng trưng cho tình yêu thương xót của Ngài.', 'The Son of God made man, born of the Virgin Mary at Bethlehem, who proclaimed the kingdom, died on the cross and rose on the third day. He is the centre of Scripture and of all Christian life. His Sacred Heart symbolises his merciful love.')}${refs(['John.1.14', 'Luke.2.1-20', 'John.19.17-30', 'Matt.28.1-10'])}</div></div>
    <div class="feature">${ART.mary('')}<div><h2>${H('Đức Mẹ Maria', 'The Virgin Mary')}</h2>${P('Mẹ Thiên Chúa và là Mẹ của chúng ta. Hội Thánh tôn kính Mẹ qua các lễ Vô Nhiễm, Truyền Tin, Lên Trời và Kinh Mân Côi. Mẹ luôn dẫn chúng ta đến với Chúa Giêsu: “Hãy làm mọi điều Người bảo anh em.”', 'Mother of God and our mother. The Church honours her in the feasts of the Immaculate Conception, Annunciation and Assumption and in the Rosary. She always leads us to Jesus: “Do whatever he tells you.”')}${refs(['Luke.1.26-38', 'John.2.1-12', 'John.19.25-27'])}</div></div>` : '';
    return `${feat}<p class="en">${f.length} ${L('nhân vật', 'entries')}</p>
    <div class="people">${f.map(p => `<article class="person">${ART.avatar(p[0], '')}<div><h3>${H(p[1], p[2], '')}</h3><div class="meta">${esc(p[3])}${p[3] && p[4] ? ' · ' : ''}${p[4] ? L('Lễ: ', 'Feast: ') + esc(p[4]) : ''}</div>${P(p[5], p[6])}</div></article>`).join('')}</div>`;
  }

  /* ---- SÁCH KINH ---- */
  let ptab = 'pray', rmys = null;
  const PR = k => PRAYERS.find(p => p[1].startsWith(k));
  const prayBody = p => BI(p[2], p[3], 'pray').replace(/\n/g, '<br>');
  function prayersPage() {
    const T = [['pray', 'Kinh thường dùng', 'Common prayers'], ['rosary', 'Kinh Mân Côi', 'Rosary'], ['way', 'Đàng Thánh Giá', 'Stations of the Cross'], ['books', 'Sách nổi tiếng', 'Famous books']];
    let body = '';
    if (ptab === 'pray') {
      body = `<div class="note">${L('Bản đọc phổ biến; một số chữ có thể khác nhau chút ít giữa các giáo phận.', 'Common wording; small differences exist between dioceses and translations.')}</div>` + PRAYERS.map(p => `<details class="acc"><summary>${H(p[0], p[1], ' style="margin-left:6px"')}</summary><div class="body">${prayBody(p)}</div></details>`).join('')
        + `<details class="acc"><summary>${H(LITANY.vi, LITANY.en, ' style="margin-left:6px"')}</summary><div class="body">${P(LITANY.intro[0], LITANY.intro[1])}<ol class="memo">${LITANY.lines.map(l => `<li>${I(l[0], l[1])}</li>`).join('')}</ol></div></details>`;
    } else if (ptab === 'rosary') {
      const wd = new Date().getDay(); const today = { 1: 0, 6: 0, 4: 1, 2: 2, 5: 2, 3: 3, 0: 3 }[wd];
      if (rmys === null) rmys = today;
      const steps = rosarySteps(rmys);
      body = `<div class="feature">${ART.rosary('')}<div><h2>${H('Trình tự lần hạt Mân Côi', 'Order of the Rosary')}</h2>${P('Chọn bộ mầu nhiệm, rồi nhấn vào tên từng kinh để mở cửa sổ đọc; đọc xong nhấn nút để sang kinh kế tiếp. Hoặc nhấn “Bắt đầu” để đi lần lượt từ đầu.', 'Choose the set of mysteries, then click any prayer to open it in a reading window; when finished press the button to continue to the next. Or press “Start” to go through from the beginning.')}</div></div>
      <div class="chips">${MYST.map((m, i) => `<button class="chip" type="button" data-rmys="${i}" aria-pressed="${rmys === i}">${esc(ENP ? m.en : m.vi)}${i === today ? ' ★' : ''}</button>`).join('')}</div>
      <p class="note">${esc(MYST[rmys].days)} · ★ ${L('gợi ý hôm nay', 'suggested today')}</p>
      <p><button class="btn" type="button" data-rstart="0">${L('Bắt đầu lần hạt', 'Start the Rosary')}</button></p>
      <ol class="seq">${steps.map((s, i) => `<li><button type="button" class="seqbtn" data-rstart="${i}"><span class="n">${i + 1}</span><span>${stepTitle(s)}</span></button></li>`).join('')}</ol>`;
    } else if (ptab === 'way') body = `<div class="feature">${ART.cross('')}<div><h2>${H('Đàng Thánh Giá', 'Stations of the Cross')}</h2>${P('Mười bốn chặng suy niệm cuộc khổ nạn của Chúa Giêsu, thường cầu nguyện trong Mùa Chay và mỗi thứ Sáu. Mỗi chặng có thể mở đầu bằng: “Chúng con thờ lạy Chúa và chúc tụng Chúa, vì Chúa đã dùng Thánh Giá mà cứu chuộc thế gian.”', 'Fourteen stations meditating on Jesus’ Passion, often prayed in Lent and on Fridays. Each may begin: “We adore you, O Christ, and we bless you, because by your holy cross you have redeemed the world.”')}</div></div><ol>${STATIONS.map(s => `<li style="margin:8px 0">${I(s[0], s[1])}</li>`).join('')}</ol>`;
    else body = `<div class="note">${L('Sách thuộc phạm vi công cộng được đưa vào đọc ngay trong trang (nút “Đọc ngay”); các sách khác có liên kết tới nơi đọc toàn văn miễn phí. Nhiều sách còn lại có bản quyền hoặc chưa tìm được bản miễn phí đáng tin nên chỉ có phần giới thiệu.', 'Public-domain books can be read right here (“Read here”); others link to a free full text. Remaining books are in copyright or have no reliable free edition, so only a description is given.')}</div>` + BOOKS_LIST().map(b => {
      const lk = (BOOKLINKS[b[1]] || []).map(l => l[2].startsWith('lib:') ? `<a class="btn sm" href="#library-${l[2].slice(4)}">${L(l[0], l[1])}</a>` : `<a class="btn sm alt" href="${l[2]}" target="_blank" rel="noopener">${L(l[0], l[1])} ↗</a>`).join(' ');
      return `<div class="book-item"><b>${H(b[0], b[1])}</b><span class="meta" style="font-size:.82rem;color:var(--muted)">${esc(ENP ? b[3] : b[2])}</span>${P(b[4], b[5])}${lk ? `<div class="links">${lk}</div>` : ''}</div>`;
    }).join('');
    return `<div class="page-title">${ART.rosary('')}<div><h1>${H('Sách kinh', 'Prayers & Books')}</h1>${P('Các kinh nguyện thông dụng, Kinh Mân Côi, Đàng Thánh Giá và những sách kinh, sách thiêng liêng nổi tiếng của Công giáo.', 'Common prayers, the Rosary, the Stations of the Cross and famous Catholic prayer and spiritual books.')}</div></div>
    <div class="chips">${T.map(t => `<button class="chip" type="button" data-ptab="${t[0]}" aria-pressed="${ptab === t[0]}">${L(t[1], t[2])}</button>`).join('')}</div>${body}`;
  }
  const BOOKS_LIST = () => window.BOOKS;

  /* ---- Cửa sổ lần hạt ---- */
  function rosarySteps(m) {
    const s = [{ k: 'sign' }, { k: 'creed' }, { k: 'our', first: 1 }, { k: 'hail', n: 3 }, { k: 'glory' }];
    for (let d = 0; d < 5; d++) s.push({ k: 'myst', d, m }, { k: 'our' }, { k: 'hail', n: 10, d }, { k: 'glory' }, { k: 'fatima' });
    s.push({ k: 'salve' }, { k: 'litany' }, { k: 'closing' }, { k: 'sign', end: 1 });
    return s;
  }
  const ORD = ['nhất', 'nhì', 'ba', 'bốn', 'năm'];
  function stepTitle(s) {
    const E = ['first', 'second', 'third', 'fourth', 'fifth'];
    if (s.k === 'sign') return H(s.end ? 'Dấu Thánh Giá (kết thúc)' : 'Dấu Thánh Giá', s.end ? 'Sign of the Cross (closing)' : 'Sign of the Cross');
    if (s.k === 'creed') return H('Kinh Tin Kính', 'The Creed');
    if (s.k === 'our') return H('Kinh Lạy Cha', 'Our Father');
    if (s.k === 'hail') return H(`Kinh Kính Mừng × ${s.n}`, `Hail Mary × ${s.n}`);
    if (s.k === 'glory') return H('Kinh Sáng Danh', 'Glory Be');
    if (s.k === 'myst') { const M = MYST[s.m]; return H(`Sự thứ ${ORD[s.d]}: ${M.items[s.d][0]}`, `The ${E[s.d]} mystery: ${M.items[s.d][1]}`); }
    if (s.k === 'fatima') return H('Kinh Fatima', 'Fatima Prayer');
    if (s.k === 'salve') return H('Kinh Nữ Vương (Salve Regina)', 'Hail, Holy Queen');
    if (s.k === 'litany') return H('Kinh Cầu Đức Bà (tùy chọn)', 'Litany of Loreto (optional)');
    return H('Lời nguyện kết thúc', 'Closing prayer');
  }
  let mdl = null;
  function openRosary(i) { mdl = { steps: rosarySteps(rmys), i: +i, c: 0 }; renderModal(); }
  function closeModal() { const e = $('#mdl'); if (e) e.remove(); mdl = null; document.body.classList.remove('modal-open'); }
  async function renderModal() {
    if (!mdl) return;
    const s = mdl.steps[mdl.i]; const last = mdl.i === mdl.steps.length - 1;
    let el = $('#mdl'); if (!el) { el = document.createElement('div'); el.id = 'mdl'; el.className = 'mdl'; document.body.appendChild(el); document.body.classList.add('modal-open'); }
    let content = '', nextLabel = L('Đọc xong · tiếp tục →', 'Done · continue →');
    const text = k => { const p = PR(k); return p ? prayBody(p) : ''; };
    if (s.k === 'sign') content = text('Sign of the Cross');
    else if (s.k === 'creed') content = text('The Apostles');
    else if (s.k === 'our') content = text('Our Father') + (s.first ? `<p class="hint">${L('Nên dâng lời nguyện này theo ý riêng.', 'You may offer this prayer for your own intentions.')}</p>` : '');
    else if (s.k === 'glory') content = text('Glory Be');
    else if (s.k === 'fatima') content = text('Fatima');
    else if (s.k === 'salve') content = text('Hail, Holy');
    else if (s.k === 'closing') content = text('Closing Prayer');
    else if (s.k === 'litany') content = `${P(LITANY.intro[0], LITANY.intro[1])}<ol class="memo">${LITANY.lines.map(l => `<li>${I(l[0], l[1])}</li>`).join('')}</ol>`;
    else if (s.k === 'hail') {
      const dots = Array.from({ length: s.n }, (_, i) => `<i class="${i < mdl.c ? 'on' : ''}"></i>`).join('');
      content = `<div class="beads" aria-label="${mdl.c}/${s.n}">${dots}</div>` + text('Hail Mary') + `<p class="hint">${L('Kinh Kính Mừng', 'Hail Mary')} ${Math.min(mdl.c + 1, s.n)}/${s.n}</p>`;
      if (mdl.c < s.n - 1) nextLabel = L(`Đã đọc · kinh thứ ${mdl.c + 2} →`, `Done · prayer ${mdl.c + 2} →`);
      if (s.d !== undefined && mdl.c === 0) { /* nhắc mầu nhiệm */ content = `<p class="hint">${I(MYST[rmys].items[s.d][0], MYST[rmys].items[s.d][1])}</p>` + content; }
    } else if (s.k === 'myst') {
      const it = MYST[s.m].items[s.d]; const r = it[2].split('.'); const id = r[0], ch = +r[1], vs = (r[2] || '1').split('-'); const a = +vs[0], z = +(vs[1] || vs[0]);
      content = `<h3>${H(it[0], it[1])}</h3><div class="scrip" id="mscr">…</div><p>${refLink(it[2])}</p><p class="hint">${L('Suy niệm một lát, rồi đọc kinh Lạy Cha, 10 kinh Kính Mừng và kinh Sáng Danh.', 'Pause to meditate, then pray the Our Father, ten Hail Marys and the Glory Be.')}</p>`;
      loadBook(id).then(d => { const c = d.c[ch - 1], t = $('#mscr'); if (!c || !t) return; let h = ''; for (let k = a; k <= Math.min(z, 12 + a); k++) { const vi = c.vi[k - 1], en = c.en[k - 1]; if (!vi && !en) continue; h += `<div class="mv"><sup>${k}</sup> ${BI(vi || '', en || '')}</div>`; } t.innerHTML = h || ''; }).catch(() => { });
    }
    el.innerHTML = `<div class="mdl-card" role="dialog" aria-modal="true" aria-label="Kinh Mân Côi"><div class="mdl-top"><span class="tag">${L('Bước', 'Step')} ${mdl.i + 1}/${mdl.steps.length}</span><button type="button" class="x" id="mx" aria-label="${L('Đóng', 'Close')}">✕</button></div>
      <div class="mdl-bar"><i style="width:${((mdl.i + 1) / mdl.steps.length) * 100}%"></i></div>
      <h2>${stepTitle(s)}</h2><div class="mdl-body">${s.k === 'myst' || s.k === 'hail' || s.k === 'litany' ? '' : ''}${content}</div>
      <div class="mdl-act"><button type="button" class="btn alt" id="mprev"${mdl.i === 0 && mdl.c === 0 ? ' disabled' : ''}>← ${L('Trước', 'Back')}</button><button type="button" class="btn" id="mnext">${last ? L('Hoàn tất ✓', 'Finish ✓') : nextLabel}</button></div></div>`;
    $('#mx').onclick = closeModal;
    $('#mprev').onclick = () => { if (s.k === 'hail' && mdl.c > 0) mdl.c--; else { mdl.i = Math.max(0, mdl.i - 1); mdl.c = 0; } renderModal(); };
    $('#mnext').onclick = () => { if (s.k === 'hail' && mdl.c < s.n - 1) { mdl.c++; renderModal(); return; } if (last) { closeModal(); return; } mdl.i++; mdl.c = 0; renderModal(); };
    $('#mnext').focus(); const card = el.querySelector('.mdl-card'); if (card) card.scrollTop = 0;
  }
  document.addEventListener('keydown', e => { if (!mdl) return; if (e.key === 'Escape') closeModal(); else if (e.key === 'ArrowRight') $('#mnext').click(); else if (e.key === 'ArrowLeft' && !$('#mprev').disabled) $('#mprev').click(); });

  /* ---- Thư viện sách đọc trong trang ---- */
  const libCache = {};
  async function libPage(id, part) {
    if (!libCache[id]) { const r = await fetch('data/lib/' + id + '.json'); if (!r.ok) throw new Error('lib'); libCache[id] = await r.json(); }
    const d = libCache[id];
    const head = `<p><a href="#prayers">← ${L('Sách kinh', 'Prayers & Books')}</a></p><h1>${H(d.vi, d.en)}</h1><p class="meta" style="color:var(--muted)">${esc(d.au)} · ${esc(d.tr)}</p>`;
    if (!(part >= 1 && part <= d.parts.length)) return head + `<div class="note">${L('Bản tiếng Anh thuộc phạm vi công cộng; chưa có bản dịch tiếng Việt thuộc phạm vi công cộng nên chỉ hiển thị tiếng Anh. Chọn một phần để đọc.', 'Public-domain English text; no public-domain Vietnamese translation is available, so only English is shown. Choose a part to read.')}</div><ol class="toc">${d.parts.map((p, i) => `<li><a href="#library-${id}-${i + 1}">${esc(p.t)}</a></li>`).join('')}</ol>`;
    const p = d.parts[part - 1];
    const nav = `<div class="mdl-act">${part > 1 ? `<a class="btn alt" href="#library-${id}-${part - 1}">← ${L('Trước', 'Previous')}</a>` : '<span></span>'}<a class="btn alt" href="#library-${id}">${L('Mục lục', 'Contents')}</a>${part < d.parts.length ? `<a class="btn" href="#library-${id}-${part + 1}">${L('Tiếp', 'Next')} →</a>` : '<span></span>'}</div>`;
    return head + `<h2 class="en" style="font-style:normal">${esc(p.t)}</h2>${nav}<div class="reader">${p.ps.map(x => `<p>${esc(x)}</p>`).join('')}</div>${nav}`;
  }

  /* ---- BÀI GIẢNG KINH THÁNH ---- */
  const NTIDS = () => BOOKS.filter(b => b.t === 'NT');
  const homNote = () => `<div class="note">${L('Bài giảng do trang biên soạn, dựa trên Kinh Thánh và truyền thống Hội Thánh, nhằm giúp suy niệm; không thay thế huấn quyền hay bài giảng của linh mục. Mỗi chương trong 27 sách Tân Ước đều có bài giảng riêng theo chủ đề của chương; một số chương có thêm từ khóa nguyên ngữ.', 'Homilies are written for this site from Scripture and Church tradition as aids to meditation; they do not replace the Church’s teaching or a priest’s homily. Every chapter of all 27 New Testament books has its own homily on that chapter’s themes; some include original-language keywords.')}</div>`;
  const HX = window.HOMX = window.HOMX || {};
  const getHom = k => { if (HOMC[k]) return HOMC[k]; const x = HX[k]; return x ? { t: [x[0], x[1]], b: [x[2], x[3]], a: [x[4], x[5]], w: x[6] ? [x[6]] : [] } : null; };
  const homCount = id => new Set(Object.keys(HOMC).concat(Object.keys(HX)).filter(k => k.startsWith(id + '.'))).size;
  function homIndex() {
    return `<div class="page-title">${ART.dove('')}<div><h1>${H('Bài giảng Kinh Thánh', 'Bible Homilies')}</h1>${P('Giải thích ý nghĩa sâu xa của từng lời, từng đoạn Kinh Thánh theo lối bài giảng. Trước mắt là Tân Ước.', 'Homily-style reflections on the deeper meaning of each word and passage of Scripture. For now: the New Testament.')}</div></div>${homNote()}
    <div class="grid2">${NTIDS().map(b => { const h = HOMB.find(x => x[0] === b.id), n = homCount(b.id); return `<a class="card hb" href="#homily-${b.id}"><b>${H(b.vi, b.en)}</b><span class="tag">${b.n} ${L('chương', 'ch.')}${n ? ' · ' + n + ' ' + L('bài giảng chương', 'chapter homilies') : ''}</span>${h ? `<small>${esc(ENP ? h[2] : h[1])}</small>` : ''}</a>`; }).join('')}</div>`;
  }
  function homBook(id) {
    const b = bk(id), h = HOMB.find(x => x[0] === id); if (!b || !h) return homIndex();
    const ch = Array.from({ length: b.n }, (_, i) => { const k = id + '.' + (i + 1), has = !!getHom(k), pc = PASS.some(p => p[0] === id && p[1] === i + 1); return `<a class="chbtn${has ? ' has' : pc ? ' pc' : ''}" href="#homily-${id}-${i + 1}" title="${has ? L('Có bài giảng', 'Homily available') : pc ? L('Có giải thích đoạn', 'Passage commentary') : ''}">${i + 1}</a>`; }).join('');
    return `<p><a href="#homily">← ${L('Tất cả các sách', 'All books')}</a></p><h1>${H(b.vi, b.en)}</h1>${homNote()}
    <h2>${L('Tổng quan', 'Overview')}</h2><h3>${L('Chủ đề', 'Theme')}</h3>${P(h[1], h[2])}<h3>${L('Ý nghĩa sâu xa', 'Deeper meaning')}</h3>${P(h[3], h[4])}<h3>${L('Sống Lời Chúa', 'Living the Word')}</h3>${P(h[5], h[6])}
    <h2 style="margin-top:22px">${L('Chọn chương', 'Choose a chapter')}</h2><p class="legend"><span class="chbtn has">●</span> ${L('bài giảng chương', 'chapter homily')} <span class="chbtn pc">●</span> ${L('giải thích đoạn', 'passage commentary')}</p><div class="ch-grid">${ch}</div>
    <p><a class="btn alt" href="#bible-${id}">${L('Đọc sách này trong Kinh Thánh', 'Read this book in the Bible')}</a></p>`;
  }
  async function homChapter(id, chap) {
    const b = bk(id); if (!b || chap < 1 || chap > b.n) return homBook(id);
    const d = await loadBook(id); const c = d.c[chap - 1]; const k = id + '.' + chap, h = getHom(k);
    const nav = `<div class="mdl-act">${chap > 1 ? `<a class="btn alt" href="#homily-${id}-${chap - 1}">← ${L('Chương trước', 'Previous')}</a>` : '<span></span>'}<a class="btn alt" href="#homily-${id}">${L('Mục lục', 'Contents')}</a>${chap < b.n ? `<a class="btn" href="#homily-${id}-${chap + 1}">${L('Chương sau', 'Next')} →</a>` : '<span></span>'}</div>`;
    let body = '';
    if (h) {
      body = `<h2>${H(h.t[0], h.t[1])}</h2><div class="homily">${P(h.b[0], h.b[1])}</div>
      ${h.w.length ? `<h3>${L('Từ khóa và ý nghĩa', 'Key words and their meaning')}</h3>` : ''}${h.w.map(w => `<div class="kw"><b>${esc(w[0])}</b> <i>${esc(w[1])}</i>${P(w[2], w[3])}</div>`).join('')}
      <h3>${L('Sống Lời Chúa', 'Living the Word')}</h3><div class="apply">${P(h.a[0], h.a[1])}</div>`;
    } else {
      const ps = PASS.filter(p => p[0] === id && p[1] === chap);
      body = `<div class="note">${L('Bài giảng riêng cho chương này đang được biên soạn.', 'A dedicated homily for this chapter is in preparation.')}${ps.length ? ' ' + L('Trong lúc chờ, đây là phần giải thích các đoạn đã có:', 'Meanwhile, here are the passage commentaries already written:') : ''}</div>${ps.map(comm).join('')}`;
    }
    const vs = c ? (lang === 'en' ? verseRows(c.en, [], 'en', []) : lang === 'vi' || (c.vi.length && c.en.length !== c.vi.length) ? (c.vi.length ? verseRows([], c.vi, 'vi', []) : verseRows(c.en, [], 'en', [])) : verseRows(c.en, c.vi, 'both', [])) : '';
    return `<p><a href="#homily">← ${L('Bài giảng', 'Homilies')}</a> · <a href="#homily-${id}">${esc(bname(id))}</a></p><h1>${H(b.vi, b.en)} ${chap}</h1>${nav}${body}
    <details class="acc" style="margin-top:18px"><summary>${L('Đọc nguyên văn chương này', 'Read the text of this chapter')}</summary><div class="body">${vs}</div></details>${nav}`;
  }

  /* ---- THÁNH LỄ ---- */
  const roleHtml = r => `<span class="role r-${r}">${esc(ENP ? MASS_ROLES[r][1] : MASS_ROLES[r][0])}</span>`;
  const stepHtml = st => `<div class="mstep m-${st[0]}">${roleHtml(st[0])}<div class="mtxt">${BI(st[1], st[2])}</div></div>`;
  function massPage() {
    return `<div class="page-title">${ART.cross('')}<div><h1>${H('Thánh lễ', 'The Mass')}</h1>${P('Trình tự đầy đủ một thánh lễ Công giáo: lời chủ tế, lời đáp của cộng đoàn, người đọc, và các chỉ dẫn cử chỉ.', 'The full order of a Catholic Mass: the priest’s words, the people’s responses, the readers, and rubrics for gestures.')}</div></div>
    <div class="note">${L(MASS_NOTE[0], MASS_NOTE[1])}</div>
    <div class="legend2">${['P', 'C', 'R', 'A'].map(r => roleHtml(r)).join(' ')}</div>
    <div class="chips">${MASS.map((m, i) => `<button class="chip" type="button" data-mjump="${i}">${esc(ENP ? m.en : m.vi)}</button>`).join('')}<button class="chip" type="button" data-mjump="p">${L('Tin Lành', 'Protestant')}</button></div>
    ${MASS.concat([PROT]).map((m, i) => `<section class="msec" id="msec-${i === MASS.length ? 'p' : i}"><h2>${H(m.vi, m.en)}</h2>${P(m.intro[0], m.intro[1])}${m.steps.map(stepHtml).join('')}</section>`).join('')}`;
  }

  /* ---- KIỂM TRA ---- */
  const LV = { e: ['Dễ', 'Easy', 'Những câu chuyện Kinh Thánh quen thuộc.', 'Well-known Bible stories.'], m: ['Trung bình', 'Medium', 'Nhân vật, địa danh và giáo huấn.', 'People, places and teaching.'], h: ['Khó', 'Hard', 'Chi tiết ít người biết và lịch sử Hội Thánh.', 'Lesser-known details and Church history.'] };
  let qz = null;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function quizStart(l) {
    const pool = shuffle(QUIZ.filter(x => l === 'all' || x.l === l)).slice(0, 10).map(x => { const idx = shuffle(x.o.map((_, i) => i)); return Object.assign({}, x, { o: idx.map(i => x.o[i]), a: idx.indexOf(x.a) }); });
    qz = { l, qs: pool, i: 0, score: 0, picked: null };
  }
  function optLabel(o) { return lang === 'both' ? (o[0] === o[1] ? esc(o[0]) : ben ? `${esc(o[1])}<span class="sub">${esc(o[0])}</span>` : `${esc(o[0])}<span class="sub">${esc(o[1])}</span>`) : esc(lang === 'en' ? o[1] : o[0]); }
  function quizPage() {
    const head = `<div class="page-title">${ART.lamb('')}<div><h1>${H('Kiểm tra Kinh Thánh', 'Bible Quiz')}</h1>${P('Mỗi đề có 10 câu trắc nghiệm. Chọn mức độ để bắt đầu.', 'Each quiz has 10 multiple-choice questions. Pick a level to begin.')}</div></div>`;
    if (!qz) {
      const best = l => store.get('best-' + l, '');
      return head + `<div class="lvl">${['e', 'm', 'h'].map(l => `<div class="card"><b>${ENP ? LV[l][1] : LV[l][0]}</b>${P(LV[l][2], LV[l][3])}<p class="en">${QUIZ.filter(x => x.l === l).length} ${L('câu trong ngân hàng', 'questions available')}${best(l) ? ' · ' + L('Điểm cao nhất', 'Best') + ': ' + best(l) + '/10' : ''}</p><button class="btn" type="button" data-start="${l}">${L('Bắt đầu', 'Start')}</button></div>`).join('')}</div><p><button class="btn alt" type="button" data-start="all">${L('Đề hỗn hợp (10 câu mọi mức)', 'Mixed quiz (10 questions, all levels)')}</button></p>`;
    }
    if (qz.i >= qz.qs.length) {
      const key = 'best-' + qz.l; if (+store.get(key, 0) < qz.score) store.set(key, String(qz.score));
      const msg = qz.score >= 9 ? ['Xuất sắc! Bạn nắm Kinh Thánh rất vững.', 'Excellent! You know your Bible very well.'] : qz.score >= 6 ? ['Khá tốt! Hãy đọc lại các đoạn đã sai để nhớ lâu.', 'Good job! Review the passages you missed.'] : ['Hãy tiếp tục đọc Lời Chúa và thử lại nhé.', 'Keep reading the Word and try again.'];
      return head + `<div class="quiz-box"><h2>${qz.score}/${qz.qs.length}</h2>${P(msg[0], msg[1])}<button class="btn" type="button" data-start="${qz.l}">${L('Làm đề mới', 'New quiz')}</button> <button class="btn alt" type="button" data-start="">${L('Chọn mức khác', 'Change level')}</button></div>`;
    }
    const q = qz.qs[qz.i], done = qz.picked !== null;
    return head + `<div class="quiz-box"><div class="bar" role="progressbar" aria-valuenow="${qz.i}" aria-valuemax="${qz.qs.length}"><i style="width:${(qz.i / qz.qs.length) * 100}%"></i></div><span class="tag">${L('Câu', 'Question')} ${qz.i + 1}/${qz.qs.length} · ${ENP ? LV[q.l][1] : LV[q.l][0]}</span>
    <div class="qtext">${BI(q.q[0], q.q[1])}</div>
    ${q.o.map((o, i) => `<button type="button" class="opt${done ? (i === q.a ? ' ok' : i === qz.picked ? ' bad' : '') : ''}" data-opt="${i}" ${done ? 'disabled' : ''}>${optLabel(o)}</button>`).join('')}
    ${done ? `<div class="expl"><b>${qz.picked === q.a ? L('Chính xác!', 'Correct!') : L('Chưa đúng.', 'Not quite.')}</b> ${P(q.x[0], q.x[1])}${q.ref ? refs([q.ref]) : ''}</div><p><button class="btn" type="button" id="qNext">${qz.i + 1 >= qz.qs.length ? L('Xem kết quả', 'See result') : L('Câu tiếp', 'Next')}</button></p>` : ''}</div>`;
  }

  /* ---- Định tuyến ---- */
  async function route(keep) {
    await loadBooks();
    const h = (location.hash || '#home').slice(1); const parts = h.split('-'); const view = parts[0] || 'home';
    closeModal(); drawTabs(TABS.some(t => t[0] === view) ? view : (view === 'library' ? 'prayers' : 'home'));
    let html = '', after = null;
    try {
      if (view === 'bible') {
        if (parts[1]) {
          const ch = parseInt(parts[2], 10);
          hl = parts[3] ? parseInt(parts[3], 10) : null;
          html = ch ? await chapterPage(parts[1], ch) : bookPage(parts[1]);
          after = () => { if (hl) { const el = document.getElementById('v-' + (lang === 'both' && false ? 'both' : (document.getElementById('v-both-' + hl) ? 'both' : lang === 'en' ? 'en' : 'vi')) + '-' + hl); if (el) el.scrollIntoView({ block: 'center' }); } else if (!keep) window.scrollTo(0, 0); };
        } else { html = bibleIndex(); after = () => { if (!keep) window.scrollTo(0, 0); }; }
      } else if (view === 'calendar') html = calendarPage();
      else if (view === 'definitions') html = defsPage('');
      else if (view === 'catechism') html = catPage('');
      else if (view === 'people') html = peoplePage('');
      else if (view === 'prayers') html = prayersPage();
      else if (view === 'mass') html = massPage();
      else if (view === 'homily') html = parts[1] ? (parts[2] ? await homChapter(parts[1], parseInt(parts[2], 10)) : homBook(parts[1])) : homIndex();
      else if (view === 'library') html = await libPage(parts[1], parseInt(parts[2], 10));
      else if (view === 'quiz') html = quizPage();
      else html = await home();
    } catch (e) { html = `<div class="note">${L('Không tải được nội dung. Vui lòng thử lại.', 'Could not load the content. Please try again.')}</div>`; }
    app.innerHTML = html; bind(view);
    if (after) after(); else if (!keep) window.scrollTo(0, 0);
  }
  function go(x) { if (x) location.hash = 'bible-' + x; }
  function bind(view) {
    $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
    if (view === 'bible') {
      const f = $('#jump'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const r = parseJump($('#jumpIn').value); const m = $('#jumpMsg'); if (!r) { m.hidden = false; m.textContent = L('Không hiểu địa chỉ này. Ví dụ: Gioan 3:16, John 3:16, Ps 23.', 'Could not read that reference. Try: John 3:16 or Ps 23.'); return; } location.hash = 'bible-' + r.id + '-' + r.ch + (r.v ? '-' + r.v : ''); });
      const sb = $('#selBook'); if (sb) { sb.addEventListener('change', () => go(sb.value + '-1')); $('#selCh').addEventListener('change', e => go(sb.value + '-' + e.target.value)); }
    }
    if (view === 'calendar') {
      const set = () => route(true);
      $('#yr').addEventListener('change', e => { const v = +e.target.value; if (v >= 1583 && v <= 2999) { calYear = v; calDay = null; set(); } });
      $('#yPrev').addEventListener('click', () => { calYear--; calDay = null; set(); }); $('#yNext').addEventListener('click', () => { calYear++; calDay = null; set(); });
      $('#mPrev').addEventListener('click', () => { calMonth--; if (calMonth < 1) { calMonth = 12; calYear--; } calDay = null; set(); });
      $('#mNext').addEventListener('click', () => { calMonth++; if (calMonth > 12) { calMonth = 1; calYear++; } calDay = null; set(); });
      $$('[data-day]').forEach(b => b.addEventListener('click', () => { calDay = +b.dataset.day; set(); }));
      $$('[data-type]').forEach(b => b.addEventListener('click', () => { calType = b.dataset.type; set(); }));
    }
    if (view === 'definitions') $('#dq').addEventListener('input', e => { $('#dlist').innerHTML = defsList(e.target.value); });
    if (view === 'catechism') { $('#cq').addEventListener('input', e => { $('#clist').innerHTML = catList(e.target.value); }); $$('[data-ctab]').forEach(b => b.addEventListener('click', () => { ctab = b.dataset.ctab; route(true); })); }
    if (view === 'people') {
      $('#pq').addEventListener('input', e => { $('#plist').innerHTML = peopleList(e.target.value); });
      $$('[data-cat]').forEach(b => b.addEventListener('click', () => { pCat = b.dataset.cat; route(true); }));
    }
    if (view === 'mass') $$('[data-mjump]').forEach(b => b.addEventListener('click', () => { const e = document.getElementById('msec-' + b.dataset.mjump); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    if (view === 'prayers') {
      $$('[data-ptab]').forEach(b => b.addEventListener('click', () => { ptab = b.dataset.ptab; route(true); }));
      $$('[data-rmys]').forEach(b => b.addEventListener('click', () => { rmys = +b.dataset.rmys; route(true); }));
      $$('[data-rstart]').forEach(b => b.addEventListener('click', () => openRosary(b.dataset.rstart)));
    }
    if (view === 'quiz') {
      $$('[data-start]').forEach(b => b.addEventListener('click', () => { if (b.dataset.start) quizStart(b.dataset.start); else qz = null; route(true); window.scrollTo(0, 0); }));
      $$('[data-opt]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.opt; qz.picked = i; if (i === qz.qs[qz.i].a) qz.score++; route(true); }));
      const n = $('#qNext'); if (n) n.addEventListener('click', () => { qz.i++; qz.picked = null; route(true); window.scrollTo(0, 0); });
    }
  }
  window.addEventListener('hashchange', () => { route(false); });
  route(false);
})();
