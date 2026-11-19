import{C as e,D as t,Q as n,S as r,_ as i,_t as a,v as o,yt as s,z as c}from"./modules/shiki-D6KYKeN5.js";import{ot as l,st as u}from"./index-DCl6X_g9.js";import{t as d}from"./slidev/CodeBlockWrapper-BIirvPSp.js";import{t as f}from"./default-BUu6DSEO.js";var p={dir:`ltr`,style:{"--slidev-code-font-size":`13px`,"--slidev-code-line-height":`1.35`}},m={__name:`07-machine-clients.md__slidev_38`,setup(m){let{$slidev:h,$nav:g,$clicksContext:_,$clicks:v,$page:y,$renderContext:b,$frontmatter:x}=u();return _.setup(),(u,m)=>{let h=d;return c(),o(f,s(t(a(l)(a(x),37))),{punch:n(e=>[...m[1]||=[i(`p`,null,`پاسخ ابزار برای مدل نوشته می‌شود، نه برای نمایش به انسان: متن ساده یا JSON، بدون چیدمان.`,-1)]]),default:n(()=>[m[2]||=i(`h1`,null,[r(`خروجی واقعی: سرور MCP به `),i(`code`,null,`tools/call`),r(` چه پاسخی می‌دهد؟`)],-1),i(`div`,p,[e(h,{title:``,ranges:[]},{default:n(()=>[...m[0]||=[i(`pre`,{class:`shiki shiki-themes vitesse-dark vitesse-light slidev-code`,style:{"--shiki-dark":`#dbd7caee`,"--shiki-light":`#393a34`,"--shiki-dark-bg":`#121212`,"--shiki-light-bg":`#ffffff`}},[i(`code`,{class:`language-text`},[i(`span`,{class:`line`},[i(`span`,null,`$ curl -si localhost:8017/mcp -H "Content-Type: application/json" \\`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`    -H "Accept: application/json, text/event-stream" \\`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`    -H "MCP-Protocol-Version: 2026-07-28" \\`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`    -H "Mcp-Method: tools/call" -H "Mcp-Name: search_books" -d @call.json`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`HTTP/1.1 200 OK`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`Content-Type: application/json`)]),r(`
`),i(`span`,{class:`line`},[i(`span`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`{"jsonrpc":"2.0","id":2,"result":{"resultType":"complete",`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`  "content":[{"type":"text","text":"[{\\"id\\":\\"b1\\",`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`    \\"title\\":\\"Computer Networking: A Top-Down Approach\\",`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`    \\"author\\":\\"Kurose, Ross\\",\\"price\\":2850000,\\"stock\\":4}]"}],`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`  "isError":false}}`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`$ curl -si localhost:8017/mcp -H "Mcp-Method: tools/list" -d @list.json`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`HTTP/1.1 400 Bad Request`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`{"jsonrpc":"2.0","id":1,"error":{"code":-32020,"message":"HeaderMismatch:`)]),r(`
`),i(`span`,{class:`line`},[i(`span`,null,`  MCP-Protocol-Version header and _meta protocolVersion are required"}}`)])])],-1)]]),_:1})])]),_:1},16)}}};export{m as default};