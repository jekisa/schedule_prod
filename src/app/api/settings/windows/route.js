import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Window from '@/models/Window';
import { getUserFromToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const windows = await Window.find({ is_active: true }).sort({ window_name: 1 });
    return NextResponse.json({ windows });
  } catch (error) {
    console.error('Get windows error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { window_name } = body;

    if (!window_name?.trim()) {
      return NextResponse.json({ error: 'Nama window harus diisi' }, { status: 400 });
    }

    const existing = await Window.findOne({ window_name: window_name.trim(), is_active: true });
    if (existing) {
      return NextResponse.json({ error: 'Window sudah ada' }, { status: 400 });
    }

    const newWindow = await Window.create({ window_name: window_name.trim() });

    logAudit({
      user,
      action: 'CREATE',
      entityType: 'Window',
      entityId: newWindow._id,
      entityName: window_name.trim(),
      oldValues: null,
      newValues: newWindow.toObject(),
    });

    return NextResponse.json({ message: 'Window berhasil ditambahkan', windowId: newWindow._id });
  } catch (error) {
    console.error('Create window error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { id, window_name } = body;

    if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 });
    if (!window_name?.trim()) return NextResponse.json({ error: 'Nama window harus diisi' }, { status: 400 });

    const oldDoc = await Window.findById(id).lean();
    await Window.findByIdAndUpdate(id, { window_name: window_name.trim() });

    logAudit({
      user,
      action: 'UPDATE',
      entityType: 'Window',
      entityId: id,
      entityName: window_name.trim(),
      oldValues: oldDoc,
      newValues: { window_name: window_name.trim() },
    });

    return NextResponse.json({ message: 'Window berhasil diupdate' });
  } catch (error) {
    console.error('Update window error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 });

    const oldDoc = await Window.findById(id).lean();
    await Window.findByIdAndUpdate(id, { is_active: false });

    logAudit({
      user,
      action: 'DELETE',
      entityType: 'Window',
      entityId: id,
      entityName: oldDoc?.window_name,
      oldValues: oldDoc,
      newValues: null,
    });

    return NextResponse.json({ message: 'Window berhasil dihapus' });
  } catch (error) {
    console.error('Delete window error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
