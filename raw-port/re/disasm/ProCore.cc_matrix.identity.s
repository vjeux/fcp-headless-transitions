# __ZN9cc_matrix8identityEv at 0x4a0e (nm -a says T; otool -tV missed the symbol label).
# Function body (from otool -tV output at that address, minus the missed label):
0000000000004a0e	pushq	%rbp                  # (byte 0x55 — mis-decoded by otool as `addb %dl, 0x48(%rbp)` due to prev-function tail resync)
0000000000004a0f	movq	%rsp, %rbp            # (bytes 48 89 E5)  — the "movl %esp,%ebp" printed at 0x4a10 is actually the tail of this instruction re-synced after otool's confusion
0000000000004a12	movss	0xdd556(%rip), %xmm0  # xmm0 lane0 = *(0x4a1a + 0xdd556) = *(0xe1f70) = 1.0f (0x3f800000); upper 3 lanes zeroed by movss
0000000000004a1a	movups	%xmm0, (%rdi)          # m[0..3] = {1, 0, 0, 0}
0000000000004a1d	movups	%xmm0, 0x10(%rdi)      # m[4..7] = {1, 0, 0, 0}
0000000000004a21	movl	$0x3f800000, 0x20(%rdi)   # m[8] = 1.0f
0000000000004a28	popq	%rbp
0000000000004a29	retq
