import{C as e,D as t,Q as n,S as r,T as i,V as a,_ as o,_t as s,b as c,m as l,v as u,vt as d,xt as f,y as p,yt as m,z as h}from"./modules/shiki-D6KYKeN5.js";import{Tt as g,ot as _,st as v}from"./index-DYB7Yb2-.js";import{t as y}from"./default-M7UO4J2S.js";var b={class:`jw`,role:`img`,"aria-label":`یک JWT با سه بخش header و payload و signature که با نقطه جدا شده‌اند، و محتوای رمزگشایی‌شدهٔ هر بخش`},x={class:`jw-tok`},S={key:0},C={class:`jw-cols`},w={class:`jw-name`},T={dir:`rtl`},E=g(i({__name:`JwtParts`,setup(e){let{$slidev:t,$nav:n,$clicksContext:r,$clicks:i,$page:s,$renderContext:u,$frontmatter:m}=v(),g=[{cls:`h`,raw:`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`,name:`header`,body:`{
  "alg": "HS256",
  "typ": "JWT"
}`,note:`الگوریتم امضا`},{cls:`p`,raw:`eyJzdWIiOiI0MDEyMzQ1NjciLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc5MjQ2NzAwMCwiZXhwIjoxNzkyNDY3OTAwfQ`,name:`payload`,body:`{
  "sub": "401234567",
  "role": "student",
  "iat": 1792467000,
  "exp": 1792467900
}`,note:`ادعاها؛ exp یعنی ۱۵ دقیقه عمر`},{cls:`s`,raw:`j3n6IS2NIA4p2tRsvxD1_F1yjiIhn1sd-OQdq0VcCBs`,name:`signature`,body:`HMAC-SHA256(
  header + "." + payload,
  server key
)`,note:`فقط دارندهٔ کلید می‌سازد`}];return(e,t)=>(h(),c(`div`,b,[o(`p`,x,[(h(),c(l,null,a(g,(e,t)=>(h(),c(l,{key:e.cls},[o(`span`,{class:d(e.cls)},f(e.raw),3),t<2?(h(),c(`b`,S,`.`)):p(`v-if`,!0)],64))),64))]),o(`div`,C,[(h(),c(l,null,a(g,e=>o(`div`,{key:e.cls,class:d([`jw-col`,e.cls])},[o(`div`,w,f(e.name),1),o(`pre`,null,f(e.body),1),o(`small`,T,f(e.note),1)],2)),64))])]))}}),[[`__scopeId`,`data-v-2e316354`]]),D={__name:`03-state-identity.md__slidev_45`,setup(i){let{$slidev:a,$nav:c,$clicksContext:l,$clicks:d,$page:f,$renderContext:p,$frontmatter:g}=v();return l.setup(),(i,a)=>{let c=E;return h(),u(y,m(t(s(_)(s(g),44))),{punch:n(e=>[...a[0]||=[o(`p`,null,`JWT خواناست اما تغییرناپذیر؛ راز را در payload نگذارید.`,-1)]]),default:n(()=>[a[1]||=o(`h1`,null,`مرور: درون یک JWT چیست؟`,-1),e(c),a[2]||=o(`ul`,null,[o(`li`,null,[r(`هر بخش `),o(`span`,{class:`mark`},`Base64url`),r(` است، نه رمز؛ امضا فقط جلوی تغییر را می‌گیرد. جزئیات در فصل بعد`)])],-1)]),_:1},16)}}};export{D as default};