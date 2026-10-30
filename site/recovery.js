(()=>{
 const form=document.getElementById('recoverForm');if(!form)return;
 const input=document.getElementById('emailPrefix'),button=form.querySelector('button'),status=document.getElementById('recoveryStatus');
 form.addEventListener('submit',async event=>{
  event.preventDefault();const prefix=SecretGridCodec.normalizePrefix(input.value);
  if(!/^[a-z0-9][a-z0-9._+-]{0,127}$/.test(prefix)){status.textContent='请输入邮箱 @ 前面的部分。';input.focus();return;}
  button.disabled=true;status.textContent='正在查找你的密信……';
  try{
   const response=await fetch('recovery.json?updated='+Date.now(),{cache:'no-store'});if(!response.ok)throw Error('network');
   const index=await response.json();
   if(index.version!==1||!index.salt||!index.entries||!Object.keys(index.entries).length){status.textContent='本局密信尚未发布，请等守夜人发信后再查询。';return;}
   const id=await SecretGridCodec.prefixHash(prefix),token=index.entries[id];
   if(typeof token!=='string'){status.textContent='暂未找到这个邮箱前缀。请检查拼写；刚发信时可稍等片刻再试。';return;}
   const key=prefix+':'+index.salt,data=await SecretGridCodec.decode(token,key);
   if(!Number.isInteger(data.number)||data.number<1||data.number>10||typeof data.title!=='string'||typeof data.goal!=='string')throw Error('payload');
   const url=new URL('rules_new.html',location.href);url.hash=new URLSearchParams({player:token,key}).toString();
   SecretGridNavigation.remember(url.href,data);location.assign(url.href);
  }catch{status.textContent='暂时无法读取密信，请稍后重试，或使用邮件中的密信链接。';}
  finally{button.disabled=false;}
 });
})();
