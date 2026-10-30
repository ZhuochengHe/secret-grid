(async()=>{
 const status=document.getElementById('previewStatus'),frame=document.getElementById('emailFrame');
 document.getElementById('identityLink').href='badge-preview.html'+location.hash;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const format=s=>escape(s).replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#E3C98F">$1</strong>').replace(/\n/g,'<br>').replace(/🎃|💀/gu,c=>'<img src="https://zhuochenghe.github.io/secret-grid/assets/'+(c==='🎃'?'life':'death')+'-sigil.png" width="22" height="22" alt="'+(c==='🎃'?'生之烙印':'死之烙印')+'" style="width:22px;height:22px;vertical-align:middle;border:0;">');
 try{
 const params=new URLSearchParams(location.hash.slice(1)),key=params.get('key'),token=params.get('player');
 if(!key||!token){status.textContent='请使用完整的示例链接打开，或从身份网页预览底部进入。';return;}
 const data=await SecretGridCodec.decode(token,key);
 if(typeof data.title!=='string'||typeof data.goal!=='string')throw Error('Invalid payload');
 const identityUrl=new URL('badge-preview.html',location.href);identityUrl.hash=location.hash;SecretGridNavigation.remember(identityUrl.href,data,true);
 const root='https://zhuochenghe.github.io/secret-grid/';
 const safeBadge=typeof data.badgeUrl==='string'&&/^https:\/\/zhuochenghe\.github\.io\/secret-grid\/assets\/[a-f0-9]+\.png$/.test(data.badgeUrl)?data.badgeUrl:'';
 let board='<table role="presentation" cellpadding="0" cellspacing="2" border="0" align="center"><tr><td></td>';
 for(let c=1;c<=7;c++)board+='<td style="color:#C2A06A;font:11px Georgia,serif;text-align:center">'+c+'</td>';board+='</tr>';
 const zone=data.zone||'all';
 for(let r=1;r<=7;r++){board+='<tr><td style="color:#C2A06A;font:11px Georgia,serif">'+r+'</td>';for(let c=1;c<=7;c++){const hi=zone==='all'||zone==='row4'&&r===4||zone==='center3'&&r>=3&&r<=5&&c>=3&&c<=5||zone==='sides'&&c!==4||zone==='rows26'&&(r===2||r===6);board+='<td width="26" height="26" align="center" style="width:26px;height:26px;border:1px solid '+(hi?'#C2A06A':'#3A2A33')+';background:'+(hi?'#5E1B28':'#241A22')+';font:12px Georgia,serif;color:#C2A06A">'+(r===4&&c===4?'✦':'&nbsp;')+'</td>';}board+='</tr>';}board+='</table>';
 const values={EVENT_DATE:data.event?.date||'聚会日期见正式邀请',EVENT_TIME:data.event?.time||'聚会时间见正式邀请',EVENT_LOCATION:data.event?.location||'聚会地点见正式邀请',HERO_URL:root+'assets/web/hero.png',SEAL_URL:root+'assets/seal.png',BADGE_URL:safeBadge,LIFE_SIGIL_URL:root+'assets/life-sigil.png',DEATH_SIGIL_URL:root+'assets/death-sigil.png',ROMAN:'示例预览',ROLE_ZH:data.title,ROLE_EN:data.en||'',LORE_SHORT:data.lore||'',RIVAL_NAME:data.rivalTitle||'',RIVAL_GOAL_HTML:format(data.rivalGoal),DESTINY_HTML:format(data.goal),MINI_BOARD_HTML:board,PANEL_BG:'#3A121B',PANEL_BORDER:'#C2A06A',PANEL_ACCENT:'#E3C98F',PLAYER_URL:root+'badge-preview.html'+location.hash,RULES_URL:root+'rules_new.html'+location.hash+'&view=rules&preview=1'};
 const response=await fetch('email-template.html?v=mail-identity-lines-3');if(!response.ok)throw Error('Template unavailable');
 const template=await response.text();
 const html=template.replace(/{{([A-Z_]+)}}/g,(_,k)=>['DESTINY_HTML','RIVAL_GOAL_HTML','MINI_BOARD_HTML'].includes(k)?values[k]||'':escape(values[k]||'')).replace(/<img[^>]*src=""[^>]*>/g,'').replace(/<a href=/g,'<a target="_blank" rel="noopener" href=');
 frame.addEventListener('load',()=>{const doc=frame.contentDocument;if(!doc)return;const resize=()=>frame.style.height=Math.ceil(Math.max(doc.body.scrollHeight,doc.documentElement.scrollHeight))+'px';resize();new ResizeObserver(resize).observe(doc.body);for(const img of doc.images)img.addEventListener('load',resize);});
 frame.hidden=false;frame.srcdoc=html;status.hidden=true;
 }catch{status.textContent='示例链接不完整或加载失败，请重新打开完整链接。';}
})();
