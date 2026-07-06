$ErrorActionPreference = "SilentlyContinue"
docker rm -f prelegal | Out-Null
Write-Host "Prelegal stopped."
