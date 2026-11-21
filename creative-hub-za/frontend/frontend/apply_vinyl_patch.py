# Usage: python3 apply_vinyl_patch.py path/to/frontend/index.html
# Makes index.html.bak, then adds: vinyl player, track upload, follow system.
import sys,shutil
p=sys.argv[1];shutil.copy(p,p+'.bak')
s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert s.count(a)==1,'Could not find a unique match for: '+a[:70]
    s=s.replace(a,b)

rep(r'''@media(prefers-reduced-motion:reduce){.up{animation:none}''', r'''.vinyl{position:relative;width:min(100%,300px);aspect-ratio:1;border-radius:50%;background:repeating-radial-gradient(circle at center,#09090b 0 2px,#17171b 2px 3px);box-shadow:0 18px 50px #000b,inset 0 0 0 6px #0c0c0f;animation:spin 3.4s linear infinite;animation-play-state:paused}
    .vinyl.on{animation-play-state:running}
    .vinyl:after{content:'';position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,transparent 0 35deg,#ffffff18 55deg,transparent 85deg 215deg,#ffffff12 235deg,transparent 265deg)}
    .vinyl .lab{position:absolute;inset:31%;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #09090b}
    .vinyl .hole{position:absolute;left:50%;top:50%;width:4.5%;aspect-ratio:1;transform:translate(-50%,-50%);background:#0e0e11;border-radius:50%;z-index:2}
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.vinyl{animation:none!important}.up{animation:none}''')
rep(r'''view=v;if(v==='chat')chatWith=a||null;''', r'''vStop();view=v;if(v==='chat')chatWith=a||null;''')
rep(r'''me=null;msgs=[];notifs=[];renderWho();showWelcome()''', r'''me=null;msgs=[];notifs=[];FOL=new Set();renderWho();showWelcome()''')
rep(r'''await Promise.all([loadMsgs(),loadNotifs()]);live();''', r'''await Promise.all([loadMsgs(),loadNotifs(),loadFollows()]);live();''')
rep(r'''This profile could not be found.</p>';return}''', r'''This profile could not be found.</p>';return}
    const tr=db?(await db.from('tracks').select('*').eq('profile_id',id).maybeSingle()).data:null;''')
rep(r'''<div class="tile aspect-square rounded-2xl">${pic(p)}</div><div>''', r'''${tr?vinyl(p,tr):`<div class="tile aspect-square rounded-2xl">${pic(p)}</div>`}<div>''')
rep(r'''${esc(p.metro||'South Africa')}</p>''', r'''${esc(p.metro||'South Africa')}</p><p id="fcnt" class="text-xs text-mute mt-1"></p>''')
rep(r'''Message</button>`}</div></div></div>`;''', r'''Message</button><button id="fbtn" class="btn2" onclick="toggleFollow('${id}')">${FOL.has(id)?'Following':'Follow'}</button>`}</div></div></div>`;fcount(id);vAuto();''')
rep(r'''<div id="pf-port"></div>':''}''', r'''<div id="pf-port"></div><div id="pf-trk"></div>':''}''')
rep(r'''catChips('cats-pf');pfInit()}''', r'''catChips('cats-pf');pfInit();trkInit()}''')
rep(r'''<p class="text-xs text-mute mt-5 mb-2">Links: Spotify, YouTube, Instagram, anything</p>''', r'''${ob.cats.includes('Music')?`<p class="text-xs text-mute mt-5 mb-2">Your best track (optional). It plays on a spinning vinyl on your profile.</p><label class="btn2 inline-flex items-center gap-2 cursor-pointer"><span class="m">album</span><span>${ob.audio?esc(ob.audio.name):'Upload MP3 or M4A (10 MB max)'}</span><input type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a" class="hidden" onchange="ob.audio=this.files[0]||null;obPaint()"/></label>`:''}
<p class="text-xs text-mute mt-5 mb-2">Links: Spotify, YouTube, Instagram, anything</p>''')
rep(r'''Object.assign(me,u);P[me.id]=me;ob.step=3;obPaint();''', r'''if(ob.audio&&ob.cats.includes('Music'))await upTrack(ob.audio,'');
    Object.assign(me,u);P[me.id]=me;ob.step=3;obPaint();''')
rep(r'''n.link?.startsWith('chat:')?go('chat',n.link.slice(5)):go('dashboard')}''', r'''n.link?.startsWith('chat:')?go('chat',n.link.slice(5)):n.link?.startsWith('person:')?go('person',n.link.slice(7)):go('dashboard')}''')

