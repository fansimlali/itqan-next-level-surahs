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
            console.log(`\n🔍 SURAH STATUS (307): "${surahName}"`);
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
          console.log(`\n🔍 INCOMPLETE SURAHS (307):`);
          console.log(`   Total incomplete: ${incompleteSurahs.length}`);
          incompleteSurahs.forEach(s => {
            if (s.name.includes('انفطار')) {
              console.log(`   - "${s.name}": ${s.memorizedVerses}/${s.totalVerses} (${s.completionPercentage}%)`);
            }
          });
        }