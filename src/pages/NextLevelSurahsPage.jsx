  // معالجة البيانات
  useEffect(() => {
    console.log('\n🔜 PROCESSING HOOK RUNNING');
    console.log('   allMonthlyRecords.length:', allMonthlyRecords.length);
    console.log('   allStudents.length:', allStudents.length);
    console.log('   allCurriculum.length:', allCurriculum.length);
    
    if (!allStudents || allStudents.length === 0 || allCurriculum.length === 0) {
      console.log('   ⚠️ Missing data, skipping processing');
      setProcessedStudents([]);
      return;
    }

    try {
      const processed = [];

      allStudents.forEach((student) => {
        const nextGradeVal = getNextGrade(student.school_grade);
        if (!nextGradeVal) return;

        const requiredSurahs = allCurriculum
          .filter((c) => c.school_grade === nextGradeVal)
          .map((c) => c.surah_name);

        if (requiredSurahs.length === 0) return;

        // حساب السور المحفوظة لكل سورة
        const surahStatuses = requiredSurahs.map(surahName => {
          const memorizedVerses = calculateMemorizedVersesForSurah(student.id, surahName);
          const totalVerses = SURAH_VERSES[surahName] || 0;
          const completionPercentage = totalVerses > 0 ? Math.round((memorizedVerses / totalVerses) * 100) : 0;
          const isComplete = completionPercentage >= 80;
          
          // DEBUG: للطالب 307
          if (student.id == 307 && surahName.includes('انفطار')) {
            console.log(`\n🔍 SURAH STATUS CALC (307): "${surahName}"`);
            console.log(`   memorizedVerses: ${memorizedVerses}`);
            console.log(`   totalVerses: ${totalVerses}`);
            console.log(`   completionPercentage: ${completionPercentage}%`);
            console.log(`   isComplete: ${isComplete}`);
          }
          
          return {
            name: surahName,
            memorizedVerses: memorizedVerses,
            totalVerses: totalVerses,
            completionPercentage: completionPercentage,
            status: isComplete ? 'محفوظ' : (memorizedVerses > 0 ? 'جزئي' : 'لم يبدأ')
          };
        });

        const incompleteSurahs = surahStatuses.filter(s => s.completionPercentage < 80);
        const completeSurahs = surahStatuses.filter(s => s.completionPercentage >= 80);
        
        // DEBUG: للطالب 307
        if (student.id == 307) {
          console.log(`\n🔍 SURAHS FOR 307 AFTER FILTER:`);
          console.log(`   incomplete (< 80%): ${incompleteSurahs.length}`);
          incompleteSurahs.forEach(s => {
            if (s.name.includes('انفطار')) {
              console.log(`   - "${s.name}": ${s.memorizedVerses}/${s.totalVerses}`);
            }
          });
        }

        const totalMemorized = surahStatuses.reduce((sum, s) => sum + s.memorizedVerses, 0);
        const totalRequired = surahStatuses.reduce((sum, s) => sum + s.totalVerses, 0);
        const overallCompletion = totalRequired > 0 ? Math.min(Math.round((totalMemorized / totalRequired) * 100), 100) : 0;

        const summary = {
          student_id: student.id,
          student_name: student.name,
          current_grade: student.school_grade,
          next_grade: nextGradeVal,
          status: student.status,
          gender: student.gender,
          required_surahs_count: requiredSurahs.length,
          incomplete_surahs_count: incompleteSurahs.length,
          complete_surahs_count: completeSurahs.length,
          overall_completion_percentage: overallCompletion,
          incomplete_surahs: incompleteSurahs,
          has_incomplete: incompleteSurahs.length > 0,
        };

        processed.push(summary);
      });

      let incomplete = processed.filter((s) => s.has_incomplete);

      incomplete = incomplete.filter((s) => {
        if (activeOnly && s.status !== 'نشط') return false;
        if (selectedStatus && s.status !== selectedStatus) return false;
        if (selectedGender && s.gender !== selectedGender) return false;
        return true;
      });

      incomplete = searchStudents(incomplete, searchTerm);
      incomplete = sortStudents(incomplete, sortBy);

      setProcessedStudents(incomplete);
      const stats = calculatePageStatistics(incomplete);
      setStatistics(stats);
      
      console.log('\n✅ PROCESSING COMPLETE');
      console.log('   Final processed students:', incomplete.length);
    } catch (err) {
      console.error('Error processing data:', err);
      setError('خطأ في معالجة البيانات');
    }
  }, [allStudents, allCurriculum, allMonthlyRecords, activeOnly, selectedStatus, selectedGender, searchTerm, sortBy]);