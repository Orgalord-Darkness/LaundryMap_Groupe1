import { Link } from 'react-router';

function AdminDashboard() {
  const stats = {
    laundries: 72,
    users: 109,
    accountsToValidate: 17,
    pendingLaundries: 4,
    reportedComments: 23,
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="font-bold text-2xl mt-6 text-center">Tableau de bord</h1>
      <p className="text-gray-500 text-center mt-2"> Bienvenue dans votre espace administratif </p>

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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/professionnalAdministration/professionnalAccountValidationList" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Comptes à valider</p>
            <p className="text-sm text-gray-300"> Dernière demande il y a 48 min </p>
          </div>
          <p className="text-4xl font-bold">{stats.accountsToValidate}</p>
        </Link>

        <Link to="/laveries-en-attente" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Laveries en attentes</p>
            <p className="text-sm text-gray-300"> Dernière demande il y a 20 min </p>
          </div>
          <p className="text-4xl font-bold">{stats.pendingLaundries}</p>
        </Link>

        <Link to="/commentaires-signales" className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-32 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors block" >
          <div>
            <p className="font-semibold">Commentaires signalés</p>
            <p className="text-sm text-gray-300"> Dernier signalement il y a 5 min</p>
          </div>
          <p className="text-4xl font-bold">{stats.reportedComments}</p>
        </Link>
      </div>
    </div>
  </>
  );
}

export default AdminDashboard;