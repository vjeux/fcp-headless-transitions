# Link/Behavior value application — DECODED 2026-07-27

## How a behavior injects its value into a target channel
`OZChannel::setValueOffsetByBehaviors(CMTime time, double newValue)` (ProChannel @0x169b6):
```
offset  = newValue - this->getValueAsDouble(time)   ; xmm1 = param - base(keyframed) value
acc[r13] = offset + acc[r13]                         ; ADDITIVE accumulation of behavior offsets
```
=> A behavior does NOT overwrite the channel. It computes `offset = behaviorValue - authoredValue`
   at the sample time and ADDS that offset to an accumulator applied on top of the channel's own
   keyframed value. Multiple behaviors on one channel accumulate additively.

Vector variants: OZChannel2D::setValueOffsetByBehaviors(t, dx, dy) @0x47fbe;
OZChannel3D::setValueOffsetByBehaviors(t, dx, dy, dz) @0x49274;
OZChannelPosition3D @0x78ea8; OZChannelScale3D @0x86e9c — same additive-offset pattern per component.

## Which channels are behavior-driven
`OZChannel::isChannelAffectedByBehaviors(bool)` @0x18452 / `OZChannelObjectRootBase::
isChannelAffectedByBehaviors(OZChannelBase*, bool)` @0x72624 gate whether the offset pass runs.

## Ref resolution feeding the behavior
The behavior's source is an OZChannelRef (sourceChannelRef/sourceParentChannelRef, scope
OZLinkBehaviorScope ids 1005/1002). It resolves via OZChannelRef::getChannel (@0x4af40, decoded in
OZChannelFolder.resolveChannelRef): './'-relative, '/'-split, numeric-id getDescendant walk.

## Consequence for the port
Link behaviors = additive offset of (resolvedSourceValue - targetAuthoredValue). Any apparent
sign-inversion of link-driven rotation seen empirically in the engine must originate in the SOURCE
value computation (the specific behavior subtype / axis mapping), NOT in this application step, which
is a plain additive offset. NEXT: decode the concrete behavior subtype that maps a source channel to
a target rotation (the axis/negation), to replace the engine's empirical negate-rotY/rotZ rule with a
decoded one.
