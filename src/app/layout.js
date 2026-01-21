import './globals.css';
import { Inter } from 'next/font/google';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Production Scheduling System',
  description: 'Sistem Penjadwalan Produksi - Potong, Jahit, Sablon, Bordir',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
