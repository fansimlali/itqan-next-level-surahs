import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Card, CardContent, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { supabase } from '../supabase/client';

const StudentDiagnosticPage = () => {
  const [studentData, setStudentData] = useState(null);
  const [nextGradeSurahs, setNextGradeSurahs] = useState([]);
  const [memorizedRecords, setMemorizedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. جلب بيانات الطالب 66
        const { data: student, error: studentErr } = await supabase
          .from('students')
          .select('id, name, school_grade, status, gender')
          .eq('id', 66)
          .single();

        if (studentErr) throw studentErr;
        setStudentData(student);
        console.log('📋 بيانات الطالب:', student);

        // 2. تحديد المستوى التالي
        const nextGradeMap = {
          'الأول ابتدائي': 'الثاني ابتدائي',
          'الثاني ابتدائي': 'الثالث ابتدائي',
          'الثالث ابتدائي': 'الرابع ابتدائي',
          'الرابع ابتدائي': 'الخامس ابتدائي',
          'الخامس ابتدائي': 'السادس ابتدائي',
          'السادس ابتدائي': 'الأولى إعدادي',
          'الأولى إعدادي': 'الثانية إعدادي',
          'الثانية إعدادي': 'الثالثة إعدادي',
          'الثالثة إعدادي': 'الجذع المشترك',
          'الجذع المشترك': 'الأولى بكالوريا',
          'الأولى بكالوريا': 'الثانية بكالوريا',
        };

        const nextGrade = nextGradeMap[student.school_grade];
        console.log(`📚 المستوى الحالي: ${student.school_grade}`);
        console.log(`📚 المستوى التالي: ${nextGrade}`);

        if (!nextGrade) {
          throw new Error('لا يوجد مستوى تالي لهذا الطالب');
        }

        // 3. جلب السور المقررة في المستوى التالي
        const { data: surahs, error: surahsErr } = await supabase
          .from('curriculum')
          .select('surah_name')
          .eq('school_grade', nextGrade);

        if (surahsErr) throw surahsErr;
        setNextGradeSurahs(surahs || []);
        console.log(`📖 السور المقررة في ${nextGrade}:`, surahs);

        // 4. جلب جميع السجلات المحفوظة للطالب 66
        const { data: records, error: recordsErr } = await supabase
          .from('monthly_records')
          .select('surah_name, start_verse, end_verse, verse_count, month, year')
          .eq('student_id', 66);

        if (recordsErr) throw recordsErr;
        setMemorizedRecords(records || []);
        console.log('📏 السجلات المحفوظة:', records);

      } catch (err) {
        setError(`خطأ: ${err.message}`);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMemorizedVerses = (surahName) => {
    const records = memorizedRecords.filter(r => r.surah_name === surahName);
    if (records.length === 0) return { count: 0, details: [] };

    const versesSet = new Set();
    records.forEach(r => {
      for (let i = r.start_verse; i <= r.end_verse; i++) {
        versesSet.add(i);
      }
    });

    return {
      count: versesSet.size,
      details: records.map(r => `${r.start_verse}-${r.end_verse}`)
    };
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        🔍 تشخيص الطالب رقم 66
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {studentData && (
        <>
          {/* معلومات الطالب */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>📋 معلومات الطالب</Typography>
              <Typography><strong>الاسم:</strong> {studentData.name}</Typography>
              <Typography><strong>الرقم:</strong> {studentData.id}</Typography>
              <Typography><strong>المستوى الحالي:</strong> {studentData.school_grade}</Typography>
              <Typography><strong>الحالة:</strong> {studentData.status}</Typography>
              <Typography><strong>الجنس:</strong> {studentData.gender}</Typography>
            </CardContent>
          </Card>

          {/* السور المقررة في المستوى التالي */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>📚 السور المقررة في المستوى التالي</Typography>
              <Typography sx={{ mb: 2 }}>
                <strong>عدد السور:</strong> {nextGradeSurahs.length}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>السورة</strong></TableCell>
                      <TableCell align="center"><strong>الآيات المحفوظة</strong></TableCell>
                      <TableCell align="center"><strong>الحالة</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nextGradeSurahs.map((item, idx) => {
                      const memorized = getMemorizedVerses(item.surah_name);
                      const isMemorized = memorized.count > 0;

                      return (
                        <TableRow key={idx} sx={{ backgroundColor: isMemorized ? '#e8f5e9' : '#fff' }}>
                          <TableCell>{item.surah_name}</TableCell>
                          <TableCell align="center">
                            {isMemorized ? (
                              <Typography sx={{ fontSize: '14px' }}>
                                {memorized.details.join(', ')}
                              </Typography>
                            ) : (
                              <Typography sx={{ color: 'red', fontSize: '14px' }}>لم يحفظ</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {isMemorized ? '✅ محفوظ' : '❌ ناقص'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* ملخص الوضع */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>📋 ملخص الوضع</Typography>
              {(() => {
                const memorizedSurahs = nextGradeSurahs.filter(
                  s => getMemorizedVerses(s.surah_name).count > 0
                ).length;
                const incompleteSurahs = nextGradeSurahs.filter(
                  s => getMemorizedVerses(s.surah_name).count === 0
                ).length;
                const completionPercentage = Math.round(
                  (memorizedSurahs / nextGradeSurahs.length) * 100
                );

                return (
                  <>
                    <Typography>
                      <strong>السور المحفوظة:</strong> {memorizedSurahs} من {nextGradeSurahs.length}
                    </Typography>
                    <Typography>
                      <strong>السور الناقصة:</strong> {incompleteSurahs}
                    </Typography>
                    <Typography sx={{ color: completionPercentage >= 80 ? 'green' : 'orange' }}>
                      <strong>نسبة الإكمال:</strong> {completionPercentage}%
                    </Typography>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default StudentDiagnosticPage;