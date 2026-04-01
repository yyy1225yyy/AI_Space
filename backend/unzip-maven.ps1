$zipPath = "H:\yyyflie\yyydemo\AI\AI_Space\backend\maven.zip"
$destPath = "H:\yyyflie\yyydemo\AI\AI_Space\backend\maven"
Expand-Archive -Path $zipPath -DestinationPath $destPath -Force
Write-Host "Unzipped OK"
