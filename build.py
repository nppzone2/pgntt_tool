# Dựng file dùng một mình: python3 build.py  ->  index.html (bản web, không có dữ liệu khách hàng)
# Muốn dựng bản có dữ liệu riêng: PGNTT_SEED=đường_dẫn_file.json python3 build.py  (không đưa file đó lên GitHub)
import os
t0=open('template.html').read(); head=t0[:t0.index('</style>')]
c=open('part_css.css').read(); t=open('part_body.html').read()
new=head+c+'</style>\n\n'+t
seed=os.environ.get('PGNTT_SEED','seed_empty.json')
d=open(seed).read().replace('</','<\\/')
logo='data:image/png;base64,'+open('logo_b64.txt').read().strip()
new=new.replace('__LOGO_SPVB__',logo).replace('__FONT_R__',open('font_R.b64').read().strip()).replace('__FONT_B__',open('font_B.b64').read().strip())
out=new.replace('__DATA__',d)
open('index.html','w').write(out)
print('index.html', len(out), 'bytes, seed:', seed)
