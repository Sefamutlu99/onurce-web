const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const parallax = document.querySelector("[data-parallax]");
const countItems = document.querySelectorAll("[data-count]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("js");

const introLoader = document.querySelector("[data-intro]");
if (introLoader && document.documentElement.classList.contains("is-intro")) {
  // Logo animasyonu ~1.3 sn; sayfa yavaş yüklense de en geç 2.5 sn'de perde kalkar
  const started = performance.now();
  let introFinished = false;
  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    const wait = Math.max(0, 1400 - (performance.now() - started));
    setTimeout(() => {
      introLoader.classList.add("is-done");
      document.documentElement.classList.remove("is-intro");
      setTimeout(() => introLoader.remove(), 1000);
    }, wait);
  };
  if (document.readyState === "complete") finishIntro();
  else {
    window.addEventListener("load", finishIntro, { once: true });
    setTimeout(finishIntro, 2500);
  }
} else {
  introLoader?.remove();
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);

  if (!parallax || reduceMotion.matches || window.scrollY === 0) return;
  const offset = Math.min(window.scrollY * 0.12, 90);
  parallax.style.transform = `scale(1.08) translateY(${offset}px)`;
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const heroVideos = [...document.querySelectorAll("[data-hero-video]")];
let heroIndex = 0;
const heroProgress = document.querySelector("[data-hero-progress]");
const heroCurrent = document.querySelector("[data-hero-current]");
const heroTotal = document.querySelector("[data-hero-total]");
const pad = (n) => String(n).padStart(2, "0");

function renderHeroBar() {
  if (!heroProgress) return;
  heroProgress.innerHTML = heroVideos.map(() => "<span></span>").join("");
  [...heroProgress.children].forEach((bar, i) => bar.style.setProperty("--p", i < heroIndex ? 1 : 0));
  heroCurrent.textContent = pad(heroIndex + 1);
  heroTotal.textContent = pad(heroVideos.length);
}

function playHeroVideo(index) {
  heroVideos.forEach((video, i) => video.classList.toggle("is-active", i === index));
  renderHeroBar();
  const video = heroVideos[index];
  // Geçiş animasyonu bitince arkada kalan videoları durdur
  setTimeout(() => heroVideos.forEach((other) => other !== heroVideos[heroIndex] && other.pause()), 1500);
  video.currentTime = 0;
  video.play().catch(() => {});
  const next = heroVideos[(index + 1) % heroVideos.length];
  if (next !== video) next.preload = "auto";
}

if (heroVideos.length && !reduceMotion.matches) {
  heroVideos.forEach((video) => {
    // Her klibin en fazla ~8 saniyesini göster, sonra bir sonrakine geç
    video.addEventListener("timeupdate", () => {
      if (video !== heroVideos[heroIndex]) return;
      const limit = Math.min(video.duration || 8, 8) - 1.2;
      heroProgress?.children[heroIndex]?.style.setProperty("--p", Math.min(video.currentTime / limit, 1));
      if (video.currentTime >= limit) {
        heroIndex = (heroIndex + 1) % heroVideos.length;
        playHeroVideo(heroIndex);
      }
    });
    video.addEventListener("canplay", () => {
      if (video === heroVideos[heroIndex] && video.paused) video.play().catch(() => {});
    });
    video.addEventListener("error", () => {
      if (video !== heroVideos[heroIndex]) return;
      video.remove();
      heroVideos.splice(heroIndex, 1);
      if (!heroVideos.length) return;
      heroIndex %= heroVideos.length;
      playHeroVideo(heroIndex);
    });
  });
  document.addEventListener("visibilitychange", () => {
    const video = heroVideos[heroIndex];
    if (video && !document.hidden && video.paused) video.play().catch(() => {});
  });
  playHeroVideo(0);
} else {
  heroVideos.forEach((video) => video.removeAttribute("autoplay"));
  renderHeroBar();
}

toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("is-open", !isOpen);
  header.classList.toggle("is-open", !isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.tagName !== "A") return;
  toggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
});

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button");
  button.textContent = "Talebiniz Alındı";
  button.disabled = true;
});

