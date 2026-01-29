import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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
