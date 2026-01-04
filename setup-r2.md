# Setup Cloudflare R2 per il Portfolio

## 1. Installazione Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

## 2. Creazione Bucket
```bash
wrangler r2 bucket create portfolio-assets
```

## 3. Upload File
```bash
wrangler r2 object put portfolio-assets/model.glb --file="assets/models/buddha/source/model.glb"
wrangler r2 object put portfolio-assets/finalized.zip --file="assets/models/buddha/source/finalized.zip"
wrangler r2 object put portfolio-assets/tex_u0_v0.jpg --file="assets/models/buddha/source/tex_u0_v0.jpg"
```

## 4. Configura Accesso Pubblico
1. Vai su dashboard Cloudflare
2. R2 → portfolio-assets → Settings
3. "Allow public access"
4. Copia il URL pubblico

## 5. Aggiorna il codice
Sostituisci in main.js:
```javascript
'https://portfolio-assets.your-account.r2.cloudflarestorage.com/model.glb'
```
con il tuo URL pubblico R2.

## Vantaggi
- ✅ CDN globale inclusa
- ✅ Nessun costo di egress
- ✅ 10GB storage gratuito
- ✅ Performance ottimali
