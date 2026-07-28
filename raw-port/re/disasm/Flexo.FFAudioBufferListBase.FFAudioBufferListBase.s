__ZN21FFAudioBufferListBaseC2ERK27AudioStreamBasicDescriptionyRK6CMTime:
0000000001255820	pushq	%rbp
0000000001255821	movq	%rsp, %rbp
0000000001255824	leaq	0x6cbf8d(%rip), %rax
000000000125582b	movq	%rax, (%rdi)
000000000125582e	movups	(%rcx), %xmm0
0000000001255831	movups	%xmm0, 0x8(%rdi)
0000000001255835	movq	0x10(%rcx), %rax
0000000001255839	movq	%rax, 0x18(%rdi)
000000000125583d	movq	%rdx, 0x20(%rdi)
0000000001255841	movq	$0x0, 0x28(%rdi)
0000000001255849	movups	(%rsi), %xmm0
000000000125584c	movups	0x10(%rsi), %xmm1
0000000001255850	movups	%xmm0, 0x30(%rdi)
0000000001255854	movups	%xmm1, 0x40(%rdi)
0000000001255858	movq	0x20(%rsi), %rax
000000000125585c	movq	%rax, 0x50(%rdi)
0000000001255860	popq	%rbp
0000000001255861	retq
0000000001255862	nopw	%cs:(%rax,%rax)
