import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua users
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const users = await User.find()
      .select('-password')
      .sort({ created_at: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah user baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { username, password, full_name, email, role } = body;

    // Validasi input
    if (!username || !password || !full_name || !email) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username atau email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const newUser = await User.create({
      username,
      password: hashedPassword,
      full_name,
      email,
      role: role || 'staff',
    });

    return NextResponse.json({
      message: 'User berhasil ditambahkan',
      userId: newUser._id,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { id, username, password, full_name, email, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID user harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah digunakan user lain
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: id }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username atau email sudah digunakan' },
        { status: 400 }
      );
    }

    // Update user
    const updateData = { username, full_name, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ message: 'User berhasil diupdate' });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus user
export async function DELETE(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID user harus diisi' },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
