/**
 * nextLevelUtils.js
 * 
 * دوال مساعدة شاملة لحساب وفلترة البيانات
 */

import { GRADE_PROGRESSION } from './gradeProgression';
import { SURAH_VERSES, calculateCompletionPercentage } from './surahData';

export const COMPLETION_THRESHOLD = 0.8;

/**
 * getSurahStatus: تحديد حالة السورة
 */
export const getSurahStatus = (memorizedVerses, totalVerses, threshold = COMPLETION_THRESHOLD) => {
  if (totalVerses === 0) return 'لم يبدأ';
  const completionPercentage = memorizedVerses / totalVerses;
  if (completionPercentage >= threshold) return 'محفوظ';
  if (completionPercentage > 0) return 'جزئي';
  return 'لم يبدأ';
};

/**
 * getStatusColor: الحصول على لون الحالة
 */
export const getStatusColor = (status) => {
  const colors = {
    'محفوظ': 'success',
    'جزئي': 'warning',
    'لم يبدأ': 'danger',
  };
  return colors[status] || 'secondary';
};

/**
 * getStatusIcon: الحصول على أيقونة الحالة
 */
export const getStatusIcon = (status) => {
  const icons = {
    'محفوظ': '✅',
    'جزئي': '⚠️',
    'لم يبدأ': '❌',
  };
  return icons[status] || '❔';
};

/**
 * calculateSurahDetails: حساب تفاصيل السورة
 */
export const calculateSurahDetails = (surahName, memorizedVerses = 0) => {
  const totalVerses = SURAH_VERSES[surahName] || 0;
  const status = getSurahStatus(memorizedVerses, totalVerses);
  let completionPercentage = calculateCompletionPercentage(memorizedVerses, totalVerses);
  // التأكد من عدم تجاوز 100%
  completionPercentage = Math.min(Math.round(completionPercentage), 100);
  return {
    name: surahName,
    status,
    memorizedVerses,
    totalVerses,
    completionPercentage,
    isComplete: status === 'محفوظ',
  };
};

/**
 * calculateStudentSummary: حساب ملخص الطالب
 */
export const calculateStudentSummary = (student, requiredSurahs, studentRecords) => {
  const surahDetails = requiredSurahs.map((surahName) => {
    const memorizedVerses = studentRecords[surahName] || 0;
    return calculateSurahDetails(surahName, memorizedVerses);
  });

  const incompleteSurahs = surahDetails.filter((s) => !s.isComplete);
  const requiredCount = requiredSurahs.length;
  const incompleteCount = incompleteSurahs.length;
  const completeCount = requiredCount - incompleteCount;

  const totalMemorized = surahDetails.reduce((sum, s) => sum + s.memorizedVerses, 0);
  const totalRequired = surahDetails.reduce((sum, s) => sum + s.totalVerses, 0);
  let overallCompletion = calculateCompletionPercentage(totalMemorized, totalRequired);
  // التأكد من عدم تجاوز 100%
  overallCompletion = Math.min(Math.round(overallCompletion), 100);

  return {
    student_id: student.id,
    student_name: student.name,
    current_grade: student.school_grade,
    status: student.status,
    gender: student.gender,
    required_surahs_count: requiredCount,
    incomplete_surahs_count: incompleteCount,
    complete_surahs_count: completeCount,
    overall_completion_percentage: overallCompletion,
    incomplete_surahs: incompleteSurahs,
    has_incomplete: incompleteCount > 0,
  };
};

/**
 * filterIncompleteStudents: فلترة الطلاب الذين لديهم سور ناقصة
 */
export const filterIncompleteStudents = (studentSummaries) => {
  return studentSummaries.filter((s) => s.has_incomplete);
};

/**
 * sortStudents: ترتيب الطلاب
 */
export const sortStudents = (students, sortBy = 'name') => {
  const sorted = [...students];
  switch (sortBy) {
    case 'incomplete_count':
      sorted.sort((a, b) => b.incomplete_surahs_count - a.incomplete_surahs_count);
      break;
    case 'completion_rate':
      sorted.sort((a, b) => b.overall_completion_percentage - a.overall_completion_percentage);
      break;
    case 'name':
    default:
      sorted.sort((a, b) => a.student_name.localeCompare(b.student_name, 'ar'));
      break;
  }
  return sorted;
};

/**
 * searchStudents: البحث عن طلاب
 */
export const searchStudents = (students, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return students;
  const term = searchTerm.toLowerCase().trim();
  return students.filter((s) => s.student_name.includes(term));
};

/**
 * calculatePageStatistics: حساب إحصائيات الصفحة
 */
export const calculatePageStatistics = (students) => {
  if (students.length === 0) {
    return {
      total_students: 0,
      total_incomplete_surahs: 0,
      average_completion_percentage: 0,
      students_with_incomplete: 0,
    };
  }

  const totalIncompleteSurahs = students.reduce((sum, s) => sum + s.incomplete_surahs_count, 0);
  let averageCompletion = students.reduce((sum, s) => sum + s.overall_completion_percentage, 0) / students.length;
  averageCompletion = Math.min(Math.round(averageCompletion), 100);

  return {
    total_students: students.length,
    total_incomplete_surahs: totalIncompleteSurahs,
    average_completion_percentage: averageCompletion,
    students_with_incomplete: students.filter((s) => s.has_incomplete).length,
  };
};

/**
 * validateStudentData: التحقق من صحة بيانات الطالب
 */
export const validateStudentData = (student) => {
  const errors = [];
  if (!student.id) errors.push('معرف الطالب مفقود');
  if (!student.name) errors.push('اسم الطالب مفقود');
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * formatSurahForDisplay: تنسيق بيانات السورة
 */
export const formatSurahForDisplay = (surah) => {
  return {
    ...surah,
    displayName: surah.name,
    displayStatus: surah.status,
    displayVerses: `${surah.memorizedVerses} من ${surah.totalVerses}`,
    displayPercentage: `${surah.completionPercentage}%`,
    statusIcon: getStatusIcon(surah.status),
    statusColor: getStatusColor(surah.status),
  };
};