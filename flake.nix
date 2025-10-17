{
  inputs.flakelight.url = "github:nix-community/flakelight";
  outputs = {flakelight, ...}:
    flakelight ./. (
      {lib, ...}: {
        systems = lib.systems.flakeExposed;
        formatters = pkgs: let
          alejandra = "${pkgs.alejandra}/bin/alejandra .";
          typstyle = "${pkgs.typstyle}/bin/typstyle -i src/assets/resume.typ";
        in {
          "*.nix" = alejandra;
          "*.typ" = typstyle;
        };
      }
    );
}
