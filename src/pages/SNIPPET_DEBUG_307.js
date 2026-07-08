        console.log('🔍 سجلات الطالب 304 (العدد):', student304Records.length);
        console.log('🔍 سجلات الطالب 307 (العدد):', student307Records.length);
        
        // البحث عن الانفطار للطالب 307
        const student307Anfal = student307Records.filter(r => r.surah_name === 'الانفطار');
        console.log('🔍 سجلات الانفطار للطالب 307:', student307Anfal);
        
        console.log('🔍 أسماء السور للطالب 307 (آدم بلحمام):');
        student307Records.forEach((rec, idx) => {
          console.log(`   ${idx + 1}. "${rec.surah_name}", آيات: ${rec.start_verse}-${rec.end_verse}`);
        });