const projects = {
  "yeni-proje": {
    title: "Yeni Projemiz",
    status: "Devam eden proje",
    image: "assets/onurce/yd2.webp",
    summary:
      "Ayancık merkez aksına yakın, konut konforunu yatırım değeriyle birleştiren yeni yaşam projesi. Detaylar netleştikçe oda planı ve daire tipleri bu alanda güncellenebilir.",
    location: "Ayancık / Sinop merkez çevresi",
    mapQuery: "Ayancık Sinop Onurce İnşaat",
    specs: [["Durum", "Devam ediyor"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "2+1 / 3+1"]],
    rooms: ["Salon", "Mutfak", "Yatak Odası", "Banyo", "Antre"]
  },
  celik: {
    title: "Çelik Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/mc2.webp",
    summary: "Aile yaşamına uygun daire seçenekleri, güçlü cephe dili ve merkezi ulaşım avantajıyla tamamlanan konut projesi.",
    location: "Ayancık / Sinop",
    mapQuery: "Çelik Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Aile dairesi"]],
    rooms: ["Salon", "Mutfak", "Ebeveyn Odası", "Çocuk Odası", "Banyo"]
  },
  payidar: {
    title: "Payidar Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/ms2.webp",
    summary: "Günlük ihtiyaçlara yakın konum, yalın planlama ve kullanışlı iç hacimlerle geliştirilen tamamlanmış konut işi.",
    location: "Ayancık / Sinop",
    mapQuery: "Payidar Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Kullanışlı plan"]],
    rooms: ["Salon", "Mutfak", "Oda", "Oda", "Banyo"]
  },
  sehzade: {
    title: "Şehzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/hanzade2301185.webp",
    summary: "Cephe karakteri ve kompakt yaşam kurgusuyla öne çıkan, tamamlanmış konut portföyü projelerinden biri.",
    location: "Ayancık / Sinop",
    mapQuery: "Şehzade Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Kompakt konut"]],
    rooms: ["Salon", "Mutfak", "Yatak Odası", "Balkon", "Banyo"]
  },
  lalezade: {
    title: "Lalezade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/lalezade28052019b.webp",
    summary: "Yaşam alanlarını ferah kullanım, güçlü dış cephe ve sakin konut dokusu etrafında bir araya getiren tamamlanmış proje.",
    location: "Ayancık / Sinop",
    mapQuery: "Lalezade Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Ferah daire"]],
    rooms: ["Salon", "Mutfak", "Oturma", "Yatak Odası", "Banyo"]
  },
  beyzade: {
    title: "Beyzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/beyzade1805051.webp",
    summary: "Onurce İnşaat portföyündeki tamamlanmış konut projelerinden; aile kullanımı ve yatırım değeri odağında tasarlandı.",
    location: "Ayancık / Sinop",
    mapQuery: "Beyzade Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Aile kullanımı"]],
    rooms: ["Salon", "Mutfak", "Ebeveyn Odası", "Oda", "Banyo"]
  },
  yurt: {
    title: "Devlet Öğrenci Yurdu",
    status: "Tamamlanan proje",
    image: "assets/onurce/yurtx1.webp",
    summary: "Toplu kullanım ihtiyacına cevap veren, oda organizasyonu ve ortak alan kurgusu öne çıkan tamamlanmış yapı.",
    location: "Ayancık / Sinop",
    mapQuery: "Devlet Öğrenci Yurdu Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Yurt"], ["Bölge", "Ayancık"], ["Plan", "Ortak alanlı"]],
    rooms: ["Yatak Alanı", "Etüt", "Koridor", "Islak Hacim", "Ortak Alan"]
  },
  hanzade: {
    title: "Hanzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/hanzade1.webp",
    summary: "Konut portföyünde yer alan, dengeli plan şeması ve kullanışlı iç dağılımıyla tamamlanan proje.",
    location: "Ayancık / Sinop",
    mapQuery: "Hanzade Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Dengeli plan"]],
    rooms: ["Salon", "Mutfak", "Yatak Odası", "Çocuk Odası", "Banyo"]
  },
  mihrimah: {
    title: "Mihrimah Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/mk2209161.webp",
    summary: "Tamamlanan konut işleri arasında yer alan Mihrimah Konutları, cephe etkisi ve plan verimliliğiyle portföyü tamamlıyor.",
    location: "Ayancık / Sinop",
    mapQuery: "Mihrimah Konutları Ayancık Sinop",
    specs: [["Durum", "Tamamlandı"], ["Kullanım", "Konut"], ["Bölge", "Ayancık"], ["Plan", "Verimli plan"]],
    rooms: ["Salon", "Mutfak", "Oda", "Balkon", "Banyo"]
  }
};

const commonProjectFeatures = [
  "Betonarme karkas bina, konvansiyonel kalıp sistemi ile inşa edilecektir.",
  "Radye temel, Deprem Yönetmeliği'ne uygun şekilde yapılacaktır.",
  "Temel, yapı çevresi ve saha yağmur suyu drenaj sistemi uygulanacaktır.",
  "Radye temel altında, bodrum dış perde duvarlarında ve tavanında su yalıtımı yapılacaktır.",
  "Bağımsız daireler arasında ses yalıtımı yapılacaktır.",
  "Döşemelerde şap altı yalıtım ve dış cephede kesintisiz ısı yalıtımı uygulanacaktır.",
  "Çatılarda su, ısı ve ses yalıtımı yapılacaktır.",
  "Dış cephede mantolama ve porselen seramik kullanılacaktır.",
  "Balkonlarda temperli lamine cam korkuluklar kullanılacaktır.",
  "Blok girişinde mermer kaplama ve her daire için posta kutusu yer alacaktır.",
  "Konforlu ısıcamlı, ısı yalıtımlı PVC doğramalar kullanılacaktır.",
  "Daire giriş kapıları ahşap görünümlü çelik kapı; iç kapılar ahşap kaplamalı veya lake mobilya kapı olacaktır.",
  "Mutfak dolapları ankastre mutfak gereçlerine göre düzenlenecektir."
];

projects.mihrimah = {
  title: "Mihrimah Konutları",
  status: "Kaynak sayfa: Yeni Projemiz",
  image: "assets/onurce/mk2209161.webp",
  summary:
    "Yalı Mahallesi'nde yer alan proje; deprem yönetmeliğine uygun radye temel, su/ses/ısı yalıtımı, porselen seramik cephe ve merkezi ısıtma sistemi gibi teknik özelliklerle planlandı.",
  location: "Yalı Mahallesi, Prof. Dr. Sedat Demircan Caddesi No:74, Ayancık / Sinop",
  mapQuery: "Yalı Mahallesi Prof. Dr. Sedat Demircan Caddesi No:74 Ayancık Sinop",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d370.9556207578995!2d34.58697823986364!3d41.94347983175157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408f813925ccf61d%3A0x59d53d936581242c!2sYal%C4%B1%2C%20Prof.%20Dr.%20Sedat%20Demircan%20Cad.%2C%2057402%20Ayanc%C4%B1k%2FSinop!5e0!3m2!1str!2str!4v1663493739065!5m2!1str!2str",
  specs: [
    ["Konum", "Yalı Mah. No:74"],
    ["Kat", "4 kat"],
    ["Daire", "1+1 ve 3+1"],
    ["Isıtma", "Merkezi"]
  ],
  features: [
    "Betonarme karkas bina, konvansiyonel kalıp sistemi ile inşa edilecektir.",
    "Radye temel, Deprem Yönetmeliği'ne uygun şekilde yapılacaktır.",
    "Temel, yapı çevresi ve saha yağmur suyu drenaj sistemi uygulanacaktır.",
    "Radye temel altında, bodrum dış perde duvarlarında ve tavanında su yalıtımı yapılacaktır.",
    "Bağımsız daireler arasında, hidrofor ve su deposu mahallerinde ses yalıtımı yapılacaktır.",
    "Döşemelerde şap altı yalıtım ve dış cephede kesintisiz ısı yalıtımı uygulanacaktır.",
    "Çatılarda su, ısı ve ses yalıtımı yapılacaktır.",
    "Dış cephede mantolama ve porselen seramik; balkonlarda temperli lamine cam korkuluk kullanılacaktır.",
    "Blok girişinde mermer kaplama ve her daire için posta kutusu yer alacaktır.",
    "Daire giriş kapıları ahşap görünümlü çelik kapı; iç kapılar ahşap kaplamalı veya lake mobilya kapı olacaktır.",
    "Mutfak dolapları ankastre eviye, ocak, fırın, mikrodalga, davlumbaz ve bulaşık makinesine göre düzenlenecektir.",
    "Toplam 4 kat; her katta iki adet 60 m² net 1+1 ve bir adet 125 m² ebeveyn banyolu 3+1 daire bulunacaktır."
  ],
  planImage: "assets/onurce/mk2209162.webp",
  planAlt: "Mihrimah Konutları kat planı krokisi",
  rooms: ["2 adet 60 m² net 1+1", "1 adet 125 m² 3+1", "Ebeveyn banyosu", "4 kat", "Kat planı"]
};

