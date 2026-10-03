$body = @{ name = "Test Rider"; email = "rider@test.com"; password = "pass1234" } | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
Write-Host "SIGNUP RESPONSE:" $r.Content

$body2 = @{ email = "rider@test.com"; password = "pass1234" } | ConvertTo-Json
$r2 = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body2 -ContentType "application/json"
Write-Host "LOGIN RESPONSE:" $r2.Content

$r3 = Invoke-WebRequest -Uri "http://localhost:5000/api/bikes" -Method GET
Write-Host "BIKES COUNT:" ($r3.Content | ConvertFrom-Json).Count
