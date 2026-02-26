$ErrorActionPreference = "Stop"

function Find-WinSCPPath {
    $candidates = @(
        "C:\Program Files\WinSCP\winscp.com",
        "C:\Program Files (x86)\WinSCP\winscp.com",
        "$env:LOCALAPPDATA\Programs\WinSCP\winscp.com",
        "$env:LOCALAPPDATA\WinSCP\winscp.com",
        "C:\Program Files\WinSCP\WinSCP.exe",
        "C:\Program Files (x86)\WinSCP\WinSCP.exe",
        "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.exe",
        "$env:LOCALAPPDATA\WinSCP\WinSCP.exe"
    )
    foreach ($path in $candidates) { if (Test-Path $path) { return $path } }
    try {
        $proc = Get-Process -Name WinSCP -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($proc -and $proc.Path) { return $proc.Path }
    } catch {}
    $cmd = (Get-Command WinSCP -ErrorAction SilentlyContinue)
    if ($cmd) { return $cmd.Source }
    return $null
}

$winscp = Find-WinSCPPath
if (-not $winscp) { Write-Error "WinSCP not found. Please install the standard WinSCP installer from https://winscp.net/eng/download.php"; exit 1 }

$script = Join-Path $PSScriptRoot "deploy.winscp"
if (-not (Test-Path $script)) { Write-Error "deploy.winscp not found"; exit 1 }

$log = Join-Path $PSScriptRoot "WinSCP-upload.log"
Write-Host "Using WinSCP at: $winscp"
& $winscp /log="$log" /ini=nul /script="$script"
$exitCode = $LASTEXITCODE
Write-Host "WinSCP exit code: $exitCode"
if (Test-Path $log) { Write-Host "Log saved to: $log" }
exit $exitCode