const representativeApartmentTourRooms = [
  {
    id: "living",
    title: "Salon",
    description: "Geniş oturma alanı, sıcak malzeme paleti ve doğal ışık odaklı temsilî yaşam alanı.",
    position: "0% center",
    x: 36,
    y: 54
  },
  {
    id: "kitchen",
    title: "Mutfak",
    description: "Ankastre yerleşime uygun, sade çizgili ve kullanışlı temsilî mutfak atmosferi.",
    position: "25% center",
    x: 64,
    y: 45
  },
  {
    id: "bedroom",
    title: "Yatak Odası",
    description: "Dinlenme konforunu öne çıkaran, sakin tonlarda planlanmış temsilî yatak odası.",
    position: "50% center",
    x: 63,
    y: 68
  },
  {
    id: "bathroom",
    title: "Banyo",
    description: "Taş dokular, net aydınlatma ve kompakt kullanım hissi veren temsilî banyo görünümü.",
    position: "75% center",
    x: 44,
    y: 73
  },
  {
    id: "balcony",
    title: "Balkon",
    description: "Dış mekanla bağlantı kuran, cam korkuluk ve sakin oturma düzeniyle temsilî balkon alanı.",
    position: "100% center",
    x: 26,
    y: 35
  }
];

function createApartmentTour(projectTitle, planLabel = "daire", sprite) {
  return {
    title: `${projectTitle} iç mekan deneyimi`,
    note:
      "Bu görseller geçici temsilî render setidir. Gerçek proje iç mekan görselleri geldiğinde aynı gezinti yapısına bağlanacaktır.",
    sprite,
    rooms: representativeApartmentTourRooms.map((room) => ({
      ...room,
      description: room.description.replace("temsilî", `${planLabel} için temsilî`)
    }))
  };
}

projects.mihrimah.tour = createApartmentTour(
  "Mihrimah Konutları",
  "1+1 ve 3+1 daireler",
  "assets/onurce/tour/projects/mihrimah-sprite.webp"
);

