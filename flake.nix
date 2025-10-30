{
	description = "My Awesome Desktop Shell";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
		# AGS input - for reference only, not directly used due to wrapGAppsHook issue
		ags.url = "github:aylur/ags";
	};

	outputs = {
		self,
		nixpkgs,
		...
	}: let
		system = "x86_64-linux";
		pkgs = nixpkgs.legacyPackages.${system};
		
		pname = "my-shell";
		entry = "app.ts";

		# Basic runtime dependencies
		runtimeDeps = with pkgs; [
			gjs
			libadwaita
			libsoup_3
			gtk4
		];
		
	in {
		packages.${system} = {
			default = pkgs.writeShellScriptBin pname ''
				# This script expects AGS to be available in PATH
				# Install AGS separately in your system configuration
				
				if ! command -v ags &> /dev/null; then
					echo "Error: AGS not found in PATH"
					echo ""
					echo "Please install AGS in your NixOS/home-manager configuration:"
					echo "  environment.systemPackages = [ inputs.ags.packages.\${system}.default ];"
					echo "or:"
					echo "  home.packages = [ inputs.ags.packages.\${system}.default ];"
					exit 1
				fi
				
				export PATH="${pkgs.lib.makeBinPath runtimeDeps}:$PATH"
				exec ags run "${self}/${entry}" "$@"
			'';
		};

		devShells.${system} = {
			default = pkgs.mkShell {
				packages = runtimeDeps;
				
				shellHook = ''
					echo "AGS development environment"
					echo ""
					echo "Note: Install AGS separately due to wrapGAppsHook compatibility issue"
					echo "  nix shell github:aylur/ags"
					echo ""
					echo "Then run:"
					echo "  ags run ${entry}"
				'';
			};
		};
		
		# Export for use in NixOS/home-manager
		# Usage: imports = [ inputs.my-shell.homeManagerModules.default ];
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
