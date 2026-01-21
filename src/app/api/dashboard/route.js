import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua schedule dari 4 tabel
    const [potong, jahit, sablon, bordir] = await Promise.all([
      query(`
        SELECT 
          sp.*,
          'potong' as type,
          a.article_name as article_full_name,
          u.full_name as pic_name,
          s.supplier_name
        FROM schedule_potong sp
        LEFT JOIN articles a ON sp.article_id = a.id
        LEFT JOIN users u ON sp.pic_id = u.id
        LEFT JOIN suppliers s ON sp.supplier_id = s.id
        WHERE sp.status IN ('scheduled', 'in_progress')
        ORDER BY sp.start_date ASC
      `),
      query(`
        SELECT 
          sj.*,
          'jahit' as type,
          a.article_name as article_full_name,
          u.full_name as pic_name,
          s.supplier_name
        FROM schedule_jahit sj
        LEFT JOIN articles a ON sj.article_id = a.id
        LEFT JOIN users u ON sj.pic_id = u.id
        LEFT JOIN suppliers s ON sj.supplier_id = s.id
        WHERE sj.status IN ('scheduled', 'in_progress')
        ORDER BY sj.start_date ASC
      `),
      query(`
        SELECT 
          ss.*,
          'sablon' as type,
          a.article_name as article_full_name,
          u.full_name as pic_name,
          s.supplier_name
        FROM schedule_sablon ss
        LEFT JOIN articles a ON ss.article_id = a.id
        LEFT JOIN users u ON ss.pic_id = u.id
        LEFT JOIN suppliers s ON ss.supplier_id = s.id
        WHERE ss.status IN ('scheduled', 'in_progress')
        ORDER BY ss.start_date ASC
      `),
      query(`
        SELECT 
          sb.*,
          'bordir' as type,
          a.article_name as article_full_name,
          u.full_name as pic_name,
          s.supplier_name
        FROM schedule_bordir sb
        LEFT JOIN articles a ON sb.article_id = a.id
        LEFT JOIN users u ON sb.pic_id = u.id
        LEFT JOIN suppliers s ON sb.supplier_id = s.id
        WHERE sb.status IN ('scheduled', 'in_progress')
        ORDER BY sb.start_date ASC
      `)
    ]);

    // Gabungkan semua schedule
    const allSchedules = [...potong, ...jahit, ...sablon, ...bordir];

    // Hitung statistik
    const stats = {
      total: allSchedules.length,
      potong: potong.length,
      jahit: jahit.length,
      sablon: sablon.length,
      bordir: bordir.length,
      scheduled: allSchedules.filter(s => s.status === 'scheduled').length,
      in_progress: allSchedules.filter(s => s.status === 'in_progress').length,
    };

    // Sort all schedules by start_date
    const sortedSchedules = allSchedules.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    return NextResponse.json({
      stats,
      schedules: sortedSchedules,
      upcomingSchedules: sortedSchedules,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
