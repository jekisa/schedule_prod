# Production Scheduling System

Sistem Penjadwalan Produksi untuk mengelola penjadwalan Potong, Jahit, Sablon, dan Bordir dengan multiple suppliers.

## Fitur

- ✅ Dashboard informatif dengan statistik real-time
- ✅ Penjadwalan Potong dengan validasi ketersediaan supplier
- ✅ Penjadwalan Jahit dengan validasi ketersediaan supplier
- ✅ Penjadwalan Sablon dengan validasi ketersediaan supplier
- ✅ Penjadwalan Bordir dengan validasi ketersediaan supplier
- ✅ Master Data: Users/PIC, Suppliers, Articles
- ✅ Validasi otomatis: Supplier tidak bisa menerima pekerjaan di rentang waktu yang sama
- ✅ Autentikasi dengan JWT
- ✅ RESTful API

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ 
- MySQL 5.7+ atau MySQL 8+
- npm atau yarn

## Instalasi

### 1. Clone atau Download Project

```bash
cd production-scheduling
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

**a. Buat Database di MySQL:**

```sql
CREATE DATABASE production_scheduling;
```

**b. Import Schema:**

```bash
mysql -u root -p production_scheduling < database/schema.sql
```

Atau copy paste isi file `database/schema.sql` ke MySQL client Anda.

### 4. Konfigurasi Environment Variables

Copy file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` sesuai konfigurasi MySQL Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=production_scheduling
DB_PORT=3306

JWT_SECRET=your-secret-key-change-this
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 6. Login

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

## Struktur Database

### Tables:

1. **users** - Data user untuk login dan sebagai PIC
2. **suppliers** - Data supplier (potong, jahit, sablon, bordir)
3. **articles** - Master artikel/produk
4. **schedule_potong** - Penjadwalan potong
5. **schedule_jahit** - Penjadwalan jahit
6. **schedule_sablon** - Penjadwalan sablon
7. **schedule_bordir** - Penjadwalan bordir

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users?id={id}` - Delete user

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers?type={type}` - Get suppliers by type
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers` - Update supplier
- `DELETE /api/suppliers?id={id}` - Delete supplier

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create new article
- `PUT /api/articles` - Update article
- `DELETE /api/articles?id={id}` - Delete article

### Schedules (Potong/Jahit/Sablon/Bordir)
- `GET /api/schedules/{type}` - Get all schedules by type
- `POST /api/schedules/{type}` - Create new schedule
- `PUT /api/schedules/{type}` - Update schedule
- `DELETE /api/schedules/{type}?id={id}` - Delete schedule

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics and upcoming schedules

## Fitur Utama

### 1. Dashboard
- Statistik real-time untuk setiap jenis penjadwalan
- Overview jadwal 7 hari ke depan
- Quick access ke semua modul

### 2. Penjadwalan
Setiap penjadwalan (Potong, Jahit, Sablon, Bordir) mencakup:
- Nama artikel
- Deskripsi artikel
- Kuantitas
- PIC (Person In Charge)
- Week Delivery
- Supplier
- Tanggal mulai & selesai
- Status (Scheduled, In Progress, Completed, Cancelled)
- Notes

**Validasi Otomatis:**
- Supplier tidak dapat menerima pekerjaan baru jika sudah ada jadwal di rentang waktu yang sama
- System akan otomatis cek overlap schedule

### 3. Master Data

**Users/PIC:**
- Username untuk login
- Full name
- Email
- Role (admin, staff, manager)
- User otomatis menjadi pilihan PIC di penjadwalan

**Suppliers:**
- Nama supplier
- Tipe supplier (potong, jahit, sablon, bordir)
- Contact person
- Phone
- Address

**Articles:**
- Nama artikel
- Deskripsi
- Category

## Build untuk Production

```bash
npm run build
npm start
```

## Development

Struktur folder:

```
production-scheduling/
├── database/
│   └── schema.sql
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── globals.css   # Global styles
│   │   ├── layout.js     # Root layout
│   │   └── page.js       # Login page
│   ├── components/       # React components
│   └── lib/
│       ├── db.js         # Database connection
│       └── auth.js       # JWT utilities
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Troubleshooting

### Database Connection Error
Pastikan MySQL berjalan dan kredensial di `.env.local` benar.

### Port 3000 sudah digunakan
Ubah port dengan menjalankan:
```bash
PORT=3001 npm run dev
```

### JWT Token Error
Pastikan `JWT_SECRET` di `.env.local` sudah diset.

## Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository.

## License

MIT License
