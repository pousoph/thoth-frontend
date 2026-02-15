# Connect thoth-frontend to GitHub and push all files
# Run this script after installing Git: https://git-scm.com/download/win
# In PowerShell: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned (if needed)
# Then: .\push-to-github.ps1

$ErrorActionPreference = "Stop"
$remoteUrl = "https://github.com/pousoph/thoth-frontend.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH. Install from: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    git init
}
git remote remove origin 2>$null
git remote add origin $remoteUrl
git add -A
git status
git commit -m "Initial commit: thoth-frontend React + Vite project"
git branch -M main
git push -u origin main

Write-Host "Done. Repository pushed to $remoteUrl" -ForegroundColor Green
