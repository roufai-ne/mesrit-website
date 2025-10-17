import mongoose from 'mongoose';

// Schéma pour les logs système centralisés
const systemLogSchema = new mongoose.Schema({
  // Informations temporelles
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Classification du log
  level: {
    type: String,
    enum: ['error', 'warning', 'info', 'success', 'debug'],
    required: true,
    index: true
  },
  
  type: {
    type: String,
    required: true,
    index: true,
    // Types définis dans LOG_TYPES du logger
    enum: [
      // Authentification
      'access', 'login', 'logout', 'login_failed', 'session_expired',
      // Gestion des utilisateurs
      'user_created', 'user_updated', 'user_deleted', 'password_changed', 'role_changed',
      // Gestion du contenu
      'content_created', 'content_updated', 'content_deleted', 'content_published', 'content_viewed',
      'minister_content_accessed',
      // Actions
      'user_action', 'admin_action',
      // Système
      'system_startup', 'system_shutdown', 'system_error', 'backup_created', 'backup_restored',
      'database_error', 'api_error',
      'system_maintenance',
      // Sécurité
      'security_breach', 'suspicious_activity', 'rate_limit_exceeded', 'unauthorized_access',
      // Performance
      'slow_query', 'high_memory_usage', 'high_cpu_usage'
    ]
  },
  
  // Contenu du message
  message: {
    type: String,
    required: true,
    text: true // Index de recherche textuelle
  },
  
  // Informations utilisateur
  userId: {
    type: String,
    sparse: true,
    index: true
  },
  
  username: {
    type: String,
    default: 'system',
    index: true
  },
  
  // Informations réseau/session
  ip: {
    type: String,
    default: 'localhost'
  },
  
  userAgent: {
    type: String,
    default: 'system'
  },
  
  sessionId: {
    type: String,
    sparse: true
  },
  
  // Détails techniques
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Informations contextuelles
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  
  // Informations de la requête HTTP (si applicable)
  httpMethod: {
    type: String,
    sparse: true
  },
  
  httpUrl: {
    type: String,
    sparse: true
  },
  
  httpStatus: {
    type: Number,
    sparse: true
  },
  
  duration: {
    type: Number, // en millisecondes
    sparse: true
  },
  
  // Catégorisation pour l'analyse
  category: {
    type: String,
    enum: ['auth', 'user', 'content', 'system', 'security', 'performance', 'api'],
    index: true
  },
  
  // Priorité pour les alertes
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  
  // Statut de traitement
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Informations d'archivage
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  
  archivedAt: {
    type: Date,
    sparse: true
  },
  
  // Métadonnées pour l'analyse
  tags: [{
    type: String,
    index: true
  }],
  
  // Référence vers d'autres entités
  relatedEntity: {
    type: {
      type: String,
      enum: ['user', 'news', 'document', 'establishment', 'service']
    },
    id: String
  }
}, {
  timestamps: true,
  // Index composé pour les requêtes fréquentes
  indexes: [
    { timestamp: -1, level: 1 },
    { type: 1, timestamp: -1 },
    { userId: 1, timestamp: -1 },
    { category: 1, level: 1, timestamp: -1 },
    { priority: 1, processed: 1, timestamp: -1 },
    { archived: 1, timestamp: -1 },
    // Index de recherche textuelle
    { message: 'text', username: 'text', type: 'text' }
  ]
});

// Middleware pre-save pour automatiser certains champs
systemLogSchema.pre('save', function(next) {
  // Définir automatiquement la catégorie basée sur le type
  if (!this.category) {
    const typeToCategory = {
      'login': 'auth',
      'logout': 'auth',
      'login_failed': 'auth',
      'session_expired': 'auth',
      'user_created': 'user',
      'user_updated': 'user',
      'user_deleted': 'user',
      'password_changed': 'user',
      'role_changed': 'user',
      'content_created': 'content',
      'content_updated': 'content',
      'content_deleted': 'content',
      'content_published': 'content',
  'content_viewed': 'content',
  'minister_content_accessed': 'content',
  'user_action': 'user',
  'admin_action': 'user',
      'system_startup': 'system',
      'system_shutdown': 'system',
      'backup_created': 'system',
      'backup_restored': 'system',
      'database_error': 'system',
      'api_error': 'api',
  'system_maintenance': 'system',
      'security_breach': 'security',
      'suspicious_activity': 'security',
      'rate_limit_exceeded': 'security',
      'unauthorized_access': 'security',
      'slow_query': 'performance',
      'high_memory_usage': 'performance',
      'high_cpu_usage': 'performance'
    };
    
    this.category = typeToCategory[this.type] || 'system';
  }
  
  // Définir automatiquement la priorité basée sur le niveau
  if (!this.priority || this.priority === 'medium') {
    const levelToPriority = {
      'error': 'high',
      'warning': 'medium',
      'info': 'low',
      'success': 'low',
      'debug': 'low'
    };
    
    this.priority = levelToPriority[this.level] || 'medium';
    
    // Cas spéciaux pour priorité critique
    const criticalTypes = ['security_breach', 'database_error', 'system_shutdown'];
    if (criticalTypes.includes(this.type)) {
      this.priority = 'critical';
    }
  }
  
  next();
});

// Méthodes d'instance
systemLogSchema.methods.markAsProcessed = function() {
  this.processed = true;
  return this.save();
};

systemLogSchema.methods.archive = function() {
  this.archived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Méthodes statiques pour les requêtes fréquentes
systemLogSchema.statics.findByLevel = function(level, limit = 100) {
  return this.find({ level }).sort({ timestamp: -1 }).limit(limit);
};

systemLogSchema.statics.findByCategory = function(category, limit = 100) {
  return this.find({ category }).sort({ timestamp: -1 }).limit(limit);
};

systemLogSchema.statics.findRecent = function(hours = 24, limit = 100) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ timestamp: { $gte: since } }).sort({ timestamp: -1 }).limit(limit);
};

systemLogSchema.statics.findUnprocessedCritical = function() {
  return this.find({
    priority: 'critical',
    processed: false,
    archived: false
  }).sort({ timestamp: -1 });
};

systemLogSchema.statics.getStatsByLevel = function(dateFrom, dateTo) {
  const match = {};
  if (dateFrom || dateTo) {
    match.timestamp = {};
    if (dateFrom) match.timestamp.$gte = new Date(dateFrom);
    if (dateTo) match.timestamp.$lte = new Date(dateTo);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        latest: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

systemLogSchema.statics.getStatsByCategory = function(dateFrom, dateTo) {
  const match = {};
  if (dateFrom || dateTo) {
    match.timestamp = {};
    if (dateFrom) match.timestamp.$gte = new Date(dateFrom);
    if (dateTo) match.timestamp.$lte = new Date(dateTo);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        levels: {
          $push: '$level'
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

systemLogSchema.statics.getHourlyActivity = function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d %H:00',
            date: '$timestamp'
          }
        },
        count: { $sum: 1 },
        levels: { $push: '$level' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Méthodes de nettoyage automatique
systemLogSchema.statics.cleanOldLogs = function(daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    priority: { $ne: 'critical' }, // Garder les logs critiques plus longtemps
    archived: true
  });
};

systemLogSchema.statics.archiveOldLogs = function(daysToArchive = 30) {
  const cutoffDate = new Date(Date.now() - daysToArchive * 24 * 60 * 60 * 1000);
  return this.updateMany(
    {
      timestamp: { $lt: cutoffDate },
      archived: false
    },
    {
      $set: {
        archived: true,
        archivedAt: new Date()
      }
    }
  );
};

export default mongoose.models.SystemLog || mongoose.model('SystemLog', systemLogSchema);