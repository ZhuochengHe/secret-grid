(async()=>{
 const params=new URLSearchParams(location.hash.slice(1));
 const kind=params.has('host')?'host':params.has('player')?'player':null;
 const status=document.querySelector('#keyStatus');
 if(!kind){if(status)status.textContent='请使用发信后生成的主持人专用链接打开工具。';return;}
 try{
 const key=params.get('key'),token=params.get(kind);
 if(!key||!token)throw Error();
 const bytes=Uint8Array.from(atob(token.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const hmac=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 for(let i=0;i<bytes.length;i+=32){const stream=new Uint8Array(await crypto.subtle.sign('HMAC',hmac,new TextEncoder().encode(String(i/32))));for(let j=0;j<32&&i+j<bytes.length;j++)bytes[i+j]^=stream[j];}
 const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(kind==='host'){
 const p=data.pairs;if(!Array.isArray(p)||p.length!==10||p.some((v,i)=>!Number.isInteger(v)||v<1||v>10||v===i+1||p[v-1]!==i+1))throw Error();
 document.querySelector('#key').value='SG1:'+btoa(JSON.stringify(p));document.querySelector('#load').click();
 status.textContent='本局已自动载入，核验已启用。';status.parentElement.hidden=false;
 }else{
 if(!Number.isInteger(data.number)||data.number<1||data.number>10||typeof data.title!=='string')throw Error();
 const box=document.querySelector('#identity');box.hidden=false;
 const label=document.createElement('p');label.textContent='仅供你阅读 · 玩家 '+data.number+' 号';box.append(label);
 const heading=document.createElement('h2');heading.textContent=data.title;heading.style.fontFamily='Zhi Mang Xing,serif';box.append(heading);
 for(const [title,text] of [['',data.en],['',data.lore],['你的宿命',data.goal],['你的宿敌：'+data.rivalTitle,data.rivalGoal]]){
 if(title){const h=document.createElement('h3');h.textContent=title;box.append(h);}
 const p=document.createElement('p');const parts=String(text||'').split(/(\*\*[^*]+\*\*)/g);for(const part of parts){const n=document.createElement(part.startsWith('**')?'strong':'span');n.textContent=part.replace(/^\*\*|\*\*$/g,'');p.append(n);}p.style.whiteSpace='pre-line';box.append(p);
 }
 const note=document.createElement('p');note.textContent='请保密这封密信和本页链接。下方是所有玩家通用的完整规则。';box.append(note);box.style.borderBottom='1px solid #8A6F47';box.style.paddingBottom='40px';
 document.querySelector('#gate').style.display='none';document.body.classList.remove('lock');box.scrollIntoView();
 }
 }catch{const box=document.querySelector('#identity')||status;if(box){box.hidden=false;box.textContent='链接不完整或无法读取，请重新打开邮件中的完整链接。';}const gate=document.querySelector('#gate');if(gate)gate.style.display='none';document.body.classList.remove('lock');}
})();
