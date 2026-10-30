(()=>{
 const keys={player:'secretGridIdentity:v1',preview:'secretGridPreviewIdentity:v1',host:'secretGridHost:v1'};
 function valid(url,host=false){try{const u=new URL(url,location.href),p=new URLSearchParams(u.hash.slice(1));return u.origin===location.origin&&/\/(?:rules_new|badge-preview|index)\.html$/.test(u.pathname)&&p.has(host?'host':'player')&&p.has('key')?u:null;}catch{return null;}}
 function read(kind){try{const value=JSON.parse(localStorage.getItem(keys[kind])||'null');return value&&valid(value.url,kind==='host')?value:null;}catch{return null;}}
 function refresh(){const identity=read('player')||read('preview');for(const link of document.querySelectorAll('[data-identity-return]')){link.hidden=!identity;if(identity){link.href=identity.url;link.textContent='返回身份密信';}else{link.removeAttribute('href');}}const status=document.querySelector('#rememberedIdentity');if(status){status.hidden=!identity;if(identity){const link=status.querySelector('a');link.href=identity.url;link.textContent=identity.preview?'返回示例密信':'返回我的密信';}}}
 window.SecretGridNavigation=Object.freeze({
  remember(url,data,preview=false){const u=valid(url);if(!u)return;try{localStorage.setItem(keys[preview?'preview':'player'],JSON.stringify({url:u.href,number:data.number,gameId:data.gameId||null,preview}));}catch{}refresh();},
  rememberHost(url){const u=valid(url,true);if(!u)return;try{localStorage.setItem(keys.host,JSON.stringify({url:u.href}));}catch{}},
  getHost(){return read('host');},refresh
 });
 refresh();window.addEventListener('storage',refresh);window.addEventListener('pageshow',refresh);
})();
