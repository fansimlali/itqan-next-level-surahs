        console.log('\ud83d\udcbe \u0639\u062f\u062f \u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0645\u062c\u0644\u0648\u0628\u0629 (\u0628\u0639\u062f Pagination):', allRecordsData.length);
        
        // \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0627\u0644\u0628 304 \u0648 307
        const student304Records = allRecordsData?.filter(r => r.student_id == 304 || r.student_id == '304') || [];
        const student307Records = allRecordsData?.filter(r => r.student_id == 307 || r.student_id == '307') || [];
        
        console.log('\ud83d\udd0d \u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0637\u0627\u0644\u0628 304 (\u0627\u0644\u0639\u062f\u062f):', student304Records.length);
        console.log('\ud83d\udd0d \u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0637\u0627\u0644\u0628 307 \u0622\u062f\u0645 \u0628\u0644\u062d\u0645\u0627\u0645 (\u0627\u0644\u0639\u062f\u062f):', student307Records.length);
        
        console.log('\ud83d\udd0d \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0633\u0648\u0631 \u0644\u0644\u0637\u0627\u0644\u0628 307 (\u0622\u062f\u0645 \u0628\u0644\u062d\u0645\u0627\u0645):');
        student307Records.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. "${rec.surah_name}", \u0622\u064a\u0627\u062a: ${rec.start_verse}-${rec.end_verse}`);
        });
        
        // \u0627\u0644\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u0627\u0646\u0641\u0637\u0627\u0631 \u0628\u0627\u0644\u062a\u062d\u062f\u064a\u062f
        const student307Anfal = student307Records.filter(r => r.surah_name === '\u0627\u0644\u0627\u0646\u0641\u0637\u0627\u0631');
        console.log('\ud83d\udd0d \u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0627\u0646\u0641\u0637\u0627\u0631 \u0644\u0644\u0637\u0627\u0644\u0628 307:', student307Anfal);