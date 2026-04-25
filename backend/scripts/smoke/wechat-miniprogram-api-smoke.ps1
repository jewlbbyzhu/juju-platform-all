param(
  [string]$BaseUrl = $env:JUJU_API_BASE_URL,
  [string]$OpenId = $env:JUJU_SMOKE_OPENID,
  [string]$NickName = $env:JUJU_SMOKE_NICKNAME
)

$ProgressPreference = "SilentlyContinue"

if (-not $BaseUrl) { $BaseUrl = "http://localhost:3001/api/v1" }
if (-not $OpenId) { $OpenId = "smoke_openid_{0}" -f ([Guid]::NewGuid().ToString("N")) }
if (-not $NickName) { $NickName = "smoke-user" }

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
Write-Host ("OpenId={0}" -f $OpenId)

try {
  Invoke-Api -Method "POST" -Path "/users/register" -Body @{ openid = $OpenId; nickname = $NickName } | Out-Null
} catch {}

$login = Invoke-Api -Method "POST" -Path "/users/login" -Body @{ openid = $OpenId }
if (-not $login.success) { throw ("login failed: {0}" -f ($login.message)) }
if (-not $login.data.token) { throw "login token missing" }
if (-not $login.data.refreshToken) { throw "login refreshToken missing" }

$headers = @{ Authorization = ("Bearer {0}" -f $login.data.token) }
$profile = Invoke-Api -Method "GET" -Path "/users/profile" -Headers $headers
if (-not $profile.success) { throw ("profile failed: {0}" -f ($profile.message)) }

$refresh = Invoke-Api -Method "POST" -Path "/auth/refresh" -Body @{ refreshToken = $login.data.refreshToken }
if (-not $refresh.success) { throw ("refresh failed: {0}" -f ($refresh.message)) }
if (-not $refresh.data.token) { throw "refresh token missing" }

$headers = @{ Authorization = ("Bearer {0}" -f $refresh.data.token) }
$profile2 = Invoke-Api -Method "GET" -Path "/users/profile" -Headers $headers
if (-not $profile2.success) { throw ("profile after refresh failed: {0}" -f ($profile2.message)) }

try {
  Invoke-Api -Method "GET" -Path "/users/profile" -Headers @{ Authorization = "Bearer invalid_token" } | Out-Null
  throw "expected unauthorized but got success"
} catch {
  $msg = $_.Exception.Message
  if ($msg -notmatch "401") {
    Write-Host ("invalid token request error: {0}" -f $msg)
  }
}

Write-Host "OK"
