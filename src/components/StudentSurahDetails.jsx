import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Box, Typography, Stack } from '@mui/material';
import { getStatusColor, getStatusIcon } from '../utils/nextLevelUtils';

const StudentSurahDetails = ({ incomplete_surahs, isExpanded = true }) => {
  if (!isExpanded || !incomplete_surahs || incomplete_surahs.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ✅ لا توجد سور ناقصة
        </Typography>
      </Box>
    );
  }

  const statusColorMap = {
    'محفوظ': '#4CAF50',
    'جزئي': '#FFC107',
    'لم يبدأ': '#F44336',
  };

  const statusLabelMap = {
    'محفوظ': 'محفوظ',
    'جزئي': 'جزئي',
    'لم يبدأ': 'لم يبدأ',
  };

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: 'background.default', borderRadius: 1, overflow: 'hidden', '& table': { '& td, & th': { padding: '12px' } } }}>
      <Table size="small" aria-label="سور ناقصة">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light', '& th': { fontWeight: 600, color: 'primary.dark', padding: '12px 8px', fontSize: '0.9rem' } }}>
            <TableCell align="right" width="30%">
              السورة
            </TableCell>
            <TableCell align="center" width="20%">
              الحالة
            </TableCell>
            <TableCell align="center" width="15%">
              محفوظ / إجمالي
            </TableCell>
            <TableCell align="center" width="35%">
              نسبة الإكمال
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomplete_surahs.map((surah) => {
            const statusColor = statusColorMap[surah.status];
            const statusLabel = statusLabelMap[surah.status];
            const completionPercentage = Math.min(surah.completionPercentage || 0, 100);

            return (
              <TableRow
                key={surah.name}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:hover': { backgroundColor: 'action.selected' },
                  '& td': { padding: '12px 8px', borderBottom: '0.5px solid', borderBottomColor: 'divider' },
                }}
                className="printable-row"
              >
                <TableCell align="right" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <span>{surah.name}</span>
                    <span className="no-print">{getStatusIcon(surah.status)}</span>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={statusLabel}
                    size="small"
                    sx={{
                      backgroundColor: statusColor,
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 500 }}>
                  {surah.memorizedVerses} / {surah.totalVerses}
                </TableCell>
                <TableCell align="center">
                  <Stack spacing={0.5}>
                    <LinearProgress
                      variant="determinate"
                      value={completionPercentage}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: 'action.disabled',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: statusColor,
                        },
                      }}
                      className="printable-progress"
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
                      {completionPercentage}%
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentSurahDetails;