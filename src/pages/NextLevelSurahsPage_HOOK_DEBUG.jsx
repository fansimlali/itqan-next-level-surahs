  // معالجة البيانات
  useEffect(() => {
    console.log('\n🔜 PROCESSING HOOK RE-RUN');
    console.log('   allMonthlyRecords.length:', allMonthlyRecords.length);
    
    if (!allStudents || allStudents.length === 0 || allCurriculum.length === 0) {
      setProcessedStudents([]);
      return;
    }