// src/pages/admin/Statistiques.js
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import StatsAdmin from "@/components/admin/StatsAdmin";

export default function AdminStats() {
  return (
    <AdminLayout
      title="Statistiques avancées"
      subtitle="Analyses et métriques détaillées"
      requiredPermission="canAccessAdvancedStats"
    >
      <StatsAdmin />
    </AdminLayout>
  );
}
