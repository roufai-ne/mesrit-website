# 🌐 Configuration Avancée Caddy - MESRIT Website

Guide de configuration avancée pour Caddy avec optimisations performance et sécurité.

## 🚀 Configuration de Base

### Caddyfile Simple

```caddy
votre-domaine.com {
    reverse_proxy localhost:3000
}
```

### Caddyfile Complet avec Optimisations

```caddy
# Configuration globale
{
    # Options de sécurité
    servers {
        trusted_proxies static private_ranges
    }

    # Limite de taille des uploads
    max_file_size 50MB

    # Configuration Let's Encrypt
    email admin@votre-domaine.com

    # Logs globaux
    log {
        output file /var/log/caddy/global.log {
            roll_size 100MiB
            roll_keep 5
        }
        level INFO
    }
}

# Site principal
votre-domaine.com, www.votre-domaine.com {
    # Redirection www vers non-www
    @www host www.votre-domaine.com
    redir @www https://votre-domaine.com{uri} permanent

    # Reverse proxy vers l'application Next.js
    reverse_proxy localhost:3000 {
        # Headers de sécurité
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}

        # Timeouts
        transport http {
            dial_timeout 30s
            response_header_timeout 30s
        }

        # Health check
        health_uri /api/health
        health_interval 30s
    }

    # Headers de sécurité
    header {
        # HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

        # Protection XSS
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"

        # CSP (Content Security Policy)
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"

        # Autres headers de sécurité
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "geolocation=(), microphone=(), camera=()"

        # Retirer headers révélateurs
        -Server
        -X-Powered-By
    }

    # Compression
    encode {
        gzip 6
        zstd
        minimum_length 1000
        match {
            header Content-Type text/*
            header Content-Type application/javascript*
            header Content-Type application/json*
            header Content-Type application/xml*
            header Content-Type image/svg+xml*
        }
    }

    # Assets statiques Next.js avec cache agressif
    handle_path /_next/static/* {
        root * /var/www/mesrit-website/.next/static
        file_server {
            precompressed gzip br
        }
        header Cache-Control "public, max-age=31536000, immutable"
        header Vary "Accept-Encoding"
    }

    # Assets publics avec cache modéré
    handle_path /uploads/* {
        root * /var/www/mesrit-website/public/uploads
        file_server
        header Cache-Control "public, max-age=2592000"
        header Vary "Accept-Encoding"
    }

    # Images et autres assets publics
    handle_path /images/* {
        root * /var/www/mesrit-website/public/images
        file_server {
            precompressed gzip br
        }
        header Cache-Control "public, max-age=604800"
    }

    # API avec headers de sécurité renforcés
    handle_path /api/* {
        reverse_proxy localhost:3000
        header {
            # Rate limiting headers (informationnel)
            X-RateLimit-Limit "100"
            X-RateLimit-Window "1m"
        }
    }

    # Protection contre les chemins sensibles
    handle_path /.env* {
        respond "Forbidden" 403
    }

    handle_path /.git/* {
        respond "Forbidden" 403
    }

    handle_path /node_modules/* {
        respond "Forbidden" 403
    }

    # Logs d'accès spécifiques
    log {
        output file /var/log/caddy/mesrit.log {
            roll_size 100MiB
            roll_keep 10
        }
        format json
        level INFO
    }

    # Métriques (optionnel)
    metrics /metrics {
        disable_openmetrics
    }
}

# Sous-domaine API (optionnel)
api.votre-domaine.com {
    reverse_proxy localhost:3000 {
        header_up Host votre-domaine.com
    }

    # CORS pour API
    header {
        Access-Control-Allow-Origin "https://votre-domaine.com"
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization"
        Access-Control-Max-Age "86400"
    }

    # Répondre aux requêtes OPTIONS
    @cors_preflight method OPTIONS
    respond @cors_preflight 204
}

# Sous-domaine admin (optionnel)
admin.votre-domaine.com {
    reverse_proxy localhost:3000 {
        header_up Host votre-domaine.com
        header_up X-Admin-Request "true"
    }

    # Authentification basique supplémentaire (optionnel)
    basicauth {
        admin $2a$14$Zkx19XLiW6VYouLHR5NbcOZmg4VJdFkNE9SidS2nv5Zz/U5HCFUG.
    }

    # Headers de sécurité renforcés pour l'admin
    header {
        X-Admin-Access "true"
        Cache-Control "no-cache, no-store, must-revalidate"
    }
}
```

## 🔧 Configurations Spécialisées

### Load Balancing (Multi-instances)

```caddy
votre-domaine.com {
    reverse_proxy {
        to localhost:3000
        to localhost:3001
        to localhost:3002

        lb_policy round_robin
        health_uri /api/health
        health_interval 30s

        fail_duration 30s
        max_fails 3
        unhealthy_latency 10s
    }
}
```

### Rate Limiting

```caddy
votre-domaine.com {
    # Limite globale
    rate_limit {
        zone static_ip {
            key "{remote_host}"
            window 1m
            events 100
        }

        zone dynamic_ip {
            key "{remote_host}"
            window 1h
            events 1000
        }
    }

    # Limite API stricte
    handle_path /api/* {
        rate_limit {
            zone api {
                key "{remote_host}"
                window 1m
                events 30
            }
        }
        reverse_proxy localhost:3000
    }

    reverse_proxy localhost:3000
}
```

### Geo-blocking

