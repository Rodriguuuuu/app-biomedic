# APP‑BIOMED · Deploy no Netlify (sem terminal)

## Passos
1) Subir o código para o GitHub (via navegador)
   - Ir a https://github.com → New Repository → criar repo vazio
   - "Upload files" → arrastar **todos os ficheiros desta pasta** (incl. `netlify.toml`)
   - Commit

2) Netlify
   - app.netlify.com → "Add new site" → "Import from Git"
   - Escolher GitHub → selecionar o repositório
   - Build command: `npm run build` (já vem no netlify.toml)
   - Publish directory: `out` (já vem no netlify.toml)
   - Node: 18 (já vem no netlify.toml)
   - Deploy

3) URL público
   - O Netlify cria um domínio do tipo `https://<nome>.netlify.app`
   - Pode personalizar em Site settings → Domain

## Dica
Sempre que fizer alterações:
- Fazer commit no GitHub → o Netlify volta a fazer deploy automaticamente.
