import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ingredient from '@/models/Ingredient';
import { getUserFromToken } from '@/lib/auth';

// GET - Ambil semua ingredients
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const ingredients = await Ingredient.find({ is_active: true }).sort({ no_po_bahan: 1 });

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Get ingredients error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah ingredient baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { no_po_bahan, status_bahan, plan_delivery, qty_po_bahan } = body;

    if (!no_po_bahan) {
      return NextResponse.json(
        { error: 'No PO Bahan harus diisi' },
        { status: 400 }
      );
    }

    const newIngredient = await Ingredient.create({
      no_po_bahan,
      status_bahan,
      plan_delivery: plan_delivery || null,
      qty_po_bahan: Number(qty_po_bahan) || 0,
    });

    return NextResponse.json({
      message: 'Bahan berhasil ditambahkan',
      ingredientId: newIngredient._id,
    });
  } catch (error) {
    console.error('Create ingredient error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update ingredient
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { id, no_po_bahan, status_bahan, plan_delivery, qty_po_bahan, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID bahan harus diisi' },
        { status: 400 }
      );
    }

    await Ingredient.findByIdAndUpdate(id, {
      no_po_bahan,
      status_bahan,
      plan_delivery: plan_delivery || null,
      qty_po_bahan: Number(qty_po_bahan) || 0,
      is_active,
    });

    return NextResponse.json({ message: 'Bahan berhasil diupdate' });
  } catch (error) {
    console.error('Update ingredient error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus ingredient (soft delete)
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
        { error: 'ID bahan harus diisi' },
        { status: 400 }
      );
    }

    await Ingredient.findByIdAndUpdate(id, { is_active: false });

    return NextResponse.json({ message: 'Bahan berhasil dihapus' });
  } catch (error) {
    console.error('Delete ingredient error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
