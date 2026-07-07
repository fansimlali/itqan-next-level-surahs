import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Alert, Paper, Stack, Grid, Card, CardContent } from '@mui/material';
import NextLevelFilters from './NextLevelFilters';
import NextLevelStudentsTable from './NextLevelStudentsTable';
import NextLevelReportExport from './NextLevelReportExport';
import { getNextGrade, isLastGrade } from '../utils/gradeProgression';
import { calculateStudentSummary, filterIncompleteStudents, sortStudents, filterStudentsByStatus, searchStudents, calculatePageStatistics } from '../utils/nextLevelUtils';
import { supabase } from '../supabase/client';

const NextLevelSurahsPage = () => {
  const [selectedGrade, setSelectedGrade] = useState('الأول ابتدائي');
  const [activeOnly, setActiveOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [allStudents, setAllStudents] = useState([]);
  const [studentRecords, setStudentRecords] = useState({});
  const [requiredSurahs, setRequiredSurahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedStudents, setProcessedStudents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [nextGrade, setNextGrade] = useState('');

  // جلب الطلاب عند تحميل الصفحة
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('students')
          .select('id, name, school_grade, status')
          .is('deleted_at', null)
          .order('school_grade')
          .order('name');
        if (err) throw err;
        setAllStudents(data || []);
      } catch (err) {
        setError(`خطأ في جلب بيانات الطلاب: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // جلب السور المقررة عند تغيير المستوى
  useEffect(() => {
    const fetchCurriculum = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = getNextGrade(selectedGrade);
        if (!next || isLastGrade(selectedGrade)) {
          setError('هذا هو آخر مستوى دراسي - لا يوجد مستوى تالي');
          setRequiredSurahs([]);
          setNextGrade(null);
          setLoading(false);
          return;
        }
        setNextGrade(next);
        const { data, error: err } = await supabase
          .from('curriculum')
          .select('surah_name')
          .eq('school_grade', next)
          .order('surah_name');
        if (err) throw err;
        const surahs = data.map((row) => row.surah_name);
        setRequiredSurahs(surahs);
      } catch (err) {
        setError(`خطأ في جلب المقرر الدراسي: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculum();
  }, [selectedGrade]);

  // جلب سجلات الحفظ
  useEffect(() => {
    const fetchRecords = async () => {
      if (!allStudents || allStudents.length === 0) return;
      try {
        const gradeStudents = allStudents.filter((s) => s.school_grade === selectedGrade);
        const studentIds = gradeStudents.map((s) => s.id);
        if (studentIds.length === 0) return;
        const { data, error: err } = await supabase
          .from('monthly_records')
          .select('student_id, surah_name, verse_count')
          .in('student_id', studentIds);
        if (err) throw err;
        const records = {};
        data.forEach((record) => {
          if (!records[record.student_id]) {
            records[record.student_id] = {};
          }
          records[record.student_id][record.surah_name] = (records[record.student_id][record.surah_name] || 0) + record.verse_count;
        });
        setStudentRecords(records);
      } catch (err) {
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, [selectedGrade, allStudents]);

  // معالجة البيانات
  useEffect(() => {
    if (!allStudents || allStudents.length === 0 || requiredSurahs.length === 0) {
      setProcessedStudents([]);
      return;
    }
    try {
      const gradeStudents = allStudents.filter((s) => s.school_grade === selectedGrade);
      const summaries = gradeStudents.map((student) => {
        const records = studentRecords[student.id] || {};
        return calculateStudentSummary(student, requiredSurahs, records);
      });
      const incomplete = filterIncompleteStudents(summaries);
      let filtered = incomplete;
      filtered = filterStudentsByStatus(filtered, activeOnly);
      filtered = searchStudents(filtered, searchTerm);
      filtered = sortStudents(filtered, sortBy);
      setProcessedStudents(filtered);
      const stats = calculatePageStatistics(filtered);
      setStatistics(stats);
    } catch (err) {
      console.error('Error processing data:', err);
      setError('خطأ في معالجة البيانات');
    }
  }, [allStudents, requiredSurahs, studentRecords, activeOnly, searchTerm, sortBy, selectedGrade]);

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setSearchTerm('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          📚 السور الغير المحفوظة في المستوى التالي
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض الطلاب الذين لديهم سور ناقصة في المستوى الدراسي التالي - للتركيز عليها في الفترة الصيفية
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <NextLevelFilters
        selectedGrade={selectedGrade}
        onGradeChange={handleGradeChange}
        activeOnly={activeOnly}
        onActiveOnlyChange={setActiveOnly}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        disabled={loading}
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
                  السور الناقصة
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
                  المستوى التالي
                </Typography>
                <Typography variant="h6">{nextGrade || '—'}</Typography>
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
        <NextLevelStudentsTable students={processedStudents} loading={loading} nextGrade={nextGrade} />
      )}
      {processedStudents.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <NextLevelReportExport students={processedStudents} nextGrade={nextGrade} selectedGrade={selectedGrade} statistics={statistics} disabled={loading} />
        </Box>
      )}
    </Container>
  );
};

export default NextLevelSurahsPage;