Object.assign(projects, {
  hanzade: {
    title: "Hanzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/Onurce-1009-7.webp",
    summary:
      "Cevizli Mahallesi girişinde, Ardıç Sokak'ta merkezi konumda; spor salonu ve otogara yakın planlanan konut ve iş yeri projesi.",
    location: "Cevizli Mahallesi, Ardıç Sokak No:2, Ayancık / Sinop",
    mapQuery: "Cevizli Ardıç Sokak No:2 Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.0248694227007!2d34.58734395100477!3d41.93531696970862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408f81178cf0c237%3A0xa7ca12b16c817a28!2zQ2V2aXpsaSwgQXJkxLHDpyBTay4gTm86MiwgNTc0MDAgQXlhbmPEsWsvU2lub3A!5e0!3m2!1str!2str!4v1486396232798",
    specs: [["Arsa", "440 m²"], ["Zemin", "160 m² iş yeri"], ["Kat", "4 kat"], ["Daire", "110 m² 3+1"]],
    features: [
      "440 m² arsa üzerinde geliştirilmiştir.",
      "Zemin katta 160 m² iş yeri planlanmıştır.",
      "Devamında her katta 110 m² çift daire olmak üzere toplam 4 kattan oluşmaktadır.",
      "Yeşil alan peyzaj alanı olarak tasarlanmıştır.",
      "Her dairede hol, salon, üç yatak odası, mutfak, banyo, WC ve iki balkon yer alır.",
      ...commonProjectFeatures
    ],
    planImage: "assets/onurce/onurce-plan-lejant.webp",
    planAlt: "Hanzade Konutları kat planı krokisi",
    rooms: ["110 m² 3+1", "20 m² salon", "11,50 m² mutfak", "4,70 m² banyo", "2 balkon"]
  },
  beyzade: {
    title: "Beyzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/beyzadeweb102.webp",
    summary:
      "Ayancık'ın gelişen yerleşim bölgesi Cevizli Mahallesi, Ilgın Sokak üzerinde konumlanan 3+1 konut projesi.",
    location: "Cevizli Mahallesi, Ilgın Sokak, Ayancık / Sinop",
    mapQuery: "Cevizli Mahallesi Ilgın Sokak Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.089468113129!2d34.59070497013753!3d41.93392882952339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x54eb4cdde69a373a!2zNDHCsDU2JzAzLjQiTiAzNMKwMzUnMzQuMCJF!5e0!3m2!1str!2str!4v1507715373330",
    specs: [["Konum", "Cevizli / Ilgın"], ["Daire", "110 m²"], ["Plan", "3+1"], ["Kat başı", "2 daire"]],
    features: ["Her katta 110 m² 3+1 iki adet daire bulunmaktadır.", ...commonProjectFeatures],
    planImage: "assets/onurce/beyzade_plan1.webp",
    planAlt: "Beyzade Konutları kat planı krokisi",
    rooms: ["110 m² 3+1", "2 daire", "Salon", "Mutfak", "Banyo"]
  },
  busra: {
    title: "Büşra Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/onurceyeni1.webp",
    summary:
      "Cevizli Mahallesi, Ilgın Sokak'ta konumlanan; her katta iki adet 110 m² 3+1 daire planına sahip konut projesi.",
    location: "Cevizli Mahallesi, Ilgın Sokak, Ayancık / Sinop",
    mapQuery: "Cevizli Mahallesi Ilgın Sokak Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.0412503042307!2d34.59165731570095!3d41.93496496983215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408f811738355ca7%3A0x91ff73def2ebe426!2sCevizli+Mahallesi%2C+Ilg%C4%B1n+Sk.%2C+57400+Ayanc%C4%B1k%2FSinop!5e0!3m2!1str!2str!4v1530987052134",
    specs: [["Konum", "Cevizli / Ilgın"], ["Daire", "110 m²"], ["Plan", "3+1"], ["Kat başı", "2 daire"]],
    features: ["Her katta 110 m² 3+1 iki adet daire bulunmaktadır.", ...commonProjectFeatures],
    planImage: "assets/onurce/1a53dc70-4379-48d2-9432-6c1a42795aee.webp",
    planAlt: "Büşra Konutları kat planı krokisi",
    rooms: ["110 m² 3+1", "2 daire", "Salon", "Mutfak", "Banyo"]
  },
  celik: {
    title: "Çelik Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/mc2.webp",
    summary:
      "Cevizli Mahallesi, Eski Değirmen Yolu Sokak'ta konumlanan; toplam 4 katlı ve her katta iki adet 115 m² net 3+1 daire içeren proje.",
    location: "Cevizli Mahallesi, Eski Değirmen Yolu Sokak, Ayancık / Sinop",
    mapQuery: "Cevizli Eski Değirmen Yolu Sokak Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1484.1122955534738!2d34.58841488352547!3d41.93102509452384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x408f811eb35866f1%3A0xe76775c3e7610d8a!2sCevizli%2C%20Eski%20De%C4%9Firmen%20Yolu%20Sk.%2C%2057402%20Ayanc%C4%B1k%2FSinop!5e0!3m2!1str!2str!4v1581782883033!5m2!1str!2str",
    specs: [["Konum", "Eski Değirmen Yolu"], ["Kat", "4 kat"], ["Daire", "115 m² net"], ["Plan", "3+1"]],
    features: ["Toplam 4 kattan oluşur.", "Her katta iki adet 115 m² net 3+1 daire bulunmaktadır.", "Merkezi ısıtma sistemi bulunmaktadır.", ...commonProjectFeatures],
    planImage: "assets/onurce/mc3.webp",
    planAlt: "Çelik Konutları kat planı krokisi",
    rooms: ["115 m² net 3+1", "2 daire", "4 kat", "Merkezi ısıtma", "Kat planı"]
  },
  payidar: {
    title: "Payidar Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/yd2.webp",
    summary:
      "Cevizli Mahallesi, Eğitimciler Caddesi üzerinde konumlanan; toplam 4 katlı ve her katta yedi adet 60 m² net 1+1 daire içeren proje.",
    location: "Cevizli Mahallesi, Eğitimciler Caddesi, Ayancık / Sinop",
    mapQuery: "Cevizli Mahallesi Eğitimciler Caddesi Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d741.9899754652154!2d34.58873348814353!3d41.936712998694745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDU2JzEyLjIiTiAzNMKwMzUnMjEuNCJF!5e0!3m2!1str!2str!4v1581958505094!5m2!1str!2str",
    specs: [["Konum", "Eğitimciler Cad."], ["Kat", "4 kat"], ["Daire", "60 m² net"], ["Plan", "1+1"]],
    features: ["Toplam 4 kattan oluşur.", "Her katta yedi adet 60 m² net 1+1 daire bulunmaktadır.", "Kat kaloriferi sistemi kullanılmıştır.", ...commonProjectFeatures],
    planImage: "assets/onurce/ms3.webp",
    planAlt: "Payidar Konutları kat planı krokisi",
    rooms: ["60 m² net 1+1", "7 daire", "4 kat", "Kat kaloriferi", "Kat planı"]
  },
  sehzade: {
    title: "Şehzade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/ms2.webp",
    summary:
      "Cevizli Mahallesi, Ilgın Sokak'ta konumlanan; toplam 5 katlı ve her katta üç adet 125 m² net 3+1 daire içeren proje.",
    location: "Cevizli Mahallesi, Ilgın Sokak, Ayancık / Sinop",
    mapQuery: "Cevizli Mahallesi Ilgın Sokak Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4991.658614536551!2d34.58390633792546!3d41.93460568610974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDU2JzA1LjUiTiAzNMKwMzUnMzcuMSJF!5e0!3m2!1str!2str!4v1581877062081!5m2!1str!2str",
    specs: [["Konum", "Cevizli / Ilgın"], ["Kat", "5 kat"], ["Daire", "125 m² net"], ["Plan", "3+1"]],
    features: ["Toplam 5 kattan oluşur.", "Her katta üç adet 125 m² net 3+1 daire bulunmaktadır.", "Kat kaloriferi sistemi kullanılmıştır.", ...commonProjectFeatures],
    planImage: "assets/onurce/ms3.webp",
    planAlt: "Şehzade Konutları kat planı krokisi",
    rooms: ["125 m² net 3+1", "3 daire", "5 kat", "Kat kaloriferi", "Kat planı"]
  },
  lalezade: {
    title: "Lalezade Konutları",
    status: "Tamamlanan proje",
    image: "assets/onurce/lalezade28052019b.webp",
    summary:
      "Cevizli Mahallesi, Ilgın Sokak'ta konumlanan; her katta bir adet 55 m² net 1+1 ve iki adet 120 m² net 3+1 daire içeren proje.",
    location: "Cevizli Mahallesi, Ilgın Sokak, Ayancık / Sinop",
    mapQuery: "Cevizli Mahallesi Ilgın Sokak Ayancık Sinop",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.089468113129!2d34.59070497013753!3d41.93392882952339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x54eb4cdde69a373a!2zNDHCsDU2JzAzLjQiTiAzNMKwMzUnMzQuMCJF!5e0!3m2!1str!2str!4v1507715373330",
    specs: [["Konum", "Cevizli / Ilgın"], ["1+1", "55 m² net"], ["3+1", "120 m² net"], ["Kat başı", "3 daire"]],
    features: ["Her katta bir adet 55 m² net 1+1 daire bulunmaktadır.", "Her katta iki adet 120 m² net 3+1 daire bulunmaktadır.", ...commonProjectFeatures],
    planImage: "assets/onurce/lalezade28052019c.webp",
    planAlt: "Lalezade Konutları kat planı krokisi",
    rooms: ["55 m² net 1+1", "120 m² net 3+1", "3 daire", "Ilgın Sokak", "Kat planı"]
  }
});

