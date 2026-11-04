import type { LatLngExpression, LatLngTuple } from 'leaflet'

export const SOHAG_CENTER: LatLngExpression = [26.5569, 31.6948]

export type MapPoint = {
  id: string
  position: LatLngTuple
  label: string
  detail: string
}

export type ResultPoint = MapPoint & {
  score: number
}

export const DATA_POINTS: MapPoint[] = [
  {
    id: 'arts',
    position: [26.5592, 31.6984],
    label: 'كلية الآداب',
    detail: 'نقطة الأساس المكاني لمنصة جيونوفا داخل جامعة سوهاج.',
  },
  {
    id: 'akhmim',
    position: [26.5644, 31.7451],
    label: 'أخميم',
    detail: 'طبقة بيانات مساحية للأنشطة العمرانية والتراثية.',
  },
  {
    id: 'girga',
    position: [26.3382, 31.8914],
    label: 'جرجا',
    detail: 'مجموعة نقاط رصد ميداني للموارد المكانية.',
  },
  {
    id: 'tahta',
    position: [26.7691, 31.5022],
    label: 'طهطا',
    detail: 'طبقة استخدامات الأراضي والغطاء الأرضي.',
  },
  {
    id: 'balyana',
    position: [26.2358, 32.0034],
    label: 'البلينا',
    detail: 'بيانات حدود إدارية ومسارات نقل محلية.',
  },
]

export const RESULT_POINTS: ResultPoint[] = [
  {
    id: 'arts-result',
    position: [26.5592, 31.6984],
    label: 'نتائج الحرم الجامعي',
    detail: 'تحليل كثافة المشاريع المكانية حول كلية الآداب.',
    score: 94,
  },
  {
    id: 'north',
    position: [26.7691, 31.5022],
    label: 'نتائج القطاع الشمالي',
    detail: 'مؤشر تكامل الطبقات المكانية في طهطا.',
    score: 81,
  },
  {
    id: 'east',
    position: [26.5644, 31.7451],
    label: 'نتائج القطاع الشرقي',
    detail: 'تغطية البيانات التراثية والمواقع الأثرية في أخميم.',
    score: 88,
  },
  {
    id: 'south',
    position: [26.3382, 31.8914],
    label: 'نتائج القطاع الجنوبي',
    detail: 'دقة النماذج المكانية لمحاور التنمية في جرجا.',
    score: 76,
  },
]
