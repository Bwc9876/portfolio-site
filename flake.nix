{
  inputs.flakelight.url = "github:nix-community/flakelight";
  outputs = {flakelight, ...}:
    flakelight ./. ({lib, ...}: {
      systems = lib.systems.flakeExposed;
      package = pkgs: let
        src = ./.;
      in
        pkgs.buildNpmPackage {
          name = "portfolio-site";
          version = "0.0.0";
          inherit src;
          packageJSON = ./package.json;
          npmDeps = pkgs.importNpmLock {
            npmRoot = src;
          };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;
          installPhase = "cp -r dist/ $out";
          ASTRO_TELEMETRY_DISABLED = 1;
        };
      devShell.packages = pkgs: with pkgs; [nodejs_23 alejandra nodePackages.prettier];
      formatters = {
        "*.nix" = "alejandra .";
        "*.{js,ts,astro,json,yml,mdx}" = "prettier --write .";
      };
    });
}
