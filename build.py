# Dựng index.html: python3 build.py
# config.json: client_id (Google OAuth) và gs_url (URL web app Apps Script). Cả hai không phải bí mật.
# Dữ liệu nguồn không nằm trong repo; bản web tải từ Google Sheet sau khi đăng nhập.
import os, json
cfg=json.load(open('config.json'))
gs_url=os.environ.get('PGNTT_GS_URL',cfg.get('gs_url',''))
client=cfg.get('client_id','')
t0=open('template.html').read(); head=t0[:t0.index('</style>')]
c=open('part_css.css').read(); t=open('part_body.html').read()
new=head+c+'</style>\n\n'+t
seed=os.environ.get('PGNTT_SEED','seed_empty.json')
d=open(seed).read().replace('</','<\\/')
logo='data:image/png;base64,'+open('logo_b64.txt').read().strip()
new=(new.replace('__LOGO_SPVB__',logo)
        .replace('__FONT_R__',open('font_R.b64').read().strip())
        .replace('__FONT_B__',open('font_B.b64').read().strip())
        .replace("'__GS_URL__'","'"+gs_url+"'")
        .replace("'__CLIENT_ID__'","'"+client+"'"))
out=new.replace('__DATA__',d)
open('index.html','w').write(out)
print('index.html', len(out), 'bytes; gs_url set:', bool(gs_url))
