import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box, Typography, LinearProgress, Stack, Chip, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import StudentSurahDetails from './StudentSurahDetails';

const NextLevelStudentsTable = ({ students, loading = false, nextGrade = '' }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (studentId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          جاري تحميل البيانات...
        </Typography>
      </Paper>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ✅ لا توجد طلاب لديهم سور ناقصة - جميع الطلاب أكملوا المقرر!
        </Typography>
      </Paper>
    );
  }

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 50) return '#FFC107';
    return '#F44336';
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table aria-label="جدول الطلاب" stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main', '& th': { fontWeight: 700, color: 'white', padding: '16px 12px', fontSize: '0.95rem' } }}>
            <TableCell align="center" width="40px" />
            <TableCell align="right" width="18%">
              اسم الطالب
            </TableCell>
            <TableCell align="center" width="12%">
              المستوى الحالي
            </TableCell>
            <TableCell align="center" width="12%">
              المستوى التالي
            </TableCell>
            <TableCell align="center" width="10%">
              سور مقررة
            </TableCell>
            <TableCell align="center" width="10%">
              سور ناقصة
            </TableCell>
            <TableCell align="center" width="22%">
              نسبة الإكمال
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => {
            const isExpanded = expandedRows[student.student_id];
            const completionPercentage = student.overall_completion_percentage || 0;
            const completionColor = getCompletionColor(completionPercentage);

            return (
              <React.Fragment key={student.student_id}>
                <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'background.default' }, '&:hover': { backgroundColor: 'action.hover' }, cursor: 'pointer', transition: 'background-color 0.2s', '& td': { padding: '14px 12px', borderBottom: '0.5px solid', borderBottomColor: 'divider' } }} onClick={() => toggleExpand(student.student_id)}>
                  <TableCell align="center" sx={{ width: '40px' }}>
                    <Tooltip title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}>
                      <IconButton size="small" sx={{ color: 'primary.main' }}>
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.95rem' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                      <span>{student.student_name}</span>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={student.current_grade} size="small" variant="outlined" sx={{ fontSize: '0.8rem', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={nextGrade || student.current_grade} size="small" color="primary" sx={{ fontSize: '0.8rem', fontWeight: 500 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: 'monospace' }}>
                      {student.required_surahs_count}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#F44336', fontFamily: 'monospace' }}>
                      {student.incomplete_surahs_count}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={0.5} sx={{ width: '100%' }}>
                      <LinearProgress variant="determinate" value={completionPercentage} sx={{ height: 8, borderRadius: 1, backgroundColor: 'action.disabled', '& .MuiLinearProgress-bar': { backgroundColor: completionColor, borderRadius: 1 } }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}>
                        {completionPercentage}%
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: isExpanded ? 'action.selected' : 'transparent' }}>
                  <TableCell colSpan={7} sx={{ padding: 0 }}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                          السور الناقصة ({student.incomplete_surahs_count} من {student.required_surahs_count})
                        </Typography>
                        <StudentSurahDetails incomplete_surahs={student.incomplete_surahs} isExpanded={true} />
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NextLevelStudentsTable;