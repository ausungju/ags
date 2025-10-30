{
	description = "My Awesome Desktop Shell";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

		ags = {
			url = "github:aylur/ags";
			inputs.nixpkgs.follows = "nixpkgs";
		};
	};

	outputs = {
		self,
		nixpkgs,
		ags,
	}: let
		system = "x86_64-linux";
		pkgs = import nixpkgs {
			inherit system;
			overlays = [
				(final: prev: {
					wrapGAppsHook = prev.wrapGAppsHook3;
				})
			];
		};
		pname = "my-shell";
		entry = "app.ts";

		astalPackages = []; # Temporarily disabled due to wrapGAppsHook issue
		# astalPackages = with ags.packages.${system}; [
		# 	io
		# 	astal4 # or astal3 for gtk3
		# 	apps
		# 	auth
		# 	battery
		# 	bluetooth
		# 	cava
		# 	greet
		# 	hyprland
		# 	mpris
		# 	network
		# 	notifd
		# 	powerprofiles
		# 	river
		# 	tray
		# 	wireplumber
		# ];

		extraPackages =
			astalPackages
			++ (with pkgs; [
				libadwaita
				libsoup_3
			]);
	in {
		packages.${system} = {
			default = pkgs.stdenv.mkDerivation {
				name = pname;
				src = ./.;

				nativeBuildInputs = with pkgs; [
					wrapGAppsHook3
					wrapGAppsHook4
					gobject-introspection
					gjs
				];

				buildInputs = extraPackages;

				installPhase = ''
					runHook preInstall

					mkdir -p $out/bin
					mkdir -p $out/share
					cp -r * $out/share
					${ags.packages.${system}.default}/bin/ags bundle ${entry} $out/bin/${pname} -d "SRC='$out/share'"

					runHook postInstall
				'';
			};
		};

		devShells.${system} = {
			default = pkgs.mkShell {
				nativeBuildInputs = with pkgs; [
					wrapGAppsHook3
					gobject-introspection
				];
				
				buildInputs = extraPackages ++ [
					(ags.packages.${system}.default.override {
						inherit extraPackages;
					})
				];
			};
		};
	};
}
