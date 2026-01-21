import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// Fungsi untuk cek apakah supplier tersedia di rentang waktu tertentu
async function isSupplierAvailable(supplierId, startDate, endDate, excludeId = null) {
  let sql = `
    SELECT COUNT(*) as count FROM schedule_potong 
    WHERE supplier_id = ? 
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (start_date <= ? AND end_date >= ?) OR
      (start_date <= ? AND end_date >= ?) OR
      (start_date >= ? AND end_date <= ?)
    )
  `;
  
  const params = [supplierId, startDate, startDate, endDate, endDate, startDate, endDate];
  
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  
  const result = await query(sql, params);
  return result[0].count === 0;
}

// GET - Ambil semua schedule potong
export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await query(`
      SELECT 
        sp.*,
        a.article_name as article_full_name,
        u.full_name as pic_name,
        s.supplier_name
      FROM schedule_potong sp
      LEFT JOIN articles a ON sp.article_id = a.id
      LEFT JOIN users u ON sp.pic_id = u.id
      LEFT JOIN suppliers s ON sp.supplier_id = s.id
      ORDER BY sp.start_date DESC
    `);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah schedule potong baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      article_id,
      article_name,
      description,
      quantity,
      pic_id,
      week_delivery,
      supplier_id,
      start_date,
      end_date,
      notes,
    } = body;

    // Validasi input
    if (!article_id || !quantity || !pic_id || !week_delivery || !supplier_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah supplier tersedia
    const available = await isSupplierAvailable(supplier_id, start_date, end_date);
    
    if (!available) {
      return NextResponse.json(
        { error: 'Supplier tidak tersedia di rentang waktu yang dipilih' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO schedule_potong 
       (article_id, article_name, description, quantity, pic_id, week_delivery, supplier_id, start_date, end_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [article_id, article_name, description, quantity, pic_id, week_delivery, supplier_id, start_date, end_date, notes]
    );

    return NextResponse.json({
      message: 'Schedule potong berhasil ditambahkan',
      scheduleId: result.insertId,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update schedule potong
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      article_id,
      article_name,
      description,
      quantity,
      pic_id,
      week_delivery,
      supplier_id,
      start_date,
      end_date,
      status,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID schedule harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah supplier tersedia (exclude schedule yang sedang diupdate)
    const available = await isSupplierAvailable(supplier_id, start_date, end_date, id);
    
    if (!available) {
      return NextResponse.json(
        { error: 'Supplier tidak tersedia di rentang waktu yang dipilih' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE schedule_potong 
       SET article_id = ?, article_name = ?, description = ?, quantity = ?, pic_id = ?, 
           week_delivery = ?, supplier_id = ?, start_date = ?, end_date = ?, status = ?, notes = ?
       WHERE id = ?`,
      [article_id, article_name, description, quantity, pic_id, week_delivery, supplier_id, start_date, end_date, status, notes, id]
    );

    return NextResponse.json({ message: 'Schedule potong berhasil diupdate' });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus schedule potong
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
        { error: 'ID schedule harus diisi' },
        { status: 400 }
      );
    }

    await query('DELETE FROM schedule_potong WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Schedule potong berhasil dihapus' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
