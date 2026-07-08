import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Alert, Paper, Stack, Grid, Card, CardContent } from '@mui/material';
import NextLevelFilters from '../components/NextLevelFilters';
import NextLevelStudentsTable from '../components/NextLevelStudentsTable';
import NextLevelReportExport from '../components/NextLevelReportExport';
import { getNextGrade } from '../utils/gradeProgression';
import { calculateStudentSummary, filterIncompleteStudents, sortStudents, searchStudents, calculatePageStatistics } from '../utils/nextLevelUtils';
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
  const [studentRecords, setStudentRecords] = useState({});
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
        
        // بناء خريطة من السجلات لكل طالب
        const records = {};
        recordsData.forEach((record) => {
          if (!records[record.student_id]) {
            records[record.student_id] = {};
          }
          
          // حساب عدد الآيات من start_verse و end_verse
          // لأن verse_count قد يكون 0 أو غير صحيح
          let verseCount = record.verse_count || 0;
          if (verseCount === 0 && record.start_verse && record.end_verse) {
            verseCount = record.end_verse - record.start_verse + 1;
          }
          
          records[record.student_id][record.surah_name] = 
            (records[record.student_id][record.surah_name] || 0) + verseCount;
        });
        setStudentRecords(records);
      } catch (err) {
        setError(`خطأ في جلب البيانات: ${err.message}`);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

        const studentRecs = studentRecords[student.id] || {};
        const summary = calculateStudentSummary(student, requiredSurahs, studentRecs);
        summary.next_grade = nextGradeVal;

        processed.push(summary);
      });

      let incomplete = filterIncompleteStudents(processed);

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
  }, [allStudents, allCurriculum, studentRecords, activeOnly, selectedStatus, selectedGender, searchTerm, sortBy]);

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