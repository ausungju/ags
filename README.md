# My AGS Shell

A custom AGS (Aylur's GTK Shell) configuration built with Nix flakes.

## Installation

### Method 1: Direct Run (for testing)

```bash
# Install AGS first (temporary workaround for wrapGAppsHook issue)
nix shell github:aylur/ags

# Then run your shell
nix run github:ausungju/ags
```

### Method 2: NixOS Configuration

Add to your `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    my-shell.url = "github:ausungju/ags";
    ags.url = "github:aylur/ags";
  };

  outputs = { self, nixpkgs, my-shell, ags, ... }: {
    nixosConfigurations.yourhost = nixpkgs.lib.nixosSystem {
      modules = [
        {
          environment.systemPackages = [
            ags.packages.x86_64-linux.default
            my-shell.packages.x86_64-linux.default
          ];
        }
      ];
    };
  };
}
```

### Method 3: Home Manager

Add to your home-manager configuration:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager";
    my-shell.url = "github:ausungju/ags";
    ags.url = "github:aylur/ags";
  };

  outputs = { self, nixpkgs, home-manager, my-shell, ags, ... }: {
    homeConfigurations.youruser = home-manager.lib.homeManagerConfiguration {
      modules = [
        my-shell.homeManagerModules.default
        {
          programs.my-shell.enable = true;
          home.packages = [ ags.packages.x86_64-linux.default ];
        }
      ];
    };
  };
}
```

## Development

```bash
# Enter development shell
nix develop

# Run AGS (requires AGS to be installed)
ags run app.ts
```

## Current Limitations

Due to the deprecation of `wrapGAppsHook` in nixpkgs (replaced by `wrapGAppsHook3`), AGS and its Astal libraries need to be installed separately. This is a temporary workaround until AGS upstream updates their dependencies.

## Structure

- `app.ts` - Main entry point
- `widget/` - Widget definitions
  - `bar/` - Bar widgets
  - `system-menu-window.tsx` - System menu
- `style/` - SCSS stylesheets
