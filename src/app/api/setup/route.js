import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Article from '@/models/Article';

export async function GET() {
  try {
    await connectDB();

    // Hash password admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if admin exists
    const existingUser = await User.findOne({ username: 'admin' });

    if (existingUser) {
      // Update existing admin password
      await User.findOneAndUpdate(
        { username: 'admin' },
        { password: hashedPassword }
      );
      return NextResponse.json({
        message: 'Admin password updated successfully',
        username: 'admin',
        password: 'admin123'
      });
    } else {
      // Create new admin user
      await User.create({
        username: 'admin',
        password: hashedPassword,
        full_name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin'
      });
      return NextResponse.json({
        message: 'Admin user created successfully',
        username: 'admin',
        password: 'admin123'
      });
    }
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Migrate existing articles to add new fields
export async function POST() {
  try {
    await connectDB();

    // Add new fields with default values to all articles that are missing them
    const result = await Article.updateMany(
      {
        $or: [
          { brand: { $exists: false } },
          { buyer: { $exists: false } },
          { week_delivery: { $exists: false } },
          { co_qty: { $exists: false } },
          { co_price: { $exists: false } },
          { co_total: { $exists: false } },
        ],
      },
      {
        $set: {
          brand: '',
          buyer: '',
          week_delivery: '',
          co_qty: 0,
          co_price: 0,
          co_total: 0,
        },
      }
    );

    return NextResponse.json({
      message: 'Migrasi artikel berhasil',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
