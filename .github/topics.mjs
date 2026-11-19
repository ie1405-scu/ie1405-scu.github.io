// موضوع‌های ارائه: هر موضوع یک issue با برچسب «ارائه» است و رزرو با یک کامنت انجام می‌شود.
//   push یا اجرای دستی  ← issueهای موضوع‌ها را با .github/topics.json هم‌گام می‌کند (ساختن، به‌روزرسانی، بستن حذف‌شده‌ها)
//   کامنت روی موضوع     ← «رزرو» یا «لغو»؛ مدرس: «رزرو @نام»، و روی پیشنهاد «تأیید» یا «رد»
//   issue پیشنهاد تازه   ← پاسخ «ثبت شد، در انتظار تأیید»
// در پایان همیشه presentations/status.json (برای صفحهٔ ارائه‌ها در سایت) و presentations/README.md ساخته می‌شوند؛
// workflow آن‌ها را روی main commit می‌کند.
// متن issue و کامنت‌ها فقط به‌صورت داده خوانده می‌شوند؛ هیچ بخشی از آن‌ها اجرا نمی‌شود.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const API = process.env.GITHUB_API_URL || 'https://api.github.com'
const repo = process.env.GITHUB_REPOSITORY
const token = process.env.GITHUB_TOKEN
const eventName = process.env.GITHUB_EVENT_NAME || 'workflow_dispatch'
const event = process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH) ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : {}
const conf = existsSync('.github/topics.json') ? JSON.parse(readFileSync('.github/topics.json', 'utf8')) : { sessions: [], topics: [] }
const OUT = process.env.TOPICS_OUT || 'presentations'

const L = { topic: 'ارائه', taken: 'رزرو', proposal: 'پیشنهاد' }
const LABELS = [
  { name: L.topic, color: '0A6C86', description: 'موضوع ارائه' },
  { name: L.taken, color: 'A4561C', description: 'موضوع رزروشده' },
  { name: L.proposal, color: '137333', description: 'پیشنهاد موضوع ارائه، در انتظار تأیید' },
]
const STAFF = ['OWNER', 'MEMBER', 'COLLABORATOR']
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
const en = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── GitHub API ──
async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'content-type': 'application/json', 'user-agent': 'ie-topics' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null; try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (res.status >= 400 && !call.quiet) console.error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`)
  return { status: res.status, data }
}
async function must(method, path, body) {
  const r = await call(method, path, body)
  if (r.status >= 400) throw new Error(`${method} ${path}: ${r.status}`)
  return r.data
}
async function issues(label, state = 'open') {
  const all = []
  for (let page = 1; ; page++) {
    const batch = await must('GET', `/repos/${repo}/issues?labels=${encodeURIComponent(label)}&state=${state}&per_page=100&page=${page}`)
    all.push(...batch.filter(i => !i.pull_request))
    if (batch.length < 100) return all
  }
}
const labelsOf = i => (i.labels || []).map(l => (typeof l === 'string' ? l : l.name))
const hasLabel = (i, name) => labelsOf(i).includes(name)
async function reply(n, text) {
  await call('POST', `/repos/${repo}/issues/${n}/comments`, { body: `<div dir="rtl">\n\n${text}\n\n</div>` })
}
async function ensureLabels() {
  const have = new Set((await must('GET', `/repos/${repo}/labels?per_page=100`)).map(l => l.name))
  for (const l of LABELS) if (!have.has(l.name)) await call('POST', `/repos/${repo}/labels`, l)
}

// ── متن issue ──
// وضعیت رزرو در خود issue و میان دو نشانه نگه داشته می‌شود؛ هم‌گام‌سازی متن موضوع را عوض می‌کند ولی رزرو را نگه می‌دارد.
const STATUS = /<!-- status -->[\s\S]*?<!-- \/status -->/
const topicId = body => String(body || '').match(/<!-- topic:([\w-]+) -->/)?.[1] || null
function holder(body) {
  const m = String(body || '').match(/<!-- by:([A-Za-z0-9-]+) at:([\dTZ:.+-]+) -->/)
  return m ? { login: m[1], at: m[2] } : null
}
function statusBlock(h) {
  const inner = h
    ? `<!-- by:${h.login} at:${h.at} -->\n**وضعیت:** 🔒 رزرو شده برای @${h.login}. اگر منصرف شدید، زیر همین صفحه بنویسید: **لغو**`
    : `**وضعیت:** 🟢 آزاد. برای رزرو، زیر همین صفحه فقط بنویسید: **رزرو**`
  return `<!-- status -->\n${inner}\n<!-- /status -->`
}
function withStatus(body, h) {
  const b = String(body || '')
  if (STATUS.test(b)) return b.replace(STATUS, statusBlock(h))
  // پیشنهادی که تازه تأیید شده: وضعیت به انتهای متن دانشجو اضافه می‌شود
  return `${b.trimEnd()}\n\n---\n\n<div dir="rtl">\n\n${statusBlock(h)}\n\n</div>`
}
const sessionTitle = n => conf.sessions.find(s => s.n === n)?.title
const sessionText = n => (n == null ? 'مرتبط با کتاب درسی، بدون جلسهٔ مشخص' : `پس از جلسهٔ ${fa(n)}${sessionTitle(n) ? `، ${sessionTitle(n)}` : ''}`)
function topicBody(t, h) {
  const src = (t.sources || []).map(([label, url]) => `- [${label}](${url})`).join('\n')
  return `<div dir="rtl">

