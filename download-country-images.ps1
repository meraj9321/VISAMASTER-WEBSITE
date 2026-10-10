$folder = Join-Path $PSScriptRoot "public\images\countries"

# Folder automatically create hoga
New-Item -ItemType Directory -Force -Path $folder | Out-Null

$images = @(
    @{
        Name = "uae.jpg"
        Url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dubai_skyline_-_Dubai,_UAE.jpg"
    },
    @{
        Name = "usa.jpg"
        Url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/New_York_City,_Skyline.jpg"
    },
    @{
        Name = "canada.jpg"
        Url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toronto_Skyline,_Ontario_Canada.jpg"
    },
    @{
        Name = "uk.jpg"
        Url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/London-skyline.jpg"
    },
    @{
    Name = "australia.jpg"
    Url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sydney_skyline,_Australia.jpg"
}
)

foreach ($image in $images) {

    $destination = Join-Path $folder $image.Name

    Write-Host "Downloading $($image.Name)..."

    Invoke-WebRequest `
        -Uri $image.Url `
        -OutFile $destination

    Write-Host "Saved: $destination"
}

Write-Host ""
Write-Host "========================================="
Write-Host "All country images downloaded!"
Write-Host "========================================="
Write-Host ""
Write-Host "Location:"
Write-Host $folder