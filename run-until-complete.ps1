# Auto-Resume Content Generator
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auto-Resume Content Generator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$maxRuns = 20  # Maximum 20 cycles to prevent infinite loop

for ($i = 1; $i -le $maxRuns; $i++) {
    Write-Host "`n--- Cycle $i/$maxRuns ---" -ForegroundColor Yellow
    
    # Check progress
    Write-Host "`nChecking progress..." -ForegroundColor Green
    node check-progress.js
    
    # Check if complete
    $result = node check-progress.js 2>&1 | Select-String "Bekleyen: 0"
    if ($result) {
        Write-Host "`n🎉 ALL DREAMS COMPLETED!" -ForegroundColor Green
        break
    }
    
    # Run generator
    Write-Host "`nRunning generator..." -ForegroundColor Green
    node generate-unique-content.js
    
    Write-Host "`nWaiting 5 seconds before next cycle..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Final Status:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
node check-progress.js
