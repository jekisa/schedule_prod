import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import Supplier from '@/models/Supplier';
import Article from '@/models/Article';
import { getUserFromToken } from '@/lib/auth';
import { calculateAutoStatus } from '@/lib/scheduleUtils';

// GET - Ambil semua schedule untuk laporan (semua jenis, semua status kecuali cancelled)
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // optional: potong|jahit|sablon|bordir
    const statusFilter = searchParams.get('status'); // optional: scheduled|in_progress|completed

    const query = {};
    if (type && ['potong', 'jahit', 'sablon', 'bordir'].includes(type)) {
      query.schedule_type = type;
    }

    const schedules = await Schedule.find(query)
      .populate('pic_id', 'full_name')
      .populate('supplier_id', 'supplier_name')
      .populate('article_id', 'article_name')
      .sort({ start_date: -1 });

    const transformed = schedules.map((s) => {
      const obj = s.toJSON();
      const autoStatus = calculateAutoStatus(obj.start_date, obj.end_date, obj.status);
      return {
        ...obj,
        status: autoStatus,
        pic_name: s.pic_id?.full_name || null,
        supplier_name: s.supplier_id?.supplier_name || null,
        article_full_name: s.article_id?.article_name || null,
        pic_id: s.pic_id?._id || s.pic_id,
        supplier_id: s.supplier_id?._id || s.supplier_id,
        article_id: s.article_id?._id || s.article_id,
      };
    });

    // Filter by auto-calculated status, always exclude cancelled unless explicitly requested
    const filtered = statusFilter
      ? transformed.filter((s) => s.status === statusFilter)
      : transformed.filter((s) => s.status !== 'cancelled');

    return NextResponse.json({ schedules: filtered });
  } catch (error) {
    console.error('Get report schedules error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
