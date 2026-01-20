# Cleanup
Remove-Item -Path "Dashboard.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "Login.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "arteco-acm-frontend\Login.js" -ErrorAction SilentlyContinue
Remove-Item -Path "arteco-acm-frontend\src\components\Login.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "arteco-acm-frontend\src\components\Dashboard.jsx" -ErrorAction SilentlyContinue

# Rename Components
$components = @(
    "Login", "Homepage", "MainLayout", "AddAppraisal", "AddArtistModal", 
    "AddArtworkModal", "AppraisalList", "ArtistDetails", "ArtistList", 
    "ArtworkDetails", "ArtworkList", "AuditLogs", "CollectionsList", 
    "CreateCollection", "Navbar", "Profile", "Register"
)

foreach ($comp in $components) {
    $src = "arteco-acm-frontend\src\components\$comp.js"
    $dest = "arteco-acm-frontend\src\components\$comp.jsx"
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $dest -Force
        Write-Host "Renamed $comp.js to .jsx"
    } else {
        Write-Host "Skipped $comp (Source not found)"
    }
}