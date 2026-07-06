$ErrorActionPreference = "Stop"
$Image = "prelegal:latest"
$Name = "prelegal"
$Here = Split-Path -Parent $PSScriptRoot

docker build -t $Image $Here
docker rm -f $Name 2>$null | Out-Null
docker run -d --name $Name -p 8000:8000 --env-file "$Here\.env" $Image
Write-Host "Prelegal is starting at http://localhost:8000"
