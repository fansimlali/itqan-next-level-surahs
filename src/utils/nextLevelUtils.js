/**
 * nextLevelUtils.js - Debug Version
 */

import { GRADE_PROGRESSION } from './gradeProgression';
import { SURAH_VERSES, calculateCompletionPercentage } from './surahData';

export const COMPLETION_THRESHOLD = 0.8;

/**
 * normalizeStr: تطبيع النصوص
 */
const normalizeStr = (str) => {
  if (!str) return '';
  const normalized = str
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/^\u0633\u0648\u0631\u0629\s+/, '')
    .replace(/^sura\s+/i, '')
    .trim();
  
  console.log(`normalizeStr('${str}') = '${normalized}'`);
  return normalized;
};

/**
 * getSurahStatus: تحديد حالة السورة
 */
export const getSurahStatus = (memorizedVerses, totalVerses, threshold = COMPLETION_THRESHOLD) => {
  if (totalVerses === 0) return '\u0644\u0645 \u064a\u0628\u062f\u0623';
  const completionPercentage = memorizedVerses / totalVerses;
  if (completionPercentage >= threshold) return '\u0645\u062d\u0641\u0648\u0638';
  if (completionPercentage > 0) return '\u062c\u0632\u0626\u064a';
  return '\u0644\u0645 \u064a\u0628\u062f\u0623';
};

/**
 * getStatusColor
 */
export const getStatusColor = (status) => {
  const colors = {
    '\u0645\u062d\u0641\u0648\u0638': 'success',
    '\u062c\u0632\u0626\u064a': 'warning',
    '\u0644\u0645 \u064a\u0628\u062f\u0623': 'danger',
  };
  return colors[status] || 'secondary';
};

/**
 * getStatusIcon
 */
export const getStatusIcon = (status) => {
  const icons = {
    '\u0645\u062d\u0641\u0648\u0638': '\u2705',
    '\u062c\u0632\u0626\u064a': '\u26a0\ufe0f',
    '\u0644\u0645 \u064a\u0628\u062f\u0623': '\u274c',
  };
  return icons[status] || '\u2753';
};

/**
 * calculateSurahDetails: حساب تفاصيل السورة
 */
export const calculateSurahDetails = (surahName, memorizedVerses = 0) => {
  const totalVerses = SURAH_VERSES[surahName] || 0;
  const status = getSurahStatus(memorizedVerses, totalVerses);
  let completionPercentage = calculateCompletionPercentage(memorizedVerses, totalVerses);
  completionPercentage = Math.min(Math.round(completionPercentage), 100);
  return {
    name: surahName,
    status,
    memorizedVerses,
    totalVerses,
    completionPercentage,
    isComplete: status === '\u0645\u062d\u0641\u0648\u0638',
  };
};

/**
 * calculateStudentSummary: حساب ملخص الطالب
 */
export const calculateStudentSummary = (student, requiredSurahs, studentRecords) => {
  console.log('\n========== calculateStudentSummary ==========');
  console.log('Student:', student.name, '(ID:', student.id, ')');
  console.log('Required Surahs:', requiredSurahs);
  console.log('Student Records:', studentRecords);
  console.log('============================================\n');

  const surahDetails = requiredSurahs.map((surahName) => {
    console.log(`\n--- Processing Surah: '${surahName}' ---`);
    let memorizedVerses = 0;
    const normalizedRequired = normalizeStr(surahName);
    
    console.log(`Looking for: '${normalizedRequired}'`);
    console.log('Available records:');
    
    for (const [recordedSurah, verses] of Object.entries(studentRecords)) {
      const normalizedRecorded = normalizeStr(recordedSurah);
      console.log(`  '${recordedSurah}' -> '${normalizedRecorded}' (${verses} verses)`);
      
      if (normalizedRequired === normalizedRecorded) {
        console.log(`  ✅ MATCH FOUND! ${verses} verses`);
        memorizedVerses = verses;
        break;
      }
    }
    
    if (memorizedVerses === 0) {
      console.log(`  ❌ NO MATCH FOUND for '${normalizedRequired}'`);
    }
    
    return calculateSurahDetails(surahName, memorizedVerses);
  });

  const incompleteSurahs = surahDetails.filter((s) => !s.isComplete);
  const requiredCount = requiredSurahs.length;
  const incompleteCount = incompleteSurahs.length;
  const completeCount = requiredCount - incompleteCount;

  const totalMemorized = surahDetails.reduce((sum, s) => sum + s.memorizedVerses, 0);
  const totalRequired = surahDetails.reduce((sum, s) => sum + s.totalVerses, 0);
  let overallCompletion = calculateCompletionPercentage(totalMemorized, totalRequired);
  overallCompletion = Math.min(Math.round(overallCompletion), 100);

  console.log('\nFinal Summary:');
  console.log('Incomplete Surahs Count:', incompleteCount);
  console.log('Overall Completion:', overallCompletion + '%');

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
 * filterIncompleteStudents
 */
export const filterIncompleteStudents = (studentSummaries) => {
  return studentSummaries.filter((s) => s.has_incomplete);
};

/**
 * filterStudentsByStatus
 */
export const filterStudentsByStatus = (students, activeOnly = true) => {
  if (!activeOnly) return students;
  return students.filter((s) => s.status === '\u0646\u0634\u0637');
};

/**
 * sortStudents
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
 * searchStudents
 */
export const searchStudents = (students, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return students;
  const term = searchTerm.toLowerCase().trim();
  return students.filter((s) => s.student_name.includes(term));
};

/**
 * calculatePageStatistics
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
 * validateStudentData
 */
export const validateStudentData = (student) => {
  const errors = [];
  if (!student.id) errors.push('\u0645\u0639\u0631\u0641 \u0627\u0644\u0637\u0627\u0644\u0628 \u0645\u0641\u0642\u0648\u062f');
  if (!student.name) errors.push('\u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628 \u0645\u0641\u0642\u0648\u062f');
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * formatSurahForDisplay
 */
export const formatSurahForDisplay = (surah) => {
  return {
    ...surah,
    displayName: surah.name,
    displayStatus: surah.status,
    displayVerses: `${surah.memorizedVerses} \u0645\u0646 ${surah.totalVerses}`,
    displayPercentage: `${surah.completionPercentage}%`,
    statusIcon: getStatusIcon(surah.status),
    statusColor: getStatusColor(surah.status),
  };
};