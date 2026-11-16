#!/usr/bin/env python3
"""Applies the Creative Hub ZA edits to index.html in one go.

Run it from the folder that contains index.html:
    python3 apply_patches.py

Safe by design: it saves index.html.bak first, and refuses to change anything
unless every edit's "find" text is present exactly once.
"""
import shutil, sys

FILE = "index.html"
E = []  # (name, find, replace)

def edit(name, old, new):
    E.append((name, old, new))

# 1. Font: DM Sans everywhere
edit("font link",
 r"""<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>""",
 r"""<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>""")
edit("tailwind fonts",
 r"""fontFamily:{sans:['Manrope','sans-serif'],display:['Playfair Display','serif']}""",
 r"""fontFamily:{sans:['DM Sans','system-ui','sans-serif'],display:['DM Sans','system-ui','sans-serif']}""")
edit("icon font weight",
 r"""wght,FILL@400,0..1""",
 r"""wght,FILL@300,0""")

# 2. Theme
edit("load theme.css",
 r"""</head>""",
 r"""<link rel="stylesheet" href="/theme.css"/>
</head>""")

# 3. Join page links open the right sign-up
edit("join param",
 r"""if(REF&&!me)openOnboard()""",
 r"""const J=new URLSearchParams(location.search).get('join');if((REF||J)&&!me)openOnboard(J)""")

# 4. Invite links land on the join page
edit("invite link",
 r"""const inv=()=>location.href.split('?')[0].split('#')[0]+'?ref='+me.id;""",
 r"""const inv=()=>location.origin+'/join.html?ref='+me.id;""")

# 5. Remove redundant buttons
edit("welcome: partner button",
 r"""<button class="btn2 bg-black/40 backdrop-blur" onclick="enterApp('partners')">Partner with us</button>""",
 r"""""")
edit("welcome: partner link in footer",
 r"""<button onclick="enterApp('guidelines')">Community guidelines</button>""",
 r"""<button onclick="enterApp('partners')">Partner with us</button><button onclick="enterApp('guidelines')">Community guidelines</button>""")
edit("welcome: duplicate Open app",
 r"""me?`<button class="btn" onclick="enterApp('dashboard')">Open app</button>`:""",
 r"""me?'':""")
edit("profile: duplicate change password",
 r"""<div class="card p-5 max-w-xl mt-4"><b>Change password</b><div class="relative mt-3"><input id="np1" class="inp pr-11" type="password" minlength="6" placeholder="New password (6+ characters)"/><button type="button" aria-label="Show or hide password" class="absolute right-3 top-1/2 -translate-y-1/2 text-mute" onclick="eye(this)"><span class="m">visibility</span></button></div><button class="btn mt-3" onclick="chPw()">Update password</button></div>""",
 r"""""")

# 6. Release / refund buttons on the dashboard (only show once deposits are held)
edit("dashboard rows",
 r"""bs.slice(0,6).map(x=>{const o=P[x.client_id===me.id?x.artist_id:x.client_id];return `<div class="card p-3 flex justify-between gap-3 text-sm"><span class="truncate">${x.client_id===me.id?'To':'From'} ${esc(o?.full_name||'Member')}</span><span class="text-mute shrink-0">${R(x.escrow_deposit)} · ${esc(x.payment_status.replace('_',' '))}</span></div>`})""",
 r"""bs.slice(0,6).map(x=>{const isC=x.client_id===me.id,o=P[isC?x.artist_id:x.client_id];
const act=x.payment_status==='escrow_held'?(isC?`<button class="btn2 !py-1 !px-3 !text-xs" onclick="bookingAct('${x.id}','release')">Release deposit</button>`:`<button class="btn2 !py-1 !px-3 !text-xs" onclick="bookingAct('${x.id}','refund')">Cancel and refund</button>`):'';
return `<div class="card p-3 flex items-center justify-between gap-3 text-sm"><span class="truncate">${isC?'To':'From'} ${esc(o?.full_name||'Member')}</span><span class="flex items-center gap-3 shrink-0"><span class="text-mute">${R(x.escrow_deposit)} · ${esc(x.payment_status.replace('_',' '))}</span>${act}</span></div>`})""")
edit("bookingAct function",
 r"""/* ---------- init ---------- */""",
 r"""/* ---------- release / refund a held deposit ---------- */
async function bookingAct(id,act){
  if(!confirm(act==='release'?'Release this deposit to the creative? This cannot be undone.':'Cancel this booking and refund the client?'))return;
  const{data:{session}}=await db.auth.getSession();
  try{const r=await fetch(C.API+'/api/bookings/'+id+'/'+act,{method:'POST',headers:{Authorization:'Bearer '+session.access_token}});
    const j=await r.json().catch(()=>({}));toast(j.message||(r.ok?'Done.':'Something went wrong.'))}
  catch(e){toast('Could not reach the server.')}
  go('dashboard');
}

/* ---------- init ---------- */""")

def main():
    try:
        src = open(FILE, encoding="utf-8").read()
    except FileNotFoundError:
        sys.exit(f"Can't find {FILE}. Run this from the folder that contains it.")
    bad = [(n, src.count(o)) for n, o, _ in E if src.count(o) != 1]
    if bad:
        for n, c in bad:
            print(f"  STOP: '{n}' found {c} times (expected 1). Already applied, or index.html differs.")
        sys.exit("Nothing was changed.")
    shutil.copyfile(FILE, FILE + ".bak")
    for n, o, new in E:
        src = src.replace(o, new)
        print("  done:", n)
    open(FILE, "w", encoding="utf-8").write(src)
    print(f"\nAll {len(E)} edits applied. Backup saved as {FILE}.bak")

main()