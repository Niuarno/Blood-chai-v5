# BloodChai

BloodChai is a modern, responsive, full-stack blood donation platform specifically designed for Bangladesh, built using Next.js 14, Tailwind CSS, and Supabase.

## Features
- **Role-Based Routing:** Secure dashboards for Donors, Recipients, and Admins.
- **Location Filtering:** Cascade directory search by Bangladesh Division, District, and Upazila.
- **Auto-Registration:** Recipients can register automatically while requesting blood.
- **Admin Management:** Comprehensive CMS for users, reports, emergency callouts, and payment gateways.
- **UI/UX:** Animated transitions, glass-morphism dark-crimson theme, mobile-first design.

---

## 🚀 Setup & Deployment Guide

Follow these steps to deploy BloodChai or run it locally.

### 1. Supabase Setup (Database & Auth)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Under **Authentication -> Providers**, ensure Email/Password auth is enabled.
3. Turn off **"Confirm email"** in auth settings if you want users to log in immediately without email verification.
4. Go to **SQL Editor** in the Supabase dashboard.
5. Copy the entire contents of `supabase/schema.sql` (found in this repository) and click **Run**.
6. (Optional) Run the following SQL to make yourself an admin immediately:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following keys from your Supabase project settings (Settings > API):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Local Development
Make sure you have Node.js installed.
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Vercel Deployment
1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. During setup, paste all three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Keep the framework preset as **Next.js**.
5. Click **Deploy**.

---

## Architecture Choices
- **App Router:** Fully embraces Next.js 14 Server Actions and App Router structure.
- **RLS (Row Level Security):** Supabase RLS is configured to protect data. Service Role Key is used only in specific `/api` or Admin server components to bypass RLS securely.
- **Styling:** Custom classes defined in `app/globals.css` combined with `tailwind.config.ts`.
