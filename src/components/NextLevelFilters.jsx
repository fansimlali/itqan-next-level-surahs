import React from 'react';
import { Box, FormControl, Select, MenuItem, FormControlLabel, Switch, TextField, Paper, Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GRADE_ORDER } from '../utils/gradeProgression';

const NextLevelFilters = ({ selectedGrade, onGradeChange, activeOnly, onActiveOnlyChange, searchTerm, onSearchChange, disabled = false }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        🔍 الفلاتر والبحث
      </Typography>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ alignItems: { xs: 'stretch', md: 'flex-start' } }}>
        <FormControl sx={{ minWidth: { xs: '100%', md: 280 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
            المستوى الدراسي
          </Typography>
          <Select value={selectedGrade} onChange={(e) => onGradeChange(e.target.value)} disabled={disabled} sx={{ backgroundColor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
            {GRADE_ORDER.map((grade) => (<MenuItem key={grade} value={grade}>{grade}</MenuItem>))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: { xs: '100%', md: 200 }, px: { xs: 0, md: 2 }, borderLeft: { xs: 'none', md: '1px solid' }, borderLeftColor: { xs: 'transparent', md: 'divider' } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.primary', whiteSpace: 'nowrap' }}>
            حالة الطلاب
          </Typography>
          <FormControlLabel control={<Switch checked={activeOnly} onChange={(e) => onActiveOnlyChange(e.target.checked)} disabled={disabled} size="medium" />} label={activeOnly ? 'نشطين فقط' : 'الكل'} sx={{ ml: 2, '& .MuiFormControlLabel-label': { fontSize: '0.95rem' } }} />
        </Box>
        <TextField placeholder="ابحث باسم الطالب..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} disabled={disabled} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ flex: { xs: 1, md: 1.5 }, minWidth: { xs: '100%', md: 200 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: 'background.default' } }} size="small" />
      </Stack>
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
        💡 اختر المستوى لعرض الطلاب الذين لديهم سور ناقصة في المستوى التالي
      </Typography>
    </Paper>
  );
};

export default NextLevelFilters;