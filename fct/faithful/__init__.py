"""Faithful reimplementation program — compaction-proof per-primitive oracle verification.
See README.md. All state lives on disk (catalog.json + state.json); the driver is
idempotent and resumable so it survives context compaction / agent death."""
