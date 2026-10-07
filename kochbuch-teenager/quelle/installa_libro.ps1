# Kochbuch fuer Teenager - installazione con foto
# Crea la cartella di destinazione, scarica le 100 foto (GPT Image 2.5 / Higgsfield),
# le prepara per la stampa (300 dpi) e le inserisce nel manoscritto KDP.

param(
    [string]$Ziel = 'C:\Users\vmori\OneDrive\Book\ACCOUNT\Vincenzo.kdp\KOCHBUCH FÜR TEENAGER'
)

$ErrorActionPreference = 'Stop'
$Paket = Split-Path -Parent $MyInvocation.MyCommand.Path
$FotoOrdner = Join-Path $Ziel 'Foto'
$DruckOrdner = Join-Path $FotoOrdner 'stampa_300dpi'
$Manuskript = Join-Path $Ziel 'Kochbuch_fuer_Teenager_Manuskript.docx'

# Formato del riquadro foto nel libro: 7,125 x 2,708 pollici a 300 dpi
$BreitePx = 2137
$HoehePx = 812

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host ''
Write-Host 'KOCHBUCH FUER TEENAGER - installazione' -ForegroundColor Yellow
Write-Host "Cartella: $Ziel"
New-Item -ItemType Directory -Force -Path $Ziel, $FotoOrdner, $DruckOrdner | Out-Null

# 1) Scaricare le foto originali
$righe = Get-Content -Encoding UTF8 (Join-Path $Paket 'foto_urls.txt') | Where-Object { $_.Trim() -ne '' }
$i = 0
foreach ($riga in $righe) {
    $i++
    $nr, $url = $riga -split "`t"
    $png = Join-Path $FotoOrdner "$nr.png"
    Write-Progress -Activity 'Download foto' -Status "Foto $nr" -PercentComplete ($i / $righe.Count * 100)
    if (-not (Test-Path $png) -or (Get-Item $png).Length -lt 10000) {
        Invoke-WebRequest -Uri $url -OutFile $png -UseBasicParsing
    }
}
Write-Progress -Activity 'Download foto' -Completed
Write-Host "Foto scaricate: $($righe.Count)" -ForegroundColor Green

# 2) Ritagliare al formato del riquadro e salvare come JPG 300 dpi
$jpgCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]90)
$zielRatio = $BreitePx / $HoehePx

foreach ($riga in $righe) {
    $nr = ($riga -split "`t")[0]
    $png = Join-Path $FotoOrdner "$nr.png"
    $jpg = Join-Path $DruckOrdner "$nr.jpg"
    $img = [System.Drawing.Image]::FromFile($png)
    try {
        $w = $img.Width; $h = $img.Height
        if ($w / $h -gt $zielRatio) {
            $cw = [int]($h * $zielRatio); $ch = $h; $cx = [int](($w - $cw) / 2); $cy = 0
        } else {
            $cw = $w; $ch = [int]($w / $zielRatio); $cx = 0; $cy = [int](($h - $ch) / 2)
        }
        $bmp = New-Object System.Drawing.Bitmap $BreitePx, $HoehePx
        $bmp.SetResolution(300, 300)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $dest = New-Object System.Drawing.Rectangle 0, 0, $BreitePx, $HoehePx
        $src = New-Object System.Drawing.Rectangle $cx, $cy, $cw, $ch
        $g.DrawImage($img, $dest, $src, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        $bmp.Save($jpg, $jpgCodec, $encParams)
        $bmp.Dispose()
    } finally {
        $img.Dispose()
    }
}
Write-Host 'Foto preparate per la stampa (300 dpi).' -ForegroundColor Green

# 3) Copiare il manoscritto e sostituire i segnaposto con le foto
Copy-Item -Force (Join-Path $Paket 'Kochbuch_fuer_Teenager_Manuskript.docx') $Manuskript
$zip = [System.IO.Compression.ZipFile]::Open($Manuskript, [System.IO.Compression.ZipArchiveMode]::Update)
try {
    foreach ($riga in $righe) {
        $nr = ($riga -split "`t")[0]
        $name = "word/media/foto$nr.jpg"
        $alt = $zip.GetEntry($name)
        if ($alt) { $alt.Delete() }
        $neu = $zip.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
        $stream = $neu.Open()
        try {
            $bytes = [System.IO.File]::ReadAllBytes((Join-Path $DruckOrdner "$nr.jpg"))
            $stream.Write($bytes, 0, $bytes.Length)
        } finally {
            $stream.Dispose()
        }
    }
} finally {
    $zip.Dispose()
}
Write-Host 'Foto inserite nel manoscritto.' -ForegroundColor Green

# 4) Altri file
foreach ($f in 'LEGGIMI.txt', 'Foto_Prompts.txt') {
    $p = Join-Path $Paket $f
    if (Test-Path $p) { Copy-Item -Force $p $Ziel }
}

Write-Host ''
Write-Host 'FATTO!' -ForegroundColor Yellow
Write-Host "Manoscritto: $Manuskript"
Write-Host "Foto:        $FotoOrdner"
Start-Process explorer.exe $Ziel
