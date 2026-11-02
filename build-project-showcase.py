from pathlib import Path
from PIL import Image

root = Path(__file__).parent
out = root / 'assets' / 'project-showcase'
out.mkdir(exist_ok=True)
source = Image.open(r'C:\Users\turga\Downloads\Bugünün Projeleri, Yarının Yaşam Alanları.png')
for i, (left, right) in enumerate([(0,418),(424,823),(828,1227),(1233,1632),(1638,2048)], 1):
    source.crop((left,256,right,457)).save(out / f'project-{i}.webp', quality=96)
source.crop((1360,0,2048,256)).save(out / 'sky-signature.webp', quality=96)
source.crop((350,0,900,70)).save(out / 'sky.webp', quality=95)
source.crop((350,680,1700,768)).save(out / 'clouds.webp', quality=95)

projects = [
    ('KARTALTEPE RESİDANS','İSTANBUL / BAKIRKÖY',100,4,'TAMAMLANDI'),
    ('MAVİ YAKA KONUTLARI','İZMİR / KARŞIYAKA',65,3,'İNŞAAT DEVAM EDİYOR'),
    ('YEŞİL VADİ EVLERİ','ANTALYA / KONYAALTI',25,2,'TEMEL AŞAMASINDA'),
    ('SAHİL PARK KONUTLARI','SAMSUN / ATAKUM',10,1,'RUHSAT SÜRECİNDE'),
    ('LİMAN VİLLALARI','MUĞLA / BODRUM',0,0,'PLANLAMA AŞAMASINDA'),
]
cards = []
for i, (name, city, percent, done, status) in enumerate(projects,1):
    stages = ['Proje<br>Planı','Ruhsat','İnşaat','Tamamlandı'] if i == 1 else ['Proje<br>Planı','Ruhsat','İnşaat','İç Dekorasyon','Teslim']
    steps = ''.join(f'<li class="{"is-done" if n < done else ""} {"is-current" if n == done-1 and done>1 else ""}"><span class="showcase-dot">'+ ('<img src="assets/project-showcase/check.svg" alt="">' if n < done else '') + f'</span><span>{label}</span></li>' for n,label in enumerate(stages))
    cards.append(f'''<article class="showcase-card {'is-complete' if i == 1 else ''}">
      <div class="showcase-photo"><img src="assets/project-showcase/project-{i}.webp" alt="{name.title()} proje görseli" loading="lazy"><span class="showcase-number">{i}. PROJE</span></div>
      <div class="showcase-info"><h3>{name}</h3><p class="showcase-location">{city}</p>
      <div class="showcase-progress" role="progressbar" aria-label="{name} tamamlanma oranı" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{percent}"><strong>%{percent}</strong></div>
      <ol class="showcase-stages" style="--stage-fill:{100 if i==1 else (done-1)*25 if done else 0}%">{steps}</ol>
      <p class="showcase-status">{status}</p></div></article>''')
section = '''
      <section class="project-showcase" id="guncel-projeler" aria-labelledby="showcase-title">
        <div class="showcase-header">
          <img class="showcase-logo" src="assets/onurce/onurcelogosiyah.png" alt="Onurce İnşaat">
          <div class="showcase-heading-row"><h2 id="showcase-title">Bugünün Projeleri,<br><span>Yarının Yaşam Alanları</span></h2>
          <p class="showcase-description">Güven, kalite ve sürdürülebilir<br>yaşam alanları için çalışmalarımıza<br>tüm hızıyla devam ediyoruz.</p></div>
        </div>
        <div class="showcase-grid">''' + ''.join(cards) + '''</div>
        <div class="showcase-footer"><p>SAĞLAM YAPILAR <span>|</span> GÜVENLİ YARINLAR</p><a href="#projeler">TÜM PROJELERİ KEŞFET <img src="assets/project-showcase/arrow.svg" alt=""></a></div>
      </section>

'''
html = root / 'index.html'
text = html.read_text(encoding='utf-8')
text = text.replace('      <section class="work-model section dark" id="surec">',section + '      <section class="work-model section dark" id="surec">')
html.write_text(text,encoding='utf-8')
