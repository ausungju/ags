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
		pkgs = nixpkgs.legacyPackages.${system};
		
		pname = "my-shell";
		entry = "app.ts";

		# Try to extract AGS packages without triggering the error
		# Use strings to defer evaluation
		agsOutputs = ags.packages.${system} or {};
		
		runtimeDeps = with pkgs; [
			gjs
			libadwaita
			libsoup_3
			gtk4
			typescript
			nodejs
		];
		
	in {
		packages.${system} = {
			default = pkgs.writeShellApplication {
				name = pname;
				runtimeInputs = runtimeDeps ++ [ pkgs.nix ];
				
				text = ''
					# Build AGS and required astal packages at runtime
					# This is a workaround for the wrapGAppsHook deprecation issue
					
					AGS_FLAKE="github:aylur/ags"
					
					echo "Ensuring AGS and Astal packages are built..." >&2
					
					# Build all needed packages in parallel
					AGS_CLI=$(nix build "$AGS_FLAKE" --no-link --print-out-paths 2>/dev/null)
					BATTERY=$(nix build "$AGS_FLAKE#battery" --no-link --print-out-paths 2>/dev/null)
					TRAY=$(nix build "$AGS_FLAKE#tray" --no-link --print-out-paths 2>/dev/null)
					HYPRLAND=$(nix build "$AGS_FLAKE#hyprland" --no-link --print-out-paths 2>/dev/null)
					IO=$(nix build "$AGS_FLAKE#io" --no-link --print-out-paths 2>/dev/null)
					ASTAL4=$(nix build "$AGS_FLAKE#astal4" --no-link --print-out-paths 2>/dev/null)
					
					# Set up typelib paths for GObject Introspection
					export GI_TYPELIB_PATH="$BATTERY/lib/girepository-1.0:$TRAY/lib/girepository-1.0:$HYPRLAND/lib/girepository-1.0:$IO/lib/girepository-1.0:$ASTAL4/lib/girepository-1.0''${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
					export LD_LIBRARY_PATH="$BATTERY/lib:$TRAY/lib:$HYPRLAND/lib:$IO/lib:$ASTAL4/lib''${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
					
					exec "$AGS_CLI/bin/ags" run "${self}/${entry}" "$@"
				'';
			};
		};

		devShells.${system} = {
			default = pkgs.mkShell {
				packages = runtimeDeps;
				
				shellHook = ''
					echo "AGS development environment"
					echo ""
					echo "Building AGS..."
					AGS_BIN=$(nix build --no-link --print-out-paths github:aylur/ags)/bin/ags
					export PATH="$(dirname "$AGS_BIN"):$PATH"
					echo "AGS available at: $AGS_BIN"
					echo ""
					echo "Run: ags run ${entry}"
				'';
			};
		};
		
		homeManagerModules.default = { config, lib, pkgs, ...}: {
			options.programs.my-shell = {
				enable = lib.mkEnableOption "my-shell AGS configuration";
			};
			
			config = lib.mkIf config.programs.my-shell.enable {
				home.packages = [
					self.packages.${system}.default
				];
			};
		};
	};
}