**سؤال محوری:** ${t.question}

**زمان ارائه:** ${sessionText(t.session)}

${src ? `**منابع برای شروع:**\n\n${src}\n\n` : ''}${statusBlock(h)}

<sub>فهرست همهٔ موضوع‌ها: ${conf.site ? `${conf.site}presentations/` : 'presentations/README.md'}</sub>

</div>

<!-- topic:${t.id} -->`
}
const topicTitle = t => `ارائه: ${t.title}`

// فرم issue هر کادر را زیر یک «### عنوان» می‌گذارد
function field(body, label) {
  const part = String(body || '').split(/^### /m).find(p => p.startsWith(label))
  const v = part ? part.slice(label.length).trim() : ''
  return v === '_No response_' ? '' : v.split(/\n---\n|<!-- status -->/)[0].trim()
}
function proposalData(i) {
  const b = i.body || ''
  const s = en(field(b, 'جلسهٔ مرتبط')).match(/جلسهٔ\s*(\d+)/)
  const sources = [...field(b, 'منابع').matchAll(/https?:\/\/[^\s)<>"]+/g)].map(m => {
    const u = m[0].replace(/[.,،]+$/, '')
    let label = u; try { const x = new URL(u); label = (x.host + x.pathname).replace(/\/$/, '') } catch {}
    return [label.length > 48 ? label.slice(0, 47) + '…' : label, u]
  }).slice(0, 6)
  return {
    title: i.title.replace(/^\s*(پیشنهاد|ارائه)\s*[:：]\s*/, '').trim() || i.title,
    question: (field(b, 'سؤال محوری') || b.match(/\*\*سؤال محوری:\*\*\s*(.+)/)?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 400),
    session: s ? Number(s[1]) : null,
    sources,
    self: /-\s*\[x\]/i.test(field(b, 'ارائه‌دهنده')),
  }
}

// ── فرمان‌ها ──
// کامنت فقط وقتی فرمان است که کوتاه و یک‌خطی باشد؛ گفت‌وگوی عادی زیر موضوع فرمان حساب نمی‌شود.
function command(text) {
  const t = String(text || '').trim()
  if (!t || t.includes('\n') || t.length > 60) return null
  const n = t.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/أ/g, 'ا').replace(/[‌ـ]/g, '').replace(/^\//, '').replace(/[.!؟?،]+$/, '').trim()
  const [w, ...rest] = n.split(/\s+/)
  const word = w.toLowerCase()
  const target = rest.join(' ').replace(/^برای\s+/, '').match(/^@?([A-Za-z0-9-]{1,39})$/)?.[1] || null
  const map = { رزرو: 'reserve', reserve: 'reserve', لغو: 'cancel', انصراف: 'cancel', cancel: 'cancel', تایید: 'approve', approve: 'approve', رد: 'reject', reject: 'reject' }
  return map[word] ? { cmd: map[word], target, extra: rest.length > 0 } : null
}
async function heldBy(login) {
  const open = await issues(L.topic)
  return open.find(i => holder(i.body)?.login.toLowerCase() === login.toLowerCase()) || null
}
async function setHolder(i, h) {
  await must('PATCH', `/repos/${repo}/issues/${i.number}`, { body: withStatus(i.body, h) })
  if (h) {
    await call('POST', `/repos/${repo}/issues/${i.number}/labels`, { labels: [L.taken] })
    // تخصیص فقط برای نمایش در فهرست issueهاست؛ اگر GitHub اجازه ندهد، رزرو همچنان معتبر است
    call.quiet = true; await call('POST', `/repos/${repo}/issues/${i.number}/assignees`, { assignees: [h.login] }); call.quiet = false
  } else {
    call.quiet = true
    await call('DELETE', `/repos/${repo}/issues/${i.number}/labels/${encodeURIComponent(L.taken)}`)
    const old = holder(i.body); if (old) await call('DELETE', `/repos/${repo}/issues/${i.number}/assignees`, { assignees: [old.login] })
    call.quiet = false
  }
}
async function reserve(i, login, forSomeone) {
  const cur = holder(i.body)
  if (cur && cur.login.toLowerCase() === login.toLowerCase()) return reply(i.number, `این موضوع از قبل برای @${login} رزرو شده است.`)
  if (cur) return reply(i.number, `این موضوع پیش‌تر برای @${cur.login} رزرو شده است. موضوع آزاد دیگری را از [فهرست موضوع‌ها](${conf.site || ''}presentations/) انتخاب کنید یا موضوع تازه‌ای پیشنهاد دهید.`)
  const other = await heldBy(login)
  if (other) return reply(i.number, `${forSomeone ? `@${login}` : 'شما'} پیش‌تر موضوع #${other.number} را رزرو کرده‌${forSomeone ? 'است' : 'اید'}. هر نفر فقط یک موضوع دارد؛ ${forSomeone ? 'اول آن رزرو باید لغو شود' : 'اگر این موضوع را می‌خواهید، اول زیر آن موضوع بنویسید «لغو»'}.`)
  await setHolder(i, { login, at: new Date().toISOString() })
  return reply(i.number, `### ✓ رزرو شد\n\nاین موضوع برای @${login} رزرو شد و تا چند دقیقهٔ دیگر در فهرست موضوع‌ها هم «رزرو شده» دیده می‌شود. زمان ارائه را مدرس اعلام می‌کند.`)
}
async function onComment() {
  const { issue, comment } = event
  if (!issue || !comment || comment.user?.type === 'Bot') return
  const c = command(comment.body)
  if (!c) return
  const who = comment.user.login
  const staff = STAFF.includes(comment.author_association)
  const i = await must('GET', `/repos/${repo}/issues/${issue.number}`)
  const isTopic = hasLabel(i, L.topic), isProposal = hasLabel(i, L.proposal)
  if (!isTopic && !isProposal) return
  if (i.state !== 'open') return reply(i.number, 'این موضوع بسته شده است و قابل رزرو نیست.')

  if (c.cmd === 'reserve') {
    if (!isTopic) return reply(i.number, 'این هنوز یک پیشنهاد است. پس از تأیید مدرس می‌شود آن را رزرو کرد.')
    if (c.target && c.target.toLowerCase() !== who.toLowerCase()) {
      if (!staff) return reply(i.number, 'هر کس فقط برای خودش رزرو می‌کند: فقط بنویسید «رزرو».')
      return reserve(i, c.target, true)
    }
    if (c.extra && !c.target) return reply(i.number, 'برای رزرو، فقط واژهٔ **رزرو** را به‌تنهایی در یک کامنت بنویسید.')
    return reserve(i, who, false)
  }
  if (c.cmd === 'cancel') {
    if (c.extra) return reply(i.number, 'برای لغو رزرو، فقط واژهٔ **لغو** را به‌تنهایی در یک کامنت بنویسید.')
    const cur = holder(i.body)
    if (!isTopic || !cur) return reply(i.number, 'این موضوع رزرو نشده است.')
    if (cur.login.toLowerCase() !== who.toLowerCase() && !staff) return reply(i.number, `فقط @${cur.login} یا مدرس می‌تواند این رزرو را لغو کند.`)
    await setHolder(i, null)
    return reply(i.number, `رزرو @${cur.login} لغو شد و این موضوع دوباره آزاد است.`)
  }
  if (c.cmd === 'approve' || c.cmd === 'reject') {
    if (!staff || c.extra) return
    if (!isProposal) return reply(i.number, 'این issue پیشنهاد نیست.')
    if (c.cmd === 'reject') {
      await reply(i.number, 'این پیشنهاد به فهرست اضافه نشد. از پیشنهادتان سپاسگزاریم؛ می‌توانید موضوع دیگری را از فهرست رزرو کنید.')
      return must('PATCH', `/repos/${repo}/issues/${i.number}`, { state: 'closed', state_reason: 'not_planned' })
    }
    const p = proposalData(i)
    const body = `${withStatus(i.body, null)}\n\n<!-- topic:issue-${i.number} -->`
    await must('PATCH', `/repos/${repo}/issues/${i.number}`, { title: `ارائه: ${p.title}`, body })
    await call('POST', `/repos/${repo}/issues/${i.number}/labels`, { labels: [L.topic] })
    call.quiet = true; await call('DELETE', `/repos/${repo}/issues/${i.number}/labels/${encodeURIComponent(L.proposal)}`); call.quiet = false
    const fresh = await must('GET', `/repos/${repo}/issues/${i.number}`)
    const author = i.user.login
    if (p.self && !(await heldBy(author))) {
      await setHolder(fresh, { login: author, at: new Date().toISOString() })
      return reply(i.number, `### ✓ تأیید شد\n\nاین موضوع به فهرست اضافه شد و برای پیشنهاددهنده، @${author}، رزرو شد.`)
    }
    return reply(i.number, `### ✓ تأیید شد\n\nاین موضوع به فهرست اضافه شد و آزاد است. برای رزرو، زیر همین صفحه بنویسید: **رزرو**${p.self ? `\n\n@${author} پیش‌تر موضوع دیگری رزرو کرده است؛ برای این موضوع اول باید آن را لغو کند.` : ''}`)
  }
}
async function onOpened() {
  const i = event.issue
  if (!i || !hasLabel(i, L.proposal) || topicId(i.body)) return
  await reply(i.number, `پیشنهادتان ثبت شد و پس از بررسی مدرس به فهرست اضافه می‌شود. تا آن زمان در بخش «پیشنهادهای در انتظار تأیید» در [صفحهٔ ارائه‌ها](${conf.site || ''}presentations/) دیده می‌شود.`)
}

