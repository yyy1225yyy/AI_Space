$settingsPath = "H:\yyyflie\yyydemo\AI\AI_Space\backend\maven\apache-maven-3.9.9\conf\settings.xml"
$content = Get-Content $settingsPath -Raw
$mirrorBlock = @"
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <name>Aliyun Maven</name>
      <url>https://maven.aliyun.com/repository/central</url>
    </mirror>
  </mirrors>
"@
$content = $content -replace "</settings>", "$mirrorBlock</settings>"
Set-Content $settingsPath -Value $content
Write-Host "Maven mirror configured"
