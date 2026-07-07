import React from 'react';
import { Box, FormControl, Select, MenuItem, FormControlLabel, Switch, TextField, Paper, Stack, Typography, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { GRADE_ORDER } from '../utils/gradeProgression';

const NextLevelFilters = ({ 
  selectedGrade, 
  onGradeChange, 
  selectedStatus, 
  onStatusChange,
  selectedGender,
  onGenderChange,
  activeOnly, 
  onActiveOnlyChange, 
  searchTerm, 
  onSearchChange, 
  disabled = false,
  showGradeFilter = true 
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        🔍 الفلاتر والبحث
      </Typography>
      <Stack spacing={2} direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ alignItems: { xs: 'stretch', md: 'flex-start' }, flexWrap: 'wrap' }}>
        {/* فلتر المستوى */}
        {showGradeFilter && (
          <FormControl sx={{ minWidth: { xs: '100%', md: 250 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
              المستوى الدراسي
            </Typography>
            <Select value={selectedGrade} onChange={(e) => onGradeChange(e.target.value)} disabled={disabled} sx={{ backgroundColor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
              {GRADE_ORDER.map((grade) => (<MenuItem key={grade} value={grade}>{grade}</MenuItem>))}
            </Select>
          </FormControl>
        )}

        {/* فلتر الحالة */}
        <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
            الحالة
          </Typography>
          <Select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} disabled={disabled} sx={{ backgroundColor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="نشط">نشط</MenuItem>
            <MenuItem value="منقطع">منقطع</MenuItem>
          </Select>
        </FormControl>

        {/* فلتر الجنس */}
        <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}>
            الجنس
          </Typography>
          <Select value={selectedGender} onChange={(e) => onGenderChange(e.target.value)} disabled={disabled} sx={{ backgroundColor: 'background.default', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}>
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="ذكر">ذكر</MenuItem>
            <MenuItem value="أنثى">أنثى</MenuItem>
          </Select>
        </FormControl>

        {/* حقل البحث */}
        <TextField placeholder="ابحث باسم الطالب..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} disabled={disabled} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ flex: { xs: 1, md: 1 }, minWidth: { xs: '100%', md: 200 }, '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: 'background.default' } }} size="small" />
      </Stack>

      {/* نص معلومات */}
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
        💡 استخدم الفلاتر لعرض الطلاب الذين لديهم سور ناقصة في المستوى التالي
      </Typography>
    </Paper>
  );
};

export default NextLevelFilters;