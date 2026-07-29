__ZN11HGTransform13LoadTransformEPKS_:
00000000001b46e0	pushq	%rbp
00000000001b46e1	movq	%rsp, %rbp
00000000001b46e4	movups	0x80(%rsi), %xmm0
00000000001b46eb	movups	%xmm0, 0x80(%rdi)
00000000001b46f2	movups	0x70(%rsi), %xmm0
00000000001b46f6	movups	%xmm0, 0x70(%rdi)
00000000001b46fa	movups	0x60(%rsi), %xmm0
00000000001b46fe	movups	%xmm0, 0x60(%rdi)
00000000001b4702	movups	0x50(%rsi), %xmm0
00000000001b4706	movups	%xmm0, 0x50(%rdi)
00000000001b470a	movups	0x10(%rsi), %xmm0
00000000001b470e	movups	0x20(%rsi), %xmm1
00000000001b4712	movups	0x30(%rsi), %xmm2
00000000001b4716	movups	0x40(%rsi), %xmm3
00000000001b471a	movups	%xmm3, 0x40(%rdi)
00000000001b471e	movups	%xmm2, 0x30(%rdi)
00000000001b4722	movups	%xmm1, 0x20(%rdi)
00000000001b4726	movups	%xmm0, 0x10(%rdi)
00000000001b472a	popq	%rbp
00000000001b472b	retq
00000000001b472c	nopl	(%rax)
