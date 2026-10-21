const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const allowed = new Set(['/index.html','/robots.txt','/sitemap.xml','/style.css','/game.js','/assets/arvid-lindblad.webp','/assets/f1-logo.png','/assets/f1-red.svg']);
http.createServer((req,res)=>{
 const pathname = new URL(req.url,'http://localhost').pathname;
 const file = pathname === '/' ? '/index.html' : pathname;
 if (!allowed.has(file)) { res.writeHead(404); return res.end('Not found'); }
 fs.readFile(path.join(root,file),(err,data)=>{
  if(err){res.writeHead(500);return res.end('Unable to load file');}
  res.setHeader('Content-Type',file.endsWith('.xml')?'application/xml':file.endsWith('.txt')?'text/plain':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':'text/html');
  res.end(data);
 });
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Grid Merge listening on port '+(process.env.PORT||3000)));
