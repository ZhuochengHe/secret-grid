(()=>{
 const panel=document.getElementById('endingControl');if(!panel)return;
 const status=document.getElementById('endingStatus'),revealButton=document.getElementById('revealPairs'),refreshButton=document.getElementById('refreshEndings'),previewButton=document.getElementById('previewSettlement'),settleButton=document.getElementById('settleGame'),retryButton=document.getElementById('retryEndingMail'),form=document.getElementById('endingChoices'),summary=document.getElementById('settlementPreview'),judge=document.getElementById('judge');
 let host=null,state=null,revealed=false,busy=false,confirmedChoices=null;
 const mailLabels={waiting:'待裁决',pending:'待发送',sent:location.pathname.endsWith('/test.html')?'已模拟寄信':'已发送',sending:'投递待确认',uncertain:'投递待确认'};
 function element(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
 const demo=location.pathname.endsWith('/test.html')?window.SecretGridDemo:null;
 function endpoint(){if(demo)return 'local-demo';try{const u=new URL(host.controlUrl);return u.origin==='https://script.google.com'&&/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname)?u.href:null;}catch{return null;}}
 function rpc(action,extra={}){
  if(demo)return Promise.resolve().then(()=>demo.request(action,{revision:state?.revision,reveal:revealed,...extra}));
  return new Promise((resolve,reject)=>{
   const requestId=crypto.randomUUID(),frame=document.createElement('iframe'),post=document.createElement('form');frame.name='sg-host-'+requestId;frame.hidden=true;post.method='POST';post.action=endpoint();post.target=frame.name;post.hidden=true;
   const request={requestId,action,gameId:host.gameId,controlKey:host.controlKey,revision:state?.revision,reveal:revealed,...extra};
   const input=document.createElement('input');input.name='request';input.value=JSON.stringify(request);post.append(input);
   let timer;
   const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();post.remove();};
   function receive(event){if(!/^https:\/\/(?:script\.google\.com|(?:[a-zA-Z0-9-]+\.)*googleusercontent\.com)$/.test(event.origin))return;const data=event.data;if(data?.channel!=='secret-grid-host'||data.requestId!==requestId)return;cleanup();data.ok?resolve(data.data):reject(Error(data.error||'操作失败。'));}
   window.addEventListener('message',receive);timer=setTimeout(()=>{cleanup();reject(Error('请求超时，操作可能仍在处理。请稍后刷新状态确认，不要重复封盘。'));},90000);
   document.body.append(frame,post);post.submit();
  });
 }
 function ruleReady(){return demo||state?.accusationRule==='board-after-correct-v2';}
 function updateDisabled(){
  refreshButton.disabled=busy||!endpoint();revealButton.disabled=busy||!state;previewButton.disabled=busy||!ruleReady()||!state||!revealed||state.sealed;settleButton.disabled=busy||!ruleReady()||!confirmedChoices||!state?.sendingEnabled||state.sealed;retryButton.disabled=busy||!ruleReady()||!state?.sendingEnabled||!state.players.some(p=>p.result!==null&&p.mail==='pending');
  if(host?.controlKey)judge.disabled=busy||!ruleReady()||!state?.sendingEnabled||state.sealed||!state.players.some(p=>p.active&&!p.used);
 }
 function render(){
  document.getElementById('endingOverview').textContent=state.sealed?'本局已封盘，诸位结局已定。':'已定结局 '+state.players.filter(p=>p.result!==null).length+' / '+state.players.length+(demo?'；已模拟寄信 ':'；邮件已发送 ')+state.players.filter(p=>p.mail==='sent').length+' 封。';
  const rows=document.getElementById('endingPlayers');rows.replaceChildren();
  for(const p of state.players){const text=p.result===null?'待裁决':p.result?'胜利':'失败';rows.append(element('li',p.number+' 号 · '+text+' · '+mailLabels[p.mail]));const checkbox=document.querySelector('#players input[value="'+p.number+'"]');if(checkbox){checkbox.disabled=!p.active||state.sealed;if(!p.active)checkbox.checked=false;}}
  for(const [id,actor]of[['accuser',true],['target',false]]){const select=document.getElementById(id);for(const option of select.options){if(!demo)option.textContent=option.value+' 号';const p=state.players.find(p=>p.number===Number(option.value));option.disabled=!p?.active||(actor&&p.used)||state.sealed;}if(select.selectedOptions[0]?.disabled){const next=[...select.options].find(o=>!o.disabled);if(next)select.value=next.value;}}
  document.getElementById('shuffle').disabled=state.sealed;
  if(revealed&&state.pairs){const saved=readChoices();form.replaceChildren();for(const pair of state.pairs){const field=element('fieldset');field.append(element('legend',pair.act));const pending=pair.roles.some(r=>state.players.find(p=>p.number===r.number).result===null);
    pair.roles.forEach((r,side)=>{const player=state.players.find(p=>p.number===r.number),label=element('label',undefined,'condition-option');if(pending&&!state.sealed){const radio=document.createElement('input');radio.type='radio';radio.name='pair-'+pair.index;radio.value=String(side);radio.checked=saved[pair.index]===side;label.append(radio);}const content=element('span');content.append(element('strong',r.number+' 号 · '+r.title),element('span',r.goal.replace(/\*\*/g,''),'condition-goal'));if(player.result!==null)content.append(element('small',(player.result?'胜局已定':'败局已定')+(pending?'；这里选择的是棋盘条件是否成立，已被放逐者的结局不再改变。':'')));label.append(content);field.append(label);});form.append(field);}}
  updateDisabled();
 }
 function readChoices(){return Array.from({length:5},(_,i)=>{const radio=form.querySelector('input[name="pair-'+i+'"]:checked');return radio?Number(radio.value):null;});}
 async function run(action,extra={}){if(busy||!endpoint())return;if(action!=='state'&&!ruleReady()){status.textContent='云端仍为旧指认规则，请更新 Apps Script 并部署新版本后再裁决。';return;}busy=true;status.textContent='正在处理……';updateDisabled();try{const result=await rpc(action,extra);state=result.state;confirmedChoices=null;summary.replaceChildren();render();if(!ruleReady()){status.textContent='云端仍为旧指认规则。请更新 Apps Script 并部署新版本，再查看裁决进展。';return result;}status.textContent=[result.message,...(result.warnings||[])].filter(Boolean).join(' ')||(!state.sendingEnabled?'裁决服务已连接；结局邮件发送开关尚未启用。':'状态已同步。');return result;}catch(error){status.textContent=error.message;return null;}finally{busy=false;updateDisabled();}}
 refreshButton.onclick=()=>run('state');revealButton.onclick=async()=>{revealed=true;const result=await run('state');if(!result)revealed=false;updateDisabled();};
 form.addEventListener('change',()=>{confirmedChoices=null;summary.replaceChildren();updateDisabled();});
 previewButton.onclick=async()=>{const choices=readChoices(),result=await run('previewSettlement',{choices});if(!result?.plan)return;confirmedChoices=choices;summary.append(element('h3','封盘结局预览'));const list=element('ul');for(const row of result.plan.results)list.append(element('li',row.number+' 号 · '+row.title+'：'+(row.result?'胜利':'失败')));summary.append(list);if(result.plan.doubleLossPairs.length)summary.append(element('p','双方皆败：第 '+result.plan.doubleLossPairs.map(i=>i+1).join('、')+' 对。','double-loss'));status.textContent='请核对以上结局，再点击“'+settleButton.textContent+'”。';updateDisabled();};
 settleButton.onclick=()=>{if(confirmedChoices)run('settle',{choices:confirmedChoices});};retryButton.onclick=()=>run('retryMail');
 window.addEventListener('secretgrid:host',async event=>{
  host=event.detail;if(!host.controlKey||!host.gameId)return;panel.hidden=false;judge.onclick=async()=>{if(!state||!state.sendingEnabled)return;const accuser=Number(document.getElementById('accuser').value),target=Number(document.getElementById('target').value);if(accuser===target){document.getElementById('verdict').textContent='请选择两位不同的执棋者。';return;}const result=await run('accuse',{accuser,target});if(result)document.getElementById('verdict').textContent=result.message;};judge.textContent=demo?'确认指认并模拟寄信':'确认指认并寄出结局';judge.disabled=true;
  if(!endpoint()){status.textContent='裁决服务尚未连接。完成 Apps Script Web App 部署后，请使用新的守夜人链接。';updateDisabled();return;}
  await run('state');
 });
})();
