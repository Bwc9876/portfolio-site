{pkgs}: let
  typst-packages = pkgs.fetchgit {
    url = "https://github.com/typst/packages.git";
    rev = "20dfd96e1e5f5284bde5eaaeacb094bee9215fb0";
    sparseCheckout = map (p: "packages/preview/${p}") [
      "basic-resume/0.2.9"
      "scienceicons/0.1.0"
    ];
    hash = "sha256-k14km63OmRU/9pj02oIA+XXmqpQ0GpUqWxzP7gCvlKU=";
  };
in
  pkgs.runCommand "plugins-dir" {} ''
    mkdir -p $out
    ln -s ${typst-packages}/packages/preview $out/preview
  ''
