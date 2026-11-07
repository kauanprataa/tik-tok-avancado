# TikTok Avançado · área de membros

Site estático (Netlify) com login, progresso e conteúdo no Supabase (projeto `tiktok-avancado`, São Paulo).

## Como funciona
- **Login:** e-mail e senha do Supabase Auth. O aluno só entra se tiver uma matrícula ativa.
- **Liberação:** aulas 01 e 02 abrem na hora; as outras 7 dias depois da entrada do aluno. A regra fica no banco (`public.pode_ver_aula`), então não dá para burlar pelo navegador.
- **Vídeos e materiais:** ficam no bucket privado `conteudo` do Supabase Storage. O site gera links temporários só para aulas liberadas.
- **Progresso e anotações:** tabela `progresso`, salvos na conta do aluno (funciona em qualquer aparelho).

## Painel do admin (aba "Admin" no site)
- **Alunos:** liberar acesso (gera senha para mandar ao aluno), gerar nova senha, pausar ou reativar.
- **Vídeos e materiais:** enviar o vídeo (MP4, até 50 MB no plano grátis) e os materiais de cada aula.

## Arquivos
- `index.html`, `styles.css`, `app.js` – o site.
- `config.js` – endereço e chave pública do Supabase.
- `capas/` – imagens dos módulos.
- `_headers` – cabeçalhos de segurança do Netlify.

Para trocar títulos de aulas ou a regra de liberação, edite `MODULES`/`RELEASE` em `app.js` (e a função `pode_ver_aula` no Supabase, se mudar a regra).
