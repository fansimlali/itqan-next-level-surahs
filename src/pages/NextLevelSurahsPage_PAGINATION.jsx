        // جلب جميع سجلات الحفظ - بدون حد للنتائج
        let allRecordsData = [];
        let pageIndex = 0;
        const pageSize = 1000;
        let hasMore = true;
        
        while (hasMore) {
          const { data: recordsPage, error: recordsErr, count } = await supabase
            .from('monthly_records')
            .select('student_id, surah_name, start_verse, end_verse, verse_count', { count: 'exact' })
            .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);
          
          if (recordsErr) throw recordsErr;
          
          if (recordsPage && recordsPage.length > 0) {
            allRecordsData = [...allRecordsData, ...recordsPage];
            pageIndex++;
            // الحق من هل هناك طلبات أخرى
            hasMore = recordsPage.length === pageSize;
          } else {
            hasMore = false;
          }
        }
        
        console.log('💾 عدد السجلات المجلوبة (بعد Pagination):', allRecordsData.length);
        
        // التحقق من بيانات الطالب 304
        const student304Records = allRecordsData?.filter(r => r.student_id == 304 || r.student_id == '304') || [];
        console.log('🔍 سجلات الطالب 304 (العدد):', student304Records.length);
        
        setAllMonthlyRecords(allRecordsData || []);