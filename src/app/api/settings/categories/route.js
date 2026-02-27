import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const categories = await Category.find({ is_active: true }).sort({ category_name: 1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { category_name } = body;

    if (!category_name?.trim()) {
      return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 });
    }

    const existing = await Category.findOne({ category_name: category_name.trim(), is_active: true });
    if (existing) {
      return NextResponse.json({ error: 'Kategori sudah ada' }, { status: 400 });
    }

    const newCategory = await Category.create({ category_name: category_name.trim() });
    return NextResponse.json({ message: 'Kategori berhasil ditambahkan', categoryId: newCategory._id });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { id, category_name } = body;

    if (!id) return NextResponse.json({ error: 'ID harus diisi' }, { status: 400 });
    if (!category_name?.trim()) return NextResponse.json({ error: 'Nama kategori harus diisi' }, { status: 400 });

    await Category.findByIdAndUpdate(id, { category_name: category_name.trim() });
    return NextResponse.json({ message: 'Kategori berhasil diupdate' });
  } catch (error) {
    console.error('Update category error:', error);
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

    await Category.findByIdAndUpdate(id, { is_active: false });
    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
