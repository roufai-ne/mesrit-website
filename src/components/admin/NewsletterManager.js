/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Send, Download, Search, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]); // État pour les logs
  const [showLogsPanel, setShowLogsPanel] = useState(false); // État pour afficher le panneau de logs
  const [filterStatus, setFilterStatus] = useState('all'); // Filtre par statut
  const [filterPeriod, setFilterPeriod] = useState('all'); // Filtre par période
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [itemsPerPage] = useState(10); // Nombre de logs par page

  useEffect(() => {
    fetchSubscribers();
    fetchLogs(filterStatus, filterPeriod, currentPage, itemsPerPage);
  }, [filterStatus, filterPeriod, currentPage, itemsPerPage]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/newsletter');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      toast.error('Erreur de chargement des abonnés');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (status = 'all', period = 'all', page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `/api/newsletter/logs?status=${status}&period=${period}&page=${page}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      toast.error('Erreur de chargement des logs');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet abonné ?')) return;
    
    try {
      const response = await fetch(`/api/newsletter/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Abonné supprimé');
        fetchSubscribers();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ['Email', 'Date d\'inscription', 'Statut'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_subscribers_${new Date().toISOString()}.csv`;
    link.click();
  };

  const sendNewsletter = async () => {
    if (!emailContent.trim()) {
      toast.error('Veuillez saisir le contenu de l\'email');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajoutez le token
        },
        body: JSON.stringify({ content: emailContent })
      });

      if (response.ok) {
        toast.success('Newsletter envoyée');
        setEmailContent('');
        fetchLogs(filterStatus, filterPeriod, currentPage, itemsPerPage); // Recharger les logs
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter</h2>
          <p className="text-gray-500">Gérez vos abonnés et envoyez des newsletters</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="flex gap-6">
      
  {/* Section d'envoi */}
  <div className={`bg-white rounded-lg shadow p-6 transition-all duration-300 ${showLogsPanel ? 'flex-1' : 'w-full'}`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Envoyer une newsletter</h3>
      <button
        onClick={() => setShowLogsPanel(!showLogsPanel)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        {showLogsPanel ? (
          <>
            <XCircle className="w-4 h-4" />
            Masquer les logs
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            Afficher les logs
          </>
        )}
      </button>
    </div>
    <textarea
      value={emailContent}
      onChange={(e) => setEmailContent(e.target.value)}
      placeholder="Contenu de la newsletter..."
      className="w-full min-h-[200px] p-4 border rounded-lg mb-4"
    />
    <button
      onClick={sendNewsletter}
      disabled={sending}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {sending ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Send className="w-4 h-4" />
      )}
      {sending ? 'Envoi...' : 'Envoyer'}
    </button>
  </div>

  {/* Panneau des logs */}
  <div
    className={`bg-white rounded-lg shadow p-6 w-96 transition-transform duration-300 ${
      showLogsPanel ? 'translate-x-0' : 'translate-x-full hidden'
    }`}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Derniers logs</h3>
      <button
        onClick={() => setShowLogsPanel(!showLogsPanel)}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <Clock className="w-5 h-5" />
      </button>
    </div>

    {/* Filtres */}
    <div className="flex gap-2 mb-4">
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-2 py-1 border rounded-lg"
      >
        <option value="all">Tous</option>
        <option value="success">Succès</option>
        <option value="error">Erreurs</option>
      </select>
      <select
        value={filterPeriod}
        onChange={(e) => setFilterPeriod(e.target.value)}
        className="px-2 py-1 border rounded-lg"
      >
        <option value="all">Toute période</option>
        <option value="last7days">7 derniers jours</option>
      </select>
    </div>

    {/* Liste des logs */}
    <div className="space-y-4">
      {logs.length === 0 ? (
        <p className="text-gray-500">Aucun log disponible</p>
      ) : (
        logs.map((log, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {log.status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <p className="text-sm font-medium">{log.email}</p>
            </div>
            <p className="text-xs text-gray-500">{log.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>

    {/* Pagination */}
    <div className="flex justify-center mt-4">
      {Array.from({ length: Math.ceil(logs.length / itemsPerPage) }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-4 py-2 mx-1 border rounded-lg ${
            currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  </div>
</div>

      {/* Liste des abonnés */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Rechercher un abonné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Date d&apos;inscription</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    Chargement...
                  </td>
                </tr>
              ) : subscribers
                  .filter(sub => sub.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(subscriber => (
                    <tr key={subscriber._id} className="border-t">
                      <td className="p-4">{subscriber.email}</td>
                      <td className="p-4">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscriber.status === 'active' ? 'Actif' : 'Désabonné'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(subscriber._id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}