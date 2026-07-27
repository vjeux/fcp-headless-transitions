// Extracted from otool -tV of Ozone framework at addrs 0x6db4a0..0x6db4df
// Note: otool mis-decodes `55 48 89 E5` (push %rbp; mov %rsp,%rbp) as
// `addb %dl, 0x48(%rbp); movl %esp, %ebp` when there's no symbol label at
// 0x6db4a0 — but the class symbol map confirms D1Ev is at 0x6db4a0.
__ZN15LiMaterialLayerD1Ev:                          // @0x6db4a0
00000000006db4a0	pushq	%rbp
00000000006db4a1	movq	%rsp, %rbp
00000000006db4a4	ud2
00000000006db4a6	nopw	%cs:(%rax,%rax)
__ZN15LiMaterialLayerD0Ev:                          // @0x6db4b0
00000000006db4b0	pushq	%rbp
00000000006db4b1	movq	%rsp, %rbp
00000000006db4b4	ud2
00000000006db4b6	nopw	%cs:(%rax,%rax)
__ZTv0_n24_N15LiMaterialLayerD1Ev:                  // @0x6db4c0  (thunk to D1)
00000000006db4c0	pushq	%rbp
00000000006db4c1	movq	%rsp, %rbp
00000000006db4c4	ud2
00000000006db4c6	nopw	%cs:(%rax,%rax)
__ZTv0_n24_N15LiMaterialLayerD0Ev:                  // @0x6db4d0  (thunk to D0)
00000000006db4d0	pushq	%rbp
00000000006db4d1	movq	%rsp, %rbp
00000000006db4d4	ud2
00000000006db4d6	nopw	%cs:(%rax,%rax)
