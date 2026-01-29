import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import Supplier from '@/models/Supplier';
import Article from '@/models/Article';
import { getUserFromToken } from '@/lib/auth';
import { calculateAutoStatus } from '@/lib/scheduleUtils';

const SCHEDULE_TYPE = 'jahit';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && (typeof id === 'string' && id.length === 24);
}

// Fungsi untuk cek apakah supplier tersedia di rentang waktu tertentu
async function isSupplierAvailable(supplierId, startDate, endDate, excludeId = null) {
  // Skip availability check if supplierId is not a valid ObjectId
  if (!isValidObjectId(supplierId)) {
    return true;
  }

  const query = {
    supplier_id: new mongoose.Types.ObjectId(supplierId),
    schedule_type: SCHEDULE_TYPE,
    status: { $nin: ['cancelled', 'completed'] },
    $or: [
      { start_date: { $lte: startDate }, end_date: { $gte: startDate } },
      { start_date: { $lte: endDate }, end_date: { $gte: endDate } },
      { start_date: { $gte: startDate }, end_date: { $lte: endDate } },
    ],
  };

  if (excludeId && isValidObjectId(excludeId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const count = await Schedule.countDocuments(query);
  return count === 0;
}

// GET - Ambil semua schedule jahit
export async function GET(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const schedules = await Schedule.find({ schedule_type: SCHEDULE_TYPE })
      .populate('pic_id', 'full_name')
      .populate('supplier_id', 'supplier_name')
      .populate('article_id', 'article_name')
      .sort({ start_date: -1 });

    // Transform data for frontend compatibility with auto status
    const transformedSchedules = schedules.map((schedule) => {
      const scheduleObj = schedule.toJSON();
      const autoStatus = calculateAutoStatus(
        scheduleObj.start_date,
        scheduleObj.end_date,
        scheduleObj.status
      );

      return {
        ...scheduleObj,
        status: autoStatus,
        pic_name: schedule.pic_id?.full_name || null,
        supplier_name: schedule.supplier_id?.supplier_name || null,
        article_full_name: schedule.article_id?.article_name || null,
        pic_id: schedule.pic_id?._id || schedule.pic_id,
        supplier_id: schedule.supplier_id?._id || schedule.supplier_id,
        article_id: schedule.article_id?._id || schedule.article_id,
      };
    });

    return NextResponse.json({ schedules: transformedSchedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah schedule jahit baru
export async function POST(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

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

    // Validasi ObjectId format
    if (!isValidObjectId(article_id)) {
      return NextResponse.json(
        { error: 'Article ID tidak valid' },
        { status: 400 }
      );
    }
    if (!isValidObjectId(pic_id)) {
      return NextResponse.json(
        { error: 'PIC ID tidak valid' },
        { status: 400 }
      );
    }
    if (!isValidObjectId(supplier_id)) {
      return NextResponse.json(
        { error: 'Supplier ID tidak valid' },
        { status: 400 }
      );
    }

    // Cek apakah supplier tersedia
    const available = await isSupplierAvailable(supplier_id, new Date(start_date), new Date(end_date));

    if (!available) {
      return NextResponse.json(
        { error: 'Supplier tidak tersedia di rentang waktu yang dipilih' },
        { status: 400 }
      );
    }

    const newSchedule = await Schedule.create({
      schedule_type: SCHEDULE_TYPE,
      article_id,
      article_name,
      description,
      quantity,
      pic_id,
      week_delivery,
      supplier_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      notes,
    });

    return NextResponse.json({
      message: 'Schedule jahit berhasil ditambahkan',
      scheduleId: newSchedule._id,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update schedule jahit
export async function PUT(request) {
  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

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

    // Validasi ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Schedule ID tidak valid' },
        { status: 400 }
      );
    }
    if (article_id && !isValidObjectId(article_id)) {
      return NextResponse.json(
        { error: 'Article ID tidak valid' },
        { status: 400 }
      );
    }
    if (pic_id && !isValidObjectId(pic_id)) {
      return NextResponse.json(
        { error: 'PIC ID tidak valid' },
        { status: 400 }
      );
    }
    if (supplier_id && !isValidObjectId(supplier_id)) {
      return NextResponse.json(
        { error: 'Supplier ID tidak valid' },
        { status: 400 }
      );
    }

    // Cek apakah supplier tersedia (exclude schedule yang sedang diupdate)
    const available = await isSupplierAvailable(supplier_id, new Date(start_date), new Date(end_date), id);

    if (!available) {
      return NextResponse.json(
        { error: 'Supplier tidak tersedia di rentang waktu yang dipilih' },
        { status: 400 }
      );
    }

    await Schedule.findByIdAndUpdate(id, {
      article_id,
      article_name,
      description,
      quantity,
      pic_id,
      week_delivery,
      supplier_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status,
      notes,
    });

    return NextResponse.json({ message: 'Schedule jahit berhasil diupdate' });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus schedule jahit
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
        { error: 'ID schedule harus diisi' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Schedule ID tidak valid' },
        { status: 400 }
      );
    }

    await Schedule.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Schedule jahit berhasil dihapus' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
