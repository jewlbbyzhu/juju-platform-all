param(
  [string]$BaseUrl = $env:JUJU_API_BASE_URL
)

$ProgressPreference = "SilentlyContinue"

if (-not $BaseUrl) { $BaseUrl = "http://localhost:3001/api/v1" }

function Invoke-Api {
  param(
    [ValidateSet("GET","POST","PUT","DELETE")] [string]$Method,
    [string]$Path,
    [hashtable]$Headers = @{},
    $Body = $null
  )

  $uri = "{0}{1}" -f $BaseUrl.TrimEnd("/"), $Path
  try {
    if ($null -eq $Body) {
      return Invoke-RestMethod -Method $Method -Uri $uri -Headers $Headers -TimeoutSec 60
    }

    $json = $Body | ConvertTo-Json -Depth 20
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $Headers -Body $json -ContentType "application/json" -TimeoutSec 60
  } catch {
    $status = $null
    $respBody = $null

    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
      try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respBody = $reader.ReadToEnd()
      } catch {}
    }

    $msg = $_.Exception.Message
    if ($status) { $msg = "{0} (HTTP {1})" -f $msg, $status }
    if ($respBody) { $msg = "{0}`nResponseBody: {1}" -f $msg, $respBody }
    throw $msg
  }
}

Write-Host ("BaseUrl={0}" -f $BaseUrl)

$res = Invoke-Api -Method "GET" -Path "/parties/published?page=1&pageSize=3" -Headers @{ "User-Agent" = "Mozilla/5.0" }
if (-not $res.success) { throw ("get published parties failed: {0}" -f ($res.message)) }

Write-Host "OK"