[
  ["yeni-proje", "2+1 / 3+1 daireler", "assets/onurce/tour/projects/yeni-proje-sprite.webp"],
  ["celik", "115 m² net 3+1 daireler", "assets/onurce/tour/projects/celik-sprite.webp"],
  ["payidar", "60 m² net 1+1 daireler", "assets/onurce/tour/projects/payidar-sprite.webp"],
  ["sehzade", "125 m² net 3+1 daireler", "assets/onurce/tour/projects/sehzade-sprite.webp"],
  ["lalezade", "55 m² 1+1 ve 120 m² 3+1 daireler", "assets/onurce/tour/projects/lalezade-sprite.webp"],
  ["beyzade", "110 m² 3+1 daireler", "assets/onurce/tour/projects/beyzade-sprite.webp"],
  ["busra", "110 m² 3+1 daireler", "assets/onurce/tour/projects/busra-sprite.webp"],
  ["hanzade", "110 m² 3+1 daireler", "assets/onurce/tour/projects/hanzade-sprite.webp"]
].forEach(([projectId, planLabel, sprite]) => {
  if (!projects[projectId]) return;
  projects[projectId].tour = createApartmentTour(projects[projectId].title, planLabel, sprite);
});

const valueTrends = {
  ayancik: {
    area: "Ayancık geneli",
    summary: "Ayancık genelinde konut talebi; merkez erişimi, sahil yaşamı ve sınırlı arsa arzı etkisiyle izlenir.",
    points: [
      ["2021", 100],
      ["2022", 146],
      ["2023", 218],
      ["2024", 286],
      ["2025", 348],
      ["2026", 392]
    ]
  },
  cevizli: {
    area: "Cevizli Mahallesi",
    summary: "Cevizli aksında yeni konut dokusu, ulaşım ve günlük ihtiyaçlara yakınlık değer algısını destekler.",
    points: [
      ["2021", 100],
      ["2022", 152],
      ["2023", 232],
      ["2024", 304],
      ["2025", 376],
      ["2026", 428]
    ]
  },
  yali: {
    area: "Yalı Mahallesi",
    summary: "Yalı Mahallesi'nde merkez ve sahil erişimi, nitelikli konut projelerinde prim beklentisini güçlendirir.",
    points: [
      ["2021", 100],
      ["2022", 158],
      ["2023", 244],
      ["2024", 322],
      ["2025", 408],
      ["2026", 462]
    ]
  },
  egitimciler: {
    area: "Eğitimciler Caddesi çevresi",
    summary: "Eğitimciler Caddesi çevresinde kompakt daire tipi ve merkezi kullanım avantajı yatırım talebini canlı tutar.",
    points: [
      ["2021", 100],
      ["2022", 149],
      ["2023", 226],
      ["2024", 296],
      ["2025", 364],
      ["2026", 416]
    ]
  }
};

[
  ["yeni-proje", "ayancik", 14],
  ["celik", "cevizli", -7],
  ["payidar", "egitimciler", -4],
  ["sehzade", "cevizli", 9],
  ["lalezade", "cevizli", -2],
  ["beyzade", "cevizli", 4],
  ["busra", "cevizli", -11],
  ["yurt", "ayancik", -18],
  ["hanzade", "cevizli", 13],
  ["mihrimah", "yali", 0]
].forEach(([projectId, trendId, variance]) => {
  if (!projects[projectId]) return;
  const trend = valueTrends[trendId];
  projects[projectId].valueTrend = {
    ...trend,
    points: trend.points.map(([year, value], index) => [
      year,
      index === 0 ? value : Math.max(100, value + Math.round((variance * index) / (trend.points.length - 1)))
    ])
  };
});

const projectModal = document.querySelector("[data-project-modal]");
const projectImage = document.querySelector("[data-project-image]");
const projectStatus = document.querySelector("[data-project-status]");
const projectTitle = document.querySelector("[data-project-title]");
const projectSummary = document.querySelector("[data-project-summary]");
const projectSpecs = document.querySelector("[data-project-specs]");
const projectFeatures = document.querySelector("[data-project-features]");
const projectLocation = document.querySelector("[data-project-location]");
const projectMapLink = document.querySelector("[data-project-map-link]");
const projectMap = document.querySelector("[data-project-map]");
const floorPlan = document.querySelector("[data-floor-plan]");
const valueSummary = document.querySelector("[data-value-summary]");
const valueGrowth = document.querySelector("[data-value-growth]");
const valueChart = document.querySelector("[data-value-chart]");
const projectTabs = document.querySelectorAll("[data-project-tab]");
const projectPanels = document.querySelectorAll("[data-project-panel]");
const tourModal = document.querySelector("[data-tour-modal]");
const tourImage = document.querySelector("[data-tour-image]");
const tourTitle = document.querySelector("[data-tour-title]");
const tourDescription = document.querySelector("[data-tour-description]");
const tourCount = document.querySelector("[data-tour-count]");
const tourPlan = document.querySelector("[data-tour-plan]");
const tourProjectTitle = document.querySelector("[data-tour-project-title]");
const tourNote = document.querySelector("[data-tour-note]");
const tourPrev = document.querySelector("[data-tour-prev]");
const tourNext = document.querySelector("[data-tour-next]");
const tourHero = document.querySelector("[data-tour-hero]");
let lastFocusedProject = null;
let activeTour = null;
let activeTourIndex = 0;
let tourTransitionTimer = null;

