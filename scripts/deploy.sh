#!/usr/bin/env sh
# Publica o build (dist/) no bucket S3 servido pelo CloudFront.
# Uso: AWS_PROFILE=<perfil> bun run deploy
set -eu

BUCKET="${DEPLOY_BUCKET:-shift-swap-frontend-666600766236}"
REGION="${AWS_REGION:-us-east-1}"

# Assets com hash no nome: nunca mudam, cache de 1 ano.
aws s3 sync dist/assets "s3://$BUCKET/assets" --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable"

# Demais arquivos estáticos (favicon, ícones): cache de 1 dia.
aws s3 sync dist "s3://$BUCKET" --region "$REGION" \
  --exclude "assets/*" --exclude "index.html" \
  --cache-control "public, max-age=86400"

# index.html por último e sem cache, para os usuários pegarem a versão nova logo
# (os assets que ele referencia já estão no bucket).
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --region "$REGION" \
  --cache-control "no-cache" --content-type "text/html; charset=utf-8"

echo "Publicado em https://dkrzib6ua831y.cloudfront.net"