// ── هم‌گام‌سازی با topics.json ──
async function sync() {
  await ensureLabels()
  if (!conf.topics?.length) return
  const all = await issues(L.topic, 'all')
  const byId = new Map(all.map(i => [topicId(i.body), i]).filter(([id]) => id))
  const ids = new Set()
  for (const t of conf.topics) {
    ids.add(t.id)
    const i = byId.get(t.id)
    const h = i ? holder(i.body) : null
    const title = topicTitle(t), body = topicBody(t, h)
    if (!i) {
      await must('POST', `/repos/${repo}/issues`, { title, body, labels: [L.topic] })
      console.log(`+ ${t.id}`); await sleep(1500)
    } else if (i.title !== title || i.body !== body || i.state !== 'open') {
      await must('PATCH', `/repos/${repo}/issues/${i.number}`, { title, body, state: 'open' })
      console.log(`~ ${t.id} #${i.number}`)
    }
  }
  // موضوعی که از فهرست برداشته شده بسته می‌شود، مگر اینکه کسی آن را رزرو کرده باشد
  for (const [id, i] of byId) {
    if (ids.has(id) || id.startsWith('issue-') || i.state !== 'open') continue
    if (holder(i.body)) { console.log(`! ${id} #${i.number} از فهرست برداشته شده ولی رزرو است؛ باز می‌ماند`); continue }
    await must('PATCH', `/repos/${repo}/issues/${i.number}`, { state: 'closed', state_reason: 'not_planned' })
    console.log(`- ${id} #${i.number}`)
  }
}

