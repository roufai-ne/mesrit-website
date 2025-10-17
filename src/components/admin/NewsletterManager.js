/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermissionRBAC';
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  Send,
  Download,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { secureApi } from "@/lib/secureApi";

export default function NewsletterManager() {
  const { user } = useAuth();
  const permissions = usePermission();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]); // Initialisé comme tableau vide
  const [totalLogs, setTotalLogs] = useState(0); // Total pour la pagination
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Permissions RBAC pour la newsletter
  const canSendNewsletter = permissions.canManageNewsletter;
  const canDeleteSubscriber = permissions.isContentAdmin || permissions.isAdmin;
  const canExportSubscribers = permissions.isContentAdmin || permissions.isAdmin;

  useEffect(() => {
    fetchSubscribers();
    fetchLogs(filterStatus, filterPeriod, currentPage);
  }, [filterStatus, filterPeriod, currentPage]);

  const fetchSubscribers = async () => {
    try {
      const data = await secureApi.get("/api/newsletter/subscribe", true);
      setSubscribers(data);
    } catch (error) {
      toast.error("Erreur de chargement des abonnés");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (status = "all", period = "all", page = 1) => {
    try {
      const data = await secureApi.get(
        `/api/newsletter/logs?status=${status}&period=${period}&page=${page}&limit=${itemsPerPage}`,
        true
      );
      // Vérifier si data.logs existe et est un tableau
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
        setTotalLogs(data.total || data.logs.length); // Utiliser total si disponible, sinon estimer
      } else {
        setLogs([]); // Si ce n'est pas un tableau, initialiser comme vide
        setTotalLogs(0);
        console.warn("Données de logs inattendues :", data);
      }
    } catch (error) {
      toast.error("Erreur de chargement des logs");
      setLogs([]); // Réinitialiser en cas d'erreur
      setTotalLogs(0);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet abonné ?")) return;

    try {
      await secureApi.delete(`/api/newsletter/${id}`, true);
      toast.success("Abonné supprimé");
      fetchSubscribers();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const exportToCSV = () => {
    const csvData = [
      ["Email", "Date d’inscription", "Statut"],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_subscribers_${new Date().toISOString()}.csv`;
    link.click();
  };

  const sendNewsletter = async () => {
    if (!emailContent.trim()) {
      toast.error("Veuillez saisir le contenu de l’email");
      return;
    }

    setSending(true);
    try {
      const data = await secureApi.post(
        "/api/newsletter/send",
        { content: emailContent },
        true
      );
      toast.success("Newsletter envoyée avec succès");
      setEmailContent("");
      fetchLogs(filterStatus, filterPeriod, currentPage); // Recharger les logs
    } catch (error) {
      toast.error(error.message || "Erreur lors de l’envoi");
    } finally {
      setSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
            Newsletter
          </h2>
          <p className="text-gray-500 dark:text-muted-foreground">
            Gérez vos abonnés et envoyez des newsletters
          </p>
        </div>
        <div className="flex gap-2">
          {canExportSubscribers && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 dark:bg-secondary-700 dark:hover:bg-secondary-700/50 border-niger-orange/20 dark:border-secondary-600 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          )}

          <Link
            href="/admin/newsletter/config"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <Settings className="w-4 h-4" />
            Configuration Auto
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Section d’envoi */}
        <div
          className={`bg-white rounded-lg shadow p-6 transition-all duration-300 ${
            showLogsPanel ? "flex-1" : "w-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
              Envoyer une newsletter
            </h3>
            <button
              onClick={() => setShowLogsPanel(!showLogsPanel)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-secondary-700"
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
            className="w-full min-h-[200px] p-4 border rounded-lg mb-4 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
          />
          {canSendNewsletter && (
            <button
              onClick={sendNewsletter}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 bg-gradient-to-r from-niger-orange to-niger-green hover:shadow-lg transition-all duration-300"
            >
              {sending ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          )}
        </div>

        {/* Panneau des logs */}
        {showLogsPanel && (
          <div className="bg-white rounded-lg shadow p-6 w-96 dark:bg-secondary-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-niger-green dark:text-niger-green-light">
                Derniers logs
              </h3>
              <button
                onClick={() => setShowLogsPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg dark:bg-secondary-700 dark:hover:bg-secondary-700/50"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 border rounded-lg border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Tous</option>
                <option value="success">Succès</option>
                <option value="error">Erreurs</option>
              </select>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-2 py-1 border rounded-lg border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                <option value="all">Toute période</option>
                <option value="last7days">7 derniers jours</option>
              </select>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-muted-foreground">
                  Aucun log disponible
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                  >
                    <div className="flex items-center gap-2">
                      {log.status === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <p className="text-sm font-medium">
                        {log.email || "N/A"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground">
                      {log.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                Précédent
              </button>
              <span className="px-4 py-2">
                Page {currentPage} sur{" "}
                {Math.ceil(totalLogs / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= Math.ceil(totalLogs / itemsPerPage)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow dark:bg-secondary-800">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 dark:text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher un abonné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg border-niger-orange/20 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-secondary-700">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Date d’inscription</th>
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
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    Aucun abonné trouvé
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="border-t">
                    <td className="p-4">{subscriber.email}</td>
                    <td className="p-4">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {subscriber.status === "active"
                          ? "Actif"
                          : "En attente"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {canDeleteSubscriber && (
                        <button
                          onClick={() => handleDelete(subscriber._id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
