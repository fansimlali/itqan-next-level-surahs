  // دالة مساعدة لتطبيع النصوص
  const normalizeStr = (str) => {
    if (!str) return '';
    return str
      .replace(/^\s+/, '')
      .replace(/\s+$/, '')
      .trim();
  };

  // دالة لحساب الآيات المحفوظة لسورة معينة
  const calculateMemorizedVersesForSurah = (studentId, surahName) => {
    // تحويل student_id إلى number و string للمقارنة
    const studentIdNum = parseInt(studentId, 10);
    const studentIdStr = String(studentId);
    
    // تصفية السجلات باستخدام مقارنة مرنة (من حيث رقم الطالب)
    const studentRecords = allMonthlyRecords.filter(r => {
      const recordStudentId = parseInt(r.student_id, 10);
      return recordStudentId === studentIdNum || r.student_id === studentIdStr || String(r.student_id) === studentIdStr;
    });
    
    // تصفية بالسورة
    const surahRecords = studentRecords.filter(r => {
      const recordName = normalizeStr(r.surah_name);
      const targetName = normalizeStr(surahName);
      return recordName === targetName;
    });
    
    // DEBUG: للطالب 307 وسورة الانفطار
    if (studentIdNum === 307 && (surahName.includes('انفطار') || surahName === 'الانفطار')) {
      console.log('\n🔍 DEBUG الانفطار الطالب 307:');
      console.log('   ستودنت ID (رقم):', studentIdNum);
      console.log('   ستودنت ID (نص):', studentIdStr);
      console.log('   السورة المطلوبة:', `"${surahName}"`);
      console.log('   السورة مطبعة:', `"${normalizeStr(surahName)}"`);
      console.log('   عدد سجلات الطالب (الكلية):', studentRecords.length);
      console.log('   عدد سجلات الانفطار:', surahRecords.length);
      console.log('   مفاصيل سجلات الانفطار:', surahRecords);
    }
    
    // حساب عدد الآيات
    const memorizedSet = new Set();
    surahRecords.forEach(r => {
      if (r.start_verse && r.end_verse) {
        const startVerse = parseInt(r.start_verse, 10);
        const endVerse = parseInt(r.end_verse, 10);
        for (let i = startVerse; i <= endVerse; i++) {
          memorizedSet.add(i);
        }
      }
    });
    
    if (studentIdNum === 307 && (surahName.includes('انفطار') || surahName === 'الانفطار')) {
      console.log('   عدد الآيات المحفوظة:', memorizedSet.size);
    }
    
    return memorizedSet.size;
  };