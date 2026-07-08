  // دالة لحساب الآيات المحفوظة لسورة معينة
  const calculateMemorizedVersesForSurah = (studentId, surahName) => {
    // تحويل student_id إلى string للمقارنة
    const studentIdStr = String(studentId);
    const studentRecords = allMonthlyRecords.filter(r => String(r.student_id) === studentIdStr);
    const surahRecords = studentRecords.filter(r => normalizeStr(r.surah_name) === normalizeStr(surahName));
    
    // DEBUG: للطالب 307 وسورة الانفطار
    if (studentId == 307 && (surahName.includes('انفطار') || surahName === 'الانفطار')) {
      console.log('\n�\udd0d DEBUG الانفطار الطالب 307:');
      console.log('   السورة المطلوبة:', `"${surahName}"`);
      console.log('   السورة مطبعة:', `"${normalizeStr(surahName)}"`);
      console.log('   عدد سجلات الطالب:', studentRecords.length);
      console.log('   السجلات الكاملة للطالب:', studentRecords.map(r => `"${r.surah_name}"` + ` [المطبعة: "${normalizeStr(r.surah_name)}"]`));
      console.log('   عدد سجلات الانفطار:', surahRecords.length);
      if (surahRecords.length > 0) {
        console.log('   سجلات الانفطار:', surahRecords);
      } else {
        console.log('   ⚠️ لم يتم ايجاد سجلات مطابقة!');
      }
    }
    
    const memorizedSet = new Set();
    surahRecords.forEach(r => {
      if (r.start_verse && r.end_verse) {
        for (let i = r.start_verse; i <= r.end_verse; i++) {
          memorizedSet.add(i);
        }
      }
    });
    
    return memorizedSet.size;
  };