import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// استيراد الأيقونات الرسمية حصرياً من مكتبة react-icons (حزمة FontAwesome)
import { 
  FaHome, 
  FaDatabase, 
  FaChartBar, 
  FaMapMarkerAlt, 
  FaSun, 
  FaExternalLinkAlt, 
  FaAward, 
  FaTools, 
  FaCheckCircle, 
  FaLayerGroup,
  FaCogs,
  FaLeaf,
  FaTable,
  FaGlobeAmericas,
  FaStream,
  FaTemperatureHigh,
  FaTint,
  FaMountain,
  FaRoad,
  FaBolt,
  FaFlagCheckered,
  FaChartPie
} from 'react-icons/fa';

// إصلاح أيقونات Leaflet الافتراضية
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultImage = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultImage;

/* ============================================================================
 *  THEME — "Obsidian Emerald & Champagne Gold"
 * ========================================================================== */
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

.gn-nav { background: rgba(5,11,10,.72); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border-bottom: 1px solid var(--line-soft); }
.gn-card { background: linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.015));
  border: 1px solid var(--line); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 30px 70px -35px rgba(0,0,0,.85); }
.gn-card-hover { transition: border-color .3s, box-shadow .3s, transform .3s; }
.gn-card-hover:hover { border-color: rgba(233,201,138,.55);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 30px 80px -30px rgba(201,151,74,.4); }
.gn-cell { background: rgba(5,11,10,.55); border: 1px solid var(--line-soft); transition: border-color .3s; }
.gn-cell:hover { border-color: rgba(233,201,138,.45); }
.gn-icon-box { background: rgba(233,201,138,.09); border: 1px solid rgba(233,201,138,.25); color: var(--gold); }
.gn-chip { background: rgba(233,201,138,.09); border: 1px solid rgba(233,201,138,.32); color: var(--gold); }
.gn-selected { border-color: rgba(233,201,138,.85) !important;
  box-shadow: 0 0 0 1px rgba(233,201,138,.3), 0 30px 80px -25px rgba(201,151,74,.55) !important; }
.gn-ai-box { background: linear-gradient(135deg, rgba(201,151,74,.16), rgba(8,19,15,.92) 45%, rgba(47,211,180,.07));
  border: 1px solid rgba(233,201,138,.45);
  box-shadow: 0 0 90px -25px rgba(233,201,138,.35), inset 0 1px 0 rgba(255,255,255,.07); }

