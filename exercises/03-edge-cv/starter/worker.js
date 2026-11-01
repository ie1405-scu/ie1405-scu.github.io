// تمرین ۳: رزومهٔ شما روی لبه.
// این فایل همین حالا یک صفحه نشان می‌دهد، ولی به هر درخواستی، با هر متد و هر مسیر، همان صفحه را می‌دهد.
// کار شما: متن رزومه، و جدول مسیرها و headerهای صورت تمرین.

const ME = {
  name: 'نام شما',
  studentId: '000000000',
  title: 'دانشجوی مهندسی کامپیوتر، دانشگاه شهید چمران اهواز',
  skills: ['HTTP'],
}

const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ME.name}</title></head>
<body>
<h1>${ME.name}</h1>
<p>${ME.title} · شمارهٔ دانشجویی ${ME.studentId}</p>
<h2>مهارت‌ها</h2><ul>${ME.skills.map(s => `<li>${s}</li>`).join('')}</ul>
</body></html>`

export default {
  async fetch(request) {
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  },
}
