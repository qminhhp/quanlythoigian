 tWrite-Host "Building and deploying Worker..."
npm run build:worker

Write-Host "Building React app..."
npm run build

Write-Host "Deploying to Pages..."
wrangler deploy --config wrangler.toml
