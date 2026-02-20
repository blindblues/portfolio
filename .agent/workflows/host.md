---
description: Host the site on a local server accessible from mobile devices
---

Questo workflow avvia il server locale con l'opzione `--host` per permettere l'accesso da altri dispositivi (come smartphone) nella stessa rete Wi-Fi.

1. Identificazione del comando di hosting appropriato.
// turbo
2. Esecuzione del server:
   ```powershell
   if (Test-Path "package.json") {
       $pkg = Get-Content "package.json" | ConvertFrom-Json
       if ($pkg.scripts.dev -like "*astro*") {
           npm run dev -- --host
       } elseif ($pkg.scripts.dev -like "*vite*") {
           npm run dev -- --host
       } elseif ($pkg.scripts.dev -like "*next*") {
           npx next dev -H 0.0.0.0
       } else {
           npm run dev -- --host
       }
   } else {
       npx http-server -a 0.0.0.0
   }
   ```
3. Il server è ora accessibile. Cerca l'indirizzo IP locale (es. `192.168.1.XX:port`) nell'output del comando qui sopra per connetterti dal tuo dispositivo mobile.
