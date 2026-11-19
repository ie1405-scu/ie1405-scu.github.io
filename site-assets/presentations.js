// صفحهٔ ارائه‌ها: فهرست موضوع‌ها از داده‌ای که site.mjs در صفحه گذاشته، و وضعیت رزرو از status.json مخزن عمومی.
// متن موضوع‌های پیشنهادی را دانشجوها نوشته‌اند؛ هر چیزی که از status.json می‌آید escape می‌شود.
(function () {
  var data = JSON.parse(document.getElementById('topics-data').textContent)
  var $ = function (id) { return document.getElementById(id) }
  var fa = function (n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d] }) }
  var esc = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
  var safeUrl = function (u) { return /^https:\/\//.test(String(u)) ? String(u) : '#' }
  var okLogin = function (l) { return /^[A-Za-z0-9-]{1,39}$/.test(String(l || '')) }
  var sessionTitle = {}
  data.sessions.forEach(function (s) { sessionTitle[s.n] = s.title })
  var state = { session: 'all', free: false, q: '' }
  var topics = data.topics.map(function (t) { return Object.assign({ known: false }, t) })
  var proposals = []

  function groupName(n) { return n == null ? 'مرتبط با کتاب درسی' : 'پس از جلسهٔ ' + fa(n) + (sessionTitle[n] ? ': ' + sessionTitle[n] : '') }
  function norm(s) { return String(s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').toLowerCase() }

  function card(t) {
    var issueUrl = t.url ? safeUrl(t.url) : data.issues + '?q=' + encodeURIComponent('is:open label:ارائه')
    var refs = (t.sources || []).slice(0, 6).map(function (s) {
      return '<li><a href="' + esc(safeUrl(s[1])) + '" dir="ltr" rel="noopener">' + esc(s[0]) + '</a></li>'
    }).join('')
    var badge, foot
    if (!t.known) {
      badge = '<span class="state unknown">وضعیت نامشخص</span>'
      foot = '<a class="btn" href="' + esc(issueUrl) + '">دیدن در GitHub</a>'
    } else if (t.by && okLogin(t.by)) {
      badge = '<span class="state taken">رزرو شده</span>'
      foot = '<span class="who"><img src="https://github.com/' + esc(t.by) + '.png?size=64" alt="" width="28" height="28" loading="lazy"><bdi dir="ltr">@' + esc(t.by) + '</bdi></span>'
        + '<a class="btn" href="' + esc(issueUrl) + '">صفحهٔ موضوع</a>'
    } else {
      badge = '<span class="state free">آزاد</span>'
      foot = '<span class="hint">در GitHub بنویسید: <b>رزرو</b></span><a class="btn primary" href="' + esc(issueUrl) + '">رزرو در GitHub</a>'
    }
    return '<article class="topic' + (t.known && t.by ? ' is-taken' : '') + '">'
      + '<div class="ttop">' + badge + (t.proposed ? '<span class="tag">پیشنهاد دانشجو</span>' : '') + '</div>'
      + '<h4>' + esc(t.title) + '</h4>'
      + (t.question ? '<p class="q">' + esc(t.question) + '</p>' : '')
      + (refs ? '<ul class="refs" aria-label="منابع">' + refs + '</ul>' : '')
      + '<div class="tfoot">' + foot + '</div></article>'
  }

  function visible(t) {
    if (state.session !== 'all' && String(t.session) !== state.session) return false
    if (state.free && (!t.known || t.by)) return false
    if (state.q && norm(t.title + ' ' + t.question).indexOf(norm(state.q)) < 0) return false
    return true
  }

  function render() {
    var groups = [], seen = {}
    topics.filter(visible).forEach(function (t) {
      var k = String(t.session)
      if (!seen[k]) { seen[k] = { n: t.session, items: [] }; groups.push(seen[k]) }
      seen[k].items.push(t)
    })
    groups.sort(function (a, b) { return (a.n == null ? 99 : a.n) - (b.n == null ? 99 : b.n) })
    $('list').innerHTML = groups.map(function (g) {
      return '<section class="tgroup"><h3>' + (g.n == null ? '<span class="gn book" aria-hidden="true">ک</span>' : '<span class="gn" aria-hidden="true">' + fa(g.n) + '</span>') + esc(groupName(g.n)) + '</h3><div class="tgrid">' + g.items.map(card).join('') + '</div></section>'
    }).join('')
    $('none').hidden = groups.length > 0
  }

  function chips() {
    var ns = []
    topics.forEach(function (t) { if (ns.indexOf(t.session) < 0) ns.push(t.session) })
    ns.sort(function (a, b) { return (a == null ? 99 : a) - (b == null ? 99 : b) })
    var all = [['all', 'همه']].concat(ns.map(function (n) { return [String(n), n == null ? 'کتاب درسی' : 'جلسهٔ ' + fa(n)] }))
    $('chips').innerHTML = all.map(function (c) {
      return '<button type="button" class="chip" data-s="' + esc(c[0]) + '" aria-pressed="' + (state.session === c[0]) + '">' + esc(c[1]) + '</button>'
    }).join('')
  }

  function tally() {
    var known = topics.filter(function (t) { return t.known })
    var taken = known.filter(function (t) { return t.by }).length
    $('t-all').textContent = fa(topics.length)
    $('t-free').textContent = known.length ? fa(known.length - taken) : '؟'
    $('t-taken').textContent = known.length ? fa(taken) : '؟'
    $('t-bar').style.width = topics.length ? (100 * taken / topics.length) + '%' : '0'
  }

  function renderProposals() {
    $('proposals').hidden = !proposals.length
    $('props').innerHTML = proposals.map(function (p) {
      return '<li><a href="' + esc(safeUrl(p.url)) + '">' + esc(p.title) + '</a>'
        + (p.session != null ? '<span class="meta">جلسهٔ ' + fa(p.session) + '</span>' : '')
        + (okLogin(p.by) ? '<span class="meta" dir="ltr">@' + esc(p.by) + '</span>' : '') + '</li>'
    }).join('')
  }

  $('chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return
    state.session = b.getAttribute('data-s'); chips(); render()
  })
  $('only-free').addEventListener('change', function (e) { state.free = e.target.checked; render() })
  $('q').addEventListener('input', function (e) { state.q = e.target.value.trim(); render() })

  chips(); render(); tally()

  // وضعیت زنده؛ نشانی تازه در هر بار تا نسخهٔ cacheشده خوانده نشود
  var ctl = typeof AbortController === 'function' ? new AbortController() : null
  var timer = setTimeout(function () { if (ctl) ctl.abort() }, 10000)
  fetch(data.status + '?t=' + Date.now(), ctl ? { signal: ctl.signal } : {})
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json() })
    .then(function (st) {
      clearTimeout(timer)
      var byId = {}
      topics.forEach(function (t) { byId[t.id] = t })
      var ordered = []
      ;(st.topics || []).forEach(function (s) {
        var t = byId[s.id] || { id: s.id, session: s.session, title: s.title, question: s.question, sources: s.sources, proposed: !!s.proposed }
        t.known = true; t.by = s.by || null; t.url = s.url
        ordered.push(t); delete byId[s.id]
      })
      // موضوعی که هنوز issue ندارد (چند دقیقه پس از انتشار) با وضعیت نامشخص می‌ماند
      Object.keys(byId).forEach(function (k) { ordered.push(byId[k]) })
      topics = ordered
      proposals = st.proposals || []
      chips(); render(); tally(); renderProposals()
      var free = topics.filter(function (t) { return t.known && !t.by }).length
      $('live').textContent = fa(free) + ' موضوع آزاد · وضعیت هر چند دقیقه به‌روز می‌شود'
    })
    .catch(function () {
      clearTimeout(timer)
      $('live').innerHTML = 'وضعیت رزروها الان خوانده نشد؛ <a href="' + esc(data.issues) + '?q=' + encodeURIComponent('label:ارائه') + '">در GitHub ببینید</a>'
    })
})()
