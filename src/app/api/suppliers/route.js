import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua suppliers atau filter by type
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = { is_active: true };

    if (type) {
      query.supplier_type = type;
    }

    const suppliers = await Supplier.find(query).sort({ supplier_type: 1, supplier_name: 1 });

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

    await connectDB();

    const body = await request.json();
    const { supplier_name, supplier_type, contact_person, phone, address } = body;

    if (!supplier_name || !supplier_type) {
      return NextResponse.json(
        { error: 'Nama supplier dan tipe harus diisi' },
        { status: 400 }
      );
    }

    const newSupplier = await Supplier.create({
      supplier_name,
      supplier_type,
      contact_person,
      phone,
      address,
    });

    return NextResponse.json({
      message: 'Supplier berhasil ditambahkan',
      supplierId: newSupplier._id,
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

    await connectDB();

    const body = await request.json();
    const { id, supplier_name, supplier_type, contact_person, phone, address, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID supplier harus diisi' },
        { status: 400 }
      );
    }

    await Supplier.findByIdAndUpdate(id, {
      supplier_name,
      supplier_type,
      contact_person,
      phone,
      address,
      is_active,
    });

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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID supplier harus diisi' },
        { status: 400 }
      );
    }

    // Soft delete
    await Supplier.findByIdAndUpdate(id, { is_active: false });

    return NextResponse.json({ message: 'Supplier berhasil dihapus' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
