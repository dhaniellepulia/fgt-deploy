param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$DbName = "fgt_website",
  [string]$DbUser = "fgt_user",
  [string]$Container = "fgt_postgres"
)

if (!(Test-Path $BackupFile)) {
  Write-Error "Backup file not found: $BackupFile"
  exit 1
}

Write-Host "Restoring from: $BackupFile"

Get-Content -Path $BackupFile -Encoding Byte | docker exec -i $Container pg_restore -U $DbUser -d $DbName --clean --if-exists

if ($LASTEXITCODE -ne 0) {
  Write-Error "Restore failed"
  exit 1
}

Write-Host "Restore complete"
