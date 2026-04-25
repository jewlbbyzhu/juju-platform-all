param(
  [string]$BaseUrl = $env:JUJU_API_BASE_URL,
  [string]$Username = $env:JUJU_ADMIN_USERNAME,
  [string]$Password = $env:JUJU_ADMIN_PASSWORD
)

$ProgressPreference = "SilentlyContinue"

if (-not $BaseUrl) { $BaseUrl = "http://localhost:3001/api/v2" }
if (-not $Username) { throw "Missing Username (set JUJU_ADMIN_USERNAME)" }
if (-not $Password) { throw "Missing Password (set JUJU_ADMIN_PASSWORD)" }

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
Write-Host ("Username={0}" -f $Username)

$login = Invoke-Api -Method "POST" -Path "/admin/login" -Body @{ username = $Username; password = $Password }
if (-not $login.success) { throw ("admin login failed: {0}" -f ($login.message)) }
if (-not $login.data.token) { throw "admin login token missing" }
if (-not $login.data.refreshToken) { throw "admin login refreshToken missing" }

$headers = @{ Authorization = ("Bearer {0}" -f $login.data.token) }
$me = Invoke-Api -Method "GET" -Path "/auth/user" -Headers $headers
if (-not $me.success) { throw ("auth user failed: {0}" -f ($me.message)) }

$refresh = Invoke-Api -Method "POST" -Path "/auth/refresh" -Body @{ refreshToken = $login.data.refreshToken }
if (-not $refresh.success) { throw ("admin refresh failed: {0}" -f ($refresh.message)) }
if (-not $refresh.data.token) { throw "admin refresh token missing" }

$headers = @{ Authorization = ("Bearer {0}" -f $refresh.data.token) }
$me2 = Invoke-Api -Method "GET" -Path "/auth/user" -Headers $headers
if (-not $me2.success) { throw ("auth user after refresh failed: {0}" -f ($me2.message)) }

Write-Host "OK"

