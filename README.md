# 📚 صفحة السور الغير المحفوظة في المستوى التالي
## Next Level Surahs Page for Itqan Platform

صفحة جديدة لتطبيق إتقان تعرض الطلاب الذين لديهم سور ناقصة في المستوى الدراسي التالي.

### 📁 محتويات المستودع

- **src/utils/**: ملفات المساعدة والثوابت
  - `gradeProgression.js` - تسلسل المستويات الدراسية
  - `surahData.js` - بيانات السور والآيات
  - `nextLevelUtils.js` - الدوال المساعدة الرئيسية

- **src/components/**: مكونات React
  - `NextLevelFilters.jsx` - مكون الفلاتر
  - `NextLevelStudentsTable.jsx` - الجدول الرئيسي
  - `StudentSurahDetails.jsx` - تفاصيل السور
  - `NextLevelReportExport.jsx` - الطباعة والتصدير

- **src/pages/**: الصفحات
  - `NextLevelSurahsPage.jsx` - الصفحة الرئيسية

### 🚀 التثبيت السريع

```bash
# نسخ المستودع
git clone https://github.com/fansimlali/itqan-next-level-surahs.git

# الدخول للمشروع
cd itqan-next-level-surahs

# نسخ الملفات إلى مشروع إتقان
cp -r src/* /path/to/itqan/project/src/
```

### 📖 الوثائق

راجع `IMPLEMENTATION_GUIDE.md` للتفاصيل الكاملة عن التثبيت والاستخدام.

### ✨ الميزات

- ✅ عرض الطلاب الذين لديهم سور ناقصة
- ✅ فلاتر قابلة للتخصيص
- ✅ جداول expandable
- ✅ طباعة وتصدير Excel
- ✅ إحصائيات شاملة
- ✅ واجهة responsive

### 📋 المتطلبات

- React 17+
- Material-UI 5+
- Supabase

### 📞 التواصل

Fadel Simlali - [@fansimlali](https://github.com/fansimlali)