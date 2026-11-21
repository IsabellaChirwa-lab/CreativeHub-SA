# Usage: python3 apply_delete_patch.py index.html
# Makes index.html.bak2, then also deletes the user's uploaded track audio when they delete their account.
import sys,shutil
p=sys.argv[1];shutil.copy(p,p+'.bak2')
s=open(p,encoding='utf-8').read()
a="await db.storage.from('avatars').remove([`${me.id}.jpg`])"
b=a+";const{data:tk}=await db.storage.from('tracks').list(me.id);if(tk?.length)await db.storage.from('tracks').remove(tk.map(x=>`${me.id}/${x.name}`))"
if s.count(a)!=1:
    sys.exit('Could not find the avatar-removal line in delAcct (found %d). Nothing changed.'%s.count(a))
if "from('tracks').list(me.id);if(tk?.length)" in s:
    sys.exit('Already patched.')
open(p,'w',encoding='utf-8').write(s.replace(a,b))
print('Patched OK. Backup saved as '+p+'.bak2')