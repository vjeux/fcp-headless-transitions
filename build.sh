#!/bin/bash
# Build the headless renderer dylib against Final Cut Pro's frameworks.
#
# Produces oz_render.dylib, which tools/ozengine.py dlopen()s at runtime to
# drive FCP's real Motion engine headless (via `fct gen headless`).
#
# NOTE: FCP must be installed at the path below. At *run* time the callers set
# DYLD_FRAMEWORK_PATH to this same dir so the engine's sibling frameworks
# resolve (see README / tools/ozengine.py).
set -e

# FCP ships all its private frameworks (Ozone, ProGraphics, ...) in one dir.
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"

# clang++ flags:
#   -std=c++17 -ObjC++   compile as Objective-C++ (oz_render.mm mixes C++ + ObjC)
#   -dynamiclib          emit a .dylib (loaded via ctypes at runtime)
#   -F"$FW"              add FCP's Frameworks dir to the framework search path
#   -framework ...       public macOS frameworks the shim calls into
#   "$FW/*.framework/..." link directly against FCP's PRIVATE frameworks by their
#                        binary path (they aren't in the normal -framework path)
#   -Wl,-rpath,"$FW"     bake an rpath so the dylib finds those frameworks at load
#   -Wno-deprecated-declarations  silence deprecation noise from the private ABIs
clang++ -std=c++17 -ObjC++ -dynamiclib -o oz_render.dylib oz_render.mm \
  -F"$FW" \
  -framework CoreMedia -framework CoreGraphics -framework CoreFoundation \
  -framework ImageIO -framework Foundation -framework Metal \
  "$FW/Ozone.framework/Versions/A/Ozone" \
  "$FW/ProGraphics.framework/Versions/A/ProGraphics" \
  "$FW/ProCore.framework/Versions/A/ProCore" \
  "$FW/Helium.framework/Versions/A/Helium" \
  "$FW/ProAppsFxSupport.framework/Versions/A/ProAppsFxSupport" \
  -Wl,-rpath,"$FW" -Wno-deprecated-declarations
echo "built oz_render.dylib"
