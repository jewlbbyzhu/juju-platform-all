# 聚聚平台完整测试脚本
# 用于验证官网和管理后台的所有功能

param(
    [switch]$E2E,
    [switch]$Unit,
    [switch]$Audit,
    [switch]$Production,
    [switch]$All
)

$ErrorActionPreference = "Stop"

function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Green
}

function Write-Warn($message) {
    Write-Host "[WARN] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Cyan
}

# 运行单元测试
function Test-Unit {
    Write-Info "Running unit tests..."
    try {
        npm run test:unit
        Write-Success "Unit tests passed"
    } catch {
        Write-Error "Unit tests failed: $_"
    }
}

# 运行 E2E 测试
function Test-E2E {
    Write-Info "Running E2E tests..."
    try {
        npx playwright test
        Write-Success "E2E tests passed"
    } catch {
        Write-Error "E2E tests failed: $_"
    }
}

# 运行自动审计
function Test-Audit {
    Write-Info "Starting dev server for auto audit..."
    
    # 启动开发服务器
    $server = Start-Process -FilePath "npm" -ArgumentList "run","dev" -PassThru -WindowStyle Hidden
    
    try {
        # 等待服务器启动
        Write-Info "Waiting for server to start (10s)..."
        Start-Sleep -Seconds 10
        
        # 检查服务器是否运行
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -UseBasicParsing -ErrorAction Stop
            Write-Success "Dev server running (HTTP $($response.StatusCode))"
        } catch {
            Write-Error "Dev server failed to start"
            return
        }
        
        # 运行自动审计
        Write-Info "Running auto audit..."
        Write-Info "Please visit: http://localhost:3000/?autoTap=true&routes=all"
        Write-Info "Check console output for audit results"
        
        # 保持服务器运行一段时间供审计
        Write-Info "Audit running, press Ctrl+C to stop..."
        Start-Sleep -Seconds 60
        
    } finally {
        # 停止服务器
        Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
        Write-Info "Dev server stopped"
    }
}

# 生产环境验证
function Test-Production {
    Write-Info "Verifying production environment..."
    
    $tests = @(
        @{ Name = "Official Website"; Url = "https://hfparty.asia" },
        @{ Name = "Admin Panel"; Url = "https://admin.hfparty.asia" },
        @{ Name = "API"; Url = "https://api.hfparty.asia/api/v1/parties/published" },
        @{ Name = "Contact Page"; Url = "https://hfparty.asia/contact" },
        @{ Name = "Feedback Page"; Url = "https://hfparty.asia/feedback" },
        @{ Name = "Help Center"; Url = "https://hfparty.asia/help" },
        @{ Name = "Download Page"; Url = "https://hfparty.asia/download" }
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($test in $tests) {
        try {
            $response = Invoke-WebRequest -Uri $test.Url -Method HEAD -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Success "$($test.Name): HTTP $($response.StatusCode)"
                $passed++
            } else {
                Write-Warn "$($test.Name): HTTP $($response.StatusCode)"
                $failed++
            }
        } catch {
            Write-Error "$($test.Name): Failed - $_"
            $failed++
        }
    }
    
    Write-Info "Production verification complete: $passed passed, $failed failed"
}

# 主逻辑
Set-Location $PSScriptRoot\..

if ($All -or (!$E2E -and !$Unit -and !$Audit -and !$Production)) {
    Write-Info "Running full test suite..."
    Test-Unit
    Test-E2E
    Test-Production
} else {
    if ($Unit) { Test-Unit }
    if ($E2E) { Test-E2E }
    if ($Audit) { Test-Audit }
    if ($Production) { Test-Production }
}

Write-Info "Testing complete!"
