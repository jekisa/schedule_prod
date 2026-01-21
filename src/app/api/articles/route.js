import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua articles
export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await query(
      'SELECT * FROM articles WHERE is_active = TRUE ORDER BY article_name'
    );

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

    const body = await request.json();
    const { article_name, description, category } = body;

    if (!article_name) {
      return NextResponse.json(
        { error: 'Nama artikel harus diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO articles (article_name, description, category) VALUES (?, ?, ?)',
      [article_name, description, category]
    );

    return NextResponse.json({
      message: 'Artikel berhasil ditambahkan',
      articleId: result.insertId,
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

    const body = await request.json();
    const { id, article_name, description, category, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID artikel harus diisi' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE articles SET article_name = ?, description = ?, category = ?, is_active = ? WHERE id = ?',
      [article_name, description, category, is_active, id]
    );

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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID artikel harus diisi' },
        { status: 400 }
      );
    }

    await query('UPDATE articles SET is_active = FALSE WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
