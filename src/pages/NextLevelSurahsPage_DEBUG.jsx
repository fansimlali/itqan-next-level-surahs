        // التحقق من بيانات الطالب 304
        const student304Records = recordsData?.filter(r => r.student_id == 304 || r.student_id == '304') || [];
        console.log('💾 عدد السجلات المجلوبة:', recordsData?.length || 0);
        console.log('🔍 سجلات الطالب 304:', student304Records);
        
        // طباعة أسماء السور بالضبط
        console.log('🔍 أسماء السور للطالب 304:');
        student304Records.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. "سورة": "${rec.surah_name}", آيات: ${rec.start_verse}-${rec.end_verse}`);
        });