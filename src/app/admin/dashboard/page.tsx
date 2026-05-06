import AdminDashboardPage from "@/components/auth/AdminDshboard";
import { AdminGuard } from "@/components/auth/AdminGuard";

export default function Page() {
  return (
    <AdminGuard>
      <AdminDashboardPage />
    </AdminGuard>
  );
}