```caddy
votre-domaine.com {
    # Bloquer certains pays (exemple)
    @blocked_countries {
        remote_ip 1.2.3.0/24 5.6.7.0/24
    }
    respond @blocked_countries "Access denied" 403

    reverse_proxy localhost:3000
}
```

### Cache avec Redis

```caddy
votre-domaine.com {
    # Cache pour les pages statiques
    handle_path /actualites/* {
        cache {
            key "{scheme}://{host}{uri}?{query}"
            ttl 5m
            stale_ttl 1h

            # Headers à considérer pour le cache
            vary_by Accept-Encoding
            vary_by Authorization

            # Ne pas cacher certaines pages
            bypass_query_string "preview=1"
            bypass_header "Cache-Control: no-cache"
        }
        reverse_proxy localhost:3000
    }

    reverse_proxy localhost:3000
}
```

## 🛡️ Sécurité Avancée

### Protection DDoS

```caddy
{
    servers {
        # Limites de connexions
        max_header_size 16KB
        read_timeout 30s
        write_timeout 30s
        idle_timeout 2m

        # Protection contre le slowloris
        keep_alive_interval 15s
    }
}

votre-domaine.com {
    # Rate limiting agressif pour protection DDoS
    rate_limit {
        zone ddos_protection {
            key "{remote_host}"
            window 10s
            events 50
        }
    }

    reverse_proxy localhost:3000
}
```

### WAF (Web Application Firewall) Basique

```caddy
votre-domaine.com {
    # Bloquer les requêtes suspectes
    @blocked_requests {
        query_regexp "(?i)(union|select|insert|delete|update|drop|create|alter|exec|script|javascript|vbscript|onload|onerror)"
        header_regexp User-Agent "(?i)(sqlmap|nikto|nmap|masscan|nessus|openvas|nuclei)"
        path_regexp "(?i)\\.(php|asp|aspx|jsp|cgi)$"
    }
    respond @blocked_requests "Blocked" 403

    # Limiter la taille des requêtes
    request_body {
        max_size 10MB
    }

    reverse_proxy localhost:3000
}
```

## 📊 Monitoring et Logs

### Configuration Avancée des Logs

```caddy
{
    log default {
        output file /var/log/caddy/access.log {
            roll_size 100MiB
            roll_keep 30
            roll_keep_for 720h
        }
        format json {
            time_format "2006-01-02T15:04:05.000Z07:00"
            exclude request>headers>Authorization
            exclude request>headers>Cookie
        }
        level INFO
    }
}

votre-domaine.com {
    # Logs d'erreurs séparés
    log error {
        output file /var/log/caddy/error.log
        level ERROR
    }

    # Logs de sécurité
    log security {
        output file /var/log/caddy/security.log
        include_path "/api/*"
        include_path "/admin/*"
        format json
    }

    reverse_proxy localhost:3000
}
```

### Métriques Prometheus

```caddy
{
    admin localhost:2019

    servers {
        metrics
    }
}

:2019 {
    metrics /metrics

    # Protection de l'endpoint metrics
    basicauth /metrics {
        prometheus $2a$14$...
    }
}
```

## 🚀 Optimisations Performance

### Configuration HTTP/3

```caddy
{
    servers {
        protocol {
            experimental_http3
        }
    }
}

votre-domaine.com {
    # Headers pour HTTP/3
    header {
        Alt-Svc `h3=":443"; ma=86400`
    }

    reverse_proxy localhost:3000
}
```

### Preload et Early Hints

```caddy
votre-domaine.com {
    # Early hints pour les ressources critiques
    handle / {
        header {
            Link `</_next/static/css/app.css>; rel=preload; as=style`
            Link `</_next/static/js/app.js>; rel=preload; as=script`
        }
        reverse_proxy localhost:3000
    }

    reverse_proxy localhost:3000
}
```

## 🔄 Mise à Jour et Rechargement

### Script de Rechargement Automatique

```bash
#!/bin/bash
# /usr/local/bin/reload-caddy.sh

# Validation de la configuration
if sudo caddy validate --config /etc/caddy/Caddyfile; then
    echo "✅ Configuration valide"

    # Rechargement graceful
    sudo systemctl reload caddy
    echo "🔄 Caddy rechargé avec succès"

    # Vérification du statut
    sleep 2
    if sudo systemctl is-active --quiet caddy; then
        echo "✅ Caddy fonctionne correctement"
    else
        echo "❌ Erreur lors du rechargement"
        sudo systemctl status caddy
        exit 1
    fi
else
    echo "❌ Configuration invalide"
    exit 1
fi
```

### Rechargement avec inotify

```bash
# Installation inotify-tools
sudo apt install -y inotify-tools

# Script de surveillance
#!/bin/bash
inotifywait -m -e modify /etc/caddy/Caddyfile | while read; do
    echo "Configuration modifiée, rechargement..."
    /usr/local/bin/reload-caddy.sh
done
```

---

## 📞 Commandes Utiles

```bash
# Validation configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Rechargement sans interruption
sudo systemctl reload caddy

# Format automatique du Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile

# Test de la configuration
sudo caddy run --config /etc/caddy/Caddyfile --dry-run

# Vérification des certificats
sudo caddy list-certificates

# Logs en temps réel
sudo journalctl -u caddy -f

# Métriques
curl -s localhost:2019/metrics | grep caddy_
```

**🎉 Votre Caddy est maintenant configuré de manière optimale pour la production !**