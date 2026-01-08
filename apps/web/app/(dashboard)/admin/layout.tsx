import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { AdminNav } from './_components/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav />
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
}