// ── وضعیت برای سایت و GitHub ──
async function status() {
  const confById = new Map((conf.topics || []).map(t => [t.id, t]))
  const order = new Map((conf.topics || []).map((t, k) => [t.id, k]))
  const topics = (await issues(L.topic)).map(i => {
    const id = topicId(i.body) || `issue-${i.number}`
    // موضوعی که در topics.json نیست: یا پیشنهاد تأییدشده (issue-N) یا موضوعِ از فهرست برداشته‌شده‌ای که هنوز رزرو است
    const t = confById.get(id) || { ...proposalData(i), proposed: id.startsWith('issue-') }
    const h = holder(i.body)
    return { id, issue: i.number, url: i.html_url, title: t.title, question: t.question, session: t.session ?? null, sources: t.sources || [], proposed: !!t.proposed, by: h?.login || null, at: h?.at || null }
  }).sort((a, b) => (a.session ?? 99) - (b.session ?? 99) || (order.get(a.id) ?? 1e6 + a.issue) - (order.get(b.id) ?? 1e6 + b.issue))
  const proposals = (await issues(L.proposal)).filter(i => !topicId(i.body)).map(i => {
    const p = proposalData(i)
    return { issue: i.number, url: i.html_url, title: p.title, question: p.question, session: p.session, by: i.user.login }
  })
  mkdirSync(OUT, { recursive: true })
  writeFileSync(`${OUT}/status.json`, JSON.stringify({ topics, proposals }, null, 1) + '\n')
  // نسخهٔ خوانا برای خود GitHub
  const groups = new Map()
  for (const t of topics) { const k = t.session ?? 'x'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t) }
  const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const parts = [...groups].map(([k, ts]) => `### ${k === 'x' ? 'مرتبط با کتاب درسی' : `پس از جلسهٔ ${fa(k)}${sessionTitle(k) ? `: ${sessionTitle(k)}` : ''}`}\n\n| موضوع | وضعیت |\n| --- | --- |\n${ts.map(t => `| [${cell(t.title)}](${t.url}) | ${t.by ? `🔒 @${t.by}` : '🟢 آزاد'} |`).join('\n')}`)
  const free = topics.filter(t => !t.by).length
  const newUrl = `https://github.com/${repo}/issues/new?template=topic.yml`
  writeFileSync(`${OUT}/README.md`, `<div dir="rtl">

# موضوع‌های ارائه

${fa(topics.length)} موضوع، ${fa(free)} موضوع آزاد.${conf.site ? ` نسخهٔ کامل با سؤال محوری و منابع: [صفحهٔ ارائه‌ها در سایت درس](${conf.site}presentations/)` : ''}

**رزرو:** صفحهٔ موضوع آزاد را باز کنید و زیر آن فقط بنویسید **رزرو**. ربات تا یک دقیقه پاسخ می‌دهد. برای لغو بنویسید **لغو**.

**موضوع تازه:** [پیشنهاد موضوع](${newUrl})؛ پس از تأیید مدرس به فهرست اضافه می‌شود.

${parts.join('\n\n')}
${proposals.length ? `\n### پیشنهادهای در انتظار تأیید\n\n${proposals.map(p => `- [${cell(p.title)}](${p.url})`).join('\n')}\n` : ''}
</div>
`)
  console.log(`وضعیت: ${topics.length} موضوع، ${free} آزاد، ${proposals.length} پیشنهاد`)
}

if (!repo || !token) { console.error('GITHUB_REPOSITORY و GITHUB_TOKEN لازم‌اند.'); process.exit(1) }
if (eventName === 'push' || eventName === 'workflow_dispatch' || eventName === 'schedule') await sync()
else if (eventName === 'issue_comment') await onComment()
else if (eventName === 'issues' && event.action === 'opened') await onOpened()
await status()