function setProjectPanel(panelId) {
  projectTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.projectTab === panelId));
  projectPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.projectPanel === panelId));
}

function renderValueTrend(project) {
  if (!valueChart || !project.valueTrend) return;

  const { area, summary, points } = project.valueTrend;
  const values = points.map((point) => point[1]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 640;
  const height = 260;
  const padding = 38;
  const range = Math.max(max - min, 1);
  const coordinates = points.map(([, value], index) => {
    const x = padding + (index / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return [x, y];
  });
  const linePath = coordinates.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coordinates.at(-1)[0].toFixed(1)} ${height - padding} L ${coordinates[0][0].toFixed(1)} ${height - padding} Z`;
  const growth = Math.round(((values.at(-1) - values[0]) / values[0]) * 100);

  valueSummary.textContent = `${area}: ${summary}`;
  valueGrowth.textContent = `+%${growth}`;
  valueChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${area} 2021-2026 değer eğilimi">
      <defs>
        <linearGradient id="valueFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(199, 154, 75, 0.42)" />
          <stop offset="100%" stop-color="rgba(199, 154, 75, 0.02)" />
        </linearGradient>
      </defs>
      <path class="value-grid" d="M ${padding} ${padding} H ${width - padding} M ${padding} ${height / 2} H ${width - padding} M ${padding} ${height - padding} H ${width - padding}" />
      <path class="value-area" d="${areaPath}" />
      <path class="value-line" d="${linePath}" />
      ${coordinates
        .map(
          ([x, y], index) => `
            <g class="value-point">
              <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" />
              <text x="${x.toFixed(1)}" y="${(height - 12).toFixed(1)}">${points[index][0]}</text>
              <text class="value-number" x="${x.toFixed(1)}" y="${(y - 13).toFixed(1)}">${points[index][1]}</text>
            </g>
          `
        )
        .join("")}
    </svg>
  `;
}

function openProject(projectId) {
  const project = projects[projectId];
  if (!project || !projectModal) return;

  const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.mapQuery)}`;
  const mapEmbed = project.mapEmbed || `https://maps.google.com/maps?q=${encodeURIComponent(project.mapQuery)}&output=embed`;

  projectImage.src = project.image;
  projectImage.alt = `${project.title} proje görseli`;
  projectStatus.textContent = project.status;
  projectTitle.textContent = project.title;
  projectSummary.textContent = project.summary;
  projectLocation.textContent = project.location;
  projectMapLink.href = mapSearch;
  projectMap.src = mapEmbed;
  tourHero.hidden = !project.tour;
  tourHero.onclick = project.tour ? () => openTour(project) : null;
  renderValueTrend(project);
  projectSpecs.innerHTML = project.specs.map(([label, value]) => `<span>${label}<strong>${value}</strong></span>`).join("");
  projectFeatures.innerHTML = (project.features || []).map((feature) => `<li>${feature}</li>`).join("");
  projectFeatures.parentElement.hidden = !project.features?.length;

  floorPlan.classList.toggle("has-image", Boolean(project.planImage));
  if (project.planImage) {
    floorPlan.innerHTML = `<img src="${project.planImage}" alt="${project.planAlt || `${project.title} iç krokisi`}" />`;
  } else {
    floorPlan.innerHTML = project.rooms
      .map((room, index) => {
        const classes = ["floor-room"];
        if (index === 0) classes.push("living");
        if (index === project.rooms.length - 1) classes.push("hall");
        return `<span class="${classes.join(" ")}">${room}</span>`;
      })
      .join("");
  }

  projectModal.classList.add("is-open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setProjectPanel("plan");
  projectModal.querySelector("[data-project-close]").focus();
}

function renderTour(direction = "next") {
  if (!activeTour) return;
  const room = activeTour.rooms[activeTourIndex];
  clearTimeout(tourTransitionTimer);
  tourImage.classList.remove("is-turning-next", "is-turning-prev", "is-arriving-next", "is-arriving-prev");
  tourImage.style.backgroundImage = `url("${room.image || activeTour.sprite}")`;
  tourImage.style.backgroundPosition = room.position || "center";
  tourImage.style.backgroundSize = room.image ? "cover" : "500% 100%";
  tourImage.classList.add(direction === "prev" ? "is-arriving-prev" : "is-arriving-next");
  tourTransitionTimer = setTimeout(() => {
    tourImage.classList.remove("is-turning-next", "is-turning-prev", "is-arriving-next", "is-arriving-prev");
  }, 700);
  tourTitle.textContent = room.title;
  tourDescription.textContent = room.description;
  tourCount.textContent = `${String(activeTourIndex + 1).padStart(2, "0")} / ${String(activeTour.rooms.length).padStart(2, "0")}`;
  tourPlan.innerHTML = activeTour.rooms
    .map(
      (item, index) => `
        <button class="${index === activeTourIndex ? "is-active" : ""}" type="button" style="left:${item.x}%;top:${item.y}%;" data-tour-room="${index}" aria-label="${item.title} alanına geç">
          <span>${index + 1}</span>
        </button>
      `
    )
    .join("");
  tourPlan.querySelectorAll("[data-tour-room]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.tourRoom);
      const direction = nextIndex < activeTourIndex ? "prev" : "next";
      tourImage.classList.add(direction === "prev" ? "is-turning-prev" : "is-turning-next");
      activeTourIndex = nextIndex;
      setTimeout(() => renderTour(direction), 130);
    });
  });
}

