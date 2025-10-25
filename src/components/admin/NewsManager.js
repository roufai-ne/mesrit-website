// components/admin/NewsManager.js
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash,
  X,
  Search,
  BarChart3,
  FileText,
  Archive,
  RotateCcw,
  AlertCircle,
  History,
  Trash2,
  Target,
} from "lucide-react";
import NewsImageUpload from "../communication/NewsImageUpload";
import NewsVideoUpload from "../communication/NewsVideoUpload";
import VideoPlayer from "../communication/VideoPlayer";
import NewsAnalyticsDashboard from "./NewsAnalyticsDashboard";
import NewsArchiveManager from "./NewsArchiveManager";
import NewsVersionManager from "./NewsVersionManager";
import SEOManager from "./SEOManager";
import SEODashboard from "./SEODashboard";
import { useNewsArchive } from "@/hooks/useNewsArchive";
import { toast } from "react-hot-toast";
import { secureApi, useApiAction } from "@/lib/secureApi";
import { useAuth } from "@/contexts/AuthContext";
import { usePermission } from "@/hooks/usePermission";

// Déclaration des statuts pour le filtre
const statusOptions = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publiés" },
  { value: "archived", label: "Archivés" },
  { value: "deleted", label: "Corbeille" },
];

const NewsManager = ({
  categories = ["Actualités", "Événements", "Communiqués", "Annonces"],
}) => {
  const { user } = useAuth();
  const permissions = usePermission();
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("articles");
  const [selectedNews, setSelectedNews] = useState([]);

  // Filtres avancés
  const [dateFilter, setDateFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  // Gestion des versions et archivage
  const [showVersionManager, setShowVersionManager] = useState(null);
  const [showSEOManager, setShowSEOManager] = useState(null);
  const {
    archiveArticle,
    deleteArticle,
    restoreArticle,
    restoreFromTrash,
    permanentDelete,
  } = useNewsArchive();
  const [tagsFilter, setTagsFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tri
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const { execute, loading } = useApiAction();

  // État initial du formulaire
  const initialFormState = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    status: "draft",
    image: "",
    content: "",
    tags: [],
    summary: "",
    images: [],
    mainVideo: "",
    videos: [],
  };
  const [formData, setFormData] = useState(initialFormState);
  const [newTag, setNewTag] = useState("");

  // Permissions RBAC granulaires
  const canCreateNews = permissions.canCreateContent;
  const canEditOwnNews = permissions.canCreateContent; // Les éditeurs peuvent modifier leurs propres articles
  const canEditAllNews = permissions.canManageDocuments || permissions.isContentAdmin || permissions.isAdmin;
  const canDeleteNews = permissions.isContentAdmin || permissions.isAdmin;
  const canPublishNews = permissions.isContentAdmin || permissions.isAdmin;
  const canArchiveNews = permissions.isContentAdmin || permissions.isAdmin;
  const canManageSEO = permissions.isContentAdmin || permissions.isAdmin;
  const canViewAnalytics = permissions.canAccessAdvancedStats || permissions.isContentAdmin || permissions.isAdmin;

  // Fonction pour vérifier si l'utilisateur peut éditer un article spécifique
  const canEditArticle = (article) => {
    if (canEditAllNews) return true;
    if (canEditOwnNews && article.authorId === user?._id) return true;
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut supprimer un article spécifique
  const canDeleteArticle = (article) => {
    if (canDeleteNews) return true;
    return false;
  };

  // Handler pour le tri
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Charger les actualités au montage et lors du changement de filtre
  useEffect(() => {
    fetchNews();
  }, [statusFilter]);

  // Récupérer les actualités filtrées par statut
  const fetchNews = async () => {
    try {
      let response;
      if (statusFilter === "all") {
        response = await secureApi.get("/api/news", true);
      } else if (statusFilter === "archived") {
        response = await secureApi.get("/api/news/archive", true);
        response = response.articles || [];
      } else if (statusFilter === "deleted") {
        response = await secureApi.get("/api/news/trash", true);
        response = response.articles || [];
      } else {
        response = await secureApi.get(
          `/api/news?status=${statusFilter}`,
          true
        );
      }
      setNews(Array.isArray(response) ? response : response.result || []);
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
      toast.error(error.message || "Erreur lors du chargement des actualités");
    }
  };

  // Gérer la sélection individuelle
  const handleSelectNews = (id) => {
    setSelectedNews((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  // Filtrer les actualités
  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    // Filtre avancé : date
    const matchesDate =
      !dateFilter || (item.date && item.date.startsWith(dateFilter));

    // Filtre avancé : auteur
    const matchesAuthor =
      !authorFilter ||
      (item.author &&
        item.author.toLowerCase().includes(authorFilter.toLowerCase()));

    // Filtre avancé : tags
    const tagsArray = tagsFilter
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const matchesTags =
      tagsArray.length === 0 ||
      (item.tags && tagsArray.every((tag) => item.tags.includes(tag)));

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesDate &&
      matchesAuthor &&
      matchesTags
    );
  });

  // Gérer la sélection/désélection de tous
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNews(filteredNews.map((item) => item._id));
    } else {
      setSelectedNews([]);
    }
  };

  // Actions en masse
  const handleBulkArchive = async () => {
    if (selectedNews.length === 0) return;
    if (
      window.confirm(
        `Archiver ${selectedNews.length} actualité(s) sélectionnée(s) ?`
      )
    ) {
      try {
        // Archiver chaque article individuellement
        for (const newsId of selectedNews) {
          await archiveArticle(newsId, "Archivage en lot");
        }
        toast.success(
          `${selectedNews.length} actualité(s) archivée(s) avec succès !`
        );
        setSelectedNews([]);
        await fetchNews();
      } catch (error) {
        toast.error(error.message || "Erreur lors de l'archivage en masse");
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedNews.length === 0) return;
    if (
      window.confirm(
        `Restaurer ${selectedNews.length} actualité(s) sélectionnée(s) ?`
      )
    ) {
      try {
        // Restaurer chaque article individuellement
        for (const newsId of selectedNews) {
          if (statusFilter === "deleted") {
            await restoreFromTrash(newsId);
          } else {
            await restoreArticle(newsId);
          }
        }
        toast.success(
          `${selectedNews.length} actualité(s) restaurée(s) avec succès !`
        );
        setSelectedNews([]);
        await fetchNews();
      } catch (error) {
        toast.error(error.message || "Erreur lors de la restauration en masse");
      }
    }
  };

  const handleBulkTrash = async () => {
    if (selectedNews.length === 0) return;
    if (
      window.confirm(
        `Mettre ${selectedNews.length} actualité(s) sélectionnée(s) à la corbeille ?`
      )
    ) {
      try {
        // Mettre à la corbeille chaque article individuellement
        for (const newsId of selectedNews) {
          await deleteArticle(newsId, "Suppression en lot");
        }
        toast.success(
          `${selectedNews.length} actualité(s) mise(s) à la corbeille`
        );
        setSelectedNews([]);
        await fetchNews();
      } catch (error) {
        toast.error(
          error.message || "Erreur lors de la mise à la corbeille en masse"
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNews.length === 0) return;
    if (
      window.confirm(
        `ATTENTION: Supprimer définitivement ${selectedNews.length} actualité(s) sélectionnée(s) ? Cette action est irréversible.`
      )
    ) {
      try {
        // Supprimer définitivement chaque article individuellement
        for (const newsId of selectedNews) {
          await permanentDelete(newsId);
        }
        toast.success(
          `${selectedNews.length} actualité(s) supprimée(s) définitivement`
        );
        setSelectedNews([]);
        await fetchNews();
      } catch (error) {
        toast.error(error.message || "Erreur lors de la suppression en masse");
      }
    }
  };

  // Ouvrir le formulaire pour ajouter
  const handleAdd = () => {
    setEditingNews(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  // Ouvrir le formulaire pour éditer
  const handleEdit = (item) => {
    setEditingNews(item._id);
    setFormData({
      title: item.title,
      date: new Date(item.date).toISOString().split("T")[0],
      category: item.category,
      status: item.status,
      image: item.image,
      content: item.content,
      summary: item.summary || "",
      tags: item.tags || [],
      images: item.images || [],
    });
    setShowForm(true);
  };

  // Supprimer une actualité
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "ATTENTION: Supprimer définitivement cette actualité ? Cette action est irréversible."
      )
    ) {
      try {
        await execute(async () => {
          await secureApi.delete(`/api/news/${id}`);
          setNews((prevNews) => prevNews.filter((item) => item._id !== id));
          toast.success("Actualité supprimée définitivement");
        });
      } catch (error) {
        toast.error(error.message || "Erreur lors de la suppression");
      }
    }
  };

  // Archiver une actualité
  const handleArchive = async (id) => {
    if (window.confirm("Archiver cette actualité ?")) {
      try {
        await archiveArticle(id, "Archivage manuel");
        await fetchNews();
      } catch (error) {
        console.error("Erreur archivage:", error);
      }
    }
  };

  // Mettre à la corbeille
  const handleMoveToTrash = async (id) => {
    if (window.confirm("Mettre cette actualité à la corbeille ?")) {
      try {
        await deleteArticle(id, "Suppression manuelle");
        await fetchNews();
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
  };

  // Ouvrir le gestionnaire de versions
  const handleShowVersions = (newsId) => {
    setShowVersionManager(newsId);
  };

  // Ouvrir le gestionnaire SEO
  const handleShowSEO = (article) => {
    setShowSEOManager(article);
  };

  // Restaurer une actualité
  const handleRestore = async (id) => {
    if (window.confirm("Restaurer cette actualité ?")) {
      try {
        await restoreArticle(id);
        await fetchNews();
      } catch (error) {
        toast.error(error.message || "Erreur lors de la restauration");
      }
    }
  };

  // Mettre à la corbeille
  const handleTrash = async (id) => {
    if (window.confirm("Mettre cette actualité à la corbeille ?")) {
      try {
        await deleteArticle(id, "Mise à la corbeille manuelle");
        await fetchNews();
      } catch (error) {
        console.error("Erreur mise à la corbeille:", error);
      }
    }
  };

  // Restaurer de la corbeille
  const handleRestoreTrash = async (id) => {
    if (window.confirm("Restaurer cette actualité depuis la corbeille ?")) {
      try {
        await restoreFromTrash(id);
        await fetchNews();
      } catch (error) {
        toast.error(error.message || "Erreur restauration corbeille");
      }
    }
  };

  // Fonction handleShowVersions déjà définie plus haut - suppression de la redéclaration

  // Ajouter un tag
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  // Supprimer un tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Sauvegarder les modifications
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await execute(async () => {
        const formattedData = {
          ...formData,
          date: new Date(formData.date).toISOString(),
        };

        if (editingNews) {
          // Mise à jour
          const updatedNews = await secureApi.put(
            `/api/news/${editingNews}`,
            formattedData
          );
          setNews((prevNews) =>
            prevNews.map((item) =>
              item._id === editingNews ? updatedNews : item
            )
          );
          toast.success("Actualité mise à jour avec succès");
        } else {
          // Création
          const newNews = await secureApi.post("/api/news", formattedData);
          setNews((prevNews) => [...prevNews, newNews]);
          toast.success("Actualité créée avec succès");
        }

        setShowForm(false);
        await fetchNews();
      });
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  // Gérer l'upload d'images supplémentaires
  const handleAdditionalImagesUpload = async (files) => {
    for (let file of files) {
      try {
        const response = await secureApi.uploadFile(
          "/api/upload/news",
          file,
          true
        );
        const { url } = response;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { url, description: "" }],
        }));
      } catch (error) {
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }
  };

  // Supprimer une image supplémentaire
  const removeAdditionalImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  // Mettre à jour la description d'une image
  const updateImageDescription = (index, description) => {
    const newImages = [...formData.images];
    newImages[index].description = description;
    setFormData({ ...formData, images: newImages });
  };

  // Tri des actualités filtrées
  const sortedNews = [...filteredNews].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    } else if (typeof valA === "string" && typeof valB === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedNews.length / pageSize);
  const paginatedNews = sortedNews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fonction d'archivage intelligent
  const handleAutoArchive = async () => {
    if (
      window.confirm("Lancer l'archivage intelligent des articles anciens ?")
    ) {
      try {
        toast.info(
          "Fonctionnalité d'archivage automatique disponible via le script autoArchive.js"
        );
        // Cette fonctionnalité est gérée par le script src/scripts/autoArchive.js
        // qui peut être exécuté via une tâche cron ou manuellement
      } catch (error) {
        toast.error(error.message || "Erreur archivage intelligent");
      }
    }
  };

  // Obtenir les actions disponibles selon le statut et les permissions
  const getAvailableActions = (item) => {
    const actions = [];

    // Bouton modifier - disponible si l'utilisateur peut éditer cet article
    if (canEditArticle(item)) {
      actions.push(
        <button
          key={`edit-${item._id}`}
          onClick={() => handleEdit(item)}
          className="p-1 text-niger-green dark:text-niger-green-light hover:text-niger-orange transition-colors"
          title="Modifier"
          disabled={loading}
        >
          <Edit className="w-4 h-4" />
        </button>
      );
    }

    // Bouton de gestion des versions - disponible pour tous ceux qui peuvent voir l'article
    actions.push(
      <button
        key={`versions-${item._id}`}
        onClick={() => handleShowVersions(item._id)}
        className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        title="Historique des versions"
        disabled={loading}
      >
        <History className="w-4 h-4" />
      </button>
    );

    // Bouton SEO - disponible pour les content-admin et system-admin
    if (canManageSEO) {
      actions.push(
        <button
          key={`seo-${item._id}`}
          onClick={() => handleShowSEO(item)}
          className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          title="Optimisation SEO"
          disabled={loading}
        >
          <Target className="w-4 h-4" />
        </button>
      );
    }

    // Actions selon le statut et les permissions
    switch (item.status) {
      case "published":
      case "draft":
        // Archiver - disponible pour content-admin et system-admin
        if (canArchiveNews) {
          actions.push(
            <button
              key={`archive-${item._id}`}
              onClick={() => handleArchive(item._id)}
              className="p-1 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
              title="Archiver"
              disabled={loading}
            >
              <Archive className="w-4 h-4" />
            </button>
          );
        }
        
        // Mettre à la corbeille - disponible pour content-admin et system-admin
        if (canDeleteArticle(item)) {
          actions.push(
            <button
              key={`trash-published-${item._id}`}
              onClick={() => handleTrash(item._id)}
              className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              title="Mettre à la corbeille"
              disabled={loading}
            >
              <Trash className="w-4 h-4" />
            </button>
          );
        }
        break;

      case "archived":
        // Restaurer - disponible pour content-admin et system-admin
        if (canArchiveNews) {
          actions.push(
            <button
              key={`restore-archived-${item._id}`}
              onClick={() => handleRestore(item._id)}
              className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              title="Restaurer"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          );
        }
        
        // Mettre à la corbeille - disponible pour content-admin et system-admin  
        if (canDeleteArticle(item)) {
          actions.push(
            <button
              key={`trash-archived-${item._id}`}
              onClick={() => handleTrash(item._id)}
              className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              title="Mettre à la corbeille"
              disabled={loading}
            >
              <Trash className="w-4 h-4" />
            </button>
          );
        }
        break;

      case "deleted":
        // Restaurer de la corbeille - disponible pour content-admin et system-admin
        if (canArchiveNews) {
          actions.push(
            <button
              key={`restore-trash-${item._id}`}
              onClick={() => handleRestoreTrash(item._id)}
              className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              title="Restaurer de la corbeille"
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          );
        }
        
        // Supprimer définitivement - disponible pour content-admin et system-admin
        if (canDeleteArticle(item)) {
          actions.push(
            <button
              key={`delete-permanent-${item._id}`}
              onClick={() => handleDelete(item._id)}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="Supprimer définitivement"
              disabled={loading}
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          );
        }
        break;
    }

    // Analytics - disponible pour ceux qui ont accès aux statistiques avancées
    if (canViewAnalytics) {
      actions.push(
        <button
          key={`analytics-global-${item._id}`}
          onClick={() => handleShowAnalytics(item._id)}
          className="p-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          title="Analytics"
          disabled={loading}
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      );
    }

    return actions;
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    const statusMap = {
      published: "Publié",
      draft: "Brouillon",
      archived: "Archivé",
      deleted: "Corbeille",
    };
    return statusMap[status] || status;
  };

  // Obtenir les classes CSS du statut
  const getStatusClasses = (status) => {
    const classMap = {
      published:
        "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400",
      draft: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
      archived:
        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400",
      deleted: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400",
    };
    return (
      classMap[status] ||
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
    );
  };

  return (
    <div className="p-6">
      {/* Boutons d'actions en masse */}
      {selectedNews.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200 mr-4">
              {selectedNews.length} élément(s) sélectionné(s)
            </span>
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
              disabled={loading}
            >
              Archiver
            </button>
            <button
              onClick={handleBulkRestore}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
              disabled={loading}
            >
              Restaurer
            </button>
            <button
              onClick={handleBulkTrash}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors"
              disabled={loading}
            >
              Corbeille
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
              disabled={loading}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Bouton archivage intelligent */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAutoArchive}
          className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
          disabled={loading}
        >
          <Archive className="w-4 h-4 mr-2" />
          Archivage intelligent
        </button>
      </div>

      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
          Gestion des actualités
        </h2>
        {canCreateNews && (
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-niger-orange to-niger-green text-white px-4 py-2 rounded-lg flex items-center hover:shadow-lg transition-all duration-300"
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle actualité
          </button>
        )}
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl border border-niger-orange/10 p-1 mb-6">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "articles"
                ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                : "text-readable-muted dark:text-muted-foreground hover:bg-niger-cream/50 dark:hover:bg-secondary-700"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Articles</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                : "text-readable-muted dark:text-muted-foreground hover:bg-niger-cream/50 dark:hover:bg-secondary-700"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "seo"
                ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                : "text-readable-muted dark:text-muted-foreground hover:bg-niger-cream/50 dark:hover:bg-secondary-700"
            }`}
          >
            <Target className="w-5 h-5" />
            <span>SEO</span>
          </button>
        </nav>
      </div>

      {/* Contenu conditionnel */}
      {activeTab === "analytics" ? (
        <NewsAnalyticsDashboard />
      ) : activeTab === "archives" ? (
        <NewsArchiveManager />
      ) : activeTab === "seo" ? (
        <SEODashboard />
      ) : (
        <>
          {/* Barre de filtres */}
          <div className="mb-4 space-y-4">
            {/* Ligne 1: Compteur et loader */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-niger-green dark:text-niger-green-light">
                {filteredNews.length} sur {news.length} actualités affichées
              </div>
              {loading && (
                <div className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-niger-orange border-t-transparent rounded-full"></span>
                  <span className="text-niger-orange">Chargement...</span>
                </div>
              )}
            </div>

            {/* Ligne 2: Filtres principaux */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative" style={{ minWidth: 200 }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                style={{ minWidth: 150 }}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat, index) => (
                  <option key={`cat-${index}`} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                placeholder="Date"
              />

              <input
                type="text"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                placeholder="Auteur"
                style={{ minWidth: 120 }}
              />

              <input
                type="text"
                value={tagsFilter}
                onChange={(e) => setTagsFilter(e.target.value)}
                className="p-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                placeholder="Tags (séparés par des virgules)"
                style={{ minWidth: 200 }}
              />

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setDateFilter("");
                  setAuthorFilter("");
                  setTagsFilter("");
                }}
                className="px-3 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-green transition-colors font-medium"
              >
                Réinitialiser
              </button>
            </div>

            {/* Ligne 3: Filtres de statut */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-niger-orange/20 dark:border-secondary-600 ${
                    statusFilter === value
                      ? "bg-gradient-to-r from-niger-orange to-niger-green text-white shadow-lg"
                      : "bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light hover:bg-niger-cream/50 dark:hover:bg-secondary-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des actualités */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-niger-orange/10 transition-colors duration-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-niger-orange/10">
                    <th className="p-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedNews.length === filteredNews.length &&
                          filteredNews.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-niger-orange/20"
                      />
                    </th>
                    <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">
                      Image
                    </th>
                    <th
                      className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      Titre{" "}
                      {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date{" "}
                      {sortBy === "date" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      Catégorie{" "}
                      {sortBy === "category" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th
                      className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Statut{" "}
                      {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="text-left p-4 text-niger-green dark:text-niger-green-light font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNews.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-8 text-center text-readable-muted dark:text-muted-foreground"
                      >
                        Aucune actualité trouvée
                      </td>
                    </tr>
                  ) : (
                    paginatedNews.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-niger-orange/10 hover:bg-niger-cream/50 dark:hover:bg-secondary-700/50 transition-colors"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedNews.includes(item._id)}
                            onChange={() => handleSelectNews(item._id)}
                            className="rounded border-niger-orange/20"
                          />
                        </td>
                        <td className="p-4">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={64}
                              height={48}
                              className="object-cover rounded"
                            />
                          )}
                        </td>
                        <td className="p-4 text-niger-green dark:text-niger-green-light">
                          <div className="max-w-xs truncate" title={item.title}>
                            {item.title}
                          </div>
                        </td>
                        <td className="p-4 text-readable-muted dark:text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-niger-orange/20 text-niger-orange rounded-full text-sm font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusClasses(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            {getAvailableActions(item)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-niger-orange/10">
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Page {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-niger-orange/20 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light disabled:opacity-50 hover:bg-niger-cream/50 dark:hover:bg-secondary-600 transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-niger-orange/20 bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light disabled:opacity-50 hover:bg-niger-cream/50 dark:hover:bg-secondary-600 transition-colors"
                >
                  Suivant
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-4 p-2 border border-niger-orange/20 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto shadow-2xl border border-niger-orange/10 transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light">
                  {editingNews ? "Modifier l'actualité" : "Nouvelle actualité"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-readable-muted dark:text-muted-foreground hover:text-niger-orange transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    required
                    placeholder="Titre de l'actualité"
                  />
                </div>

                {/* Date et Catégorie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat, index) => (
                        <option key={`form-cat-${index}`} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Statut *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                    required
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </div>

                {/* Image principale */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Image principale *
                  </label>
                  <NewsImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    required
                  />
                </div>

                {/* Résumé */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Résumé *
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 h-24 resize-vertical"
                    placeholder="Résumé de l'actualité..."
                    required
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Contenu *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 h-40 resize-vertical"
                    placeholder="Contenu détaillé de l'actualité..."
                    required
                  />
                </div>

                {/* Images supplémentaires */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Images supplémentaires
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={img.url}
                          alt={img.description || "Image supplémentaire"}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <input
                          type="text"
                          value={img.description}
                          onChange={(e) =>
                            updateImageDescription(index, e.target.value)
                          }
                          className="mt-2 w-full p-2 text-sm border border-niger-orange/20 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light"
                          placeholder="Description de l'image"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <div
                      className="h-32 border-2 border-dashed border-niger-orange/30 dark:border-secondary-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-niger-orange bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors"
                      onClick={() =>
                        document.getElementById("additionalImages").click()
                      }
                    >
                      <input
                        id="additionalImages"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleAdditionalImagesUpload(
                            Array.from(e.target.files)
                          )
                        }
                      />
                      <div className="text-center">
                        <Plus className="w-8 h-8 text-niger-orange mx-auto mb-2" />
                        <span className="text-sm text-niger-orange">
                          Ajouter des images
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vidéo principale */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Vidéo principale
                  </label>
                  <NewsVideoUpload
                    value={
                      formData.mainVideo
                        ? {
                            url: formData.mainVideo,
                            title: "Vidéo principale",
                            description: "",
                            isMain: true,
                          }
                        : null
                    }
                    onChange={(videoData) => {
                      if (videoData) {
                        setFormData({
                          ...formData,
                          mainVideo: videoData.url,
                          videos: [
                            videoData,
                            ...(formData.videos || []).filter((v) => !v.isMain),
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          mainVideo: "",
                          videos: (formData.videos || []).filter(
                            (v) => !v.isMain
                          ),
                        });
                      }
                    }}
                  />
                </div>

                {/* Vidéos supplémentaires */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Vidéos supplémentaires
                  </label>
                  <div className="space-y-4">
                    {(formData.videos || [])
                      .filter((v) => !v.isMain)
                      .map((video, index) => (
                        <div
                          key={index}
                          className="border border-niger-orange/20 dark:border-secondary-600 rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-32 h-20 bg-gray-100 dark:bg-secondary-600 rounded-lg overflow-hidden flex-shrink-0">
                              <VideoPlayer
                                src={video.url}
                                poster={video.thumbnail}
                                title={video.title}
                                className="w-full h-full"
                                controls={false}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={video.title}
                                onChange={(e) => {
                                  const updatedVideos = [
                                    ...(formData.videos || []),
                                  ];
                                  const videoIndex = (
                                    formData.videos || []
                                  ).findIndex((v) => v.url === video.url);
                                  updatedVideos[videoIndex] = {
                                    ...video,
                                    title: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    videos: updatedVideos,
                                  });
                                }}
                                className="w-full p-2 text-sm border border-niger-orange/20 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light"
                                placeholder="Titre de la vidéo"
                              />
                              <textarea
                                value={video.description}
                                onChange={(e) => {
                                  const updatedVideos = [
                                    ...(formData.videos || []),
                                  ];
                                  const videoIndex = (
                                    formData.videos || []
                                  ).findIndex((v) => v.url === video.url);
                                  updatedVideos[videoIndex] = {
                                    ...video,
                                    description: e.target.value,
                                  };
                                  setFormData({
                                    ...formData,
                                    videos: updatedVideos,
                                  });
                                }}
                                className="w-full p-2 text-sm border border-niger-orange/20 dark:border-secondary-600 rounded bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light resize-none"
                                placeholder="Description de la vidéo"
                                rows={2}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedVideos = (
                                  formData.videos || []
                                ).filter((v) => v.url !== video.url);
                                setFormData({
                                  ...formData,
                                  videos: updatedVideos,
                                });
                              }}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                              title="Supprimer la vidéo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {/* Bouton pour ajouter une vidéo supplémentaire */}
                    <div
                      className="border-2 border-dashed border-niger-orange/30 dark:border-secondary-600 rounded-lg p-4 text-center cursor-pointer hover:border-niger-orange bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors"
                      onClick={() => {
                        // Créer un input file temporaire pour les vidéos
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept =
                          "video/mp4,video/webm,video/avi,video/mov,video/quicktime";
                        input.onchange = async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const response = await secureApi.uploadFile(
                                "/api/upload/video",
                                file,
                                true
                              );
                              const videoData = {
                                url: response.url,
                                thumbnail: response.thumbnail,
                                title: file.name.replace(/\.[^/.]+$/, ""),
                                description: "",
                                duration: 0,
                                format: response.metadata.format,
                                size: response.metadata.size,
                                uploadedAt: new Date(),
                                isMain: false,
                              };
                              setFormData({
                                ...formData,
                                videos: [...(formData.videos || []), videoData],
                              });
                              toast.success("Vidéo ajoutée avec succès");
                            } catch (error) {
                              toast.error("Erreur lors de l'ajout de la vidéo");
                            }
                          }
                        };
                        input.click();
                      }}
                    >
                      <Plus className="w-8 h-8 text-niger-orange mx-auto mb-2" />
                      <span className="text-sm text-niger-orange">
                        Ajouter une vidéo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 p-3 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300"
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-3 bg-niger-cream dark:bg-secondary-700 text-niger-green dark:text-niger-green-light rounded-lg hover:bg-niger-orange/20 transition-colors border border-niger-orange/20"
                    >
                      Ajouter
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-niger-orange/20 text-niger-orange rounded-full flex items-center text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-readable-muted dark:text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-niger-orange/10">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-niger-orange/20 text-niger-orange rounded-lg hover:bg-niger-orange/10 transition-colors font-medium"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    disabled={loading}
                  >
                    {loading
                      ? "En cours..."
                      : editingNews
                      ? "Mettre à jour"
                      : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Gestionnaire de versions */}
      {showVersionManager && (
        <NewsVersionManager
          newsId={showVersionManager}
          onClose={() => setShowVersionManager(null)}
        />
      )}

      {/* Gestionnaire SEO */}
      {showSEOManager && (
        <SEOManager
          newsId={showSEOManager._id}
          article={showSEOManager}
          onClose={() => setShowSEOManager(null)}
          onUpdate={() => {
            fetchNews();
            setShowSEOManager(null);
          }}
        />
      )}
    </div>
  );
};

export default NewsManager;