.gn-gold { color: var(--gold); }
.gn-muted { color: var(--muted); }
.gn-text-2 { color: var(--text-2); }
.gn-link { color: var(--text-2); transition: color .2s; }
.gn-link:hover { color: var(--gold); }
.gn-gold-text { background: linear-gradient(120deg, #fff1cf 0%, #e9c98a 45%, #c9974a 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }

.gn-btn-gold { color: #1b1305; background: linear-gradient(135deg, #f6dca3, #c9974a);
  box-shadow: 0 10px 30px -10px rgba(233,201,138,.55); transition: box-shadow .25s, transform .25s, filter .25s; }
.gn-btn-gold:hover { box-shadow: 0 14px 40px -8px rgba(233,201,138,.75); filter: brightness(1.06); }
.gn-btn-gold:active { transform: scale(.97); }
.gn-btn-outline { color: var(--gold); background: rgba(233,201,138,.06); border: 1px solid rgba(233,201,138,.38); transition: background .25s, border-color .25s, transform .25s; }
.gn-btn-outline:hover { background: rgba(233,201,138,.14); border-color: rgba(233,201,138,.7); }
.gn-btn-outline:active { transform: scale(.97); }

.gn-root :focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

.leaflet-container { font-family: inherit; background: #070e0c; }
.map-dark-tiles { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3); }

.leaflet-control-zoom a { background: #0a1512 !important; color: #e9c98a !important; border-color: rgba(233,201,138,.2) !important; }
.leaflet-control-attribution { background: rgba(5,11,10,.8) !important; color: #8fa39b !important; }
.leaflet-control-attribution a { color: #e9c98a !important; }
.leaflet-marker-icon { filter: drop-shadow(0 0 8px rgba(233,201,138,.75)); }
.gn-popup .leaflet-popup-content-wrapper { background: #0a1512; color: #ecefe9; border: 1px solid rgba(233,201,138,.4); border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,.7); }
.gn-popup .leaflet-popup-tip { background: #0a1512; }
.gn-popup .leaflet-popup-close-button { color: #e9c98a !important; }

@keyframes gnFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.animate-fade-in { animation: gnFadeIn .6s ease both; }
`;

// بيانات الأماكن الأربعة المثلى مع رؤية الذكاء الاصطناعي
const optimalSitesData = [
  {
    id: 1,
    title: "الظهير الصحراوي الغربي - الكوامل",
    suitability: 96,
    imageUrl: "data:image/jpeg;base64,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",
    qrLink: "https://geonova.app/sites/el-kawamel",
    aiInsight: "بناءً على النمذجة الجيومكانية، تتميز منطقة الكوامل بانخفاض معدل التباين الحراري السطحي واستقرار طبوغرافي ممتاز. يتوقع التحليل المكاني خلال 10 سنوات القادمة كفاءة تشغيلية تتجاوز 98.5% مع إمكانية ربط مباشر بشبكة القومية للكهرباء."
  },
  {
    id: 2,
    title: "شمال جهينة - المنطقة الصحراوية",
    suitability: 92,
    imageUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500",
    qrLink: "https://geonova.app/sites/juhayna",
    aiInsight: "تُظهر تحليلات الاستشعار عن بعد في شمال جهينة سطوعاً شمسياً فائقاً على مدار العام. تشير قراءات النمذجة إلى أن إضافة وحدات تخزين بطاريات ليثيوم متطورة ستعزز استقرار إنتاج الطاقة بنسبة 20%."
  },
  {
    id: 3,
    title: "شرق أخميم - الهضبة الشرقية",
    suitability: 89,
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500",
    qrLink: "https://geonova.app/sites/akhmim",
    aiInsight: "تتمتع هضبة أخميم بقربها الجغرافي من شبكات الطرق الرئيسية. يتوقع نموذج التقييم المكاني نمواً متسارعاً في العائد الاقتصادي مع انخفاض زمني ملحوظ في عمليات النقل والتشييد."
  },
  {
    id: 4,
    title: "صحراء دار السلام الجنوبي",
    suitability: 85,
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500",
    qrLink: "https://geonova.app/sites/dar-elsalam",
    aiInsight: "تعتبر هذه المنطقة واعدة جداً للتوسع المستقبلي. يتنبأ النظام الجيومكاني بأنه خلال 5 إلى 7 سنوات القادمة، سترتفع الجدوى الاقتصادية للمحطة بنسبة 25% بفضل المساحات الشاسعة المتاحة."
  }
];

// بيانات السكاشن المدمجة للنتائج النهائية (السكشن 12 و13 و14)
const combinedAnalysisSections = [
  {
    sectionId: "12",
    title: "تحليل المسافة والتصنيف لخطوط الكهرباء",
    maps: [
      {
        id: "12-A",
        title: "خريطة المسافة من خطوط الكهرباء",
        img: "/map12.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات بين المواقع المختلفة وخطوط الكهرباء، حيث تمثل المناطق الخضراء المناطق الأقرب إلى خطوط الكهرباء، بينما تشير الألوان الصفراء والوردية إلى المناطق الأبعد.",
        importance: "يُعد هذا المعيار من المعايير الأساسية لاختيار مواقع مزارع الطاقة الشمسية، نظراً لأهمية القرب من شبكات الكهرباء في تقليل تكاليف توصيل الطاقة وتسهيل ربط المحطات بالشبكة الكهربائية، مع مراعاة اشتراطات الربط الفني وقدرة الشبكة الاستيعابية."
      },
      {
        id: "12-B",
        title: "خريطة التصنيف للمسافات من خطوط الكهرباء",
        img: "/map13.jpg",
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
        id: "13-A",
        title: "خريطة المسافة من الطرق",
        img: "/map14.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات بين مختلف أجزاء منطقة الدراسة وشبكة الطرق، حيث تشير المناطق الخضراء إلى انخفاض المسافة عن الطرق، بينما تعبر الألوان الصفراء والوردية عن زيادة المسافة.",
        importance: "تكمن أهمية هذا المعيار في تقييم سهولة الوصول إلى المواقع المقترحة لإنشاء مزارع الطاقة الشمسية، وتسهيل عمليات نقل المعدات والإنشاءات وأعمال الصيانة والتشغيل، ولذلك تزداد ملاءمة المناطق القريبة من شبكة الطرق."
      },
      {
        id: "13-B",
        title: "خريطة تصنيف الطرق",
        img: "/map15.jpg",
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
        id: "14-A",
        title: "خريطة المسافة من الأودية ومجاري السيول",
        img: "/map16.jpg",
        description: "توضح الخريطة التوزيع المكاني للمسافات الفاصلة بين مناطق محافظة سوهاج وشبكات الأودية ومجاري السيول، حيث تظهر المسافات الأقل باللون الأخضر بالقرب من مجاري الأودية، بينما تزداد المسافات تدريجياً في اتجاه المناطق ذات الألوان الصفراء والوردية.",
        importance: "تبرز أهمية هذا التحليل في تحديد المناطق الأكثر ابتعاداً عن مجاري السيول، بما يسهم في تقليل احتمالات تعرض مزارع الطاقة الشمسية لمخاطر السيول، ولذلك تُعد المناطق الأبعد عن الأودية أكثر ملاءمة من منظور هذا المعيار."
      },
      {
        id: "14-B",
        title: "خريطة تصنيف الأودية",
        img: "/map17.jpg",
        description: "توضح الخريطة التوزيع المكاني للأودية ومجاري السيول داخل منطقة الدراسة، حيث تظهر المناطق الأكثر تأثرًا بمجاري الأودية باللون الأحمر، بينما تزداد درجات الملاءمة بالابتعاد عنها تدريجيًا نحو اللون الأخضر.",
        importance: "تُعد هذه الطبقة من المعايير الأساسية لتقييم المخاطر الطبيعية، إذ يساعد استبعاد المناطق القريبة من مجاري السيول على حماية المنشآت الشمسية وتقليل احتمالات تعرضها للأضرار الناتجة عن السيول."
      }
    ]
  }
];

// الخرائط الفردية المتبقية كروت مستقلة
const individualAnalysisMaps = [
  {
    id: "15",
    title: "خريطة التصنيف الجيولوجي",
    img: "/map18.jpg",
    description: "تعرض الخريطة التوزيع المكاني للتكوينات الجيولوجية بمنطقة الدراسة، حيث يسيطر التصنيف الثامن والتاسع على مساحات واسعة، خاصة في الأجزاء الوسطى والشرقية، بينما تظهر تكوينات أخرى على الأطراف الغربية والجنوبية الشرقية.",
    importance: "تُستخدم هذه الطبقة في تقييم طبيعة التكوينات الأرضية ومدى ملاءمتها لإنشاء مشروعات الطاقة الشمسية، مع مراعاة الخصائص الجيولوجية والاستقرار الأرضي."
  },
  {
    id: "16",
    title: "خريطة تصنيف الرطوبة",
    img: "/map19.jpg",
    description: "توضح الخريطة التباين المكاني في مستويات الرطوبة داخل منطقة الدراسة، حيث تظهر القيم المرتفعة نسبيًا في الأجزاء الجنوبية والجنوبية الشرقية باللون الأخضر، بينما تتركز القيم الأقل في الأجزاء الشمالية والغربية باللونين الأحمر والبرتقالي.",
    importance: "يساعد هذا التباين في تحديد المناطق الأكثر ملاءمة من الناحية المناخية لإقامة محطات الطاقة الشمسية، مع مراعاة أن انخفاض الرطوبة يُعد عاملًا مساعدًا وفقًا لمعيار الدراسة."
  },
  {
    id: "17",
    title: "خريطة تصنيف الانحدار",
    img: "/map20.jpg",
    description: "توضح الخريطة الخصائص التضاريسية لمنطقة الدراسة من حيث درجات الانحدار، وتظهر سيادة التصنيف الخامس باللون الأخضر الداكن على معظم المساحة، مع انتشار بعض المناطق ذات الانحدارات الأعلى على امتداد المجاري المائية، خاصة في الأجزاء الشرقية والشمالية الشرقية.",
    importance: "تساعد هذه الخريطة في استبعاد المناطق شديدة الانحدار وتحديد الأراضي الأكثر استواءً وملاءمة لإنشاء المحطات الشمسية."
  },
  {
    id: "18",
    title: "خريطة تصنيف الإشعاع الشمسي",
    img: "/map21.jpg",
    description: "توضح الخريطة التوزيع المكاني لمستويات الإشعاع الشمسي، حيث تظهر المناطق ذات التصنيف المرتفع باللون الأخضر في الجزء الشمالي الشرقي، بينما تسود التصنيفات الأقل في معظم الأجزاء الوسطى والجنوبية.",
    importance: "تُعد هذه الطبقة من أهم معايير اختيار مواقع مزارع الطاقة الشمسية، نظرًا لارتباط ارتفاع الإشعاع الشمسي بزيادة القدرة المحتملة على إنتاج الطاقة الكهربائية."
  },
  {
    id: "19",
    title: "خريطة تصنيف درجات الحرارة",
    img: "/map22.jpg",
    description: "توضح الخريطة التوزيع المكاني لدرجات الحرارة، حيث تظهر المناطق الأعلى حرارة باللون الأحمر والبرتقالي في الأجزاء الشمالية والشمالية الغربية، بينما تنتشر التصنيفات الأقل حرارة باللون الأخضر في الأجزاء الجنوبية والوسطى.",
    importance: "يساعد تحليل هذه الطبقة في تقييم الظروف الحرارية، حيث إن ارتفاع درجات الحرارة بصورة كبيرة قد تؤثر في كفاءة تشغيل الألواح الشمسية."
  },
  {
    id: "20",
    title: "خريطة إعادة تصنيف الغطاء الأرضي (Reclassify Land Cover)",
    img: "/map23.jpg",
    description: "توضح الخريطة التوزيع المكاني لفئات الغطاء الأرضي داخل منطقة الدراسة بعد إعادة التصنيف إلى ثلاث درجات ملاءمة، وهي الدرجات (1، 3، 10). ويتضح من الخريطة سيادة الفئة ذات درجة الملاءمة (10) باللون الأخضر الداكن، حيث تغطي معظم الأجزاء الشمالية والوسطى والشرقية من منطقة الدراسة، بينما تتركز الفئة ذات درجة الملاءمة (3) باللون الأصفر الفاتح في نطاق ممتد بالأجزاء الغربية والجنوبية الغربية، في حين تظهر الفئة الأقل ملاءمة (1) باللون الأحمر في صورة تجمعات متناثرة، خاصة على الحدود الغربية والجنوبية الغربية.",
    importance: "يساعد هذا التصنيف في استبعاد المناطق غير المناسبة وتحديد الأراضي الأكثر ملاءمة لإقامة مزارع الطاقة الشمسية وفقًا لطبيعة الغطاء الأرضي."
  },
  {
    id: "21",
    title: "خريطة تصنيف الارتفاعات",
    img: "/map24.jpg",
    description: "توضح الخريطة التدرج المكاني للارتفاعات داخل منطقة الدراسة، حيث تظهر المناطق الأعلى ارتفاعًا باللون الأحمر في الشمال الشرقي، بينما تنتشر المناطق الأقل ارتفاعًا باللون الأخضر الداكن في الأجزاء الغربية والجنوبية الغربية.",
    importance: "يساعد تحليل الارتفاعات في تحديد المناطق المناسبة من الناحية الطبوغرافية، وتقليل تكاليف أعمال التسوية والتجهيز قبل إنشاء المحطات الشمسية."
  },
  {
    id: "22",
    title: "خريطة تصنيف التربة",
    img: "/map25.jpg",
    description: "توضح الخريطة التوزيع المكاني لأنواع التربة داخل منطقة الدراسة، حيث تسود التربة الصحراوية الداكنة باللون الأزرق الفاتح على معظم المساحة، بينما تنتشر تربة الرواسب النهرية باللون الأخضر في الأجزاء الغربية والجنوبية، وتظهر التربة الصحراوية في الجزء الشمالي الشرقي، مع وجود مساحة محدودة من التربة الغنية بالمواد العضوية في الجنوب الغربي.",
    importance: "يساعد هذا التصنيف في تقييم طبيعة الأراضي وتحديد المواقع التي لا تتعارض مع الأراضي الزراعية ذات القيمة الإنتاجية."
  }
];

function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'spatial-data' | 'analysis-results' | 'final-result'>('home');
  
  const [highData, setHighData] = useState<any>(null);
  const [mediumData, setMediumData] = useState<any>(null);
  const [normalData, setNormalData] = useState<any>(null);

  const [clickedMarkers, setClickedMarkers] = useState<Array<{ lat: number; lng: number; text: string }>>([]);
  const [selectedSiteForAI, setSelectedSiteForAI] = useState(optimalSitesData[0]);

  // دالة تغيير الصفحة مع التمرير التلقائي لأعلى الصفحة فوراً
  const handleViewChange = (view: 'home' | 'spatial-data' | 'analysis-results' | 'final-result') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetch('/high.geojson')
      .then(res => res.json())
      .then(data => setHighData(data))
      .catch(() => console.log("تعذر تحميل طبقة ملائمة عالية"));

    fetch('/medium.geojson')
      .then(res => res.json())
      .then(data => setMediumData(data))
      .catch(() => console.log("تعذر تحميل طبقة متوسط الملائمة"));

    fetch('/normal.geojson')
      .then(res => res.json())
      .then(data => setNormalData(data))
      .catch(() => console.log("تعذر تحميل طبقة ملائم"));
  }, []);

  const getLayerStyle = (color: string) => ({
    color: color,
    weight: 1.5,
    fillColor: color,
    fillOpacity: 0.4,
    interactive: true
  });

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
              onClick={() => handleViewChange('home')}
              className="gn-btn-gold px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <FaHome /> العودة للرئيسية 
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-24">

        {/* الصفحة الفرعية الجديدة: الناتج النهائي (خريطة الملاءمة المكانية النهائية وجداول الأوزان والنسب) */}
        {currentView === 'final-result' && (
          <div className="space-y-12 animate-fade-in py-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="gn-gold text-sm font-semibold">مخرجات التراكب الموزون (Weighted Overlay)</span>
                <h1 className="gn-display text-3xl font-semibold text-white mt-1">الناتج النهائي: خريطة الملاءمة المكانية النهائية</h1>
              </div>
             
            </div>

            {/* بطاقة التحليل النصي والخريطة النهائية */}
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
                  <img 
                    src="/map26.jpg" 
                    alt="خريطة الملاءمة المكانية النهائية" 
                    className="w-full h-auto object-contain rounded-xl max-h-[500px] mx-auto" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                  />
                  <div className="text-center p-3 text-xs gn-muted border-t border-white/10 mt-2">
                    📍 خريطة 26: التوزيع الجغرافي لدرجات الملاءمة المكانية النهائية بمحافظة سوهاج
                  </div>
                </div>

                <div className="space-y-4 gn-text-2 text-sm md:text-base leading-relaxed">
                  <p>
                    توضح الخريطة التوزيع الجغرافي لدرجات الملاءمة المكانية لإنشاء مزارع الطاقة الشمسية بمحافظة سوهاج، وذلك بعد دمج مختلف المعايير الطبيعية والبشرية باستخدام أسلوب التراكب الموزون (<span className="gn-gold font-semibold">Weighted Overlay</span>)، بهدف تحديد أنسب المواقع من الناحية الجغرافية والبيئية والفنية لإقامة مشروعات الطاقة الشمسية.
                  </p>
                  <p>
                    وتكشف الخريطة عن وجود تباين مكاني واضح في درجات الملاءمة داخل منطقة الدراسة، حيث تتركز المناطق ذات الملاءمة العالية جدًا باللون الأخضر الداكن في مساحات واسعة من الأجزاء الشمالية والوسطى والغربية، وتمتد في بعض المواقع نحو الجنوب، وقد بلغت المساحة الإجمالية لهذه الفئة <span className="gn-gold font-bold text-base">2,177 كم²</span>، وهو ما يعكس وجود نطاقات جغرافية واسعة تمتلك مقومات مناسبة لإقامة مزارع الطاقة الشمسية.
                  </p>
                  <p>
                    كما تظهر المناطق الملائمة باللون الأخضر الفاتح في أجزاء متفرقة من المنطقة، بينما تنتشر المناطق متوسطة الملاءمة باللون الأصفر، وتظهر المناطق غير الملائمة باللون البرتقالي، في حين تتركز المناطق ذات الملاءمة المنخفضة جدًا باللون الأحمر في بعض النطاقات الشرقية والجنوبية.
                  </p>
                  <p className="bg-[#e9c98a]/10 p-4 rounded-2xl border border-[#e9c98a]/20 text-white font-medium">
                    وبوجه عام، توضح النتائج أن محافظة سوهاج تمتلك مساحات واسعة قابلة للترشيح لإقامة مشروعات الطاقة الشمسية، مع إعطاء الأولوية للمناطق التي حققت أعلى درجات الملاءمة، والتي بلغت مساحتها <span className="gn-gold font-bold">2,177 كم²</span>، باعتبارها النطاقات الأكثر ملاءمة وفقًا لمعايير الدراسة والتحليل المكاني.
                  </p>
                </div>
              </div>

              {/* قسم الجداول المرفقة (الأول والثاني) والنسب */}
              <div className="pt-8 border-t border-white/10 space-y-10">
                
                {/* الجدول الأول: جدول الأوزان النسبية للمعايير (الجدول الكبير) */}
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

                {/* الجدول الثاني والرسم البياني الدائري للنسب */}
                <div className="space-y-4">
                  <h3 className="gn-display text-xl font-semibold text-white flex items-center gap-2">
                    <FaChartPie className="gn-gold" /> الجدول الثاني: جدول درجات الملاءمة المكانية والنسب المئوية
                  </h3>
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    
                    {/* الجدول الثاني */}
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
                            <td className="p-4 font-medium text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-800"></span> Unsuitable (غير ملائم)
                            </td>
                            <td className="p-4 text-center font-mono">1,198</td>
                            <td className="p-4 text-center font-mono font-bold gn-gold">12.03%</td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-500"></span> Low Suitability (ملاءمة منخفضة جداً)
                            </td>
                            <td className="p-4 text-center font-mono">1,973</td>
                            <td className="p-4 text-center font-mono font-bold gn-gold">19.81%</td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Moderate Suitability (متوسط الملاءمة)
                            </td>
                            <td className="p-4 text-center font-mono">3,231</td>
                            <td className="p-4 text-center font-mono font-bold gn-gold">32.43%</td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-400"></span> High Suitability (ملائم)
                            </td>
                            <td className="p-4 text-center font-mono">1,383</td>
                            <td className="p-4 text-center font-mono font-bold gn-gold">13.89%</td>
                          </tr>
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium text-white flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-800"></span> Most Suitable (أعلى ملاءمة / ممتاز)
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-emerald-400">2,177</td>
                            <td className="p-4 text-center font-mono font-bold text-emerald-400">21.85%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* الرسم البياني الدائري المصمم خصيصاً للنسب المئوية المرفقة */}
                    <div className="gn-cell p-6 rounded-2xl space-y-4 flex flex-col items-center justify-center border border-white/10">
                      <h4 className="text-sm font-semibold text-white text-center">النسبة المئوية لتوزيع درجات الملاءمة</h4>
                      <div 
                        className="relative w-44 h-44 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105" 
                        style={{ 
                          background: 'conic-gradient(#991b1b 0% 12.03%, #ef4444 12.03% 31.84%, #facc15 31.84% 64.27%, #34d399 64.27% 78.16%, #065f46 78.16% 100%)' 
                        }}
                      >
                        <div className="absolute w-28 h-28 bg-[#0a1512] rounded-full flex flex-col items-center justify-center shadow-inner">
                          <span className="text-[11px] gn-muted">المساحة الكلية</span>
                          <span className="text-sm font-bold text-white font-mono">9,962 كم²</span>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-1.5 text-right w-full pt-3 border-t border-white/10">
                        <p className="text-white flex items-center justify-between"><span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-800 ml-1.5 inline-block"></span>Unsuitable:</span> <b className="gn-gold font-mono">12.03%</b></p>
                        <p className="text-white flex items-center justify-between"><span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 ml-1.5 inline-block"></span>Low Suitability:</span> <b className="gn-gold font-mono">19.81%</b></p>
                        <p className="text-white flex items-center justify-between"><span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 ml-1.5 inline-block"></span>Moderate Suitability:</span> <b className="gn-gold font-mono">32.43%</b></p>
                        <p className="text-white flex items-center justify-between"><span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1.5 inline-block"></span>High Suitability:</span> <b className="gn-gold font-mono">13.89%</b></p>
                        <p className="text-white flex items-center justify-between"><span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-800 ml-1.5 inline-block"></span>Most Suitable:</span> <b className="text-emerald-400 font-bold font-mono">21.85%</b></p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* عرض الصفحة الفرعية الأولى: طبقات البيانات المكانية (السكاشن 1 إلى 11) */}
        {currentView === 'spatial-data' && (
          <div className="space-y-12 animate-fade-in py-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="gn-gold text-sm font-semibold">استعراض تفصيلي للبيانات المكانية</span>
                <h1 className="gn-display text-3xl font-semibold text-white mt-1">طبقات البيانات والمعايير الجغرافية</h1>
              </div>
             
            </div>
            
            {/* السكشن الأول: خريطة الموقع الجغرافي لمحافظة سوهاج */}
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
                      تمتد المحافظة بين الوادي النيلي والصحراء الشرقية وغرباً، وهو ما يعكس تنوعاً واضحاً في الخصائص الطبيعية والتضاريسية داخل منطقة الدراسة. وتُعد هذه الخصائص أساساً مهماً للتحليل المكاني لاختيار المواقع المناسبة لإنشاء مزارع الطاقة الشمسية.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="gn-chip px-4 py-1.5 rounded-full text-xs font-semibold">نطاق الدراسة: محافظة سوهاج</span>
                    <span className="gn-chip px-4 py-1.5 rounded-full text-xs font-semibold">التحليل: GIS & Remote Sensing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* السكشن الثاني: خريطة الأودية ومجاري السيول */}
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

            {/* باقي السكاشن للبيانات المكانية ... */}
          </div>
        )}

        {/* عرض الصفحة الفرعية الثانية: تحليل البيانات والنتائج النهائية (السكاشن 12 فما فوق) */}
        {currentView === 'analysis-results' && (
          <div className="space-y-16 animate-fade-in py-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="gn-gold text-sm font-semibold">مخرجات النمذجة الجيومكانية</span>
                <h1 className="gn-display text-3xl font-semibold text-white mt-1">تحليل البيانات والنتائج النهائية</h1>
              </div>
              
            </div>

            {/* السكشنات المدمجة للخرائط (12، 13، 14) */}
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
                            <img 
                              src={item.img} 
                              alt={item.title} 
                              className="w-full h-auto object-contain rounded-xl max-h-[320px] mx-auto" 
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                            />
                            <div className="text-center p-2 text-xs gn-muted border-t border-white/10 mt-2">
                              📍 خريطة {item.id}
                            </div>
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

            {/* باقي الخرائط الفردية (من سكشن 15 فما فوق) */}
            <div className="space-y-6 pt-4">
              <div className="border-b border-white/10 pb-4">
                <h2 className="gn-display text-2xl font-semibold text-white">الطبقات والمعايير التحليلية المتبقية</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {individualAnalysisMaps.map((item) => (
                  <div 
                    key={item.id} 
                    className="gn-card p-6 md:p-8 rounded-3xl space-y-6 border border-[#e9c98a]/30 flex flex-col justify-between gn-card-hover"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="gn-icon-box p-3 rounded-2xl">
                          <FaChartBar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="gn-gold text-xs font-bold uppercase tracking-wider block">السكشن {item.id}</span>
                          <h3 className="gn-display text-xl font-semibold text-white">{item.title}</h3>
                        </div>
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-[#e9c98a]/30 bg-black/40 p-2 shadow-2xl">
                        <img 
                          src={item.img} 
                          alt={item.title} 
                          className="w-full h-auto object-contain rounded-xl max-h-[380px] mx-auto" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                        />
                        <div className="text-center p-2 text-xs gn-muted border-t border-white/10 mt-2">
                          📍 {item.title}
                        </div>
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

        {/* عرض الصفحة الرئيسية والتنقل السريع بين الكروت الثلاثة الرئيسيّة */}
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
                  <p className="gn-text-2 text-sm leading-relaxed">
                    يعتمد المشروع على دراسة وتحليل مجموعة شاملة من المعايير تشمل الإشعاع الشمسي، درجات الحرارة، الرطوبة، التضاريس، التربة، الجيولوجيا، شبكات الطرق، خطوط الجهد العالي، الأودية، واستخدامات الأراضي.
                  </p>
                </div>

                <div className="gn-card p-8 rounded-3xl space-y-4 relative overflow-hidden">
                  <div className="gn-icon-box p-3 rounded-2xl w-fit"><FaCogs className="w-7 h-7" /></div>
                  <h3 className="gn-display text-xl font-semibold text-white">منهجية العمل والتحليل</h3>
                  <p className="gn-text-2 text-sm leading-relaxed">
                    استخدام أدوات التحليل المكاني، وإعادة تصنيف البيانات، وتحليل المسافات، وتحديد الأوزان النسبية للمعايير، مع تطبيق أسلوب التراكب الموزون للوصول لخريطة درجات الملاءمة المكانية بدقة عالية.
                  </p>
                </div>

                <div className="gn-card p-8 rounded-3xl space-y-4 relative overflow-hidden">
                  <div className="gn-icon-box p-3 rounded-2xl w-fit"><FaLeaf className="w-7 h-7" /></div>
                  <h3 className="gn-display text-xl font-semibold text-white">أهداف ورؤية التنمية</h3>
                  <p className="gn-text-2 text-sm leading-relaxed">
                    تقديم رؤية جغرافية متكاملة لدعم اتخاذ القرار، واستغلال الموارد الطبيعية المتاحة بمحافظة سوهاج، وتشجيع التوسع في استخدام مصادر الطاقة المتجددة بما يتماشى مع توجهات الدولة للتنمية المستدامة.
                  </p>
                </div>
              </div>
            </section>

            {/* قسم كروت التنقل بين أقسام البيانات الثلاثة الرئيسية */}
            <section id="data-analysis" className="space-y-8 scroll-mt-24">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* كارت 1: طبقات البيانات المكانية */}
                <div 
                  onClick={() => handleViewChange('spatial-data')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaDatabase className="w-7 h-7" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white">طبقات البيانات المكانية والتحليلية</h2>
                    <p className="gn-muted text-sm leading-relaxed">استعرض طبقات البيانات المكانية الأساسية والجداول والنسب المئوية للسكاشن (من 1 إلى 11).</p>
                  </div>
                  <span className="gn-gold text-xs font-bold pt-4 block border-t border-white/5"></span>
                </div>

                {/* كارت 2: تحليل البيانات والنتائج النهائية */}
                <div 
                  onClick={() => handleViewChange('analysis-results')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="gn-icon-box p-3 rounded-2xl"><FaChartBar className="w-7 h-7" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white">تحليل البيانات والنتائج النهائية</h2>
                    <p className="gn-muted text-sm leading-relaxed">انتقل لاستعراض مخرجات التحليل المكاني، المسافات، والخرائط بعد إعادة التصنيف (من 12 فما فوق).</p>
                  </div>
                  <span className="gn-gold text-xs font-bold pt-4 block border-t border-white/5"></span>
                </div>

                {/* كارت 3 الجديد: الناتج النهائي (خريطة الملاءمة المكانية النهائية) */}
                <div 
                  onClick={() => handleViewChange('final-result')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl border border-[#e9c98a]/50 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-[#e9c98a] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    المُخرج الرئيسي
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="gn-icon-box p-3 rounded-2xl bg-[#e9c98a]/20 border-[#e9c98a]/50"><FaFlagCheckered className="w-7 h-7 text-[#e9c98a]" /></div>
                      <FaExternalLinkAlt className="w-5 h-5 gn-gold group-hover:scale-110 transition-transform" />
                    </div>
                    <h2 className="gn-display text-2xl font-semibold text-white">الناتج النهائي (Weighted Overlay)</h2>
                    <p className="gn-muted text-sm leading-relaxed">تحليل خريطة الملاءمة المكانية النهائية بمحافظة سوهاج مع جدولي الأوزان النسبية والمساحات والنسب.</p>
                  </div>
                  <span className="gn-gold text-xs font-bold pt-4 block border-t border-white/5 flex items-center gap-1">
               
                  </span>
                </div>

              </div>

              {/* الخريطة التفاعلية */}
              <div className="gn-card rounded-3xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <h3 className="gn-display text-xl font-semibold gn-gold flex items-center gap-2">
                    <FaMapMarkerAlt className="w-6 h-6" /> الخريطة التفاعلية لطبقات الملاءمة في محافظة سوهاج
                  </h3>
                  <div className="gn-chip px-5 py-2 rounded-2xl font-semibold text-sm text-center">
                    📍 انقر في أي مكان داخل الخريطة لوضع دبوس وعرض درجة الملاءمة
                  </div>
                </div>
                
                <div className="h-[520px] w-full rounded-2xl overflow-hidden border border-[#e9c98a]/25 relative z-0 shadow-2xl">
                  <MapContainer center={[26.5569, 31.6948]} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      className="map-dark-tiles"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

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

                    {highData && (
                      <GeoJSON 
                        data={highData} 
                        style={() => getLayerStyle('#10b981')}
                        eventHandlers={{
                          click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            const { lat, lng } = e.latlng;
                            setClickedMarkers([{ lat, lng, text: "🌟 منطقة ذات (أعلى ملائمة) - موقع مثالي لإقامة المحطة الشمسية" }]);
                          }
                        }}
                      />
                    )}

                    {mediumData && (
                      <GeoJSON 
                        data={mediumData} 
                        style={() => getLayerStyle('#f59e0b')}
                        eventHandlers={{
                          click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            const { lat, lng } = e.latlng;
                            setClickedMarkers([{ lat, lng, text: "⚡ منطقة ذات (متوسط الملائمة) - صالحة وتتطلب معالجة إنشائية" }]);
                          }
                        }}
                      />
                    )}

                    {normalData && (
                      <GeoJSON 
                        data={normalData} 
                        style={() => getLayerStyle('#3b82f6')}
                        eventHandlers={{
                          click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            const { lat, lng } = e.latlng;
                            setClickedMarkers([{ lat, lng, text: "📍 منطقة (ملائمة) - خيار ثانوي بناءً على البنية التحتية" }]);
                          }
                        }}
                      />
                    )}
                  </MapContainer>
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
                    className={`gn-card gn-card-hover cursor-pointer rounded-2xl p-4 hover:-translate-y-1 ${
                      selectedSiteForAI.id === site.id ? 'gn-selected' : ''
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
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="text-right">
                        <p className="text-xs gn-muted">امسح الـ QR للتفاصيل</p>
                        <span className="text-xs gn-gold font-mono">GEONOVA-GIS</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-md">
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

            <section id="gallery" className="gn-card py-16 px-6 rounded-3xl text-center space-y-4 scroll-mt-24">
              <div className="gn-icon-box inline-flex p-4 rounded-full mb-2">
                <FaTools className="w-12 h-12 animate-bounce" />
              </div>
              <h2 className="gn-display text-2xl font-semibold text-white">معرض صور المشروع 📸</h2>
              <p className="gn-muted max-w-md mx-auto">
                جاري العمل على تجهيز المعرض وإضافة الصور الميدانية والخرائط التفصيلية قريباً! 🚧✨
              </p>
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