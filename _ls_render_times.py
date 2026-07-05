import sys; sys.path.insert(0,'tools')
import ozengine
motr="/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized/Stylized.localized/Cinema.localized/Light Sweep.localized/Light Sweep.motr"
imgA="engine/test/start.png"; imgB="engine/test/end.png"
doc=ozengine.load_doc(motr)
import os
for t in [0.0, 3.0, 4.5, 5.6, 6.0, 10.0, 18.0]:
    out=f"/tmp/lsr_{t:.1f}.png"
    ozengine.render_frame(doc, imgA, imgB, t, out)
    print("rendered", t)
