import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';

function AdminDashboard() {
  const { t } = useTranslation();
  const [usersToReview, setUsersToReview] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<{ depasse_seuil_bannissement: boolean }[]>('/admin/utilisateurs/signalements')
      .then((res) => setUsersToReview(res.data.filter((u) => u.depasse_seuil_bannissement).length))
      .catch(() => setUsersToReview(null));
  }, []);

  const stats = {
    laundries: 72,
    users: 109,
    accountsToValidate: 17,
    pendingLaundries: 4,
    reportedComments: 23,
  };

  return (
    <>
    <div className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="font-bold text-2xl mt-6 text-center">Tableau de bord</h1>
      <p className="text-muted-foreground text-center mt-2"> Bienvenue dans votre espace administratif </p>

      {/* Cards stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 md:mx-auto md:w-[500px] gap-4 mt-18">
        <Link to="/admin/laveries/list" className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-blue-600 transition-colors block" >
          <p className="text-lg md:text-xl font-semibold">{stats.laundries}</p>
          <p className="text-sm md:text-lg">Laveries</p>
        </Link>
        <Link to="/utilisateurs" className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-blue-600 transition-colors block" >
          <p className="text-lg md:text-xl font-semibold">{stats.users}</p>
          <p className="text-sm md:text-lg">Utilisateurs</p>
        </Link>
      </div>

      {/* Sections grises */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/professionnel/validation" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Comptes à valider</p>
          </div>
          <p className="text-4xl font-bold">{stats.accountsToValidate}</p>
        </Link>

        <Link to="/admin/laveries/list" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Laveries en attente</p>
          </div>
          <p className="text-4xl font-bold">{stats.pendingLaundries}</p>
        </Link>

        <Link to="/admin/moderation" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Commentaires signalés</p>
          </div>
          <p className="text-4xl font-bold">{stats.reportedComments}</p>
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