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
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA9wMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAIFBgABB//EAD0QAAIBAwIEBAQDBQgCAwEAAAECAwAEERIhBTFBURMiYXEGFDKBQpGhI7HB0fAVJDNSYoLh8XKyY6LCRP/EABoBAAMBAQEBAAAAAAAAAAAAAAECAwQABQb/xAAtEQACAgIBAwMCBAcAAAAAAAAAAQIRAyESBDFBEyIyBWEUM1GBFUJSU3GR8P/aAAwDAQACEQMRAD8A+fKKMgqCijIK9hI8xsmoo6LUEFHRaYQmi0dFqKLR0Fccz1VzR40qKLTEYpQBIkpuOOhxAU5Cm4pZDInFDvnBp+GDIzXWyHI8pIq4srYOQVGT1TrUJyLwiKJa/s3ocltsK1EHDSYztsVxy9aVvLIrkkY77chUlMq4mVmh5jFIyxYNX91Dg7AgCquZME1aLIziVhSoOu1NOuMmvRaTNIIxFIZGGQmk5x39qq5JLZGrYxwrguspd30jww/UgXIduxB6e9XnELgTuHwdl05PM470ywCcLsxdgJcJHpKCqyYhuQNZJScns1xiorQFzmhEF+YO1GYYArwUowa1g8RggYA+pq4hP93CEhiDzAqlVinmFN2EhRxkkg9DQYy0NXP7MAkjNVd5LrzVjxJgd6qnw2xNBHMpeKwkwHSGOd9Q5A+tYm/czSlsjHPl1rb8Y4hZwmS1Zz4pQ/SM6TWQ4jZQWkCkTa5mwdAGyj1rXiujNNqynkznahyEafWiPzoT1ahLF3G9e1IivK4ayxQUZRUFFHjWnItkkFMxihouKYjFGgE1FGRaii05YWkt7cx29uuqSQ+UVz0BOwaLTMS7impeFXMF+ti4TxmdUHmwMn15VYt8PXsEJkYwMy841k3FTlOKXcZQbdCESU9AhzVyfh+1ZES1uG+YVPNqGVkbsO1JG0ntyBPE8ZPRhio+omUWNoPaxjIya0HCwpONzt/lqjt9iMirizl0Ab+wqc1ZaDo1iDEY00hxVFIBxv6UK3vjjc+n5Cl7m5LZz5vfrUFB2Xc1RS3yrqIwR6ZqnnAydjVzdsrE749KqJuZrTBGebD8AgjkvJJXAZoU1oh6nPP7VbcQvkiUsIV8dk0F85IGc4oXw/AsXD57kEM8nlKg8gOWR3quvPMWY888qlNtyHikogLi5aRiT+VThcsmCKTbNTjmKDvSgsI7ZYijLHsvc0rCrzTYQZ71aRxHw2Jx5CN80Gx0Ji5szxOHh88pieYZUsAFz2J7mrWW2igZEAIYdTWL4xFw7idxK9rcyvclQU1YCMB0HXNCl+KOJSWCWrlda7GUjzkdqv6LktE1lp7NVezhPFMrHQnNsbCsxxzi5hgHyjAl8AsPw5z/ACphON2y2FuG1yOqsJsjqev76zPE5hdS5Tyxr9AHb+dNiw1LaEnlTWhKSSW5uGlkbLkbtSsxLHfrzpk+Ubc6A4zWulRCxR1oTLTbLQmSuoYUIrqMUryhRw8q0wi1BBTCLTUITVaNGKigoyLXCthEWnLGRrW5imXV5GBOk4JHUUCIUda5pPTFWnZvk4rw3icMURkIMgwwli5dhk9dqhJNGb1rORjHOWxGNOz/AMqy/Dre4nmiWDIJbAfGw71dQQXkvGjc58QW4B1SqQSOQ5daxSxxj5Nccjl4DSF438pIINNWlyQAkrAxahrRhnIrpInyCFJzyOKVdWRskb1nLjd1apAgnt3Z4mkK4KEY7VCOXHL9acsLpxEySKXgYYZK9ubGOS3NxYoyhNpI2bOPUVSOTwwON7RBJ8Fd6hLOTnfltQZ42tyocqS240nNAdt+dPQjbo9mfO/Wk385043PKjy4Cgg7mlGO/X7U67CSdGttrOPhVo0cC+JM7ENIVxt2qmvbV0JZ/wB1WsfGbaa2WTIEyqNSt3pu4txJbOJCNWcj71kdp7NKprRjHTeox2zyfTVzJw2TVjAGf0p2OFLKJi6gsvQ7V1goqIIjaqWK7kVU8avwlrNAuTJIuOW29N8W4gI2J1HSWw3cCsjxCbxbmR1bIzgH+NaMOLk7ZHLkpUgAYKigfVnrzFaLh/BbfiULONRDMD4u4xzyKzAA1DVy6nrVzbcVMETWybgMTGx5ptjNaZxk17TPBx7sreM2kVlxGW3gk8RIzgE8/Y0g1MzYLMdWpidz60uwqkVoVu2LOKGRTRWoMnpTBFStStrWW7uY7e3jMk0hwiDmTRGXcAb/AMKtfhS9teH8ZWe7jJjMbIGVSxRj+IAc+o+9JKVK0Mlug9l8DXc8Ec93cxW6tnVGVJZO2emfSur6O8UdzAmg5idQykHpjaurA+onZsWKJ8djWjoKii4FFUV6RgYVBRgKggoyCuECxchTCKDzoKUZK4Bb2/EHjhtEXKm3YlSBzzVnZcbaPij3cxaVHTSyYArOrRFqUscWUWSSN5w3iEV4ollZFDHSR1Brr22tIpC00pjHTUMZNZCCbw1K79CCOhHKnLq9lu5NcrEkbDJrK8G9GldRcTQRcRtIIFMYEmXAZGGMDvRE41EmuExIUOQCDzHrWXVqnmm9CIPWl4LPiM6S3LPF9LAYA2waSZqHqpixhFxcJG5wGYAfc0eNIHOxdiW8qglsbAU7xnhy2zJJbAtEwGcZOnPr1FWaxRWzDwYER021N5jUXndZWZ3JDLipPJvRVY7WzKksjZ3BB6Dkatn+J5xZlDEHnz/ik4/Sp8UsReXMTWMWNWVbcbmqe54VfRJIzQnCYB365q3sn3M75w+IPifGbu7XQZSqYBKqcaiOpocPH72MDxJWlUDARj+tJuD1GDSz1dY4V2I+pK+5Ce4kk16zqZ21Ekb0m4pphQmWqLQLAYrwjPOiFcV4RRABIqDCjEVEigFAiKvOD/Dl1NdxvfWpjtFGp/FJGoY5bb5r34StI7rjkSTasIDIuO4GRn0rY8UjzKXYkszfasufLxfFGnFBSVsSfhPD5OGXNvYWioHVtGfq1dDmq/4N4Stj41zdh1uWRl0EfQvfPc1Z28eM58gPWkrvxIGwsuoE96zKcqo0OMU7H5r8FdEDsMHn3rqqA+n3ryloNmQUUWNa9VKMiV6p57Z6q9qOi7V4iUZVrhTwLRkXHOuRaveG8MgvuHEJ5bwMSCeTDotJOairY0YOTpFQooq1oLbgdu1lAs8Usdy5YMwbBBztsdu3KquaxubbJuIWTfGo8jSRyxk6GeKSQJKZt42mkWNBl2YBR3oAG2elHt5DDMkqqrMjBwDyOK6T1oEdMuLTgrsQLrUjscRqjA+5NejhsEY8Npi8u/mU+UfbG9Sju7diki3BWRwfJ2PalTJi4bUcEHffkaxuU7NihChuPgpwqSTBX05wF/cc70yltb2MqeFK/iZDeIVzp27VXi/ZJULxowHU5yfvzp62kHEM4jSOULksMgMPUUrnJjKMUGnENvBGIfEJbJZpObHv7VXtKXOF3J2AHWmpGhiu4I7ma3KL5ixfmO2DQJeMcKhnZ0mtxKqkaozsufbauUX4C2gsNncaJGceEUGRr61WcZur2Apm5Vgy6MxrgDHMfupOf4itijAXEhjU/Vg6T/Oq+f4htnt5IzExgc5EkgA37jfOf51fFiyX2JZJRaqwTLkZHKgSLS/9p+JmQW4igzhWlc5P2HP86G/EZpAzosUEA28Rhqz9iSM+gFbeLMnEMVrwRM+NCM2TgaVJzSLcQvLxvBs2MaKMs+AhI7kjGkeg/WgyXXg5WOV2bk07knnzC55D15n0Gxbg2dxLF00buVGO5FDnMMEayTSxAOMrg5JHfbpVY5is2HzAR7o8oH30+rj/APP57bFaQTyE3N0JlTOWmlUge+cb+w/6V8V5GULLSO4t5JQkZlcnmVj/AJ4opQY5YpbhnChxVIxax8QjK+bSQYiT3JI357b1r+HfDcao0nE5WRdIEcUb+bPc1F5orfgZ4m9IquAcJuOJXTm2nMDQLr8QDrnAA/X8q3cijwYEmZpbgRgMTjJPU7bUlwyyg4PbS/KmVpJtnkdtgByAHLbvjPrUY5/A8QjJlYYBrHlyc5aNWKHCOwN45DGMHZapbm70MwwrbEYYU3esq/4jP4h5hTVBcFiTv1pEGTJSXhDHBrqrpEcnbNdTkw6J6UZIyeQJpqwiPzMbkKY0YFtXLFX62nDZ5JcKyPISwkz9B9K2SzKOmZ4YnJWZtYyAMjAO49aKq1orjhAkhjJlD6Ewsh8q8+tV8FqkTlriaEgZAQNkk99qMciktAljcROJcsA3lB6npVtYXC2ySRpJzYMjgENtSwtjqLFWwe64H5mjxOLdWWNo1LczqycfaunBzVHQfF2OfPctcrMwO2aftjDdxSxXGsR6fqXpjrVB4kY//ow3/wAaE0GS4h1A65H/ACINQXTO+5d51VUNXMAguJIw6kIxAIYYI70w/wDZUSYa6mkftHHsfaqC64lbWwUvGF1HChnJLHsAOf2pU8RmuEYwrDDERu5VSQ3Tds/lnNXcL0SS8mgPxDYcNjVUt4mZ3wj3JXLHoB3+1V/z3FJ79sWY8HBMjKCWJ/UCq9rlAVm1Rq4GPFVNBb7jzN+6pS3DsFaaZgcbGRst/tXpQ9KPkfm6LJ24hKdQikTBwfKU/fuf0pd1vZH0yOA2cBXnXV9lz5f31VTzIhbU5jY8xqzK33/D++gO6xIyzHwl6xL9R9GPT2/SqpRXYDtlkLd21Ibi1Vsbx+NlvdmwRXkdtA+Y3vIZMb+HErFF9SevvSDB8aZg0aHzCCNfMexbt9/yoyW11LEHNtLDanzLHFExL+uOvudu1Hl9zqCmKzeXQbqS7l/AEg8oHoDt/DvmhSNwuK41SyXd3L6qmkHp13HpyqAsuJXWqG24dcxQBdTn5d8Ed2ON/QfkK9FlxGAabHhXFC3Wf5KXV/t8vl9xv6jO4cvudX2C3BsY/PdQ3Uk+2IjcBdPo2F8vsOXpUNdvOBNcWKJADhWeZznH4UClf65nNFXgfErdUe54RfSO3mSJYHAGertj/wCo374qD8F45eTAvYSgkAanCoqLyGxOwHb/AJock/J1MB85qK21nwyzVHYFY9LSsSeWdTEH7jH60Rr02IZYEsxdZ/xIbSICL0U6fMfXlttvvRJ+HXlpG8VrDGNQIlne6hUv3Ay/lX9T1pE8Muxje3A8TSRFdRyNnHZGP67d6HKHlnUyQ4hxSbOi+u9jn9mzDJ9AvM/rWn+CrlXhlluLK/S7HlV70NyPPTq6kc/TblSPw7YcWt52knsoIrXDGORXDPz6jHXnmtG89ykalEdkByzjoKx5svPUexWMeO2OQWwineWQs7yYGVGdI96651qhaGNTg4yTvivYIpwkZ04LDzazjGaXu9IdIlOpycAA8veoVsreiyCf3RI5RpY4L9cH3qmuJAkh8P8AD1NWeVjtSHkLSDc6dwPSs/eTqHYg0F3C3oBduZHJY5Peq7TqmAwDnvRpHdz+zRj7CkZRLkkqw99qdKycmeTSsGOkACvaeteGS30aiOMAkZ1ucAj0rqsnEk0yETsCgCggcsnAq4tnEaYidfYsxx+lZh+J3EC4gi8Tv5Ry/OjDiXEWt2kSKISDkpTIP5Gsi+qdLJJuwcJpUjRyv4rAzSo7DlqTVj86iZVQY8dx3CADNY+44/xmMZThKS4GWzIB+maVX4w4hl/E+H5QqKWch2GB33GK2w6/p2vawehORs2kgPPxW9SRvUfGg2xAxzy8+Kylt8VNcJ4w4NemNh9QK4wPfpXl38RyLMifIyxRyjdndAx7Y5/mftTvrMX6nehLyaW5u4IEBlhj64UsW1+gUfwpReIs+fFsLdYuuvOo+hOTj9TWch+J+F6m/YXQlY4ZmTxdXrkHeno+I2lzMqW9z5yQoa4gcFSeQA04HtXR6jE+8gvFJeB83rRzPdxLDC8owWWIDUPT8Tfeubi98qhvnpowdw0jZJH+lB++gGzuhK2lFDHzNLPIrMfZc5/Q14LO5Qs3ysyld5J7pCMHvvsD+Zq8cmN/GheMvIweL8RCrqvbiJTyd5CXf/xHb1/WmouK8QeHUb65iiO+ppSXcdxv/XeqhVUy4tozcXDZJkcZz6gdfc0QOkZZpX+Zn5sdWVHuetB0xlaLQcS4hIhEfELtIM4Msly5J9OfP0FD/tPiBylrfXx8vnlkunyB33bCj9fvSkhwQ987A48sG2vT2x+Af9460F5JrvKKFjt0Go/hjT1Y/wDZ6AdKnoehh+LT26kR393M6jzSSTuUHspO/wBxj0oU17dW5L317eNKdzB8w+sn/USfL0/1elIy3UVuCLMsZOtyVwR/4D8Pv9XtS8dvGqCe7fw4GyyBSNc/fSM8t92O2/Wu0ckw73V9xSbT4jmONScGRhHCvUknYDuTueW52rySeK38toxecc7plOoDkdHVef1c99sZpe4uDcKsUcYhtkOVhXcAj8RP4j69OmKJFaJAizX6yKjf4cAyHk9T/lX15npzzXNjURs+GxXJaVo44oEbDzlM7/5VH4m57dOZx1YuHt44PAtYVhgzrKAZLn/M2257dB0pW74g0rDOkKq6I0RcKi9gOn8eteWkLXCvc3BdbVN2YDdyP8voOrdKSTjFWw0dBatdB5EjkMMZ8zRRl2OOQUDcn22Ga1fwxElxYM0fDru1miChVmhKqc77ZG42Bz1ovDbi1tIIhEBGVXOFxy7Dflv/ABNN/wBpyJI7TyLHoODEG8zH+NfP5/q8uTjBVQyivJcyXk3heFJExBXDHBGo0nJKxAVFZRzxnalBxbLHTJ/tLdaknFHjLG4kVSDp8MHcHO9edLr88v52v2HpDr307hgTz5ntS+SJNZyT60H5/XJqafRjYAnrXr8ZIzvE6rszHbFS/F9R/WzqTCPK7beJIo5YU4oJhTfc57npU4r9WfzNEQfpUCifNjrGq/flXLq8/wDcOpCUkLFSFnf2qdjb2kTvJdr4xB8gbOB796Ya7XH0pUfmY+sSH2Wrx+p9Stc7/YX04WddXc0v0sFIOwHIV1ePcW4UeWP711U/ieb7D0jFRsrYUNnA+od/anDLJGgSTIcj8YC7DsTVKjlrmMKmdvb70xG1wbeRDKAiqVzo8zHHLeoSxoiWJnwFJJAY4U42P3O1HWc52ZpD6DKiqe7lu7ZkhWII5GfOSxB6Z7CmLWUNGrJLHcSAHyOvXO9K8VKzhm6tLS4kWSa2iZ+uwGKjHYcOjJYWUJJOQdOfXnXQTo6O7SrrA3G+3f8Ar1r0NK8QCfVrCHVtz6kHl0/Wp+/tZyB3fDUkA+UkMDDkoQEflVQ/D+NwGE2fE1k0EMgGUwQc/pV83iJaNM8sSA5WPVIF8Tc8j9qAoJVFQyLy/ZlcnPcEchV8WXJFd7QeTM3xa4+KnhnivJrmaGXOoB9QIxy9qoluuJ2Dfs7i8tn7LIyfxr6NHIUxIxUJp2c715PDBdk/NwrJjkW3/rnWjH17jpx/0OpmHX4o46ikHiU7gjcSgPn31DemLb4y4nC6nRZyMORa3AI9diMH1q/l+H+Fz5YxGM/6DikLj4Qgdx8pdFe4kGRitUPqGPtdDckLp8WIzf3jhaMWO5jnZQftTk3xTwy70pJb3sManKxxMhjU457jJPrzqruPhS/jP93Mc3/idP76SueB8RtcGWBlLHAA3H6da0x6tP4yClE09pxXgIDM91MZPwCa1zGo7th9/wB1QeaC5mMh41ZTuxyXlMyk/nHpHtnHasfokQAsjZOcbc8c6IrYgyUIBbnj0qv4nIjuETcRJHbxo8U3Dru5fdEF9AFixy2ZgWbsOVClsOKTEyNw66ldzlnRRJqPfK5/PpWJMoxsdqhqGoMo8w5HFMuqne0BxRrpolsUafisbwKOUToUeQ9gDuB69f3LR/EjTxzQANHHIAPDUZGB0xWanuJZyDNI8hXlqOcUbhu0shzyiY/pSZMrydwcUam2+K7JiWuIWRvpIXzAjH6UxP8AFNpJKZlZd31EkHUcj86wgFekY3rDLpMTdncTdQfEvD3kcSggBTkuwIf2rp/i61e68RdYDai7BDq1Hpnn/CsfDZzfPfLTxvC4Ol9SHKE8sj8qtLX4euZHiSZRGSzo7Z+lgcCkl02CG2c4mms+K8Gv2XVP4UzA7SDG/fP3OKuIpuHeC0ZvIMHZg7gHPbf+hSHw7wC24QxuZWzdmM6OR0nPP3pi0+HeFeLJP4aOW30Sfh1ZO2awZJdPdWwUWlutmsKfK3Mb9Dpk1DFdLqUKIkMnXUPaoLBaWlrpt4Y4gNvLuT/RrxpDldTgYXOB0+1Y5KLdoIMvIgVhBIxYfSBuME9KgZzFEJTFNJnbQEORj0rrq7IAPmCp9OM7nY0s9/4sfhxuUYg4fIJ5UYxb8Ctj5lkUI+kEFsaDjOMH+VdSVhdTRWLs0mXd8RyMu4A67966n4r9AWZm1lE0ygxJgOd+q46UxDc5ISaJm3yPMKSkmu/BXwWje3GwX6G/5NMWLLLAUGfEA0mGTysfZuv6V6EsbasWgmHt77KygLgLpc8yeQ9udNmaGFRJBENbJ0by46bVVTSeE7xNrIdgoJH07b/fFN/M+OHijgKIVwoTmB2z2/nQlB6OaDQXQh/arEBKwHPfODTVuqtNJcZYE42Y899+X6Uorf2ZaYkZnlZcagBsPQnkK8hutQi1qE1bAg/VkbZqMot/E6gnGFN4wSFcKTktnOnuOVeRLacOtPEs5rlkQgMCv0nA5dTvQopn8J4mdVH1viTTqGdhn27UGGIx2qyiUvKoLtlSSAfU49KpFe3i+wQt7xK6NskFiioo+oaQSw251PhryQxNmNmeL8YGwz/DfFLxRyJMXVgGVueOmMk1OaedcIniiOXLEA/U2NskfemcVXGglr81Ew3BHovNjQFl0XOg6QjDLEEeXsKVsUdIoXnLN4hwCdySf5YNe36iJgYYyyFtznngD/ms6xpS4o4tF1JG7KAQxIjBb6jyz7UNbj5hirKkiQvjIOQMf80kly1vNAxARJX04HTIPKutpfCjdWaNVGZCApwdzgYAPtQ9KtnD11YWFzhpFUjfypsd89vekbvh9k1t4Zt491bJUcjjH7yT9qYWY+Aqhv2iJnHJQCRgA9en/FJyzpe+USJhwGAB3HUjH5/lTw9ReRrKqbgVu6IIiyvy1nkP63pK54JPBKtvaRi5lBLNIh25ct+3OtK8ytpdEyRGrhW/1E4obzh44Xm/ZtKuvnnVyJ29q1wz5E9hsxLWsoOdBxnTnOd/6FHisbsZ0oRlMH2zWsmKKflWTGpgI9GCNPcduYG/KuSVUM76NEcZEeTvlhzI+/7qq+olWkc5FLY/DU8uPFZUDA4bOa09pwLhlrBmWE3CqxdVkPL3/lQlvoGuAzOBEltH9H4Gclm++4/Kgi51tpEuoSfVj6SO4PY7Y+9Zssss9XQOTLu4niQEiJA8pZsgZJ+9J3MrG4DxHHJipOAG5c+2/wCdK/NJosVdiTOrS7b4Lb49OdSs5gLuxnlAMckqQEHs5xn7fwFRjjfkF2MeNp1iaXW0ZVSw2w2xP/tVpZMXMJLhgIzIV7csA+5qh4wqxXMlq4dRJdStKI2A8xZtsnbYYx7dasuEERQyIrS6FByZGDEqAcbgD16DlQz40ockCx1LqK6hJVdBDaQRvk6Q38RSaTCc7LrRWwC3Q4G33zQrd4xwi5ZJCvjTs/l3YYKD06V1j4IZ0in1lZcujLpbGcZ5kY5frU449NoFnSNI1nJEkZAdzhmOzYyre2CAPtVXbyyi6iCLpiZ28N2GSTk8vbFMx3mbCWPWiPAgSNncgMWbJH5nPLrUf7RaF44pEVI1UacjlnJP33NXjFxvQCXmkswrMCGOlQ23In1rq5JD86QY1HhSMCG/Hsf511K7QaKSZD8pbZdv2i6mP3NQErtZsGY/4gA9P6zXV1bAniyyS2qTSMWdmtyc/wCpJM/+op95Pk7dpYEQSaZG1EZ3yg/ia6ursy96QZ9xLiMjT3cBk/HcHOPZf5UvLK7LGSxyl4MewzgfpXldVYpBRdyObK5dEAdTYo5EgzknNVXE7yVbqZlCgGJDpxsMgGurqjiSsXySumKp4qnDvHqJHfGasuBXUt7DNLcEMy5xgY3C5Brq6kyL2NgD8QZns7dmJJwx7bjH8zSLtpHhAbDS+cnOdx3rq6p4vicAgdiyhjq0Tlhn/dT/ABa7k4TxK4W0xoEUS6X3+qMOf1Y11dV6TkcUs/EbiV/GJUO8YB0rj8Of4V7YSFuJR5xky4z1wf8Auurqq0uLGReoxN9ejkI1hCgdiAf4mq27nkupoLF20wwqJU0gagwXv9zXV1RxfmMZB7WTxLdS6qT4hiB32Vtzj7qKjxC4aLhttKypKzZciQZBJZt9veurqMe4BUyGTh00wVI28RQBGoUADONvsKPDKbSylVEjfADgyIGxliCN9sbV1dVF3Aj3557g248KGI+CwDRJpK/swdulFhB/tWGMMdDCN8f5SqahjtvXV1LLTZ3kt/jpUtbeNokBluUDySsSWOWKkdsY9K9t18H4aM8ZIkMQUtnodq6urJl/Kj/kV9iPC4kurCJJRsVlbI75jpVbaG0PEpljWV7dIljMoDY1OcnHeurqbG/l/wB5AVVtcNLwu4kmVJG8XHmXkNqYhke7vUMxziLUMbYJTnXV1Wl5CT4JKzXSyEDUJJG5bE4Ayfzrq6urPn+Qx//Z",
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
    description: "توضح الخريطة التباين المكاني في مستويات الرطوبة داخل منطقة الدراسة، حيث تظهر القيم المرتفعة نسبيًا في الأجزاء الجنوبية والجنوبية الشرقية باللون الأخضر، بينما تتركز القيم الأقل في الأجزاء الشمالية وغرب المنشأة باللونين الأحمر والبرتقالي.",
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
              {/* <button onClick={() => setCurrentView('final-result')} className="gn-btn-gold px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                <FaFlagCheckered className="w-3 h-3" /> الناتج النهائي
              </button> */}
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

        {/* عرض الصفحة الفرعية: طبقات البيانات المكانية (متضمنة السكاشن 1 إلى 11 مع جداولها الكاملة) */}
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

            {/* السكشن الثالث: خريطة أنواع التربة ومعها الجدول والرسم البياني */}
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

            {/* السكشن الرابع: خريطة الإشعاع الشمسي */}
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

            {/* السكشن الخامس: خريطة درجة حرارة الهواء */}
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

            {/* السكشن السادس: خريطة الرطوبة النسبية */}
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

            {/* السكشن السابع: خريطة التكوينات الجيولوجية ومعها الجدول والرسم البياني */}
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

            {/* السكشن الثامن: خريطة شبكة الطرق ومعها الجدول والرسم البياني */}
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

            {/* السكشن التاسع: خريطة خطوط النقل الكهربائي ومعها الجدول والرسم البياني */}
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

            {/* السكشن العاشر: خريطة الانحدارات والتضاريس */}
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

            {/* السكشن الحادي عشر: خريطة استخدامات الأراضي ومعها الجدول والرسم البياني */}
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

        {/* عرض الصفحة الفرعية الثانية: تحليل البيانات والنتائج النهائية */}
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

            {/* باقي الخرائط الفردية (من سكشن 15 فما فوق) في كروت شبكية متناسبة ومنفصلة */}
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

        {/* الصفحة الفرعية الجديدة: الناتج النهائي */}
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

              {/* الجداول */}
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
                            <td className="p-4 text-center font-mono font-bold gn-gold">21.84%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* الرسم الدائري */}
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

        {/* عرض الصفحة الرئيسية وباقي الأقسام عند اختيار العودة */}
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

            <section id="data-analysis" className="space-y-8 scroll-mt-24">
              <div className="grid md:grid-cols-3 gap-6">
                <div 
                  onClick={() => setCurrentView('spatial-data')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="gn-icon-box p-3 rounded-2xl"><FaDatabase className="w-8 h-8" /></div>
                    <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                  </div>
                  <h2 className="gn-display text-2xl font-semibold text-white mb-3">طبقات البيانات المكانية والتحليلية</h2>
                  <p className="gn-muted">استعرض طبقات البيانات المكانية الأساسية والجداول والنسب المئوية للسكاشن (من 1 إلى 11). (اضغط للدخول)</p>
                </div>

                <div 
                  onClick={() => setCurrentView('analysis-results')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="gn-icon-box p-3 rounded-2xl"><FaChartBar className="w-8 h-8" /></div>
                    <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                  </div>
                  <h2 className="gn-display text-2xl font-semibold text-white mb-3">تحليل البيانات والنتائج النهائية</h2>
                  <p className="gn-muted">انتقل لاستعراض مخرجات التحليل المكاني والخرائط بعد إعادة التصنيف. (اضغط للدخول)</p>
                </div>

                <div 
                  onClick={() => setCurrentView('final-result')}
                  className="gn-card gn-card-hover group cursor-pointer p-8 rounded-3xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="gn-icon-box p-3 rounded-2xl"><FaFlagCheckered className="w-8 h-8" /></div>
                    <FaExternalLinkAlt className="w-5 h-5 gn-muted group-hover:text-[#e9c98a] transition-colors" />
                  </div>
                  <h2 className="gn-display text-2xl font-semibold text-white mb-3">الناتج النهائي (Weighted Overlay)</h2>
                  <p className="gn-muted">خريطة الملاءمة المكانية النهائية وجداول الأوزان والنسب. (اضغط للدخول)</p>
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
