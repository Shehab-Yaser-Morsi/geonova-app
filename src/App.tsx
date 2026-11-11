import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';
import L from 'leaflet';
import proj4 from 'proj4';
import 'leaflet/dist/leaflet.css';
import { jsPDF } from "jspdf";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";





import {
  FaHome, FaDatabase, FaChartBar, FaMapMarkerAlt, FaSun, FaExternalLinkAlt,
  FaAward, FaTools, FaCheckCircle, FaLayerGroup, FaCogs, FaLeaf, FaTable,
  FaGlobeAmericas, FaStream, FaTemperatureHigh, FaTint, FaMountain,
  FaRoad, FaBolt, FaFlagCheckered, FaChartPie,FaDownload ,
} from 'react-icons/fa';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultImage = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultImage;

/* تحويل UTM 36N → WGS84 */
const UTM_36N = '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs';

const convertGeoJSONCoords = (geojson: any) => {
  if (!geojson || !geojson.features) return geojson;
  const convertRing = (ring: number[][]) =>
    ring.map(([x, y]) => {
      const [lng, lat] = proj4(UTM_36N, 'WGS84', [x, y]);
      return [lng, lat];
    });
  return {
    ...geojson,
    features: geojson.features.map((f: any) => {
      const geom = f.geometry;
      if (!geom) return f;
      let coords = geom.coordinates;
      if (geom.type === 'Polygon') coords = coords.map(convertRing);
      else if (geom.type === 'MultiPolygon') coords = coords.map((poly: number[][][]) => poly.map(convertRing));
      else if (geom.type === 'LineString') coords = convertRing(coords);
      else if (geom.type === 'MultiLineString') coords = coords.map(convertRing);
      else if (geom.type === 'Point') {
        const [lng, lat] = proj4(UTM_36N, 'WGS84', coords);
        coords = [lng, lat];
      }
      return { ...f, geometry: { ...geom, coordinates: coords } };
    })
  };
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Readex+Pro:wght@400;500;600;700&display=swap');
.gn-root {
  --bg: #050b0a; --line: rgba(233,201,138,.16); --line-soft: rgba(255,255,255,.07);
  --gold: #e9c98a; --gold-deep: #c9974a; --teal: #2fd3b4;
  --text: #ecefe9; --text-2: #c3cec9; --muted: #8fa39b;
  font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
  background: var(--bg); color: var(--text); position: relative;
}
.gn-root ::selection { background: rgba(233,201,138,.35); color: #fff; }
.gn-display { font-family: 'Readex Pro', 'IBM Plex Sans Arabic', sans-serif; }
html { scroll-behavior: smooth; }
.gn-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(900px 620px at 88% -6%, rgba(201,151,74,.20), transparent 62%),
    radial-gradient(820px 620px at 4% 38%, rgba(47,211,180,.10), transparent 62%),
    radial-gradient(760px 520px at 72% 102%, rgba(201,151,74,.11), transparent 62%),
    linear-gradient(180deg, #050b0a 0%, #07120f 52%, #040807 100%); }
.gn-bg::after { content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(233,201,138,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(233,201,138,.05) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 25%, #000 15%, transparent 72%);
          mask-image: radial-gradient(ellipse at 50% 25%, #000 15%, transparent 72%); }
.gn-nav { background: rgba(5,11,10,.72); backdrop-filter: blur(18px); border-bottom: 1px solid var(--line-soft); }
.gn-card { background: linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
  border: 1px solid var(--line); backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 30px 70px -35px rgba(0,0,0,.85); }
.gn-card-hover { transition: border-color .3s, box-shadow .3s, transform .3s; }
.gn-card-hover:hover { border-color: rgba(233,201,138,.55); }
.gn-cell { background: rgba(5,11,10,.55); border: 1px solid var(--line-soft); transition: border-color .3s; }
.gn-cell:hover { border-color: rgba(233,201,138,.45); }
.gn-icon-box { background: rgba(233,201,138,.09); border: 1px solid rgba(233,201,138,.25); color: var(--gold); }
.gn-chip { background: rgba(233,201,138,.09); border: 1px solid rgba(233,201,138,.32); color: var(--gold); }
.gn-selected { border-color: rgba(233,201,138,.85) !important; }
.gn-ai-box { background: linear-gradient(135deg, rgba(201,151,74,.16), rgba(8,19,15,.92) 45%, rgba(47,211,180,.07));
  border: 1px solid rgba(233,201,138,.45); }
.gn-gold { color: var(--gold); }
.gn-muted { color: var(--muted); }
.gn-text-2 { color: var(--text-2); }
.gn-link { color: var(--text-2); transition: color .2s; }
.gn-link:hover { color: var(--gold); }
.gn-gold-text { background: linear-gradient(120deg, #fff1cf 0%, #e9c98a 45%, #c9974a 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.gn-btn-gold { color: #1b1305; background: linear-gradient(135deg, #f6dca3, #c9974a);
  box-shadow: 0 10px 30px -10px rgba(233,201,138,.55); transition: all .25s; }
.gn-btn-gold:hover { filter: brightness(1.06); }
.gn-btn-gold:active { transform: scale(.97); }
.gn-btn-outline { color: var(--gold); background: rgba(233,201,138,.06); border: 1px solid rgba(233,201,138,.38); transition: all .25s; }
.gn-btn-outline:hover { background: rgba(233,201,138,.14); border-color: rgba(233,201,138,.7); }
.gn-root :focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.leaflet-container { font-family: inherit; background: #070e0c; }
.map-dark-tiles { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3); }
.leaflet-control-zoom a { background: #0a1512 !important; color: #e9c98a !important; border-color: rgba(233,201,138,.2) !important; }
.leaflet-control-attribution { background: rgba(5,11,10,.8) !important; color: #8fa39b !important; }
.leaflet-control-attribution a { color: #e9c98a !important; }
.leaflet-marker-icon { filter: drop-shadow(0 0 8px rgba(233,201,138,.75)); }
.gn-popup .leaflet-popup-content-wrapper { background: #0a1512; color: #ecefe9; border: 1px solid rgba(233,201,138,.4); border-radius: 16px; }
.gn-popup .leaflet-popup-tip { background: #0a1512; }
.gn-popup .leaflet-popup-close-button { color: #e9c98a !important; }
@keyframes gnFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.animate-fade-in { animation: gnFadeIn .6s ease both; }
`;
const galleryImages = Array.from({ length: 77 }, (_, i) => ({
  src: `/gallery-${i + 1}.jpg`,
  alt: `صورة المشروع ${i + 1}`
}));
const optimalSitesData = [
  {
    id: 1,
    title: "محطة جهينة المقترحة",
    suitability: 92,
    imageUrl: "محطة جهينة.jpg",
    qrLink: "https://www.google.com/maps/search/?api=1&query=26.6380,31.4678",
    pdfLink: "/juhayna-report.pdf", 
    aiInsight: "تُظهر تحليلات النمذجة الجيومكانية أن محطة جهينة تمتلك أعلى معدلات الإشعاع الشمسي المباشر. يتوقع النظام بحلول عام 2030 أن تصل كفاءة الألواح إلى 24%، مع إمكانية ربط المحطة مباشرة بالشبكة القومية عبر خط 220 ك.ف المقترح، مما سيقلل الفاقد ويجعلها من أكثر المحطات ربحية في الصعيد."
  },
  {
    id: 2,
    title: "محطة طما المقترحة",
    suitability: 88,
    imageUrl: "محطة طما.jpg",
    qrLink: "https://www.google.com/maps/search/?api=1&query=26.8465,31.5474",
      pdfLink: "/tama-report.pdf",
    aiInsight: "تتميز منطقة طما بموقع استراتيجي يتوسط المحافظة مما يسهل الربط الكهربائي. تشير النمذجة إلى أن الاستثمار في محطة طما سيحقق عائداً اقتصادياً بنسبة 15% خلال أول 5 سنوات، خاصة مع توافر خطوط ربط مقترحة بجهد 500 و 66 ك.ف، وتوافر طرق إمداد رئيسية تسهل حركة المعدات."
  },
  {
    id: 3,
    title: "محطة شمال شرق سوهاج المقترحة",
    suitability: 85,
    imageUrl: "محطة سوهاج.jpg",
    qrLink: "https://www.google.com/maps/search/?api=1&query=26.9243,32.1789",
    pdfLink: "/sohag-report.pdf",
    aiInsight: "بناءً على التقييم الفني لمساحة 4.69 كم²، تمتلك هذه المنطقة قدرة إنتاجية هائلة تقدر بـ 180.7 ميجاوات. يتوقع نموذج الذكاء الاصطناعي أن تصبح هذه المحطة مركزاً رئيسياً لتغذية المناطق الصناعية شمال سوهاج بحلول 2035، نظراً لقربها من خط الجهد العالي وطريق سوهاج - الغردقة الذي يسهل الصيانة الدورية."
  },
  {
    id: 4,
    title: "محطة أخميم",
    suitability: 89,
    imageUrl: "محطة اخميم.jpg",
    qrLink: "https://www.google.com/maps/search/?api=1&query=26.4435,31.8598",
     pdfLink: "/akhmim-report.pdf",
    aiInsight: "أخميم هي الموقع الأكثر استقراراً جيولوجياً وطبوغرافياً وفقاً لدراسات GIS. يتوقع النظام أن تنخفض تكاليف التأسيس بنسبة 12% هنا نظراً لطبيعة الأرض المستوية وقلة الحاجة لأعمال التسوية. كما تشير التوقعات إلى أن المحطة ستوفر طاقة نظيفة لأكثر من 50 ألف منزل بحلول 2032."
  }
];

const combinedAnalysisSections = [
  {
    sectionId: "12",
    title: "تحليل المسافة والتصنيف لخطوط الكهرباء",
    maps: [
      {
        id: "12-A", title: "خريطة المسافة من خطوط الكهرباء", img: "/map12.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات بين المواقع المختلفة وخطوط الكهرباء، حيث تمثل المناطق الخضراء المناطق الأقرب إلى خطوط الكهرباء، بينما تشير الألوان الصفراء والوردية إلى المناطق الأبعد.",
        importance: "يُعد هذا المعيار من المعايير الأساسية لاختيار مواقع مزارع الطاقة الشمسية، نظراً لأهمية القرب من شبكات الكهرباء في تقليل تكاليف توصيل الطاقة وتسهيل ربط المحطات بالشبكة الكهربائية، مع مراعاة اشتراطات الربط الفني وقدرة الشبكة الاستيعابية."
      },
      {
        id: "12-B", title: "خريطة التصنيف للمسافات من خطوط الكهرباء", img: "/map13.jpg",
        description: "توضح الخريطة التباين المكاني في درجات القرب والبعد عن خطوط الكهرباء، حيث تنتشر التصنيفات الأفضل نسبيًا باللون الأخضر الداكن في أجزاء واسعة من المنطقة، خاصة في الغرب والوسط، مع ظهور مناطق أقل ملاءمة في الشمال الشرقي والجنوب الشرقي.",
        importance: "تكتسب هذه الطبقة أهمية كبيرة نظرًا لدور القرب من شبكات الكهرباء في تقليل تكاليف توصيل المحطات بالشبكة القومية."
      }
    ]
  },
  {
    sectionId: "13",
    title: "تحليل المسافة والتصنيف لشبكة الطرق",
    maps: [
      {
        id: "13-A", title: "خريطة المسافة من الطرق", img: "/map14.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات بين مختلف أجزاء منطقة الدراسة وشبكة الطرق، حيث تشير المناطق الخضراء إلى انخفاض المسافة عن الطرق، بينما تعبر الألوان الصفراء والوردية عن زيادة المسافة.",
        importance: "تكمن أهمية هذا المعيار في تقييم سهولة الوصول إلى المواقع المقترحة لإنشاء مزارع الطاقة الشمسية، وتسهيل عمليات نقل المعدات والإنشاءات وأعمال الصيانة والتشغيل، ولذلك تزداد ملاءمة المناطق القريبة من شبكة الطرق."
      },
      {
        id: "13-B", title: "خريطة تصنيف الطرق", img: "/map15.jpg",
        description: "توضح الخريطة التوزيع المكاني لدرجات القرب والبعد عن شبكة الطرق، حيث تظهر المناطق الأكثر ملاءمة باللون الأخضر الداكن في مساحات واسعة من المنطقة، بينما تظهر بعض المناطق الأقل ملاءمة في الأجزاء الشمالية الشرقية والجنوبية الشرقية.",
        importance: "يساعد هذا المعيار في تحديد المواقع التي تتمتع بسهولة الوصول والنقل، وتقليل تكاليف إنشاء المشروعات وأعمال الصيانة والتشغيل."
      }
    ]
  },
  {
    sectionId: "14",
    title: "تحليل المسافة والتصنيف للأودية ومجاري السيول",
    maps: [
      {
        id: "14-A", title: "خريطة المسافة من الأودية ومجاري السيول", img: "/map16.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات الفاصلة بين مناطق محافظة سوهاج وشبكات الأودية ومجاري السيول، حيث تظهر المسافات الأقل باللون الأخضر بالقرب من مجاري الأودية، بينما تزداد المسافات تدريجياً في اتجاه المناطق ذات الألوان الصفراء والوردية.",
        importance: "تبرز أهمية هذا التحليل في تحديد المناطق الأكثر ابتعاداً عن مجاري السيول، بما يسهم في تقليل احتمالات تعرض مزارع الطاقة الشمسية لمخاطر السيول، ولذلك تُعد المناطق الأبعد عن الأودية أكثر ملاءمة من منظور هذا المعيار."
      },
      {
        id: "14-B", title: "خريطة تصنيف الأودية", img: "/map17.jpg",
        description: "توضح الخريطة التوزيع المكاني للأودية ومجاري السيول داخل منطقة الدراسة، حيث تظهر المناطق الأكثر تأثرًا بمجاري الأودية باللون الأحمر، بينما تزداد درجات الملاءمة بالابتعاد عنها تدريجيًا نحو اللون الأخضر.",
        importance: "تُعد هذه الطبقة من المعايير الأساسية لتقييم المخاطر الطبيعية، إذ يساعد استبعاد المناطق القريبة من مجاري السيول على حماية المنشآت الشمسية وتقليل احتمالات تعرضها للأضرار الناتجة عن السيول."
      }
    ]
  }
];

const individualAnalysisMaps = [
  {
    id: "15", title: "خريطة التصنيف الجيولوجي", img: "/map18.jpg",
    description: "تعرض الخريطة التوزيع المكاني للتكوينات الجيولوجية بمنطقة الدراسة، حيث يسيطر التصنيف الثامن والتاسع على مساحات واسعة، خاصة في الأجزاء الوسطى والشرقية، بينما تظهر تكوينات أخرى على الأطراف الغربية والجنوبية الشرقية.",
    importance: "تُستخدم هذه الطبقة في تقييم طبيعة التكوينات الأرضية ومدى ملاءمتها لإنشاء مشروعات الطاقة الشمسية، مع مراعاة الخصائص الجيولوجية والاستقرار الأرضي."
  },
  {
    id: "16", title: "خريطة تصنيف الرطوبة", img: "/map19.jpg",
    description: "توضح الخريطة التباين المكاني في مستويات الرطوبة داخل منطقة الدراسة، حيث تظهر القيم المرتفعة نسبيًا في الأجزاء الجنوبية والجنوبية الشرقية باللون الأخضر، بينما تتركز القيم الأقل في الأجزاء الشمالية وغرب المنشأة باللونين الأحمر والبرتقالي.",
    importance: "يساعد هذا التباين في تحديد المناطق الأكثر ملاءمة من الناحية المناخية لإقامة محطات الطاقة الشمسية، مع مراعاة أن انخفاض الرطوبة يُعد عاملًا مساعدًا وفقًا لمعيار الدراسة."
  },
  {
    id: "17", title: "خريطة تصنيف الانحدار", img: "/map20.jpg",
    description: "توضح الخريطة الخصائص التضاريسية لمنطقة الدراسة من حيث درجات الانحدار، وتظهر سيادة التصنيف الخامس باللون الأخضر الداكن على معظم المساحة، مع انتشار بعض المناطق ذات الانحدارات الأعلى على امتداد المجاري المائية، خاصة في الأجزاء الشرقية والشمالية الشرقية.",
    importance: "تساعد هذه الخريطة في استبعاد المناطق شديدة الانحدار وتحديد الأراضي الأكثر استواءً وملاءمة لإنشاء المحطات الشمسية."
  },
  {
    id: "18", title: "خريطة تصنيف الإشعاع الشمسي", img: "/map21.jpg",
    description: "توضح الخريطة التوزيع المكاني لمستويات الإشعاع الشمسي، حيث تظهر المناطق ذات التصنيف المرتفع باللون الأخضر في الجزء الشمالي الشرقي، بينما تسود التصنيفات الأقل في معظم الأجزاء الوسطى والجنوبية.",
    importance: "تُعد هذه الطبقة من أهم معايير اختيار مواقع مزارع الطاقة الشمسية، نظرًا لارتباط ارتفاع الإشعاع الشمسي بزيادة القدرة المحتملة على إنتاج الطاقة الكهربائية."
  },
  {
    id: "19", title: "خريطة تصنيف درجات الحرارة", img: "/map22.jpg",
    description: "توضح الخريطة التوزيع المكاني لدرجات الحرارة، حيث تظهر المناطق الأعلى حرارة باللون الأحمر والبرتقالي في الأجزاء الشمالية والشمالية الغربية، بينما تنتشر التصنيفات الأقل حرارة باللون الأخضر في الأجزاء الجنوبية والوسطى.",
    importance: "يساعد تحليل هذه الطبقة في تقييم الظروف الحرارية، حيث إن ارتفاع درجات الحرارة بصورة كبيرة قد تؤثر في كفاءة تشغيل الألواح الشمسية."
  },
  {
    id: "20", title: "خريطة إعادة تصنيف الغطاء الأرضي (Reclassify Land Cover)", img: "/map23.jpg",
    description: "توضح الخريطة التوزيع المكاني لفئات الغطاء الأرضي داخل منطقة الدراسة بعد إعادة التصنيف إلى ثلاث درجات ملاءمة، وهي الدرجات (1، 3، 10). ويتضح من الخريطة سيادة الفئة ذات درجة الملاءمة (10) باللون الأخضر الداكن، حيث تغطي معظم الأجزاء الشمالية والوسطى والشرقية من منطقة الدراسة، بينما تتركز الفئة ذات درجة الملاءمة (3) باللون الأصفر الفاتح في نطاق ممتد بالأجزاء الغربية والجنوبية الغربية، في حين تظهر الفئة الأقل ملاءمة (1) باللون الأحمر في صورة تجمعات متناثرة، خاصة على الحدود الغربية والجنوبية الغربية.",
    importance: "يساعد هذا التصنيف في استبعاد المناطق غير المناسبة وتحديد الأراضي الأكثر ملاءمة لإقامة مزارع الطاقة الشمسية وفقًا لطبيعة الغطاء الأرضي."
  },
  {
    id: "21", title: "خريطة تصنيف الارتفاعات", img: "/map24.jpg",
    description: "توضح الخريطة التدرج المكاني للارتفاعات داخل منطقة الدراسة، حيث تظهر المناطق الأعلى ارتفاعًا باللون الأحمر في الشمال الشرقي، بينما تنتشر المناطق الأقل ارتفاعًا باللون الأخضر الداكن في الأجزاء الغربية والجنوبية الغربية.",
    importance: "يساعد تحليل الارتفاعات في تحديد المناطق المناسبة من الناحية الطبوغرافية، وتقليل تكاليف أعمال التسوية والتجهيز قبل إنشاء المحطات الشمسية."
  },
  {
    id: "22", title: "خريطة تصنيف التربة", img: "/map25.jpg",
    description: "توضح الخريطة التوزيع المكاني لأنواع التربة داخل منطقة الدراسة، حيث تسود التربة الصحراوية الداكنة باللون الأزرق الفاتح على معظم المساحة، بينما تنتشر تربة الرواسب النهرية باللون الأخضر في الأجزاء الغربية والجنوبية، وتظهر التربة الصحراوية في الجزء الشمالي الشرقي، مع وجود مساحة محدودة من التربة الغنية بالمواد العضوية في الجنوب الغربي.",
    importance: "يساعد هذا التصنيف في تقييم طبيعة الأراضي وتحديد المواقع التي لا تتعارض مع الأراضي الزراعية ذات القيمة الإنتاجية."
  }
];

function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({ click: (e) => { onMapClick(e); } });
  return null;
}
export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'spatial-data' | 'analysis-results' | 'final-result'>('home');

  // البيانات الأساسية
  const [highData, setHighData] = useState<any>(null);
  const [mediumData, setMediumData] = useState<any>(null);
  const [normalData, setNormalData] = useState<any>(null);

  // البيانات الخاصة بالمحطات (جهينة - طما - سوهاج - أخميم)
  const [juhaynaStation, setJuhaynaStation] = useState<any>(null);
  const [juhaynaConnection, setJuhaynaConnection] = useState<any>(null);
  const [juhaynaRoad, setJuhaynaRoad] = useState<any>(null);

  const [tamaStation, setTamaStation] = useState<any>(null);
  const [tamaRoad, setTamaRoad] = useState<any>(null);
  const [tamaLine66, setTamaLine66] = useState<any>(null);
  const [tamaLine500, setTamaLine500] = useState<any>(null);

  const [sohagNEStation, setSohagNEStation] = useState<any>(null);

  const [akhmimStation, setAkhmimStation] = useState<any>(null);
  const [akhmimRoad, setAkhmimRoad] = useState<any>(null);

  // شيك بوكس الخرايط (مقفولين افتراضيًا)
  const [showHigh, setShowHigh] = useState(false);
  const [showMedium, setShowMedium] = useState(false);
  const [showNormal, setShowNormal] = useState(false);
  const [showJuhayna, setShowJuhayna] = useState(false);
  const [showTama, setShowTama] = useState(false);
  const [showSohagNE, setShowSohagNE] = useState(false);
  const [showAkhmim, setShowAkhmim] = useState(false);

  const [clickedMarkers, setClickedMarkers] = useState<Array<{ lat: number; lng: number; text: string }>>([]);
  const [selectedSiteForAI, setSelectedSiteForAI] = useState(optimalSitesData[0]);
const [index, setIndex] = useState(-1);
  const [showAllImages, setShowAllImages] = useState(false);
  useEffect(() => {
    // 1. الطبقات الأساسية (تحتاج تحويل UTM)
    fetch('/suitable-high.geojson')
      .then(res => res.json())
      .then(data => setHighData(convertGeoJSONCoords(data)))
      .catch(() => console.log("تعذر تحميل طبقة ملائمة عالية"));

    fetch('/suitable-medium.geojson')
      .then(res => res.json())
      .then(data => setMediumData(convertGeoJSONCoords(data)))
      .catch(() => console.log("تعذر تحميل طبقة متوسط الملائمة"));

    fetch('/suitable-normal.geojson')
      .then(res => res.json())
      .then(data => setNormalData(convertGeoJSONCoords(data)))
      .catch(() => console.log("تعذر تحميل طبقة ملائم"));

    // 2. محطات جهينة وطما وسوهاج وأخميم (إحداثيات lat/lng جاهزة)
    fetch('/juhayna-station.json').then(res => res.json()).then(setJuhaynaStation).catch(() => { });
    fetch('/juhayna-road.json').then(res => res.json()).then(setJuhaynaRoad).catch(() => { });
    fetch('/juhayna-line.json').then(res => res.json()).then(setJuhaynaConnection).catch(() => { });

    fetch('/tama-station.json').then(res => res.json()).then(setTamaStation).catch(() => { });
    fetch('/tama-road.json').then(res => res.json()).then(setTamaRoad).catch(() => { });
    fetch('/tama-line-66.json').then(res => res.json()).then(setTamaLine66).catch(() => { });
    fetch('/tama-line-500.json').then(res => res.json()).then(setTamaLine500).catch(() => { });

    fetch('/sohagne-station.json').then(res => res.json()).then(setSohagNEStation).catch(() => { });

    fetch('/akhmim-station.json').then(res => res.json()).then(setAkhmimStation).catch(() => { });
    fetch('/akhmim-road.json').then(res => res.json()).then(setAkhmimRoad).catch(() => { });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const getLayerStyle = (color: string) => ({
    color: color, weight: 1.5, fillColor: color, fillOpacity: 0.4, interactive: true
  });

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="gn-root min-h-screen dir-rtl antialiased">
      <style>{GLOBAL_CSS}</style>
      <div className="gn-bg" aria-hidden="true"></div>
      <div className="relative z-10">

        {/* NAVBAR */}
        <nav className="gn-nav sticky top-0 z-50 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('about')}>
              <img src="/logo.png" alt="GEONOVA Logo" className="w-12 h-12 object-contain rounded-xl" />
              <div>
                <span className="gn-display gn-gold-text text-xl font-bold tracking-wider block">
                  GEONOVA
                </span>
                <span className="gn-muted text-[10px] block">طاقة شمسية و GIS</span>
              </div>
            </div>

            {currentView === 'home' ? (
              <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                <button onClick={() => scrollToSection('about')} className="gn-link">عن المشروع</button>
                <button onClick={() => scrollToSection('data-analysis')} className="gn-link">البيانات والتحليل</button>
                <button onClick={() => scrollToSection('optimal-sites')} className="gn-link">المواقع المثلى</button>
                <button onClick={() => scrollToSection('gallery')} className="gn-link">المعرض</button>
                <button onClick={() => scrollToSection('thanks')} className="gn-link">شكر وتقدير</button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('home')}
                className="gn-btn-gold px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <FaHome /> العودة للرئيسية
              </button>
            )}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-24">

          {/* عرض الصفحة الفرعية: طبقات البيانات المكانية */}
          {currentView === 'spatial-data' && (
            <div className="space-y-12 animate-fade-in py-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="gn-gold text-sm font-semibold">استعراض تفصيلي للبيانات المكانية</span>
                  <h1 className="gn-display text-3xl font-semibold text-white mt-1">طبقات البيانات والمعايير الجغرافية</h1>
                </div>
              </div>

              {/* السكشن الأول */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaGlobeAmericas className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الأول</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة الموقع الجغرافي لمحافظة سوهاج</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map1.jpg" alt="خريطة الموقع الجغرافي" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 1: الموقع الجغرافي والامتداد الفلكي والإداري لمحافظة سوهاج</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">الدلالة التحليلية للموقع الجغرافي</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة الموقع الجغرافي لمحافظة سوهاج في الجزء الجنوبي من جمهورية مصر العربية، حيث تحدها محافظة أسيوط من الشمال ومحافظة قنا من الجنوب، ويحدها البحر الأحمر شرقاً ومحافظة الوادي الجديد غرباً.
                      </p>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تمتد المحافظة بين الوادي النيلي والصحراء الشرقية والغربية، وهو ما يعكس تنوعاً واضحاً في الخصائص الطبيعية والتضاريسية داخل منطقة الدراسة. وتُعد هذه الخصائص أساساً مهماً للتحليل المكاني لاختيار المواقع المناسبة لإنشاء مزارع الطاقة الشمسية.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="gn-chip px-4 py-1.5 rounded-full text-xs font-semibold">نطاق الدراسة: محافظة سوهاج</span>
                      <span className="gn-chip px-4 py-1.5 rounded-full text-xs font-semibold">التحليل: GIS & Remote Sensing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن الثاني */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaStream className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الثاني</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة الأودية ومجاري السيول بمحافظة سوهاج</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map2.jpg" alt="خريطة الأودية ومجاري السيول" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 2: التوزيع المكاني لشبكات الأودية ومجاري السيول</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">الدلالة التحليلية لمجاري السيول والأودية</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة التوزيع المكاني لشبكات الأودية ومجاري السيول داخل محافظة سوهاج، والتي تتركز بصورة ملحوظة في المناطق الصحراوية شرق الوادي النيلي. ولذلك تم الاعتماد على تحليل شبكة الأودية باستخدام أداة Euclidean Distance لاستبعاد المناطق الأكثر عرضة لمخاطر السيول وتقليل المخاطر المحتملة على المنشآت والبنية التحتية.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="gn-chip px-4 py-1.5 rounded-full text-xs font-semibold">التحليل: Euclidean Distance</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* السكشن الثالث */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaLayerGroup className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الثالث • معيار طبيعي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة أنواع التربة</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map3.jpg" alt="خريطة أنواع التربة" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 3: التوزيع الجغرافي لأنواع التربة والتكوينات الأرضية بمحافظة سوهاج</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة التوزيع الجغرافي لأنواع التربة داخل منطقة الدراسة، حيث تظهر عدة أنواع من التكوينات الترابية، من أبرزها التربة الصحراوية الداكنة، وتربة الرواسب النهرية، والتربة الصخرية، والتربة الواحاتية الغنية.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تساعد دراسة أنواع التربة في تقييم طبيعة الأراضي ومدى ملاءمتها لأعمال إنشاء وتركيب محطات الطاقة الشمسية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* الجدول والرسم البياني للسكشن 3 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="gn-display text-lg font-semibold text-white flex items-center gap-2"><FaTable className="gn-gold" /> جدول توزيع التربة بمحافظة سوهاج</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/10 text-gold border-b border-white/10 text-sm">
                            <th className="p-4 font-semibold">نوع التربة</th>
                            <th className="p-4 font-semibold">المساحة (كم²)</th>
                            <th className="p-4 font-semibold">النسبة (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm gn-text-2">
                          <tr><td className="p-4 font-medium text-white">تربة وشاحية غنية</td><td className="p-4 font-mono">9.18</td><td className="p-4 font-mono gn-gold font-bold">0.09%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تربة صحراوية داكنة</td><td className="p-4 font-mono">6,637.48</td><td className="p-4 font-mono gn-gold font-bold">65.93%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تربة الرواسب النهرية</td><td className="p-4 font-mono">2,767.28</td><td className="p-4 font-mono gn-gold font-bold">27.49%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تربة صخرية</td><td className="p-4 font-mono">653.71</td><td className="p-4 font-mono gn-gold font-bold">6.49%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                      <h5 className="text-sm font-semibold text-white text-center">توزيع نسب أنواع التربة</h5>
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#ef4444 0% 65.93%, #84cc16 65.93% 93.42%, #a855f7 93.42% 99.91%, #38bdf8 99.91% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[10px] gn-muted">الإجمالي</span>
                          <span className="text-xs font-bold text-white">100%</span>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 ml-1"></span>تربة صحراوية داكنة: <b className="gn-gold">65.93%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500 ml-1"></span>تربة الرواسب النهرية: <b className="gn-gold">27.49%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 ml-1"></span>تربة صخرية: <b className="gn-gold">6.49%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 ml-1"></span>تربة وشاحية غنية: <b className="gn-gold">0.09%</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن الرابع */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaSun className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الرابع • معيار مناخي أساسي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة الإشعاع الشمسي (Solar Radiation)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map4.jpg" alt="خريطة الإشعاع الشمسي" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 4: التوزيع المكاني لمعدلات الإشعاع الشمسي (kWh/m²/day)</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة التوزيع المكاني لمعدلات الإشعاع الشمسي بمحافظة سوهاج، بوحدة كيلووات ساعة لكل متر مربع يوميًا (kWh/m²/day). وتكشف عن وجود تباين مكاني، حيث تظهر القيم الأعلى في الأجزاء الشمالية والشمالية الشرقية.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        يُعد الإشعاع الشمسي من أهم معايير اختيار مواقع محطات الطاقة الشمسية، إذ تزداد ملاءمة المواقع كلما ارتفعت كمية الإشعاع الشمسي المتاحة لزيادة كفاءة إنتاج الكهرباء.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن الخامس */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaTemperatureHigh className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الخامس • معيار مناخي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة درجة حرارة الهواء (Air Temperature)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map5.jpg" alt="خريطة درجة حرارة الهواء" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 5: التوزيع المكاني لمتوسط درجات حرارة الهواء (°C)</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تتراوح القيم الظاهرة تقريبًا بين 22 و26 درجة مئوية. يظهر انخفاض نسبي في درجات الحرارة بالأجزاء الشمالية والشمالية الشرقية، بينما ترتفع في الأجزاء الجنوبية والوسطى.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تؤثر درجة حرارة البيئة المحيطة في كفاءة الألواح الشمسية، إذ تؤدي درجات الحرارة المرتفعة للخلية عادةً إلى انخفاض كفاءتها الكهربائية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن السادس */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaTint className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن السادس • معيار مناخي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة الرطوبة النسبية (Relative Humidity)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map6.jpg" alt="خريطة الرطوبة النسبية" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 6: التوزيع المكاني لمعدلات الرطوبة النسبية (%)</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تتراوح القيم تقريبًا بين 29% و36%، وترتفع نسبيًا في الأجزاء الشمالية والشمالية الغربية بينما تنخفض باتجاه الجنوب والجنوب الشرقي.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تُستخدم لتقييم الظروف الجوية والبيئة التشغيلية المحيطة بالمحطات الشمسية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن السابع */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaMountain className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن السابع • معيار جيولوجي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة التكوينات الجيولوجية (Geology)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map7.jpg" alt="خريطة التكوينات الجيولوجية" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 7: التوزيع المكاني للتكوينات الجيولوجية بمحافظة سوهاج</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة التوزيع المكاني للتكوينات الجيولوجية بمحافظة سوهاج، حيث تظهر مجموعة متنوعة من الوحدات الجيولوجية التي تختلف في أعمارها وخصائصها، ومن أبرزها تكوينات عصر الإيوسين، ورواسب النيل، والرواسب الرباعية غير المميزة، والتكوينات البركانية، بالإضافة إلى بعض الرواسب والتكوينات الأحدث.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تساعد دراسة التكوينات الجيولوجية في التعرف على طبيعة الأساس الأرضي للمواقع المرشحة، وتقييم الخصائص الجيولوجية ومدى ملاءمتها لأعمال الإنشاء والتثبيت.
                      </p>
                    </div>
                  </div>
                </div>

                {/* الجدول والرسم البياني للسكشن 7 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="gn-display text-lg font-semibold text-white flex items-center gap-2"><FaTable className="gn-gold" /> جدول التكوينات الجيولوجية بمحافظة سوهاج</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/10 text-gold border-b border-white/10 text-sm">
                            <th className="p-4 font-semibold">التكوين الجيولوجي</th>
                            <th className="p-4 font-semibold">المساحة (كم²)</th>
                            <th className="p-4 font-semibold">النسبة (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm gn-text-2">
                          <tr><td className="p-4 font-medium text-white">تكوينات العصر الرباعي (Quaternary)</td><td className="p-4 font-mono">4,821.15</td><td className="p-4 font-mono gn-gold font-bold">47.88%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تكوينات الإيوسين (Eocene Limestone)</td><td className="p-4 font-mono">4,112.50</td><td className="p-4 font-mono gn-gold font-bold">40.85%</td></tr>
                          <tr><td className="p-4 font-medium text-white">رواسب وادي النيل الحديثة</td><td className="p-4 font-mono">985.20</td><td className="p-4 font-mono gn-gold font-bold">9.78%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تكوينات وصخور أخرى</td><td className="p-4 font-mono">148.80</td><td className="p-4 font-mono gn-gold font-bold">1.49%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                      <h5 className="text-sm font-semibold text-white text-center">توزيع التكوينات الجيولوجية</h5>
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#10b981 0% 47.88%, #3b82f6 47.88% 88.73%, #f59e0b 88.73% 98.51%, #ef4444 98.51% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[10px] gn-muted">الإجمالي</span>
                          <span className="text-xs font-bold text-white">100%</span>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1"></span>العصر الرباعي: <b className="gn-gold">47.88%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 ml-1"></span>تكوينات الإيوسين: <b className="gn-gold">40.85%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-1"></span>رواسب النيل: <b className="gn-gold">9.78%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ml-1"></span>صخور أخرى: <b className="gn-gold">1.49%</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن الثامن */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaRoad className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الثامن • معيار البنية الأساسية</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة شبكة الطرق (Road Networks)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map8.jpg" alt="خريطة شبكة الطرق" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 8: التوزيع المكاني لشبكة الطرق الرئيسية والفرعية بمحافظة سوهاج</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تستعرض الخريطة توزيع شبكة الطرق التي تخدم محافظة سوهاج، وتشمل الطرق الرئيسية السريعة وطرق الربط بين المراكز والقرى، والتركز الواضح لمحاور النقل حول شريط وادي النيل والظهير الصحراوي.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        يُعد القرب من شبكة الطرق ركيزة أساسية لتسهيل حركة نقل المعدات الثقيلة، الألواح الشمسية، ومستلزمات الإنشاءات، فضلاً عن ضمان سهولة الوصول لأعمال التشغيل والصيانة الدورية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* الجدول والرسم البياني للسكشن 8 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="gn-display text-lg font-semibold text-white flex items-center gap-2"><FaTable className="gn-gold" /> جدول توزيع درجات القرب من الطرق</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/10 text-gold border-b border-white/10 text-sm">
                            <th className="p-4 font-semibold">فئة المسافة عن الطرق</th>
                            <th className="p-4 font-semibold">المساحة (كم²)</th>
                            <th className="p-4 font-semibold">النسبة (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm gn-text-2">
                          <tr><td className="p-4 font-medium text-white">قريب جداً (أقل من 2 كم)</td><td className="p-4 font-mono">3,850.40</td><td className="p-4 font-mono gn-gold font-bold">38.24%</td></tr>
                          <tr><td className="p-4 font-medium text-white">قريب (2 - 5 كم)</td><td className="p-4 font-mono">3,120.10</td><td className="p-4 font-mono gn-gold font-bold">30.99%</td></tr>
                          <tr><td className="p-4 font-medium text-white">متوسط البعد (5 - 10 كم)</td><td className="p-4 font-mono">2,140.60</td><td className="p-4 font-mono gn-gold font-bold">21.26%</td></tr>
                          <tr><td className="p-4 font-medium text-white">بعيد (أكثر من 10 كم)</td><td className="p-4 font-mono">956.55</td><td className="p-4 font-mono gn-gold font-bold">9.51%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                      <h5 className="text-sm font-semibold text-white text-center">توزيع القرب من شبكة الطرق</h5>
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#10b981 0% 38.24%, #2fd3b4 38.24% 69.23%, #f59e0b 69.23% 90.49%, #ef4444 90.49% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[10px] gn-muted">الإجمالي</span>
                          <span className="text-xs font-bold text-white">100%</span>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1"></span>أقل من 2 كم: <b className="gn-gold">38.24%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 ml-1"></span>2 - 5 كم: <b className="gn-gold">30.99%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-1"></span>5 - 10 كم: <b className="gn-gold">21.26%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ml-1"></span>أكثر من 10 كم: <b className="gn-gold">9.51%</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن التاسع */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaBolt className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن التاسع • معيار البنية الأساسية الكهربائية</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة خطوط النقل الكهربائي (Power Lines)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map9.jpg" alt="خريطة خطوط النقل الكهربائي" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 9: مسارات ومحطات خطوط النقل الكهربائي والجهد العالي</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة مسارات شبكات نقل الطاقة الكهربائية وخطوط الجهد العالي ومحطات المحولات القائمة داخل النطاق الجغرافي للمحافظة والظهير الصحراوي المرتبط بها.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تحديد المسافات الفاصلة لربط محطات الطاقة الشمسية المقترحة بالشبكة القومية بكفاءة عالية، وتقليل الفقد الكهربائي وتكاليف مد خطوط الربط الفرعية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* الجدول والرسم البياني للسكشن 9 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="gn-display text-lg font-semibold text-white flex items-center gap-2"><FaTable className="gn-gold" /> جدول القرب من شبكات الجهد العالي</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/10 text-gold border-b border-white/10 text-sm">
                            <th className="p-4 font-semibold">فئة المسافة عن خطوط الكهرباء</th>
                            <th className="p-4 font-semibold">المساحة (كم²)</th>
                            <th className="p-4 font-semibold">النسبة (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm gn-text-2">
                          <tr><td className="p-4 font-medium text-white">مباشر / مثالي (أقل من 3 كم)</td><td className="p-4 font-mono">4,120.30</td><td className="p-4 font-mono gn-gold font-bold">40.92%</td></tr>
                          <tr><td className="p-4 font-medium text-white">ملائم (3 - 8 كم)</td><td className="p-4 font-mono">3,450.80</td><td className="p-4 font-mono gn-gold font-bold">34.28%</td></tr>
                          <tr><td className="p-4 font-medium text-white">متوسط (8 - 15 كم)</td><td className="p-4 font-mono">1,820.40</td><td className="p-4 font-mono gn-gold font-bold">18.08%</td></tr>
                          <tr><td className="p-4 font-medium text-white">بعيد (أكثر من 15 كم)</td><td className="p-4 font-mono">676.15</td><td className="p-4 font-mono gn-gold font-bold">6.72%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                      <h5 className="text-sm font-semibold text-white text-center">توزيع القرب من خطوط الكهرباء</h5>
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#10b981 0% 40.92%, #3b82f6 40.92% 75.20%, #f59e0b 75.20% 93.28%, #ef4444 93.28% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[10px] gn-muted">الإجمالي</span>
                          <span className="text-xs font-bold text-white">100%</span>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1"></span>أقل من 3 كم: <b className="gn-gold">40.92%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 ml-1"></span>3 - 8 كم: <b className="gn-gold">34.28%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-1"></span>8 - 15 كم: <b className="gn-gold">18.08%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ml-1"></span>أكثر من 15 كم: <b className="gn-gold">6.72%</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن العاشر */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaMountain className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن العاشر • معيار طبوغرافي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة درجات الانحدار والتضاريس (Slope & Topography)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map10.jpg" alt="خريطة درجات الانحدار والتضاريس" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 10: التوزيع المكاني لدرجات الانحدار والخصائص الطبوغرافية</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تعرض الخريطة التباين في زوايا الانحدار السطحي لمحافظة سوهاج، حيث تتميز المناطق الصحراوية عموماً باستواء نسبي يتخلله بعض المنحدرات الحادة عند حواف الهضاب ومجاري الأودية.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تُعد الانحدارات الضعيفة والمستوية عوامل رئيسية لاختيار مواقع الألواح الشمسية لتقليل أعمال الحفر والتسوية الباهظة وضمان ثبات الهياكل المعدنية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* السكشن الحادي عشر */}
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                <div className="flex items-center gap-3">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaLayerGroup className="w-6 h-6" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن الحادي عشر • معيار بيئي وتنموي</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">خريطة استخدامات الأراضي (Land Use / Land Cover)</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map11.jpg" alt="خريطة استخدامات الأراضي" className="w-full h-auto object-contain rounded-xl max-h-[450px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 11: التصنيف الجغرافي لأنماط استخدامات الأراضي والغطاء الأرضي</div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="gn-display text-lg font-semibold gn-gold">النبذة والتحليل</h3>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        توضح الخريطة الفئات الرئيسية لاستخدامات الأراضي في المحافظة، وتصنيف الأراضي الزراعية، التجمعات العمرانية، الأراضي العارية، والظهير الصحراوي غير المستغل.
                      </p>
                      <h4 className="gn-display text-md font-semibold gn-gold pt-2">أهمية الخريطة للمشروع</h4>
                      <p className="gn-text-2 leading-relaxed text-sm md:text-base">
                        تتيح استبعاد المناطق العمرانية والأراضي الزراعية عالية الإنتاجية وتوجيه الاستثمارات نحو الأراضي الصحراوية الشاسعة غير المستغلة بما يحقق استدامة الموارد البيئية.
                      </p>
                    </div>
                  </div>
                </div>

                {/* الجدول والرسم البياني للسكشن 11 */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="gn-display text-lg font-semibold text-white flex items-center gap-2"><FaTable className="gn-gold" /> جدول استخدامات الأراضي والغطاء الأرضي</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/10 text-gold border-b border-white/10 text-sm">
                            <th className="p-4 font-semibold">فئة استخدام الأراضي</th>
                            <th className="p-4 font-semibold">المساحة (كم²)</th>
                            <th className="p-4 font-semibold">النسبة (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm gn-text-2">
                          <tr><td className="p-4 font-medium text-white">أراضي صحراوية غير مستغلة (مثالية)</td><td className="p-4 font-mono">6,820.50</td><td className="p-4 font-mono gn-gold font-bold">67.74%</td></tr>
                          <tr><td className="p-4 font-medium text-white">أراضي زراعية (مستبعدة)</td><td className="p-4 font-mono">2,310.20</td><td className="p-4 font-mono gn-gold font-bold">22.95%</td></tr>
                          <tr><td className="p-4 font-medium text-white">تجمعات كتل عمرانية (مستبعدة)</td><td className="p-4 font-mono">710.80</td><td className="p-4 font-mono gn-gold font-bold">7.06%</td></tr>
                          <tr><td className="p-4 font-medium text-white">مسطحات مائية ومجاري نهرية</td><td className="p-4 font-mono">226.15</td><td className="p-4 font-mono gn-gold font-bold">2.25%</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                      <h5 className="text-sm font-semibold text-white text-center">توزيع فئات الغطاء الأرضي</h5>
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#10b981 0% 67.74%, #84cc16 67.74% 90.69%, #ef4444 90.69% 97.75%, #38bdf8 97.75% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[10px] gn-muted">الإجمالي</span>
                          <span className="text-xs font-bold text-white">100%</span>
                        </div>
                      </div>
                      <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1"></span>أراضي صحراوية: <b className="gn-gold">67.74%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-500 ml-1"></span>أراضي زراعية: <b className="gn-gold">22.95%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ml-1"></span>كتل عمرانية: <b className="gn-gold">7.06%</b></p>
                        <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 ml-1"></span>مسطحات مائية: <b className="gn-gold">2.25%</b></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* الصفحة الفرعية الثانية: تحليل البيانات والنتائج النهائية */}
          {currentView === 'analysis-results' && (
            <div className="space-y-16 animate-fade-in py-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="gn-gold text-sm font-semibold">مخرجات النمذجة الجيومكانية</span>
                  <h1 className="gn-display text-3xl font-semibold text-white mt-1">تحليل البيانات والنتائج النهائية</h1>
                </div>
              </div>

              <div className="space-y-12">
                {combinedAnalysisSections.map((sec) => (
                  <div key={sec.sectionId} className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/30">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaChartBar className="w-5 h-5" /></div>
                      <div>
                        <span className="gn-gold text-xs font-bold uppercase tracking-wider">السكشن {sec.sectionId}</span>
                        <h2 className="gn-display text-2xl font-semibold text-white">{sec.title}</h2>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      {sec.maps.map((item) => (
                        <div key={item.id} className="gn-cell p-6 rounded-2xl space-y-5 border border-white/10 flex flex-col justify-between">
                          <div className="space-y-4">
                            <h3 className="gn-display text-lg font-semibold text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#e9c98a] inline-block"></span>
                              {item.title}
                            </h3>
                            <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/20 bg-black/40 p-2 shadow-xl">
                              <img src={item.img} alt={item.title} className="w-full h-auto object-contain rounded-xl max-h-[320px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              <div className="text-center p-2 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة {item.id}</div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="gn-display text-xs font-bold gn-gold uppercase tracking-wide">النبذة والتحليل</h4>
                              <p className="gn-text-2 text-sm leading-relaxed">{item.description}</p>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <h4 className="gn-display text-xs font-bold gn-gold uppercase tracking-wide">أهمية الخريطة للمشروع</h4>
                              <p className="gn-text-2 text-sm leading-relaxed">{item.importance}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-4">
                <div className="border-b border-white/10 pb-4">
                  <h2 className="gn-display text-2xl font-semibold text-white">الطبقات والمعايير التحليلية المتبقية</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {individualAnalysisMaps.map((item) => (
                    <div key={item.id} className="gn-card p-6 md:p-8 rounded-3xl space-y-6 border border-[#e9c98a]/30 flex flex-col justify-between gn-card-hover">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="gn-icon-box p-3 rounded-2xl"><FaChartBar className="w-5 h-5" /></div>
                          <div>
                            <span className="gn-gold text-xs font-bold uppercase tracking-wider block">السكشن {item.id}</span>
                            <h3 className="gn-display text-xl font-semibold text-white">{item.title}</h3>
                          </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                          <img src={item.img} alt={item.title} className="w-full h-auto object-contain rounded-xl max-h-[380px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                          <div className="text-center p-2 text-xs gn-muted border-t border-white/10 mt-2">📍 {item.title}</div>
                        </div>
                        <div className="space-y-3 pt-2">
                          <h4 className="gn-display text-sm font-semibold gn-gold">النبذة والتحليل</h4>
                          <p className="gn-text-2 text-sm leading-relaxed">{item.description}</p>
                        </div>
                        <div className="space-y-2 pt-1 border-t border-white/5">
                          <h5 className="gn-display text-sm font-semibold gn-gold">أهمية الخريطة للمشروع</h5>
                          <p className="gn-text-2 text-sm leading-relaxed">{item.importance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* الناتج النهائي */}
          {currentView === 'final-result' && (
            <div className="space-y-12 animate-fade-in py-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="gn-gold text-sm font-semibold">مخرجات التراكب الموزون (Weighted Overlay)</span>
                  <h1 className="gn-display text-3xl font-semibold text-white mt-1">الناتج النهائي: خريطة الملاءمة المكانية النهائية</h1>
                </div>
              </div>
              <div className="gn-card p-8 md:p-10 rounded-3xl space-y-8 border border-[#e9c98a]/40 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="gn-icon-box p-3 rounded-2xl"><FaFlagCheckered className="w-6 h-6 text-[#e9c98a]" /></div>
                  <div>
                    <span className="gn-gold text-xs font-bold uppercase tracking-wider">النتائج النهائية للمشروع</span>
                    <h2 className="gn-display text-2xl font-semibold text-white">تحليل خريطة الملاءمة المكانية النهائية لاختيار مواقع مزارع الطاقة الشمسية بمحافظة سوهاج</h2>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                    <img src="/map26.jpg" alt="خريطة الملاءمة المكانية النهائية" className="w-full h-auto object-contain rounded-xl max-h-[500px] mx-auto" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">📍 خريطة 26: التوزيع الجغرافي لدرجات الملاءمة المكانية النهائية بمحافظة سوهاج</div>
                  </div>
                  <div className="space-y-4 gn-text-2 text-sm md:text-base leading-relaxed">
                    <p>توضح الخريطة التوزيع الجغرافي لدرجات الملاءمة المكانية لإنشاء مزارع الطاقة الشمسية بمحافظة سوهاج، وذلك بعد دمج مختلف المعايير الطبيعية والبشرية باستخدام أسلوب التراكب الموزون (<span className="gn-gold font-semibold">Weighted Overlay</span>)، بهدف تحديد أنسب المواقع من الناحية الجغرافية والبيئية والفنية لإقامة مشروعات الطاقة الشمسية.</p>
                    <p>وتكشف الخريطة عن وجود تباين مكاني واضح في درجات الملاءمة داخل منطقة الدراسة، حيث تتركز المناطق ذات الملاءمة العالية جدًا باللون الأخضر الداكن في مساحات واسعة من الأجزاء الشمالية والوسطى والغربية، وتمتد في بعض المواقع نحو الجنوب، وقد بلغت المساحة الإجمالية لهذه الفئة <span className="gn-gold font-bold text-base">2,177 كم²</span>، وهو ما يعكس وجود نطاقات جغرافية واسعة تمتلك مقومات مناسبة لإقامة مزارع الطاقة الشمسية.</p>
                    <p>كما تظهر المناطق الملائمة باللون الأخضر الفاتح في أجزاء متفرقة من المنطقة، بينما تنتشر المناطق متوسطة الملاءمة باللون الأصفر، وتظهر المناطق غير الملائمة باللون البرتقالي، في حين تتركز المناطق ذات الملاءمة المنخفضة جدًا باللون الأحمر في بعض النطاقات الشرقية والجنوبية.</p>
                    <p className="bg-[#e9c98a]/10 p-4 rounded-2xl border border-[#e9c98a]/20 text-white font-medium">وبوجه عام، توضح النتائج أن محافظة سوهاج تمتلك مساحات واسعة قابلة للترشيح لإقامة مشروعات الطاقة الشمسية، مع إعطاء الأولوية للمناطق التي حققت أعلى درجات الملاءمة، والتي بلغت مساحتها <span className="gn-gold font-bold">2,177 كم²</span>، باعتبارها النطاقات الأكثر ملاءمة وفقًا لمعايير الدراسة والتحليل المكاني.</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 space-y-10">
                  {/* الجدول الأول */}
                  <div className="space-y-4">
                    <h3 className="gn-display text-xl font-semibold text-white flex items-center gap-2">
                      <FaTable className="gn-gold" /> الجدول الأول: جدول الأوزان النسبية للمعايير (Weighted Criteria)
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-[#e9c98a]/15 text-gold border-b border-white/10 text-sm md:text-base">
                            <th className="p-4 font-bold">المعيار (Criteria)</th>
                            <th className="p-4 font-bold text-center">الوزن النسبي (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm md:text-base gn-text-2">
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">الإشعاع الشمسي</td><td className="p-4 text-center font-mono font-bold gn-gold">22%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">خطوط الكهرباء الجهد العالي</td><td className="p-4 text-center font-mono font-bold gn-gold">14%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">الطرق الرئيسية</td><td className="p-4 text-center font-mono font-bold gn-gold">10%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">المخاطر الطبيعية (مخرات السيول والأودية)</td><td className="p-4 text-center font-mono font-bold gn-gold">6%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">الانحدار</td><td className="p-4 text-center font-mono font-bold gn-gold">8%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">الارتفاعات</td><td className="p-4 text-center font-mono font-bold gn-gold">5%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">متوسط درجات الحرارة</td><td className="p-4 text-center font-mono font-bold gn-gold">4%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">الرطوبة النسبية</td><td className="p-4 text-center font-mono font-bold gn-gold">4%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">المحميات الطبيعية</td><td className="p-4 text-center font-mono font-bold gn-gold">5%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">استخدام الأرض</td><td className="p-4 text-center font-mono font-bold gn-gold">7%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">التربة</td><td className="p-4 text-center font-mono font-bold gn-gold">8%</td></tr>
                          <tr className="hover:bg-white/5 transition-colors"><td className="p-4 font-medium text-white">التركيب الجيولوجي</td><td className="p-4 text-center font-mono font-bold gn-gold">7%</td></tr>
                          <tr className="bg-[#e9c98a]/10 font-bold text-white border-t border-[#e9c98a]/30">
                            <td className="p-4">الإجمالي النهائي الأخير</td>
                            <td className="p-4 text-center font-mono text-lg gn-gold">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* الجدول الثاني + الرسم الدائري */}
                  <div className="space-y-4">
                    <h3 className="gn-display text-xl font-semibold text-white flex items-center gap-2">
                      <FaChartPie className="gn-gold" /> الجدول الثاني: جدول درجات الملاءمة المكانية والنسب المئوية
                    </h3>
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                      <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                        <table className="w-full text-right border-collapse">
                          <thead>
                            <tr className="bg-[#e9c98a]/15 text-gold border-b border-white/10 text-sm md:text-base">
                              <th className="p-4 font-bold">الفئة (Suitability Class)</th>
                              <th className="p-4 font-bold text-center">المساحة (كم²)</th>
                              <th className="p-4 font-bold text-center">النسبة (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm md:text-base gn-text-2">
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-800"></span> Unsuitable (غير ملائم)</td>
                              <td className="p-4 text-center font-mono">1,198</td>
                              <td className="p-4 text-center font-mono font-bold gn-gold">12.03%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Low Suitability (ملاءمة منخفضة جداً)</td>
                              <td className="p-4 text-center font-mono">1,973</td>
                              <td className="p-4 text-center font-mono font-bold gn-gold">19.81%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Moderate Suitability (متوسط الملاءمة)</td>
                              <td className="p-4 text-center font-mono">3,231</td>
                              <td className="p-4 text-center font-mono font-bold gn-gold">32.43%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> High Suitability (ملائم)</td>
                              <td className="p-4 text-center font-mono">1,383</td>
                              <td className="p-4 text-center font-mono font-bold gn-gold">13.89%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="p-4 font-medium text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-800"></span> Most Suitable (أعلى ملاءمة / ممتاز)</td>
                              <td className="p-4 text-center font-mono font-bold text-emerald-400">2,177</td>
                              <td className="p-4 text-center font-mono font-bold gn-gold">21.84%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center">
                        <h5 className="text-sm font-semibold text-white text-center">توزيع درجات الملاءمة النهائية</h5>
                        <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'conic-gradient(#991b1b 0% 12.03%, #ef4444 12.03% 31.84%, #facc15 31.84% 64.27%, #34d399 64.27% 78.16%, #065f46 78.16% 100%)' }}>
                          <div className="absolute w-28 h-28 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                            <span className="text-[10px] gn-muted">الإجمالي</span>
                            <span className="text-sm font-bold text-white">100%</span>
                          </div>
                        </div>
                        <div className="text-[11px] space-y-1 text-right w-full pt-2 border-t border-white/10">
                          <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-800 ml-1"></span>أعلى ملاءمة: <b className="gn-gold">21.84%</b></p>
                          <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1"></span>ملائم: <b className="gn-gold">13.89%</b></p>
                          <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 ml-1"></span>متوسط: <b className="gn-gold">32.43%</b></p>
                          <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 ml-1"></span>منخفض جداً: <b className="gn-gold">19.81%</b></p>
                          <p className="text-white"><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-800 ml-1"></span>غير ملائم: <b className="gn-gold">12.03%</b></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* الصفحة الرئيسية */}
          {currentView === 'home' && (
            <>
              <section id="about" className="space-y-10 scroll-mt-24">
                <div className="gn-card relative text-center py-20 px-6 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c9974a]/20 blur-[120px] rounded-full pointer-events-none"></div>
                  <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#2fd3b4]/10 blur-[110px] rounded-full pointer-events-none"></div>
                  <div className="absolute top-0 inset-x-16 h-px bg-gradient-to-r from-transparent via-[#e9c98a]/70 to-transparent pointer-events-none"></div>

                  <span className="gn-chip relative inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                    مشروع تخرج كلية الآداب - جامعة سوهاج
                  </span>

                  <h1 className="gn-display relative text-3xl md:text-5xl font-semibold leading-tight text-white mb-6">
                    النمذجة الجيومكانية لاختيار المواقع المثلى لمزارع الطاقة الشمسية <span className="gn-gold-text">بمحافظة سوهاج</span>
                  </h1>
                  <p className="relative gn-text-2 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
                    بالاعتماد على تقنيات الاستشعار عن بعد ونظم المعلومات الجغرافية (GIS) لدعم اتخاذ القرار وتحقيق التنمية المستدامة.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="gn-card p-8 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="gn-icon-box p-3 rounded-2xl w-fit"><FaLayerGroup className="w-7 h-7" /></div>
                    <h3 className="gn-display text-xl font-semibold text-white">المعايير المدروسة</h3>
                    <p className="gn-text-2 text-sm leading-relaxed">يعتمد المشروع على دراسة وتحليل مجموعة شاملة من المعايير تشمل الإشعاع الشمسي، درجات الحرارة، الرطوبة، التضاريس، التربة، الجيولوجيا، شبكات الطرق، خطوط الجهد العالي، الأودية، واستخدامات الأراضي.</p>
                  </div>
                  <div className="gn-card p-8 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="gn-icon-box p-3 rounded-2xl w-fit"><FaCogs className="w-7 h-7" /></div>
                    <h3 className="gn-display text-xl font-semibold text-white">منهجية العمل والتحليل</h3>
                    <p className="gn-text-2 text-sm leading-relaxed">استخدام أدوات التحليل المكاني، وإعادة تصنيف البيانات، وتحليل المسافات، وتحديد الأوزان النسبية للمعايير، مع تطبيق أسلوب التراكب الموزون للوصول لخريطة درجات الملاءمة المكانية بدقة عالية.</p>
                  </div>
                  <div className="gn-card p-8 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="gn-icon-box p-3 rounded-2xl w-fit"><FaLeaf className="w-7 h-7" /></div>
                    <h3 className="gn-display text-xl font-semibold text-white">أهداف ورؤية التنمية</h3>
                    <p className="gn-text-2 text-sm leading-relaxed">تقديم رؤية جغرافية متكاملة لدعم اتخاذ القرار، واستغلال الموارد الطبيعية المتاحة بمحافظة سوهاج، وتشجيع التوسع في استخدام مصادر الطاقة المتجددة بما يتماشى مع توجهات الدولة للتنمية المستدامة.</p>
                  </div>
                </div>
              </section>

              <section id="data-analysis" className="space-y-8 scroll-mt-24">
                <div className="grid md:grid-cols-3 gap-6">
                  <div onClick={() => setCurrentView('spatial-data')} className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaDatabase className="w-8 h-8" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white mb-3">طبقات البيانات المكانية والتحليلية</h2>
                    <p className="gn-muted">استعرض طبقات البيانات المكانية الأساسية والجداول والنسب المئوية للسكاشن (من 1 إلى 11).</p>
                  </div>

                  <div onClick={() => setCurrentView('analysis-results')} className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaChartBar className="w-8 h-8" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white mb-3">تحليل البيانات والنتائج النهائية</h2>
                    <p className="gn-muted">انتقل لاستعراض مخرجات التحليل المكاني والخرائط بعد إعادة التصنيف.</p>
                  </div>

                  <div onClick={() => setCurrentView('final-result')} className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaFlagCheckered className="w-8 h-8" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white mb-3">الناتج النهائي (Weighted Overlay)</h2>
                    <p className="gn-muted">خريطة الملاءمة المكانية النهائية وجداول الأوزان والنسب.</p>
                  </div>
                </div>

                {/* الخريطة التفاعلية بالـ 7 شيك بوكس */}
                <div className="gn-card rounded-3xl p-6 space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="gn-display text-xl font-semibold gn-gold flex items-center gap-2">
                      <FaMapMarkerAlt className="w-6 h-6" /> الخريطة التفاعلية لطبقات الملاءمة في محافظة سوهاج
                    </h3>

                  </div>

                  <div className="grid lg:grid-cols-[1fr_260px] gap-4">
                    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-[#e9c98a]/25 relative z-0 shadow-2xl">
                      <MapContainer center={[26.5569, 31.6948]} zoom={9} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-dark-tiles" />

                        <MapClickHandler onMapClick={(e) => {
                          const { lat, lng } = e.latlng;
                          const randomSuitability = ["🌟 أعلى ملائمة - موقع مثالي للمشروع", "⚡ متوسط الملائمة - صالحة مع معالجة", "📍 منطقة ملائمة للطاقة الشمسية"][Math.floor(Math.random() * 3)];
                          setClickedMarkers([{ lat, lng, text: randomSuitability }]);
                        }} />
                        {clickedMarkers.map((m, idx) => (
                          <Marker key={idx} position={[m.lat, m.lng]}>
                            <Popup className="gn-popup">
                              <div className="text-right dir-rtl p-2">
                                <p className="font-bold text-sm mb-1" style={{ color: '#e9c98a' }}>مركز محافظة سوهاج</p>
                                <p className="text-xs font-semibold" style={{ color: '#ecefe9' }}>{m.text}</p>
                              </div>
                            </Popup>
                          </Marker>
                        ))}

                        {/* الأساسية */}
                        {showHigh && highData && <GeoJSON key={`high-${showHigh}`} data={highData} style={() => ({ color: '#1b7f24', weight: 1, fillColor: '#1b7f24', fillOpacity: 0.65 })} />}
                        {showMedium && mediumData && <GeoJSON key={`medium-${showMedium}`} data={mediumData} style={() => ({ color: '#f7e906', weight: 1, fillColor: '#f7e906', fillOpacity: 0.6 })} />}
                        {showNormal && normalData && <GeoJSON key={`normal-${showNormal}`} data={normalData} style={() => ({ color: '#a3e635', weight: 1, fillColor: '#a3e635', fillOpacity: 0.5 })} />}

                        {/* جهينة */}
                        {showJuhayna && juhaynaStation && <GeoJSON key={`juhayna-st-${showJuhayna}`} data={juhaynaStation} style={() => ({ color: '#2d8e39', weight: 2, fillColor: '#2d8e39', fillOpacity: 0.55 })} />}
                        {showJuhayna && juhaynaRoad && <GeoJSON key={`juhayna-rd-${showJuhayna}`} data={juhaynaRoad} style={() => ({ color: '#fbbf24', weight: 3 })} />}
                        {showJuhayna && juhaynaConnection && <GeoJSON key={`juhayna-ln-${showJuhayna}`} data={juhaynaConnection} style={() => ({ color: '#f97316', weight: 3, dashArray: '8 4' })} />}

                        {/* طما */}
                        {showTama && tamaStation && <GeoJSON key={`tama-st-${showTama}`} data={tamaStation} style={() => ({ color: '#30ba22', weight: 2, fillColor: '#30ba22', fillOpacity: 0.55 })} />}
                        {showTama && tamaRoad && <GeoJSON key={`tama-rd-${showTama}`} data={tamaRoad} style={() => ({ color: '#f59e0b', weight: 3 })} />}
                        {showTama && tamaLine66 && <GeoJSON key={`tama-66-${showTama}`} data={tamaLine66} style={() => ({ color: '#3b82f6', weight: 3, dashArray: '6 4' })} />}
                        {showTama && tamaLine500 && <GeoJSON key={`tama-500-${showTama}`} data={tamaLine500} style={() => ({ color: '#ec4899', weight: 3, dashArray: '10 5' })} />}

                        {/* شمال شرق سوهاج */}
                        {showSohagNE && sohagNEStation && <GeoJSON key={`sohag-${showSohagNE}`} data={sohagNEStation} style={() => ({ color: '#2cd428', weight: 2, fillColor: '#2cd428', fillOpacity: 0.55 })} />}

                        {/* أخميم */}
                        {showAkhmim && akhmimStation && <GeoJSON key={`akhmim-st-${showAkhmim}`} data={akhmimStation} style={() => ({ color: '#2f8e2d', weight: 2, fillColor: '#2f8e2d', fillOpacity: 0.55 })} />}
                        {showAkhmim && akhmimRoad && <GeoJSON key={`akhmim-rd-${showAkhmim}`} data={akhmimRoad} style={() => ({ color: '#fbbf24', weight: 3 })} />}

                      </MapContainer>
                    </div>

                    {/* الـ Checkboxes */}
                                      <div className="bg-[#050b0a]/90 border border-[#e9c98a]/40 rounded-2xl p-4 space-y-3 shadow-xl h-[600px] overflow-y-auto">
                    <p className="text-sm gn-gold font-bold border-b border-white/10 pb-2">طبقات الخريطة</p>
                    
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={showHigh} onChange={(e) => setShowHigh(e.target.checked)} className="accent-[#1b7f24]" /> ملائمة عالية</label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={showMedium} onChange={(e) => setShowMedium(e.target.checked)} className="accent-[#f7e906]" /> متوسط الملائمة</label>
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={showNormal} onChange={(e) => setShowNormal(e.target.checked)} className="accent-[#a3e635]" /> ملائم</label>
                    
                    <div className="border-t border-white/10 my-2"></div>

                    {/* محطة جهينة */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={showJuhayna} onChange={(e) => setShowJuhayna(e.target.checked)} className="accent-[#2d8e39]" /> محطة جهينة
                      </label>
                      <a href="/juhayna-report.pdf" download className="text-[#e9c98a] hover:text-white transition-colors" title="تحميل التقرير">
                        <FaDownload className="w-4 h-4" />
                      </a>
                    </div>

                    {/* محطة طما */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={showTama} onChange={(e) => setShowTama(e.target.checked)} className="accent-[#30ba22]" /> محطة طما
                      </label>
                      <a href="/tama-report.pdf" download className="text-[#e9c98a] hover:text-white transition-colors" title="تحميل التقرير">
                        <FaDownload className="w-4 h-4" />
                      </a>
                    </div>

                    {/* شمال شرق سوهاج */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={showSohagNE} onChange={(e) => setShowSohagNE(e.target.checked)} className="accent-[#2cd428]" /> محطة شمال شرق سوهاج
                      </label>
                      <a href="/sohag-report.pdf" download className="text-[#e9c98a] hover:text-white transition-colors" title="تحميل التقرير">
                        <FaDownload className="w-4 h-4" />
                      </a>
                    </div>

                    {/* أخميم */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={showAkhmim} onChange={(e) => setShowAkhmim(e.target.checked)} className="accent-[#2f8e2d]" /> محطة أخميم
                      </label>
                      <a href="/akhmim-report.pdf" download className="text-[#e9c98a] hover:text-white transition-colors" title="تحميل التقرير">
                        <FaDownload className="w-4 h-4" />
                      </a>
                    </div>

                  </div>
                  </div>
                </div>
              </section>

              <section id="optimal-sites" className="space-y-8 scroll-mt-24">
                <div className="text-center space-y-2">
                  <h2 className="gn-display text-3xl font-semibold text-white">المواقع الأكثر ملاءمة للمزارع</h2>
                  <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#e9c98a] to-transparent"></div>
                  <p className="gn-muted pt-2">انقر على أي كارت أدناه لاستعراض رؤية الذكاء الاصطناعي المستقبلية للموقع</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {optimalSitesData.map((site) => (
                    <div
                      key={site.id}
                      onClick={() => setSelectedSiteForAI(site)}
                      className={`gn-card gn-card-hover cursor-pointer rounded-2xl p-4 hover:-translate-y-1 ${selectedSiteForAI.id === site.id ? 'gn-selected' : ''
                        }`}
                    >
                      <div className="relative overflow-hidden rounded-xl h-48 mb-4">
                        <img src={site.imageUrl} alt={site.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050b0a]/80 via-transparent to-transparent pointer-events-none"></div>
                        <span className="absolute top-3 right-3 bg-[#050b0a]/80 backdrop-blur-md border border-[#e9c98a]/70 text-[#e9c98a] font-bold px-3 py-1 rounded-full text-sm">
                          ملاءمة: {site.suitability}%
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3 text-right">{site.title}</h3>
                      <a 
                      href={site.pdfLink} 
                      download
                      onClick={(e) => e.stopPropagation()} 
                      className="w-full mb-3 flex items-center justify-center gap-2 bg-[#e9c98a]/10 hover:bg-[#e9c98a]/20 text-[#e9c98a] border border-[#e9c98a]/30 py-2 rounded-xl transition-colors text-sm font-bold cursor-pointer"
                    >
                      <FaDownload className="w-4 h-4" /> تحميل التقرير (PDF)
                    </a>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="text-right">
                          <p className="text-xs gn-muted">امسح الـ QR للتفاصيل</p>
                          <span className="text-xs gn-gold font-mono">GEONOVA-GIS</span>
                        </div>
                        <div
                          className="p-2 bg-white rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                          title="اضغط هنا لفتح الموقع على خرائط جوجل"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(site.qrLink, '_blank');
                          }}
                        >
                          <QRCodeSVG value={site.qrLink} size={56} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="gn-ai-box relative overflow-hidden p-8 rounded-3xl space-y-4">
                  <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#c9974a]/25 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative flex items-center gap-3 gn-gold">
                    <FaSun className="w-7 h-7" />
                    <h3 className="gn-display text-2xl font-semibold text-white">
                      رؤية الذكاء الاصطناعي المستقبلية: <span className="gn-gold">{selectedSiteForAI.title}</span>
                    </h3>
                  </div>
                  <p className="relative gn-text-2 leading-relaxed text-lg">
                    {selectedSiteForAI.aiInsight}
                  </p>
                  <div className="relative flex items-center gap-2 text-xs gn-muted pt-2 border-t border-white/10">
                    <FaCheckCircle className="w-4 h-4 text-[#2fd3b4]" />
                    <span>تم حساب التوقعات بناءً على نسبة الملاءمة ({selectedSiteForAI.suitability}%) والمعايير البيئية والاقتصادية.</span>
                  </div>
                </div>
              </section>

                                     <section id="gallery" className="scroll-mt-24">
              {/* البرواز الكبير اللي شايل كل حاجة */}
              <div className="gn-card p-8 md:p-12 rounded-3xl space-y-10 shadow-2xl">
                
                {/* العنوان */}
                <div className="text-center space-y-3">
                 
                  <h2 className="gn-display text-3xl md:text-4xl font-semibold text-white">معرض صور المشروع </h2>
                  <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#e9c98a] to-transparent"></div>
                  <p className="gn-muted max-w-2xl mx-auto pt-2">نظرة شاملة على خرائط التحليل الميداني والتفاصيل المكانية للمشروع</p>
                </div>

             
                 {/* شبكة الصور */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {galleryImages
                    .slice(0, showAllImages ? 77 : 5) // لو الزر متداس هيعرض 77، لو لأ هيعرض أول 5 بس
                    .map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setIndex(i)}
                      className="relative aspect-square p-1.5 rounded-2xl bg-gradient-to-br from-[#e9c98a]/20 to-transparent border border-[#e9c98a]/30 shadow-lg group cursor-pointer hover:border-[#e9c98a]/80 hover:shadow-[0_0_20px_rgba(233,201,138,0.3)] transition-all duration-300"
                    >
                      <div className="relative w-full h-full overflow-hidden rounded-xl bg-black/40">
                        <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=صورة'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050b0a]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <span className="text-[#e9c98a] text-xs font-bold bg-[#050b0a]/80 px-3 py-1.5 rounded-full border border-[#e9c98a]/40 backdrop-blur-sm">عرض الصورة</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* مكتبة عرض الصور المكبرة (Lightbox) */}
              <Lightbox
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                slides={galleryImages}
              />
            </section>

              <section id="thanks" className="gn-card relative overflow-hidden p-8 md:p-12 rounded-3xl space-y-8 scroll-mt-24">
                <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[34rem] h-64 bg-[#c9974a]/10 blur-[110px] rounded-full pointer-events-none"></div>
                <div className="relative flex items-center justify-center gap-3 gn-gold">
                  <FaAward className="w-8 h-8" />
                  <h2 className="gn-display text-3xl font-semibold text-white">شكر وتقدير</h2>
                </div>

                <div className="relative gn-text-2 leading-relaxed text-center space-y-4 max-w-4xl mx-auto">
                  <p className="text-lg">
                    يتقدم فريق <span className="gn-gold font-bold">GEONOVA</span> بخالص الشكر وعظيم التقدير إلى السادة أعضاء هيئة التدريس والهيئة المعاونة على دعمهم المستمر وتوجيهاتهم القيّمة.
                  </p>
                </div>

                <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-center font-semibold pt-4">
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">عميد الكلية</p>
                    <p className="text-white">الأستاذ الدكتور / محمد توفيق محمد</p>
                  </div>
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">وكيل الكلية</p>
                    <p className="text-white">الأستاذ الدكتور / محمود السيد مراد</p>
                  </div>
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">أستاذ المقرر</p>
                    <p className="text-white">الأستاذ الدكتور / محمود حجاب</p>
                  </div>
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">منسق البرنامج</p>
                    <p className="text-white">الأستاذ الدكتور / مصطفى خضير</p>
                  </div>
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">أستاذ المقرر</p>
                    <p className="text-white">الدكتورة / سيدة رسلان</p>
                  </div>
                  <div className="gn-cell p-4 rounded-xl">
                    <p className="gn-gold text-sm">الهيئة المعاونة</p>
                    <p className="text-white">الأستاذ / علاء كليب</p>
                  </div>
                </div>

                <div className="relative text-center pt-6 border-t border-white/10 gn-muted text-sm space-y-2">
                  <p className="gn-gold font-bold pt-2">مع خالص الشكر والتقدير والاحترام — فريق مشروع GEONOVA</p>
                </div>
              </section>
            </>
          )}

        </main>

        <footer className="border-t border-white/[0.07] text-center py-6 gn-muted text-xs">
          جميع الحقوق محفوظة &copy; 2026 - منصة GEONOVA لـ الاستشعار عن بعد ونظم المعلومات الجغرافية
        </footer>

      </div>
    </div>
  );
}
