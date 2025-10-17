{
  packages = pkgs:
    with pkgs; [
      nodejs_24
      typst
      typstyle
      tinymist
    ];
  env = pkgs: {TYPST_PACKAGE_PATH = "${pkgs.resumeTypstPlugins}";};
}
