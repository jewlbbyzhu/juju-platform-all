# 聚聚官方网站 - 系统性闭环测试脚本
# 采用"验证-测试-再验证"的迭代方法

param(
    [string]$BaseUrl = "http://localhost:3002",
    [string]$ApiUrl = "https://api.hfparty.asia",
    [int]$Round = 1
)

$ErrorActionPreference = "Continue"
$results = @{
    Round = $Round
    StartTime = Get-Date
    ApiTests = @()
    PageTests = @()
    Errors = @()
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  聚聚官方网站 - 系统性闭环测试 Round $Round" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. API接口测试
Write-Host "【阶段1】API接口测试" -ForegroundColor Yellow
$apiEndpoints = @(
    @{ Name = "聚会列表"; Url = "$ApiUrl/api/v1/parties/published?page=1&pageSize=3"; Method = "GET" },
    @{ Name = "版本信息-Android"; Url = "$ApiUrl/api/v1/appversion/android"; Method = "GET" },
    @{ Name = "版本信息-iOS"; Url = "$ApiUrl/api/v1/appversion/ios"; Method = "GET" },
    @{ Name = "版本信息-微信"; Url = "$ApiUrl/api/v1/appversion/wechat"; Method = "GET" },
    @{ Name = "帮助文章"; Url = "$ApiUrl/api/v1/help/articles?category=getting-started&page=1&pageSize=20"; Method = "GET" }
)

foreach ($api in $apiEndpoints) {
    Write-Host "  测试: $($api.Name) ... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $api.Url -Method $api.Method -Headers @{
            "Origin" = $BaseUrl
        } -UseBasicParsing -TimeoutSec 10
        
        $status = if ($response.StatusCode -eq 200) { "PASS" } else { "FAIL" }
        $color = if ($status -eq "PASS") { "Green" } else { "Red" }
        Write-Host $status -ForegroundColor $color
        
        $results.ApiTests += @{
            Name = $api.Name
            Status = $status
            StatusCode = $response.StatusCode
            Url = $api.Url
        }
    }
    catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    错误: $($_.Exception.Message)" -ForegroundColor Red
        $results.ApiTests += @{
            Name = $api.Name
            Status = "FAIL"
            Error = $_.Exception.Message
            Url = $api.Url
        }
        $results.Errors += "API $($api.Name): $($_.Exception.Message)"
    }
}

Write-Host ""

# 2. 页面功能测试
Write-Host "【阶段2】页面功能测试" -ForegroundColor Yellow
$pages = @(
    @{ Path = "/"; Name = "首页" },
    @{ Path = "/download"; Name = "下载页" },
    @{ Path = "/help"; Name = "帮助中心" },
    @{ Path = "/search"; Name = "搜索页" },
    @{ Path = "/login"; Name = "登录页" },
    @{ Path = "/about"; Name = "关于页" }
)

foreach ($page in $pages) {
    Write-Host "  测试: $($page.Name) ($($page.Path)) ... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$($page.Path)" -Method GET -UseBasicParsing -TimeoutSec 10
        
        $status = if ($response.StatusCode -eq 200) { "PASS" } else { "FAIL" }
        $color = if ($status -eq "PASS") { "Green" } else { "Red" }
        Write-Host $status -ForegroundColor $color
        
        $results.PageTests += @{
            Name = $page.Name
            Path = $page.Path
            Status = $status
            StatusCode = $response.StatusCode
        }
    }
    catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    错误: $($_.Exception.Message)" -ForegroundColor Red
        $results.PageTests += @{
            Name = $page.Name
            Path = $page.Path
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        $results.Errors += "Page $($page.Name): $($_.Exception.Message)"
    }
}

Write-Host ""

# 3. CORS测试
Write-Host "【阶段3】CORS配置测试" -ForegroundColor Yellow
Write-Host "  测试: 预检请求 ... " -NoNewline
try {
    $corsResponse = Invoke-WebRequest -Uri "$ApiUrl/api/v1/parties/published" -Method OPTIONS -Headers @{
        "Origin" = $BaseUrl
        "Access-Control-Request-Method" = "GET"
    } -UseBasicParsing -TimeoutSec 10
    
    $corsStatus = if ($corsResponse.StatusCode -eq 204) { "PASS" } else { "FAIL" }
    $corsColor = if ($corsStatus -eq "PASS") { "Green" } else { "Red" }
    Write-Host $corsStatus -ForegroundColor $corsColor
}
catch {
    Write-Host "FAIL" -ForegroundColor Red
    Write-Host "    错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. 生成测试报告
$results.EndTime = Get-Date
$results.Duration = ($results.EndTime - $results.StartTime).TotalSeconds

$apiPass = ($results.ApiTests | Where-Object { $_.Status -eq "PASS" }).Count
$apiFail = ($results.ApiTests | Where-Object { $_.Status -eq "FAIL" }).Count
$pagePass = ($results.PageTests | Where-Object { $_.Status -eq "PASS" }).Count
$pageFail = ($results.PageTests | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试结果汇总 (Round $Round)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API测试: $apiPass 通过, $apiFail 失败" -ForegroundColor $(if ($apiFail -eq 0) { "Green" } else { "Yellow" })
Write-Host "页面测试: $pagePass 通过, $pageFail 失败" -ForegroundColor $(if ($pageFail -eq 0) { "Green" } else { "Yellow" })
Write-Host "总耗时: $($results.Duration.ToString("F2")) 秒" -ForegroundColor White
Write-Host ""

if ($results.Errors.Count -gt 0) {
    Write-Host "发现的问题:" -ForegroundColor Red
    foreach ($error in $results.Errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

# 保存测试结果
$resultsPath = "test-results-round$Round.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsPath -Encoding UTF8
Write-Host ""
Write-Host "详细结果已保存到: $resultsPath" -ForegroundColor Gray

# 返回测试结果
return $results
