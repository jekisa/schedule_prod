import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { getUserFromToken } from '@/lib/auth';
import { calculateAutoStatus } from '@/lib/scheduleUtils';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Ambil semua schedule dari semua tipe (kecuali yang cancelled)
    const schedules = await Schedule.find({
      status: { $ne: 'cancelled' }
    })
      .populate('pic_id', 'full_name')
      .populate('supplier_id', 'supplier_name')
      .populate('article_id', 'article_name')
      .sort({ start_date: 1 });

    // Transform data dengan auto status
    const allSchedules = schedules.map((schedule) => {
      const scheduleObj = schedule.toJSON();
      const autoStatus = calculateAutoStatus(
        scheduleObj.start_date,
        scheduleObj.end_date,
        scheduleObj.status
      );

      return {
        ...scheduleObj,
        status: autoStatus,
        type: schedule.schedule_type,
        pic_name: schedule.pic_id?.full_name || null,
        supplier_name: schedule.supplier_id?.supplier_name || null,
        article_full_name: schedule.article_id?.article_name || null,
        pic_id: schedule.pic_id?._id || schedule.pic_id,
        supplier_id: schedule.supplier_id?._id || schedule.supplier_id,
        article_id: schedule.article_id?._id || schedule.article_id,
      };
    });

    // Filter hanya yang scheduled atau in_progress untuk dashboard
    const activeSchedules = allSchedules.filter(
      (s) => s.status === 'scheduled' || s.status === 'in_progress'
    );

    // Hitung statistik berdasarkan auto status
    const stats = {
      total: activeSchedules.length,
      potong: activeSchedules.filter((s) => s.schedule_type === 'potong').length,
      jahit: activeSchedules.filter((s) => s.schedule_type === 'jahit').length,
      sablon: activeSchedules.filter((s) => s.schedule_type === 'sablon').length,
      bordir: activeSchedules.filter((s) => s.schedule_type === 'bordir').length,
      scheduled: activeSchedules.filter((s) => s.status === 'scheduled').length,
      in_progress: activeSchedules.filter((s) => s.status === 'in_progress').length,
    };

    return NextResponse.json({
      stats,
      schedules: activeSchedules,
      upcomingSchedules: activeSchedules,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
