import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, CircularProgress } from '@mui/material';
import { supabase } from '../supabase/client';

const DiagnosticPage = () => {
  const [studentId, setStudentId] = useState('304');
  const [studentData, setStudentData] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setStudentData(null);
    setRecords([]);
    
    try {
      // جلب بيانات الطالب
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentErr) throw new Error(`خطأ في جلب بيانات الطالب: ${studentErr.message}`);
      
      setStudentData(student);
      console.log('بيانات الطالب:', student);

      // جلب جميع سجلات الحفظ
      const { data: recordsData, error: recordsErr } = await supabase
        .from('monthly_records')
        .select('*')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: false });
      
      if (recordsErr) throw new Error(`خطأ في جلب السجلات: ${recordsErr.message}`);
      
      setRecords(recordsData || []);
      console.log('السجلات الكاملة:', recordsData);
      
    } catch (err) {
      setError(err.message);
      console.error('خطأ:', err);
    } finally {
      setLoading(false);
    }
  };

  const qafTotal = records
    .filter(r => r.surah_name === 'سورة ق')
    .reduce((sum, r) => sum + (r.verse_count || 0), 0);
  
  const luqmanTotal = records
    .filter(r => r.surah_name === 'سورة لقمان')
    .reduce((sum, r) => sum + (r.verse_count || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
          🔍 صفحة التشخيص - التحقق من سجلات الطالب
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
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">معرف الطالب</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">الاسم</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.name}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">المستوى</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.school_grade}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">الحالة</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.status}</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {records.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📊 إجمالي السجلات: {records.length}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <Paper sx={{ p: 2, backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
                <Typography variant="caption" color="text.secondary">سورة ق</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
                  {qafTotal} آية
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {records.filter(r => r.surah_name === 'سورة ق').length} سجلات
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, backgroundColor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
                <Typography variant="caption" color="text.secondary">سورة لقمان</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#9c27b0' }}>
                  {luqmanTotal} آية
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {records.filter(r => r.surah_name === 'سورة لقمان').length} سجلات
                </Typography>
              </Paper>
            </Box>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            جميع السجلات:
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1976d2' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>السورة</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>الآيات</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>من</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>إلى</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>التاريخ</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>الختمة</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record, idx) => {
                  const isHighlighted = record.surah_name === 'سورة ق' || record.surah_name === 'سورة لقمان';
                  const bgColor = record.surah_name === 'سورة ق' ? '#fff3e0' : record.surah_name === 'سورة لقمان' ? '#f3e5f5' : 'transparent';
                  
                  return (
                    <TableRow 
                      key={idx} 
                      sx={{ 
                        backgroundColor: bgColor,
                        fontWeight: isHighlighted ? 'bold' : 'normal',
                        borderLeft: isHighlighted ? '4px solid #ff9800' : 'none'
                      }}
                    >
                      <TableCell sx={{ fontWeight: isHighlighted ? 'bold' : 'normal' }}>
                        {record.surah_name}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: isHighlighted ? 'bold' : 'normal' }}>
                        {record.verse_count}
                      </TableCell>
                      <TableCell align="center">{record.start_verse || '-'}</TableCell>
                      <TableCell align="center">{record.end_verse || '-'}</TableCell>
                      <TableCell align="center">
                        {new Date(record.recorded_at).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell align="center">{record.khatmah_number || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {records.length === 0 && studentData && !loading && (
        <Alert severity="warning">
          ⚠️ لا توجد سجلات حفظ لهذا الطالب
        </Alert>
      )}
    </Container>
  );
};

export default DiagnosticPage;