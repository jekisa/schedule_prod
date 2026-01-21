import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Hash password admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Check if admin exists
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', ['admin']);

    if (existingUsers.length > 0) {
      // Update existing admin password
      await query(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      return NextResponse.json({
        message: 'Admin password updated successfully',
        username: 'admin',
        password: 'admin123'
      });
    } else {
      // Create new admin user
      await query(
        'INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'Administrator', 'admin@example.com', 'admin']
      );
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
