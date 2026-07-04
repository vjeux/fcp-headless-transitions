#!/bin/bash
# Build the headless renderer dylib against Final Cut Pro's frameworks.
set -e
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
clang++ -std=c++17 -ObjC++ -dynamiclib -o oz_render.dylib oz_render.mm \
  -F"$FW" \
  -framework CoreMedia -framework CoreGraphics -framework CoreFoundation \
  -framework ImageIO -framework Foundation -framework Metal \
  "$FW/Ozone.framework/Versions/A/Ozone" \
  "$FW/ProGraphics.framework/Versions/A/ProGraphics" \
  "$FW/ProCore.framework/Versions/A/ProCore" \
  "$FW/Helium.framework/Versions/A/Helium" \
  -Wl,-rpath,"$FW" -Wno-deprecated-declarations
echo "built oz_render.dylib"
