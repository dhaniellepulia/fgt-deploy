param(
  [string]$BackupDir = "backups",
  [string]$DbName = "fgt_website",
  [string]$DbUser = "fgt_user",
  [string]$Container = "fgt_postgres"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $BackupDir "${DbName}_${timestamp}.dump"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

Write-Host "Creating backup: $backupPath"

docker exec -t $Container pg_dump -U $DbUser -F c -d $DbName > $backupPath

if ($LASTEXITCODE -ne 0) {
  Write-Error "Backup failed"
  exit 1
}

Write-Host "Backup complete"
