        // التحقق من بيانات الطلاب 304 و 307
        const student304Records = allRecordsData?.filter(r => r.student_id == 304 || r.student_id == '304') || [];
        const student307Records = allRecordsData?.filter(r => r.student_id == 307 || r.student_id == '307') || [];
        console.log('💾 عدد السجلات المجلوبة (بعد Pagination):', allRecordsData.length);
        console.log('🔍 سجلات الطالب 304 (العدد):', student304Records.length);
        console.log('🔍 سجلات الطالب 307 (العدد):', student307Records.length);
        
        console.log('🔍 أسماء السور للطالب 307:');
        student307Records.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. "سورة": "${rec.surah_name}", آيات: ${rec.start_verse}-${rec.end_verse}`);
        });