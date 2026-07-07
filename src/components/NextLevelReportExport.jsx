import React, { useState } from 'react';
import { Box, Button, Stack, Tooltip, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const NextLevelReportExport = ({ students = [], statistics = {}, disabled = false }) => {
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (students.length === 0) return;

    const headers = ['اسم الطالب', 'المستوى الحالي', 'المستوى التالي', 'الحالة', 'الجنس', 'السور المقررة', 'السور الناقصة', 'السور المكتملة', 'نسبة الإكمال'];

    const rows = students.map((student) => [
      student.student_name,
      student.current_grade,
      student.next_grade,
      student.status || '-',
      student.gender === 'ذكر' ? 'ذكر' : 'أنثى',
      student.required_surahs_count,
      student.incomplete_surahs_count,
      student.complete_surahs_count,
      `${student.overall_completion_percentage}%`,
    ]);

    const summaryRows = [
      [],
      ['الإحصائيات'],
      ['إجمالي الطلاب', statistics.total_students || 0],
      ['إجمالي السور الناقصة', statistics.total_incomplete_surahs || 0],
      ['نسبة الإكمال المتوسطة', `${statistics.average_completion_percentage || 0}%`],
    ];

    const csvContent = [
      ['تقرير السور الناقصة', '', '', '', '', '', '', '', ''],
      [new Date().toLocaleDateString('ar-EG'), '', '', '', '', '', '', '', ''],
      [],
      headers,
      ...rows,
      ...summaryRows,
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent('\uFEFF' + csvContent)}`);
    element.setAttribute('download', `تقرير_السور_الناقصة_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setOpenExportDialog(false);
  };

  const handleCopyData = () => {
    const textToCopy = [
      `تقرير السور الناقصة`,
      `التاريخ: ${new Date().toLocaleDateString('ar-EG')}`,
      ``,
      `عدد الطلاب: ${statistics.total_students || 0}`,
      `إجمالي السور الناقصة: ${statistics.total_incomplete_surahs || 0}`,
      `نسبة الإكمال المتوسطة: ${statistics.average_completion_percentage || 0}%`,
      ``,
      ...students.map((s) => `${s.student_name} | ${s.required_surahs_count} سور | ${s.incomplete_surahs_count} ناقصة | ${s.overall_completion_percentage}%`),
    ].join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyMessage('تم النسخ بنجاح! ✅');
      setTimeout(() => setCopyMessage(''), 2000);
    });
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, '@media print': { display: 'none' } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            📥 الطباعة والتصدير
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flex: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
            <Tooltip title="طباعة التقرير">
              <span>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} disabled={disabled || students.length === 0} sx={{ borderColor: 'primary.main', color: 'primary.main', '&:hover': { backgroundColor: 'primary.light', borderColor: 'primary.main' } }}>
                  طباعة
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="تصدير إلى ملف Excel">
              <span>
                <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => setOpenExportDialog(true)} disabled={disabled || students.length === 0} sx={{ borderColor: 'success.main', color: 'success.main', '&:hover': { backgroundColor: 'success.light', borderColor: 'success.main' } }}>
                  Excel
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="نسخ البيانات">
              <span>
                <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyData} disabled={disabled || students.length === 0} sx={{ borderColor: 'info.main', color: 'info.main', '&:hover': { backgroundColor: 'info.light', borderColor: 'info.main' } }}>
                  نسخ
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        {copyMessage && <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'success.main', fontWeight: 500 }}>
          {copyMessage}
        </Typography>}
      </Paper>
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>تصدير إلى Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            سيتم تصدير {students.length} طالب مع البيانات المعلومات.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>إلغاء</Button>
          <Button onClick={handleExportExcel} variant="contained" color="success">
            تصدير
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NextLevelReportExport;