function openTour(project) {
  if (!project.tour || !tourModal) return;
  activeTour = project.tour;
  activeTourIndex = 0;
  if (tourProjectTitle) tourProjectTitle.textContent = activeTour.title || `${project.title} iç mekan deneyimi`;
  if (tourNote && activeTour.note) tourNote.textContent = activeTour.note;
  renderTour("next");
  tourModal.classList.add("is-open");
  tourModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  tourModal.querySelector("[data-tour-close]").focus();
}

function closeTour() {
  if (!tourModal) return;
  tourModal.classList.remove("is-open");
  tourModal.setAttribute("aria-hidden", "true");
  if (!projectModal?.classList.contains("is-open")) {
    document.body.style.overflow = "";
  }
}

function closeProject() {
  if (!projectModal) return;
  projectModal.classList.remove("is-open");
  projectModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  projectMap.src = "";
  if (lastFocusedProject) lastFocusedProject.focus();
}

document.querySelectorAll("[data-project]").forEach((card) => {
  card.addEventListener("click", () => {
    lastFocusedProject = card;
    openProject(card.dataset.project);
  });
});

document.querySelectorAll("[data-project-close]").forEach((button) => {
  button.addEventListener("click", closeProject);
});

document.querySelectorAll("[data-tour-close]").forEach((button) => {
  button.addEventListener("click", closeTour);
});

tourPrev?.addEventListener("click", () => {
  if (!activeTour) return;
  tourImage.classList.add("is-turning-prev");
  activeTourIndex = (activeTourIndex - 1 + activeTour.rooms.length) % activeTour.rooms.length;
  setTimeout(() => renderTour("prev"), 130);
});

tourNext?.addEventListener("click", () => {
  if (!activeTour) return;
  tourImage.classList.add("is-turning-next");
  activeTourIndex = (activeTourIndex + 1) % activeTour.rooms.length;
  setTimeout(() => renderTour("next"), 130);
});

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => setProjectPanel(tab.dataset.projectTab));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && tourModal?.classList.contains("is-open")) {
    closeTour();
    return;
  }
  if (event.key === "Escape" && projectModal?.classList.contains("is-open")) {
    closeProject();
  }
});

document
  .querySelectorAll(
    ".section-label, .intro-grid, .split-media, .split-content, .services-head, .brand-intro, .featured-grid, .portfolio-heading, .timeline-heading, .reviews-heading, .contact > *, .site-footer"
  )
  .forEach((element) => element.classList.add("reveal"));

document
  .querySelectorAll(".steps, .brand-marquee, .timeline-rail, .review-grid, .article-grid")
  .forEach((element) => element.classList.add("reveal-stagger"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.16 }
);

document.querySelectorAll(".reveal, .reveal-stagger").forEach((element) => {
  revealObserver.observe(element);
});

// Görseller perde açılır gibi belirir; aynı satırdakiler sırayla.
// Ayrı gözlemci: Chrome görünürlüğü clip-path'e göre hesaplar, kırpılmış eleman oranı hep 0 olur;
// bu yüzden oran eşiği yerine ekrana girdiği an (isIntersecting) yeterli.
const imageRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      imageRevealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0 }
);

document.querySelectorAll(".split-media, .showcase-card, .service-card, .project-card").forEach((element) => {
  element.classList.add("img-reveal");
  const index = [...element.parentElement.children].indexOf(element);
  element.style.setProperty("--reveal-delay", `${(index % 4) * 110}ms`);
  imageRevealObserver.observe(element);
});

// Güvence: çok hızlı kaydırmada gözlemcilerin atladığı, ekrana girmiş ya da üstte kalmış öğeler de açılsın
let revealCheckQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (revealCheckQueued) return;
    revealCheckQueued = true;
    setTimeout(() => {
      revealCheckQueued = false;
      document
        .querySelectorAll(".img-reveal:not(.is-visible), .reveal:not(.is-visible), .reveal-stagger:not(.is-visible), .split-words:not(.is-visible)")
        .forEach((element) => {
          const box = element.getBoundingClientRect();
          if (box.top < window.innerHeight && box.left < window.innerWidth && box.right > 0) {
            element.classList.add("is-visible");
            imageRevealObserver.unobserve(element);
            revealObserver.unobserve(element);
          }
        });
    }, 200);
  },
  { passive: true }
);

// Bölüm başlıkları kelime kelime yukarı kayarak belirir
document.querySelectorAll("main h2").forEach((heading) => {
  if (heading.closest("[data-project-modal], [data-tour-modal]")) return;
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  let wordIndex = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.append(" ");
        return;
      }
      const outer = document.createElement("span");
      const inner = document.createElement("span");
      outer.className = "w";
      inner.textContent = part;
      inner.style.setProperty("--i", wordIndex++);
      outer.append(inner);
      fragment.append(outer);
    });
    node.replaceWith(fragment);
  });
  heading.classList.add("split-words");
  revealObserver.observe(heading);
});

// Fotoğraflar kaydırırken çerçevesinden biraz farklı hızda kayar (derinlik hissi)
if (!reduceMotion.matches) {
  const parallaxImages = [...document.querySelectorAll(".service-card img, .project-card img, .showcase-photo img")];
  parallaxImages.forEach((image) => image.classList.add("parallax-img"));
  let parallaxQueued = false;
  const updateParallax = () => {
    parallaxQueued = false;
    const viewport = window.innerHeight;
    parallaxImages.forEach((image) => {
      const box = image.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > viewport) return;
      const progress = (box.top + box.height / 2 - viewport / 2) / (viewport / 2 + box.height / 2);
      image.style.translate = `0 ${(progress * box.height * 0.06).toFixed(1)}px`;
    });
  };
  window.addEventListener(
    "scroll",
    () => {
      if (parallaxQueued) return;
      parallaxQueued = true;
      requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
  window.addEventListener("resize", updateParallax);
  updateParallax();
}

function animateCount(item) {
  const target = Number(item.dataset.count);
  const prefix = item.dataset.prefix || "";
  const suffix = item.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.8 }
);

