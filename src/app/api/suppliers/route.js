import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua suppliers atau filter by type
export async function GET(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let suppliers;
    
    if (type) {
      suppliers = await query(
        'SELECT * FROM suppliers WHERE supplier_type = ? AND is_active = TRUE ORDER BY supplier_name',
        [type]
      );
    } else {
      suppliers = await query(
        'SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY supplier_type, supplier_name'
      );
    }

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah supplier baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { supplier_name, supplier_type, contact_person, phone, address } = body;

    if (!supplier_name || !supplier_type) {
      return NextResponse.json(
        { error: 'Nama supplier dan tipe harus diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO suppliers (supplier_name, supplier_type, contact_person, phone, address) VALUES (?, ?, ?, ?, ?)',
      [supplier_name, supplier_type, contact_person, phone, address]
    );

    return NextResponse.json({
      message: 'Supplier berhasil ditambahkan',
      supplierId: result.insertId,
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, supplier_name, supplier_type, contact_person, phone, address, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID supplier harus diisi' },
        { status: 400 }
      );
    }

    await query(
      'UPDATE suppliers SET supplier_name = ?, supplier_type = ?, contact_person = ?, phone = ?, address = ?, is_active = ? WHERE id = ?',
      [supplier_name, supplier_type, contact_person, phone, address, is_active, id]
    );

    return NextResponse.json({ message: 'Supplier berhasil diupdate' });
  } catch (error) {
    console.error('Update supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus supplier (soft delete)
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
        { error: 'ID supplier harus diisi' },
        { status: 400 }
      );
    }

    // Soft delete
    await query('UPDATE suppliers SET is_active = FALSE WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Supplier berhasil dihapus' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
