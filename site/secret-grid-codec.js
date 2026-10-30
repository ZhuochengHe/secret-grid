window.SecretGridCodec=Object.freeze({
 async decode(token,key){
  if(typeof token!=='string'||typeof key!=='string'||!token||!key)throw Error('Missing link');
  const bytes=Uint8Array.from(atob(token.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  const hmac=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  for(let i=0;i<bytes.length;i+=32){const stream=new Uint8Array(await crypto.subtle.sign('HMAC',hmac,new TextEncoder().encode(String(i/32))));for(let j=0;j<32&&i+j<bytes.length;j++)bytes[i+j]^=stream[j];}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 },
 normalizePrefix(value){return String(value||'').trim().toLowerCase().split('@')[0];},
 async prefixHash(prefix){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(prefix)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
});
