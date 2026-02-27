import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Buyer from '@/models/Buyer';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const buyers = await Buyer.find({ is_active: true }).sort({ buyer_name: 1 });
    return NextResponse.json({ buyers });
  } catch (error) {
    console.error('Get buyers error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { buyer_name } = body;

    if (!buyer_name?.trim()) {
      return NextResponse.json({ error: 'Nama buyer harus diisi' }, { status: 400 });
    }

    const existing = await Buyer.findOne({ buyer_name: buyer_name.trim(), is_active: true });
    if (existing) {
      return NextResponse.json({ error: 'Buyer sudah ada' }, { status: 400 });
    }

    const newBuyer = await Buyer.create({ buyer_name: buyer_name.trim() });
    return NextResponse.json({ message: 'Buyer berhasil ditambahkan', buyerId: newBuyer._id });
  } catch (error) {
    console.error('Create buyer error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { id, buyer_name } = body;

    if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 });
    if (!buyer_name?.trim()) return NextResponse.json({ error: 'Nama buyer harus diisi' }, { status: 400 });

    await Buyer.findByIdAndUpdate(id, { buyer_name: buyer_name.trim() });
    return NextResponse.json({ message: 'Buyer berhasil diupdate' });
  } catch (error) {
    console.error('Update buyer error:', error);
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

    await Buyer.findByIdAndUpdate(id, { is_active: false });
    return NextResponse.json({ message: 'Buyer berhasil dihapus' });
  } catch (error) {
    console.error('Delete buyer error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
