# My AGS Shell

A custom AGS (Aylur's GTK Shell) configuration built with Nix flakes.

## Quick Start

```bash
# Run directly (first run will take 1-2 minutes to build AGS)
nix run github:ausungju/ags

# Or locally
cd /path/to/ags
nix run
```

**Note:** The first run will build AGS and Astal libraries (~1-2 minutes). Subsequent runs will be instant thanks to Nix caching.

## Installation

### Method 1: NixOS Configuration

Add to your `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    my-shell.url = "github:ausungju/ags";
  };

  outputs = { self, nixpkgs, my-shell, ... }: {
    nixosConfigurations.yourhost = nixpkgs.lib.nixosSystem {
      modules = [
        {
          environment.systemPackages = [
            my-shell.packages.x86_64-linux.default
          ];
        }
      ];
    };
  };
}
```

Then run with: `my-shell`

### Method 2: Home Manager

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager";
    my-shell.url = "github:ausungju/ags";
  };

  outputs = { self, nixpkgs, home-manager, my-shell, ... }: {
    homeConfigurations.youruser = home-manager.lib.homeManagerConfiguration {
      modules = [
        my-shell.homeManagerModules.default
        {
          programs.my-shell.enable = true;
        }
      ];
    };
  };
}
```

### Method 3: Standalone with Nix Profile

```bash
# Install
nix profile install github:ausungju/ags

# Run
my-shell
```

## Development

```bash
# Enter development shell
nix develop

# The AGS binary will be available in PATH
ags run app.ts
```

## Technical Details

### Workaround for wrapGAppsHook Deprecation

Due to the deprecation of `wrapGAppsHook` in nixpkgs (replaced by `wrapGAppsHook3`), this flake uses a runtime build approach:

- AGS and Astal packages are built at **runtime** to avoid evaluation errors
- First execution takes 1-2 minutes as packages are built and cached
- Subsequent executions are instant (packages are retrieved from Nix store)
- This approach allows the flake to work as a subflake without requiring users to install AGS separately

This is a temporary workaround until AGS upstream updates to use `wrapGAppsHook3`.

## Structure

```
.
├── app.ts                    # Main entry point
├── flake.nix                 # Nix flake configuration
├── widget/                   # Widget definitions
│   ├── bar/                  # Status bar components
│   │   ├── Bar.tsx           # Main bar
│   │   ├── battery.tsx       # Battery widget
│   │   ├── system.tsx        # System tray
│   │   ├── time.tsx          # Clock
│   │   ├── workspace.tsx     # Workspace indicator
│   │   └── utils.tsx         # Utility functions
│   └── system-menu-window.tsx # System menu
└── style/                    # SCSS stylesheets
    ├── _variable.scss        # Variables
    ├── bar.scss              # Bar styles
    └── main.scss             # Main styles
```

## Features

- 🚀 Works as a standalone flake
- 📦 Can be used as a subflake in other Nix configurations
- 🏠 Home Manager module included
- ⚡ Fast execution after initial build
- 🔧 Full AGS/Astal functionality

## Troubleshooting

### First run is slow
This is expected! AGS and Astal libraries need to be built once. After that, everything is cached.

### "Dirty git tree" warning
This warning is harmless - it just means you have uncommitted changes in your repository.

### Missing typelibs
Make sure you're using the latest version of the flake. The runtime script automatically sets up `GI_TYPELIB_PATH` and `LD_LIBRARY_PATH`.