countItems.forEach((item) => countObserver.observe(item));

// Onurce Takip girişi: native <dialog> odak yönetimini ve Esc ile kapanmayı kendisi sağlar
const loginDialog = document.querySelector("[data-login-dialog]");

if (loginDialog) {
  const takipUrl = loginDialog.dataset.takipUrl;
  loginDialog.querySelectorAll("[data-login-kind]").forEach((link) => {
    const url = new URL(takipUrl);
    url.searchParams.set("giris", link.dataset.loginKind);
    link.href = url.toString();
  });

  document.querySelectorAll("[data-login-open]").forEach((button) => {
    button.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      header.classList.remove("is-open");
      loginDialog.showModal();
      document.body.style.overflow = "hidden";
    });
  });

  loginDialog.querySelectorAll("[data-login-close]").forEach((el) => {
    el.addEventListener("click", (event) => {
      document.body.style.overflow = "";
      loginDialog.close();
      // Açık modal içinden sayfa içi bağlantıya tarayıcı kaydırmıyor; kapandıktan sonra elle kaydır
      const target = el.hash && document.querySelector(el.hash);
      if (!target) return;
      event.preventDefault();
      setTimeout(() => {
        target.scrollIntoView();
        history.replaceState(null, "", el.hash);
      }, 0);
    });
  });

  // Pencerenin dışına (arka plana) tıklayınca kapat
  loginDialog.addEventListener("click", (event) => {
    if (event.target === loginDialog) loginDialog.close();
  });

  loginDialog.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
}

// Mobil alt menü: kaydırılan bölüme göre aktif sekmeyi işaretle
const tabbar = document.querySelector("[data-tabbar]");

if (tabbar) {
  const tabs = [...tabbar.querySelectorAll("[data-tab]")];
  const sections = [
    ["projeler", "#guncel-projeler"],
    ["hizmetler", "#hizmetler"],
    ["projeler", "#projeler"],
    ["iletisim", "#iletisim"],
  ]
    .map(([tab, selector]) => [tab, document.querySelector(selector)])
    .filter(([, el]) => el);

  const updateTabs = () => {
    let active = "top";
    const line = window.innerHeight * 0.4;
    sections.forEach(([tab, el]) => {
      if (el.getBoundingClientRect().top <= line) active = tab;
    });
    tabs.forEach((tab) => {
      if (tab.dataset.tab === active) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
  };

  updateTabs();
  window.addEventListener("scroll", updateTabs, { passive: true });
}

// Proje haritası: koordinatlar proje verisindeki Google Maps gömme adreslerinden okunur.
// Leaflet yalnızca bölüme yaklaşınca yüklenir.
const mapCanvas = document.querySelector("[data-map-canvas]");
const mapList = document.querySelector("[data-map-list]");

function projectPins() {
  const seen = new Map();
  return Object.entries(projects)
    .map(([id, project]) => {
      const match = project.mapEmbed?.match(/!2d([\d.]+)!3d([\d.]+)/);
      if (!match) return null;
      let lat = Number(match[2]);
      let lng = Number(match[1]);
      // Aynı noktayı paylaşan projeler üst üste binmesin
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      const repeat = seen.get(key) || 0;
      seen.set(key, repeat + 1);
      lat += repeat * 0.00028;
      lng += repeat * 0.00034;
      return { id, title: project.title, location: project.location, image: project.image, lat, lng };
    })
    .filter(Boolean);
}

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.append(css);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.append(script);
  });
}

function initProjectMap(L) {
  const pins = projectPins();
  const map = L.map(mapCanvas, {
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    tap: false,
  });
  mapCanvas.querySelector(".map-loading")?.remove();
  // Anahtarsız OpenStreetMap karoları; koyu görünüm CSS filtresiyle verilir
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları',
  }).addTo(map);

  const markers = pins.map((pin, index) => {
    const icon = L.divIcon({
      className: "map-pin",
      html: `<span>${pad(index + 1)}</span>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -18],
    });
    const popup = document.createElement("div");
    popup.className = "map-popup";
    popup.innerHTML = `
      <img src="${pin.image}" alt="" />
      <strong>${pin.title}</strong>
      <small>${pin.location || ""}</small>
      <button type="button">Detayları gör →</button>`;
    popup.querySelector("button").addEventListener("click", () => openProject(pin.id));
    return L.marker([pin.lat, pin.lng], { icon, title: pin.title })
      .addTo(map)
      .bindPopup(popup, { maxWidth: 240, minWidth: 220, autoPanPadding: [24, 24] });
  });

  map.fitBounds(L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng])), { padding: [50, 50], maxZoom: 16 });

  mapList.innerHTML = pins
    .map((pin, index) => `<li><button type="button" data-pin="${index}"><span>${pad(index + 1)}</span>${pin.title}</button></li>`)
    .join("");
  mapList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pin]");
    if (!button) return;
    const marker = markers[Number(button.dataset.pin)];
    map.closePopup();
    map.once("moveend", () => marker.openPopup());
    map.flyTo(marker.getLatLng(), 17, { duration: 0.8 });
    mapList.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
  });
}

if (mapCanvas && mapList) {
  const mapObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      mapObserver.disconnect();
      loadLeaflet()
        .then(initProjectMap)
        .catch(() => {
          mapCanvas.querySelector(".map-loading").textContent = "Harita şu anda yüklenemedi.";
        });
    },
    { rootMargin: "600px 0px" }
  );
  mapObserver.observe(mapCanvas);
}

// "Ana ekrana ekle" için service worker (yalnız HTTPS veya localhost'ta çalışır)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// Alt bilgi: mobilde sütun başlıkları listeyi açıp kapatır
document.querySelectorAll(".footer-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    button.closest(".footer-col").classList.toggle("is-open", open);
  });
});
