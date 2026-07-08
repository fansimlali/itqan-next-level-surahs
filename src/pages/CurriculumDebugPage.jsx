import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { supabase } from '../supabase/client';

const CurriculumDebugPage = () => {
  const [studentId, setStudentId] = useState('304');
  const [curriculum, setCurriculum] = useState([]);
  const [studentRecords, setStudentRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setCurriculum([]);
    setStudentRecords([]);
    setStudentData(null);
    
    try {
      // جلب بيانات الطالب
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentErr) throw new Error(`خطأ في جلب الطالب: ${studentErr.message}`);
      setStudentData(student);
      console.log('Student:', student);

      // جلب المقرر الدراسي للمستوى الحالي
      const { data: currData, error: currErr } = await supabase
        .from('curriculum')
        .select('school_grade, surah_name')
        .eq('school_grade', student.school_grade);
      
      if (currErr) throw new Error(`خطأ في جلب المقرر: ${currErr.message}`);
      setCurriculum(currData || []);
      console.log('Curriculum for current grade:', currData);

      // جلب السجلات المحفوظة
      const { data: records, error: recordsErr } = await supabase
        .from('monthly_records')
        .select('surah_name, start_verse, end_verse, verse_count')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: false });
      
      if (recordsErr) throw new Error(`خطأ في جلب السجلات: ${recordsErr.message}`);
      setStudentRecords(records || []);
      console.log('Student records:', records);
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // استخراج أسماء السور الفريدة من السجلات
  const uniqueMemoizedSurahs = [...new Set(studentRecords.map(r => r.surah_name))];

  // مقارنة
  const comparisonData = curriculum.map(curr => {
    const isMemoized = uniqueMemoizedSurahs.includes(curr.surah_name);
    return {
      ...curr,
      isMemoized
    };
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
          🔍 صفحة تشخيص المناهج الدراسية
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="معرف الطالب"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            type="text"
            size="small"
          />
          <Button variant="contained" onClick={handleCheck} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'تحقق'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {studentData && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            👤 بيانات الطالب:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">معرف الطالب</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.id}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">الاسم</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.name}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary">المستوى الدراسي الحالي</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.school_grade}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {curriculum.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📖 السور المقررة في المستوى الحالي:
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {curriculum.length} سورة مقررة
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>اسم السورة</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>محفوظة؟</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {curriculum.map((curr, idx) => {
                  const isMemorized = uniqueMemoizedSurahs.includes(curr.surah_name);
                  return (
                    <TableRow 
                      key={idx}
                      sx={{ 
                        backgroundColor: isMemorized ? '#e8f5e9' : '#ffebee'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {curr.surah_name}
                      </TableCell>
                      <TableCell align="center">
                        {isMemorized ? (
                          <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✅ نعم</span>
                        ) : (
                          <span style={{ color: '#F44336', fontWeight: 'bold' }}>❌ لا</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {studentRecords.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            💾 جميع السور المحفوظة للطالب:
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {uniqueMemoizedSurahs.length} سورة فريدة
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#9c27b0' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>اسم السورة</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>من الآية</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>إلى الآية</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>عدد الآيات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentRecords.map((record, idx) => {
                  const calculatedVerses = record.verse_count || (record.end_verse - record.start_verse + 1);
                  return (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 500 }}>{record.surah_name}</TableCell>
                      <TableCell align="center">{record.start_verse}</TableCell>
                      <TableCell align="center">{record.end_verse}</TableCell>
                      <TableCell align="center">{calculatedVerses}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {curriculum.length > 0 && studentRecords.length > 0 && (
        <Paper sx={{ p: 3, backgroundColor: '#fff3e0' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#f57c00' }}>
            🔎 ملخص المقارنة:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  السور المقررة المحفوظة
                </Typography>
                <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                  {comparisonData.filter(c => c.isMemoized).length} / {curriculum.length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  السور المقررة الناقصة
                </Typography>
                <Typography variant="h5" sx={{ color: '#F44336' }}>
                  {comparisonData.filter(c => !c.isMemoized).length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default CurriculumDebugPage;