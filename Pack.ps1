$compress = @{
    Path             = "gameart.jpg", "index.js", "info.json"
    CompressionLevel = "Optimal"
    DestinationPath  = "The Riftbreaker Support.zip"
}
Compress-Archive @compress

