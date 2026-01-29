import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua articles
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const articles = await Article.find({ is_active: true }).sort({ article_name: 1 });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah article baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { article_name, description, category } = body;

    if (!article_name) {
      return NextResponse.json(
        { error: 'Nama artikel harus diisi' },
        { status: 400 }
      );
    }

    const newArticle = await Article.create({
      article_name,
      description,
      category,
    });

    return NextResponse.json({
      message: 'Artikel berhasil ditambahkan',
      articleId: newArticle._id,
    });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { id, article_name, description, category, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID artikel harus diisi' },
        { status: 400 }
      );
    }

    await Article.findByIdAndUpdate(id, {
      article_name,
      description,
      category,
      is_active,
    });

    return NextResponse.json({ message: 'Artikel berhasil diupdate' });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus article (soft delete)
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
        { error: 'ID artikel harus diisi' },
        { status: 400 }
      );
    }

    await Article.findByIdAndUpdate(id, { is_active: false });

    return NextResponse.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
