import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { employeeAPI, paymentAPI } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [salaryEvolution, setSalaryEvolution] = useState([]);
  const [paymentsByType, setPaymentsByType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);


        // Pour le super admin, afficher des stats globales ou un message
        if (userRole === 'SUPER_ADMIN') {
          setStats([
            {
              title: 'Entreprises',
              value: '1',
              change: '+0%',
              trend: 'up',
              icon: Users,
              color: 'bg-green-500'
            },
            {
              title: 'Utilisateurs',
              value: '3',
              change: '+0%',
              trend: 'up',
              icon: Users,
              color: 'bg-green-500'
            },
            {
              title: 'Paiements Totaux',
              value: '0 FCFA',
              change: '+0%',
              trend: 'up',
              icon: DollarSign,
              color: 'bg-green-500'
            },
            {
              title: 'Employés Actifs',
              value: '0',
              change: '+0',
              trend: 'up',
              icon: Users,
              color: 'bg-black'
            },
          ]);
          setSalaryEvolution([]);
          setPaymentsByType([]);
          return;
        }

        // Pour le caissier, afficher seulement les stats de paiement
        if (userRole === 'CASHIER') {
          // Récupérer seulement les paiements
          const paymentsRes = await paymentAPI.getAll();
          const payments = paymentsRes.data;

          const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
          const todayPayments = payments.filter(p =>
            new Date(p.date).toDateString() === new Date().toDateString()
          ).reduce((sum, p) => sum + p.amount, 0);

          setStats([
            {
              title: 'Paiements Aujourd\'hui',
              value: `${todayPayments.toLocaleString()} FCFA`,
              change: '+0%',
              trend: 'up',
              icon: CheckCircle,
              color: 'bg-green-500'
            },
            {
              title: 'Paiements Totaux',
              value: `${totalPaid.toLocaleString()} FCFA`,
              change: '+0%',
              trend: 'up',
              icon: DollarSign,
              color: 'bg-green-500'
            },
            {
              title: 'Nombre de Paiements',
              value: payments.length.toString(),
              change: '+0',
              trend: 'up',
              icon: Clock,
              color: 'bg-black'
            },
            {
              title: 'Employés Payés',
              value: new Set(payments.map(p => p.paySlip?.employeeId)).size.toString(),
              change: '+0',
              trend: 'up',
              icon: Users,
              color: 'bg-black'
            },
          ]);

          // Paiements par type pour le caissier
          const paymentTypes = {};
          payments.forEach(payment => {
            paymentTypes[payment.mode] = (paymentTypes[payment.mode] || 0) + payment.amount;
          });

          const paymentTypeData = Object.entries(paymentTypes).map(([type, montant]) => ({
            type: type.replace('_', ' '),
            montant
          }));

          setPaymentsByType(paymentTypeData);
          setSalaryEvolution([]); // Pas d'évolution pour le caissier
          return;
        }

        // Récupérer les employés et paiements
        const [employeesRes, paymentsRes] = await Promise.all([
          employeeAPI.getAll(),
          paymentAPI.getAll()
        ]);

        const employees = employeesRes.data;
        const payments = paymentsRes.data;

        // Calculer les statistiques
        const activeEmployees = employees.filter(emp => emp.isActive).length;
        const totalSalaryMass = employees
          .filter(emp => emp.isActive)
          .reduce((sum, emp) => sum + emp.salary, 0);

        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = totalSalaryMass - totalPaid;

        // Calculer les tendances (simplifiées pour l'exemple)
        const currentMonth = new Date().getMonth();
        const lastMonth = currentMonth - 1;

        const currentMonthPayments = payments.filter(p =>
          new Date(p.date).getMonth() === currentMonth
        ).reduce((sum, p) => sum + p.amount, 0);

        const lastMonthPayments = payments.filter(p =>
          new Date(p.date).getMonth() === lastMonth
        ).reduce((sum, p) => sum + p.amount, 0);

        const paymentChange = lastMonthPayments > 0 ?
          ((currentMonthPayments - lastMonthPayments) / lastMonthPayments * 100).toFixed(1) : '0';

        setStats([
          {
            title: 'Masse Salariale',
            value: `${totalSalaryMass.toLocaleString()} FCFA`,
            change: '+5%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-green-500'
          },
          {
            title: 'Montant Payé',
            value: `${totalPaid.toLocaleString()} FCFA`,
            change: `+${paymentChange}%`,
            trend: 'up',
            icon: CheckCircle,
            color: 'bg-green-500'
          },
          {
            title: 'Montant Restant',
            value: `${Math.max(0, remainingAmount).toLocaleString()} FCFA`,
            change: remainingAmount > 0 ? '-10%' : '0%',
            trend: remainingAmount > 0 ? 'down' : 'up',
            icon: Clock,
            color: 'bg-black'
          },
          {
            title: 'Employés Actifs',
            value: activeEmployees.toString(),
            change: '+2',
            trend: 'up',
            icon: Users,
            color: 'bg-black'
          },
        ]);

        // Évolution des salaires (données simplifiées)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthPayments = payments.filter(p =>
            new Date(p.date).getMonth() === date.getMonth() &&
            new Date(p.date).getFullYear() === date.getFullYear()
          ).reduce((sum, p) => sum + p.amount, 0);

          monthlyData.push({
            mois: date.toLocaleDateString('fr-FR', { month: 'short' }),
            montant: monthPayments
          });
        }

        // Paiements par type
        const paymentTypes = {};
        payments.forEach(payment => {
          paymentTypes[payment.mode] = (paymentTypes[payment.mode] || 0) + payment.amount;
        });

        const paymentTypeData = Object.entries(paymentTypes).map(([type, montant]) => ({
          type: type.replace('_', ' '),
          montant
        }));

        // Utiliser données réelles si elles ont du contenu, sinon données de démo
        const hasRealSalaryData = monthlyData.some(item => item.montant > 0);
        setSalaryEvolution(hasRealSalaryData ? monthlyData : [
          { mois: 'Mai', montant: 500000 },
          { mois: 'Jun', montant: 750000 },
          { mois: 'Jul', montant: 650000 },
          { mois: 'Aoû', montant: 800000 },
          { mois: 'Sep', montant: 900000 },
          { mois: 'Oct', montant: 0 }
        ]);

        setPaymentsByType(paymentTypeData.length > 0 ? paymentTypeData : [
          { type: 'ESPECES', montant: 500000 },
          { type: 'VIREMENT', montant: 300000 },
          { type: 'ORANGE MONEY', montant: 200000 }
        ]);

      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        // Pour les admins sans données, afficher des stats vides au lieu d'erreur
        if (userRole !== 'SUPER_ADMIN') {
          setStats([
            {
              title: 'Masse Salariale',
              value: '0 FCFA',
              change: '+0%',
              trend: 'up',
              icon: DollarSign,
              color: 'bg-green-500'
            },
            {
              title: 'Montant Payé',
              value: '0 FCFA',
              change: '+0%',
              trend: 'up',
              icon: CheckCircle,
              color: 'bg-green-500'
            },
            {
              title: 'Montant Restant',
              value: '0 FCFA',
              change: '0%',
              trend: 'up',
              icon: Clock,
              color: 'bg-black'
            },
            {
              title: 'Employés Actifs',
              value: '0',
              change: '+0',
              trend: 'up',
              icon: Users,
              color: 'bg-black'
            },
          ]);
          setSalaryEvolution([]);
          setPaymentsByType([]);
        } else {
          setError('Erreur lors du chargement des données');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userRole]);

  const upcomingPayments = [
    { employee: 'Mamadou Diop', poste: 'Développeur', montant: '750 000 FCFA', date: '05 Oct 2025' },
    { employee: 'Fatou Sall', poste: 'Comptable', montant: '650 000 FCFA', date: '05 Oct 2025' },
    { employee: 'Ibrahima Ndiaye', poste: 'Manager', montant: '850 000 FCFA', date: '06 Oct 2025' },
    { employee: 'Aïssatou Ba', poste: 'RH', montant: '700 000 FCFA', date: '06 Oct 2025' },
    { employee: 'Cheikh Fall', poste: 'Chauffeur', montant: '350 000 FCFA', date: '07 Oct 2025' },
  ];

  if (loading) {
    return (
      <div className="flex-1 min-h-[80vh] bg-[#e6faef] flex items-center justify-center ml-60">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-[80vh] bg-[#e6faef] flex items-center justify-center ml-60">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#22c55e] text-white px-4 py-2 rounded-lg hover:bg-[#1f9d4a] transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[80vh] flex items-center justify-center ml-60" style={{ backgroundColor: 'var(--company-color-bg)' }}>
   <div className="max-w-7xl w-full bg-white border-t border-b rounded-xl p-8 shadow-md" style={{ borderColor: 'var(--company-color)' }}>
        {/* Titre Dashboard sous le header global */}
        <div className="pb-8">
          <h2 className="text-3xl font-bold text-black text-center">Tableau de bord</h2>
          <p className="text-black mt-1 text-center">Vue d'ensemble de la gestion des salaires</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-[var(--company-color-bg)] rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border" style={{ borderColor: 'var(--company-color)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-black text-sm font-medium mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold text-black mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp size={16} style={{ color: 'var(--company-color)' }} />
                      ) : (
                        <TrendingDown size={16} className="text-black" />
                      )}
                      <span className={`text-sm font-semibold ${stat.trend === 'up' ? '' : 'text-black'}`} style={{ color: stat.trend === 'up' ? 'var(--company-color)' : undefined }}>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts - Masquer pour super admin et caissier */}
        {userRole !== 'SUPER_ADMIN' && userRole !== 'CASHIER' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="bg-[var(--company-color-bg)] rounded-xl shadow-md p-6 border" style={{ borderColor: 'var(--company-color)' }}>
            <h3 className="text-lg font-bold text-black mb-4">Évolution de la masse salariale</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salaryEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--company-color)" />
                <XAxis dataKey="mois" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--company-color)', border: 'none', borderRadius: '8px', color: 'black' }}
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Line type="monotone" dataKey="montant" stroke="var(--company-color)" strokeWidth={3} dot={{ fill: 'var(--company-color)', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-[var(--company-color-bg)] rounded-xl shadow-md p-6 border" style={{ borderColor: 'var(--company-color)' }}>
            <h3 className="text-lg font-bold text-black mb-4">Paiements par mode</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={paymentsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--company-color)" />
                <XAxis dataKey="type" stroke="#000" />
                <YAxis stroke="#000" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--company-color)', border: 'none', borderRadius: '8px', color: 'black' }}
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M FCFA`}
                />
                <Bar dataKey="montant" fill="var(--company-color)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* Upcoming Payments - Seulement pour admin */}
        {userRole === 'ADMIN' && (
          <div className="bg-[#e6faef] rounded-xl shadow-md border border-[#22c55e] p-8">
            <h3 className="text-xl font-bold text-[#22c55e] mb-4">Paiements à venir</h3>
            <p className="text-gray-600">Aucun paiement programmé pour le moment.</p>
          </div>
        )}

        {/* Section pour caissier */}
        {userRole === 'CASHIER' && (
          <div className="bg-[#e6faef] rounded-xl shadow-md border border-[#22c55e] p-8 text-center">
            <h3 className="text-xl font-bold text-[#22c55e] mb-4">Espace Caissier</h3>
            <p className="text-gray-600 mb-4">Vous pouvez enregistrer les paiements des employés depuis le menu "Paiements".</p>
            <p className="text-gray-500">Seuls les bulletins approuvés sont disponibles pour les paiements.</p>
          </div>
        )}

        {/* Message pour super admin */}
        {userRole === 'SUPER_ADMIN' && (
          <div className="bg-[#e6faef] rounded-xl shadow-md border border-[#22c55e] p-8 text-center">
            <h3 className="text-xl font-bold text-[#22c55e] mb-4">Bienvenue Super Administrateur</h3>
            <p className="text-gray-600 mb-4">Vous pouvez gérer toutes les entreprises depuis le menu "Entreprises".</p>
            <p className="text-gray-500">Sélectionnez une entreprise pour voir ses statistiques détaillées.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
