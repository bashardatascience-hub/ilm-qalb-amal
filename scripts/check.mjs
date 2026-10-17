import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const {base,pages}=JSON.parse(await fs.readFile(path.join(root,'build-info.json'),'utf8'));
const errors=[];
let count=0;
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){await walk(file);continue;}if(!file.endsWith('.html'))continue;count++;const html=await fs.readFile(file,'utf8');if(!html.includes('<html lang='))errors.push(`Missing language: ${file}`);if(!html.includes('<title>'))errors.push(`Missing title: ${file}`);if(html.includes('[Verified Arabic text]')||html.includes('example.com/replace'))errors.push(`Editorial template leaked: ${file}`);for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const value=match[1].replace(/&amp;/g,'&');if(/^(https?:|mailto:|data:|#)/.test(value))continue;const raw=value.split(/[?#]/)[0];if(!raw)continue;if(base&&!raw.startsWith(`${base}/`)){errors.push(`Wrong project base path: ${value} in ${file}`);continue;}const relative=raw.startsWith('/')?raw.slice(base.length+1):path.relative(root,path.resolve(path.dirname(file),raw));let target=path.resolve(root,relative);if(!target.startsWith(root+path.sep)&&target!==root){errors.push(`Escaping link: ${value}`);continue;}try{const stat=await fs.stat(target);if(stat.isDirectory())await fs.access(path.join(target,'index.html'));}catch{errors.push(`Broken link: ${value} in ${path.relative(root,file)}`);}}}}
await walk(root);
const index=JSON.parse(await fs.readFile(path.join(root,'search-index.json'),'utf8'));
if(index.length!==pages)errors.push('Search index does not match page count');
for(const l of ['bn','en']){if(!index.some(p=>p.l===l&&p.kind==='lesson'))errors.push(`Missing ${l} lesson`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Verified ${count} HTML files: local links, assets, project paths, language metadata, draft exclusion and search index.`);
