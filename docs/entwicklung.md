# Entwicklung: KitaHub

Stand: 20.11.2026 (automatisch aus der Projektvorlage erzeugt, bitte ergänzen).

## Technik

- Node.js/JavaScript (next, react, tailwindcss, typescript, @supabase/supabase-js)
- Supabase (Ordner supabase/)

## Befehle

```
npm install --include=dev
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
supabase start (lokal), supabase db push
```

## Umgebung

- Einheitliche Grundlage: `.editorconfig`, `.gitattributes`, `.vscode/extensions.json`, `.cursor/rules/projekt.mdc`.
- Rechner: Windows 11, Git, Node 24 (fnm: Version pro Projekt über `.node-version`), Docker Desktop, GitHub CLI, ripgrep, jq, Cursor und VS Code.
- Zugangsdaten nur in `.env.local` (nicht im Repository). Vorlage: `.env.example`.

## Offene Punkte

- [ ] Start- und Testbefehle prüfen und oben ergänzen
- [ ] Deployment und Rückweg dokumentieren
