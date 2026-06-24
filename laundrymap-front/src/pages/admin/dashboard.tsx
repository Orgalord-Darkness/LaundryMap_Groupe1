import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';

interface DashboardStats {
  totalUsers: number;
  totalPros: number;
  totalLaundries: number;
  accountsToValidate: number;
  pendingLaundries: number;
  reportedComments: number;
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [usersToReview, setUsersToReview] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {

    apiClient
      .get<DashboardStats>('/admin/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));

    apiClient.get<{ depasse_seuil_bannissement: boolean }[]>('/admin/utilisateurs/signalements')
      .then((res) => setUsersToReview(res.data.filter((u) => u.depasse_seuil_bannissement).length))
      .catch(() => setUsersToReview(null));

  }, []);

  // Affiche '—' pendant le chargement ou en cas d'erreur
  const display = (val: number | null | undefined): string =>
    val !== null && val !== undefined ? String(val) : '—';

  return (
    <>
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="font-bold text-2xl mt-6 text-center">Tableau de bord</h1>
      <p className="text-muted-foreground text-center mt-2"> Bienvenue dans votre espace administratif </p>

      {/* Cards stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 md:mx-auto md:w-[500px] gap-4 mt-18">
        <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center transition-colors block" >
          <p className="text-lg md:text-xl font-semibold">{display(stats?.totalLaundries)}</p>
          <p className="text-sm md:text-lg">Laveries</p>
        </div>

        <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center transition-colors block" >
          <p className="text-lg md:text-xl font-semibold">{display(stats?.totalPros)}</p>
          <p className="text-sm md:text-lg">Professionnels</p>
        </div>

        <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center transition-colors block" >
          <p className="text-lg md:text-xl font-semibold">{display(stats?.totalUsers)}</p>
          <p className="text-sm md:text-lg">Utilisateurs</p>
        </div>
      </div>

      {/* Sections grises */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/professionnel/validation" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Comptes à valider</p>
          </div>
          <p className="text-4xl font-bold">{display(stats?.accountsToValidate)}</p>
        </Link>

        <Link to="/admin/laveries/list" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Laveries en attente</p>
          </div>
          <p className="text-4xl font-bold">{display(stats?.pendingLaundries)}</p>
        </Link>

        <Link to="/admin/moderation" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Commentaires signalés</p>
          </div>
          <p className="text-4xl font-bold">{display(stats?.reportedComments)}</p>
        </Link>

        <Link to="/admin/moderation/utilisateurs" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">{t('admin_dashboard_utilisateurs_a_moderer')}</p>
          </div>
          <p className="text-4xl font-bold">{usersToReview ?? '—'}</p>
        </Link>
      </div>
    </div>
  </>
  );
}

export default AdminDashboard;