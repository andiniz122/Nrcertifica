# NR Certifica — Plataforma de Treinamentos NR

## Stack
- Next.js 14 (App Router) + TypeScript
- MongoDB + Mongoose
- Tailwind CSS
- NextAuth.js
- Mercado Pago SDK
- Puppeteer (certificado PDF)
- PM2 (deploy no servidor)

## Setup no servidor

### 1. Instalar dependências
```bash
cd /var/www/nrcertifica
npm install
```

### 2. Configurar variáveis de ambiente
Edite o arquivo `.env.local` com seus valores reais:
```
MONGODB_URI=mongodb://localhost:27017/nrcertifica
NEXTAUTH_URL=https://nrcertifica.com.br
NEXTAUTH_SECRET=<gere com: openssl rand -base64 32>
MP_ACCESS_TOKEN=<seu token do Mercado Pago>
MP_PUBLIC_KEY=<sua public key do Mercado Pago>
NEXT_PUBLIC_URL=https://nrcertifica.com.br
NEXT_PUBLIC_MP_PUBLIC_KEY=<sua public key>
```

### 3. Inserir curso NR-10 no banco
```bash
node scripts/seed-nr10.js
```

### 4. Build e iniciar com PM2
```bash
npm run build
pm2 start npm --name "nrcertifica" -- start
pm2 save
```

### 5. Nginx (proxy reverso)
```nginx
server {
    listen 80;
    server_name nrcertifica.com.br www.nrcertifica.com.br;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL (Let's Encrypt)
```bash
certbot --nginx -d nrcertifica.com.br -d www.nrcertifica.com.br
```

## Mercado Pago — Webhook
Configure no painel do MP a URL:
```
https://nrcertifica.com.br/api/webhook/mp
```
Eventos: `payment`

## Estrutura de arquivos
```
app/
  (public)/       # Landing, catálogo, carrinho, checkout
  (auth)/         # Login, cadastro
  (ava)/          # Área do aluno (protegida)
  api/            # Rotas da API
components/       # Componentes React
models/           # Models Mongoose
lib/              # db.ts, auth.ts, mercadopago.ts
scripts/          # Seeds e utilitários
public/data/      # Banco de questões JSON
```
