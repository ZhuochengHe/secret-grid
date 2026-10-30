(()=>{
async function loadSecretGridSession(){
 const fragment=location.hash;
 let params=new URLSearchParams(location.hash.slice(1));
 let kind=params.has('host')?'host':params.has('player')?'player':null;
 const status=document.querySelector('#keyStatus');
 const previewMode=document.body.dataset.preview==='true'||params.get('preview')==='1';
 if(!kind&&status){const saved=SecretGridNavigation.getHost();if(saved){params=new URLSearchParams(new URL(saved.url).hash.slice(1));kind='host';}}
 if(!kind){const identity=document.querySelector('#identity');if(identity){identity.hidden=true;identity.replaceChildren();}if(status)status.textContent='请使用发信后生成的主持人专用链接打开工具。';return;}
 try{
 const key=params.get('key'),token=params.get(kind);
 if(!key||!token)throw Error();
 const data=await SecretGridCodec.decode(token,key);
 if(location.hash!==fragment)return;
 if(kind==='host'){
 const p=data.pairs;if(!Array.isArray(p)||p.length!==10||p.some((v,i)=>!Number.isInteger(v)||v<1||v>10||v===i+1||p[v-1]!==i+1))throw Error();
 document.querySelector('#key').value='SG1:'+btoa(JSON.stringify(p));document.querySelector('#load').click();
 status.textContent='本局已自动载入，核验已启用。';if(status.parentElement.hidden)status.parentElement.before(status);
 const hostUrl=new URL('index.html',location.href);hostUrl.hash=new URLSearchParams({host:token,key}).toString();SecretGridNavigation.rememberHost(hostUrl.href);
 }else{
 if(!Number.isInteger(data.number)||data.number<1||data.number>10||typeof data.title!=='string')throw Error();
 const identityUrl=new URL(location.href),identityParams=new URLSearchParams(identityUrl.hash.slice(1));identityParams.delete('view');if(previewMode){identityUrl.pathname=new URL('badge-preview.html',location.href).pathname;identityParams.delete('preview');}identityUrl.hash=identityParams.toString();SecretGridNavigation.remember(identityUrl.href,data,previewMode);
 const box=document.querySelector('#identity');box.replaceChildren();
 if(params.get('view')==='rules'){box.hidden=true;const gate=document.querySelector('#gate');if(gate)gate.style.display='none';document.body.classList.remove('lock');document.querySelector('#rules')?.scrollIntoView();return;}
 box.hidden=false;
 const label=document.createElement('p');label.textContent=previewMode?'示例预览 · 尚未分配给玩家':'仅供你阅读 · 玩家 '+data.number+' 号';box.append(label);
 const heading=document.createElement('h2');heading.textContent=data.title;heading.style.fontFamily='Zhi Mang Xing,serif';box.append(heading);
 if(typeof data.badgeUrl==='string'&&/^https:\/\/zhuochenghe\.github\.io\/secret-grid\/assets\/[a-f0-9]+\.png$/.test(data.badgeUrl)){const art=document.createElement('img');art.src=data.badgeUrl;art.alt=data.title+'徽章';art.style.cssText='display:block;width:min(260px,80%);height:auto;margin:24px auto';box.append(art);}
 for(const [title,text] of [['',data.en],['',data.lore],['你的宿命',data.goal],['你的宿敌：'+data.rivalTitle,data.rivalGoal]]){
 if(title){const h=document.createElement('h3');h.textContent=title;box.append(h);}
 const p=document.createElement('p');const parts=String(text||'').split(/(\*\*[^*]+\*\*)/g);for(const part of parts){const n=document.createElement(part.startsWith('**')?'strong':'span');for(const piece of part.replace(/^\*\*|\*\*$/g,'').split(/(🎃|💀)/u)){if(piece==='🎃'||piece==='💀'){const icon=document.createElement('img');icon.src='assets/'+(piece==='🎃'?'life':'death')+'-sigil.png';icon.alt=piece==='🎃'?'生之烙印':'死之烙印';icon.style.cssText='width:1.4em;height:1.4em;object-fit:contain;vertical-align:-.3em;margin:0 .12em';n.append(icon);}else n.append(document.createTextNode(piece));}p.append(n);}p.style.whiteSpace='pre-line';box.append(p);
 }
 const note=document.createElement('p');note.textContent=previewMode?'这是一份视觉示例，不代表任何玩家的正式身份。':'请保密这封密信和本页链接。下方是所有玩家通用的完整规则。';box.append(note);box.style.borderBottom='1px solid #8A6F47';box.style.paddingBottom='40px';
 document.querySelector('#gate').style.display='none';document.body.classList.remove('lock');box.scrollIntoView();
 }
 }catch{if(location.hash!==fragment)return;const box=document.querySelector('#identity')||status;if(box){box.hidden=false;box.textContent='链接不完整或无法读取，请重新打开邮件中的完整链接。';}const gate=document.querySelector('#gate');if(gate)gate.style.display='none';document.body.classList.remove('lock');}
}
window.addEventListener('hashchange',loadSecretGridSession);
loadSecretGridSession();
})();
