# 🔒 Configuração de HTTPS / SSL Gratuito na VPS

Configurar um certificado de segurança SSL (HTTPS) na sua VPS é **gratuito, simples e extremamente recomendado** para remover o aviso de "Site Inseguro" do navegador e garantir a segurança dos dados trafegados na aplicação.

Hoje, o padrão mundial para certificados gratuitos é a autoridade certificadora **Let's Encrypt**. Para integrá-la com a sua aplicação Docker do AutoMatch, utilizamos o **Nginx** como Proxy Reverso. Ele escuta na porta `80` (HTTP) e `443` (HTTPS) na VPS e repassa as requisições internamente para o seu container Docker (que roda na porta `3000`).

---

## 🛠️ Método Recomendado: Nginx + Certbot (Let's Encrypt) direto na VPS

Este é o método mais robusto, tradicional e leve de configurar.

### 📋 Pré-requisitos
1. Ter um **domínio** ou **subdomínio** apontando para o IP da sua VPS (ex: `automatch.seudominio.com` apontando para o tipo `A` com o IP da VPS).
   > [!IMPORTANT]
   > O Let's Encrypt exige um domínio real para validar e emitir o certificado. Ele não gera certificados diretamente para IPs puros (como `http://187.124.128.145`).

---

### Passo 1: Instalar o Nginx e o Certbot na VPS
Conecte-se via SSH na sua VPS como usuário root e execute:

```bash
# Atualizar pacotes
sudo apt update

# Instalar o Nginx
sudo apt install nginx -y

# Instalar o Certbot e o plugin do Nginx
sudo apt install certbot python3-certbot-nginx -y
```

---

### Passo 2: Configurar o Nginx para redirecionar para o Docker
Crie um arquivo de configuração para o AutoMatch dentro do Nginx:

```bash
sudo nano /etc/nginx/sites-available/automatch
```

Cole o seguinte conteúdo dentro do arquivo (substituindo `automatch.seudominio.com` pelo seu domínio real):

```nginx
server {
    listen 80;
    server_name automatch.seudominio.com; # Altere para o seu domínio

    location / {
        proxy_pass http://127.0.0.1:3000; # Encaminha para o container de Produção
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Salve e feche o arquivo (`Ctrl + O`, `Enter`, depois `Ctrl + X`).

---

### Passo 3: Ativar a configuração
Crie um link simbólico para ativar o site e recarregar o Nginx:

```bash
# Habilitar o site nas configurações ativas
sudo ln -s /etc/nginx/sites-available/automatch /etc/nginx/sites-enabled/

# Testar se a sintaxe do Nginx está correta
sudo nginx -t

# Reiniciar o Nginx para aplicar as alterações
sudo systemctl restart nginx
```

Neste ponto, se você acessar `http://automatch.seudominio.com`, sua aplicação já deverá carregar (ainda em HTTP).

---

### Passo 4: Obter o Certificado SSL Gratuito
Agora, use o Certbot para obter o certificado SSL e configurar automaticamente o HTTPS no Nginx:

```bash
sudo certbot --nginx -d automatch.seudominio.com
```

* O Certbot fará perguntas básicas como o seu e-mail (para alertas de expiração) e se você aceita os termos.
* Ele perguntará se você deseja redirecionar todo o tráfego HTTP para HTTPS. Selecione a opção **2 (Redirect)**.

Pronto! O Certbot gerou o certificado, configurou as chaves de segurança e reiniciou o Nginx. Agora o seu site estará rodando em **`https://automatch.seudominio.com`** com o cadeado verde de segurança!

---

## 🔄 Renovação Automática
Os certificados do Let's Encrypt são válidos por 90 dias, mas o Certbot configura uma tarefa agendada (cron) na sua VPS que os **renova automaticamente** antes de expirarem.

Para testar se a renovação automática está funcionando perfeitamente, rode:
```bash
sudo certbot renew --dry-run
```
Se o comando finalizar sem erros, o seu certificado HTTPS será eterno e 100% automatizado!
