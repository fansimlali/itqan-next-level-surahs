import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { supabase } from '../supabase/client';

const CurriculumViewerPage = () => {
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const { data, error: err } = await supabase
          .from('curriculum')
          .select('school_grade, surah_name')
          .order('school_grade');
        
        if (err) throw err;
        setCurriculum(data || []);
      } catch (err) {
        setError(`خطأ في جلب البيانات: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, []);

  // تجميع السور حسب المستوى الدراسي
  const groupedByGrade = curriculum.reduce((acc, item) => {
    if (!acc[item.school_grade]) {
      acc[item.school_grade] = [];
    }
    acc[item.school_grade].push(item.surah_name);
    return acc;
  }, {});

  // ترتيب المستويات
  const grades = Object.keys(groupedByGrade).sort();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '500px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
          📖 المناهج الدراسية - السور المقررة لكل مستوى
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عرض شامل للسور المقررة في كل مستوى دراسي
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {grades.map((grade) => (
          <Grid item xs={12} md={6} key={grade}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  {grade}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  عدد السور: {groupedByGrade[grade].length}
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 1.5
                }}>
                  {groupedByGrade[grade].map((surah, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {surah}
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ملخص نصي */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: 'background.default' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          📋 ملخص المناهج:
        </Typography>
        {grades.map((grade) => (
          <Typography key={grade} variant="body2" sx={{ mb: 1 }}>
            <strong>{grade}:</strong> {groupedByGrade[grade].join(' - ')}
          </Typography>
        ))}
      </Paper>
    </Container>
  );
};

export default CurriculumViewerPage;