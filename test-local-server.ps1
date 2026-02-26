# Test Server Locally
Write-Host "`n🧪 Testing Server Locally...`n" -ForegroundColor Cyan

# Check if server.js exists
if (-not (Test-Path "server.js")) {
    Write-Host "❌ server.js NOT FOUND!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ server.js exists" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules NOT FOUND" -ForegroundColor Yellow
    Write-Host "   Run: npm install" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ node_modules exists" -ForegroundColor Green

# Check syntax
Write-Host "`n🔍 Checking syntax...`n" -ForegroundColor Yellow
$syntaxCheck = node --check server.js 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Syntax is valid" -ForegroundColor Green
} else {
    Write-Host "❌ Syntax errors found:" -ForegroundColor Red
    Write-Host $syntaxCheck -ForegroundColor Red
    exit 1
}

# Try to start server in background
Write-Host "`n🚀 Starting server...`n" -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Test the endpoint
Write-Host "🧪 Testing endpoint...`n" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health/continuum" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ SUCCESS! Endpoint works!" -ForegroundColor Green
        Write-Host "`nResponse:" -ForegroundColor Cyan
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "❌ Failed to connect to server" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Make sure:" -ForegroundColor Yellow
    Write-Host "   1. Port 4000 is not already in use" -ForegroundColor Gray
    Write-Host "   2. No firewall blocking port 4000" -ForegroundColor Gray
    Write-Host "   3. Run: node server.js manually to see errors" -ForegroundColor Gray
}

# Stop server
Write-Host "`n🛑 Stopping server...`n" -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "✅ Test complete!`n" -ForegroundColor Green

