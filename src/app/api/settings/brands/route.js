import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';
import { getUserFromToken } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const brands = await Brand.find({ is_active: true }).sort({ brand_name: 1 });
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { brand_name } = body;

    if (!brand_name?.trim()) {
      return NextResponse.json({ error: 'Nama brand harus diisi' }, { status: 400 });
    }

    const existing = await Brand.findOne({ brand_name: brand_name.trim(), is_active: true });
    if (existing) {
      return NextResponse.json({ error: 'Brand sudah ada' }, { status: 400 });
    }

    const newBrand = await Brand.create({ brand_name: brand_name.trim() });

    logAudit({
      user,
      action: 'CREATE',
      entityType: 'Brand',
      entityId: newBrand._id,
      entityName: brand_name.trim(),
      oldValues: null,
      newValues: newBrand.toObject(),
    });

    return NextResponse.json({ message: 'Brand berhasil ditambahkan', brandId: newBrand._id });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { id, brand_name } = body;

    if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 });
    if (!brand_name?.trim()) return NextResponse.json({ error: 'Nama brand harus diisi' }, { status: 400 });

    const oldDoc = await Brand.findById(id).lean();
    await Brand.findByIdAndUpdate(id, { brand_name: brand_name.trim() });

    logAudit({
      user,
      action: 'UPDATE',
      entityType: 'Brand',
      entityId: id,
      entityName: brand_name.trim(),
      oldValues: oldDoc,
      newValues: { brand_name: brand_name.trim() },
    });

    return NextResponse.json({ message: 'Brand berhasil diupdate' });
  } catch (error) {
    console.error('Update brand error:', error);
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

    const oldDoc = await Brand.findById(id).lean();
    await Brand.findByIdAndUpdate(id, { is_active: false });

    logAudit({
      user,
      action: 'DELETE',
      entityType: 'Brand',
      entityId: id,
      entityName: oldDoc?.brand_name,
      oldValues: oldDoc,
      newValues: null,
    });

    return NextResponse.json({ message: 'Brand berhasil dihapus' });
  } catch (error) {
    console.error('Delete brand error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
