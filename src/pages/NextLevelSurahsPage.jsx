import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Alert, Paper, Stack, Grid, Card, CardContent } from '@mui/material';
import NextLevelFilters from '../components/NextLevelFilters';
import NextLevelStudentsTable from '../components/NextLevelStudentsTable';
import NextLevelReportExport from '../components/NextLevelReportExport';
import { getNextGrade } from '../utils/gradeProgression';
import { sortStudents, searchStudents, calculatePageStatistics } from '../utils/nextLevelUtils';
import { SURAH_VERSES } from '../utils/surahData';
import { supabase } from '../supabase/client';
import '../styles/print.css';

const NextLevelSurahsPage = () => {
  const [selectedGrade, setSelectedGrade] = useState('الأول ابتدائي');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [allStudents, setAllStudents] = useState([]);
  const [allCurriculum, setAllCurriculum] = useState([]);
  const [allMonthlyRecords, setAllMonthlyRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedStudents, setProcessedStudents] = useState([]);
  const [statistics, setStatistics] = useState({});

  // جلب جميع البيانات
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // جلب جميع الطلاب
        const { data: studentsData, error: studentsErr } = await supabase
          .from('students')
          .select('id, name, school_grade, status, gender')
          .is('deleted_at', null)
          .order('school_grade')
          .order('name');
        if (studentsErr) throw studentsErr;
        setAllStudents(studentsData || []);

        // جلب جميع المقرر الدراسي
        const { data: curriculumData, error: currErr } = await supabase
          .from('curriculum')
          .select('school_grade, surah_name');
        if (currErr) throw currErr;
        setAllCurriculum(curriculumData || []);

        // جلب جميع سجلات الحفظ
        const { data: recordsData, error: recordsErr } = await supabase
          .from('monthly_records')
          .select('student_id, surah_name, start_verse, end_verse, verse_count');
        
        if (recordsErr) throw recordsErr;
        
        console.log('💾 عدد السجلات المجلوبة:', recordsData?.length || 0);
        
        // التحقق من بيانات الطالب 304
        const student304Records = recordsData?.filter(r => r.student_id == 304 || r.student_id == '304') || [];
        console.log('🔍 سجلات الطالب 304:', student304Records);
        
        setAllMonthlyRecords(recordsData || []);
      } catch (err) {
        setError(`خطأ في جلب البيانات: ${err.message}`);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // دالة مساعدة لتطبيع النصوص
  const normalizeStr = (str) => {
    if (!str) return '';
    return str
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .trim();
  };

  // دالة لحساب الآيات المحفوظة لسورة معينة
  const calculateMemorizedVersesForSurah = (studentId, surahName) => {
    // تحويل student_id إلى string للمقارنة
    const studentIdStr = String(studentId);
    const studentRecords = allMonthlyRecords.filter(r => String(r.student_id) === studentIdStr);
    const surahRecords = studentRecords.filter(r => normalizeStr(r.surah_name) === normalizeStr(surahName));
    
    const memorizedSet = new Set();
    surahRecords.forEach(r => {
      if (r.start_verse && r.end_verse) {
        for (let i = r.start_verse; i <= r.end_verse; i++) {
          memorizedSet.add(i);
        }
      }
    });
    
    // تسجيل للطالب 304 للتحقق
    if (studentId == 304) {
      console.log(`🔍 معالجة الطالب 304 - السورة: ${surahName}`);
      console.log(`   السجلات الموجودة: ${surahRecords.length}`);
      console.log(`   الآيات المحفوظة: ${memorizedSet.size}`);
    }
    
    return memorizedSet.size;
  };

  // معالجة البيانات
  useEffect(() => {
    if (!allStudents || allStudents.length === 0 || allCurriculum.length === 0) {
      setProcessedStudents([]);
      return;
    }

    try {
      const processed = [];

      allStudents.forEach((student) => {
        const nextGradeVal = getNextGrade(student.school_grade);
        if (!nextGradeVal) return;

        const requiredSurahs = allCurriculum
          .filter((c) => c.school_grade === nextGradeVal)
          .map((c) => c.surah_name);

        if (requiredSurahs.length === 0) return;

        // حساب السور المحفوظة لكل سورة
        const surahStatuses = requiredSurahs.map(surahName => {
          const memorizedVerses = calculateMemorizedVersesForSurah(student.id, surahName);
          const totalVerses = SURAH_VERSES[surahName] || 0;
          const completionPercentage = totalVerses > 0 ? Math.round((memorizedVerses / totalVerses) * 100) : 0;
          const isComplete = completionPercentage >= 80;
          
          return {
            name: surahName,
            memorizedVerses: memorizedVerses,
            totalVerses: totalVerses,
            completionPercentage: completionPercentage,
            status: isComplete ? 'محفوظ' : (memorizedVerses > 0 ? 'جزئي' : 'لم يبدأ')
          };
        });

        const incompleteSurahs = surahStatuses.filter(s => s.completionPercentage < 80);
        const completeSurahs = surahStatuses.filter(s => s.completionPercentage >= 80);

        const totalMemorized = surahStatuses.reduce((sum, s) => sum + s.memorizedVerses, 0);
        const totalRequired = surahStatuses.reduce((sum, s) => sum + s.totalVerses, 0);
        const overallCompletion = totalRequired > 0 ? Math.min(Math.round((totalMemorized / totalRequired) * 100), 100) : 0;

        const summary = {
          student_id: student.id,
          student_name: student.name,
          current_grade: student.school_grade,
          next_grade: nextGradeVal,
          status: student.status,
          gender: student.gender,
          required_surahs_count: requiredSurahs.length,
          incomplete_surahs_count: incompleteSurahs.length,
          complete_surahs_count: completeSurahs.length,
          overall_completion_percentage: overallCompletion,
          incomplete_surahs: incompleteSurahs,
          has_incomplete: incompleteSurahs.length > 0,
        };

        processed.push(summary);
      });

      let incomplete = processed.filter((s) => s.has_incomplete);

      incomplete = incomplete.filter((s) => {
        if (activeOnly && s.status !== 'نشط') return false;
        if (selectedStatus && s.status !== selectedStatus) return false;
        if (selectedGender && s.gender !== selectedGender) return false;
        return true;
      });

      incomplete = searchStudents(incomplete, searchTerm);
      incomplete = sortStudents(incomplete, sortBy);

      setProcessedStudents(incomplete);
      const stats = calculatePageStatistics(incomplete);
      setStatistics(stats);
    } catch (err) {
      console.error('Error processing data:', err);
      setError('خطأ في معالجة البيانات');
    }
  }, [allStudents, allCurriculum, allMonthlyRecords, activeOnly, selectedStatus, selectedGender, searchTerm, sortBy]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          📚 السور الغير المحفوظة في المستوى التالي
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض جميع الطلاب الذين لديهم سور ناقصة في مستواهم التالية
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <NextLevelFilters
        selectedGrade={selectedGrade}
        onGradeChange={setSelectedGrade}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        activeOnly={activeOnly}
        onActiveOnlyChange={setActiveOnly}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        disabled={loading}
        showGradeFilter={false}
      />

      {processedStudents.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  عدد الطلاب
                </Typography>
                <Typography variant="h5">{statistics.total_students}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي السور الناقصة
                </Typography>
                <Typography variant="h5">{statistics.total_incomplete_surahs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  نسبة الإكمال المتوسطة
                </Typography>
                <Typography variant="h5">{statistics.average_completion_percentage}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  عدد الطلاب مع سور ناقصة
                </Typography>
                <Typography variant="h5">{processedStudents.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <NextLevelStudentsTable students={processedStudents} loading={loading} />
      )}

      {processedStudents.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <NextLevelReportExport students={processedStudents} statistics={statistics} disabled={loading} />
        </Box>
      )}
    </Container>
  );
};

export default NextLevelSurahsPage;