block = r'''/* ---------- vinyl player, tracks, follows ---------- */
  let FOL=new Set();
  const vinyl=(p,t)=>`<div><div id="vinyl" class="vinyl mx-auto"><span class="lab tile">${pic(p)}</span><span class="hole"></span></div>
  <button id="vbtn" class="btn2 w-full mt-5 flex items-center justify-center gap-2" onclick="vToggle()"><span class="m">play_arrow</span><span>Play</span></button>
  <p class="text-xs text-mute text-center mt-2 truncate">${esc(t.title||'Latest track')}</p><audio id="vaud" src="${esc(t.audio_url)}" preload="auto" loop></audio></div>`;
  function vSet(on){$('vinyl')?.classList.toggle('on',on);const b=$('vbtn');if(b)b.innerHTML=`<span class="m">${on?'pause':'play_arrow'}</span><span>${on?'Pause':'Play'}</span>`}
  function vAuto(){const a=$('vaud');if(!a)return;a.volume=.85;a.play().then(()=>vSet(true)).catch(()=>vSet(false))} // autoplay can be blocked: the Play button covers that
  function vToggle(){const a=$('vaud');if(!a)return;if(a.paused)a.play().then(()=>vSet(true)).catch(()=>toast('Could not play this track.'));else{a.pause();vSet(false)}}
  function vStop(){const a=$('vaud');if(a){a.pause();a.removeAttribute('src');a.load()}}

  async function loadFollows(){if(!me)return;const{data}=await db.from('follows').select('followee_id').eq('follower_id',me.id);FOL=new Set((data||[]).map(x=>x.followee_id))}
  async function fcount(id){const[a,b]=await Promise.all([db.from('follows').select('*',{count:'exact',head:true}).eq('followee_id',id),db.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',id)]);const e=$('fcnt');if(e)e.textContent=`${a.count||0} followers · ${b.count||0} following`}
  async function toggleFollow(id){
    if(!me){toast('Sign in to follow.');openAuth('signin');return}
    const on=FOL.has(id),{error}=on?await db.from('follows').delete().eq('follower_id',me.id).eq('followee_id',id):await db.from('follows').insert({follower_id:me.id,followee_id:id});
    if(error){toast(error.message);return}
    on?FOL.delete(id):FOL.add(id);const b=$('fbtn');if(b)b.textContent=on?'Follow':'Following';fcount(id);
  }

  async function upTrack(f,title){
    if(!/^audio\//.test(f.type)&&!/\.(mp3|m4a)$/i.test(f.name)){toast('Please choose an MP3 or M4A file.');return false}
    if(f.size>10*1048576){toast('Audio must be under 10 MB.');return false}
    const{data:old}=await db.storage.from('tracks').list(me.id),ext=/m4a/i.test(f.name)?'m4a':'mp3',path=`${me.id}/track-${Date.now()}.${ext}`;
    const{error}=await db.storage.from('tracks').upload(path,f,{contentType:f.type||'audio/mpeg'});
    if(error){toast(error.message);return false}
    const url=db.storage.from('tracks').getPublicUrl(path).data.publicUrl,{error:e2}=await db.from('tracks').upsert({profile_id:me.id,title:title||null,audio_url:url,updated_at:new Date().toISOString()});
    if(e2){toast(e2.message);return false}
    if(old?.length)db.storage.from('tracks').remove(old.map(x=>`${me.id}/${x.name}`));
    return true;
  }
  async function trkInit(){
    const el=$('pf-trk');if(!el)return;const{data:t}=await db.from('tracks').select('*').eq('profile_id',me.id).maybeSingle();
    el.innerHTML=`<div class="card p-5 mt-4 max-w-xl"><b>Your track</b><p class="text-xs text-mute mt-1">Plays on a spinning vinyl when someone opens your profile. MP3 or M4A, up to 10 MB. Only upload music you own.</p>${t?`<p class="text-sm mt-3">Current: <b>${esc(t.title||'Untitled')}</b></p>`:''}
    <input id="tk-t" class="inp mt-3" maxlength="80" placeholder="Track title" value="${esc(t?.title||'')}"/>
    <label class="btn2 mt-3 inline-flex items-center gap-2 cursor-pointer"><span class="m">upload_file</span><span id="tk-n">${t?'Replace audio':'Choose audio file'}</span><input id="tk-f" type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a" class="hidden" onchange="$('tk-n').textContent=this.files[0]?.name||'Choose audio file'"/></label>
    <div class="flex gap-3 mt-4"><button class="btn" onclick="saveTrack()">Save track</button>${t?'<button class="btn2" onclick="delTrack()">Remove</button>':''}</div></div>`;
  }
  async function saveTrack(){
    const f=$('tk-f').files[0],title=$('tk-t').value.trim();
    if(!f){const{data,error}=await db.from('tracks').update({title}).eq('profile_id',me.id).select();if(error)return toast(error.message);return toast(data?.length?'Title saved.':'Choose an audio file first.')}
    toast('Uploading…');if(await upTrack(f,title)){toast('Track saved.');trkInit()}
  }
  async function delTrack(){
    if(!confirm('Remove your track?'))return;
    const{data:f}=await db.storage.from('tracks').list(me.id);if(f?.length)await db.storage.from('tracks').remove(f.map(x=>`${me.id}/${x.name}`));
    await db.from('tracks').delete().eq('profile_id',me.id);toast('Track removed.');trkInit();
  }

  /* ---------- passwords ---------- */'''
rep('/* ---------- passwords ---------- */', block)
open(p,'w',encoding='utf-8').write(s)
print('Patched OK. Backup saved as '+p+'.bak')