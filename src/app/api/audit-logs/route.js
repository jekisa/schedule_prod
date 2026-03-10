import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const entity_type = searchParams.get('entity_type');
    const action = searchParams.get('action');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const user_id = searchParams.get('user_id');

    const query = {};
    if (entity_type) query.entity_type = entity_type;
    if (action) query.action = action;
    if (user_id) query.user_id = user_id;
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
