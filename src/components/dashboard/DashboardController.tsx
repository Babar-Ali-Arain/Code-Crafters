import { Navigate } from 'react-router-dom';
import { useAuth } from '../layout/FirebaseProvider';
import AdminDashboard from '../admin/AdminDashboard';
import ClientDashboard from './ClientDashboard';

export default function DashboardController() {
  const { user, isAdmin, isTeam, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0FA484] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine which dashboard to show dynamically
  if (isAdmin || isTeam) {
    return <AdminDashboard />;
  } else {
    return <ClientDashboard />;
  }
}
