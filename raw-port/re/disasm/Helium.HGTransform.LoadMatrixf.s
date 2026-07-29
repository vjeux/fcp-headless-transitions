__ZN11HGTransform11LoadMatrixfEPKf:
00000000001b44f0	pushq	%rbp
00000000001b44f1	movq	%rsp, %rbp
00000000001b44f4	cvtps2pd	(%rsi), %xmm0
00000000001b44f7	movups	%xmm0, 0x10(%rdi)
00000000001b44fb	cvtps2pd	0x8(%rsi), %xmm0
00000000001b44ff	movups	%xmm0, 0x20(%rdi)
00000000001b4503	cvtps2pd	0x10(%rsi), %xmm0
00000000001b4507	movups	%xmm0, 0x30(%rdi)
00000000001b450b	cvtps2pd	0x18(%rsi), %xmm0
00000000001b450f	movups	%xmm0, 0x40(%rdi)
00000000001b4513	cvtps2pd	0x20(%rsi), %xmm0
00000000001b4517	movups	%xmm0, 0x50(%rdi)
00000000001b451b	cvtps2pd	0x28(%rsi), %xmm0
00000000001b451f	movups	%xmm0, 0x60(%rdi)
00000000001b4523	cvtps2pd	0x30(%rsi), %xmm0
00000000001b4527	movups	%xmm0, 0x70(%rdi)
00000000001b452b	cvtps2pd	0x38(%rsi), %xmm0
00000000001b452f	movups	%xmm0, 0x80(%rdi)
00000000001b4536	popq	%rbp
00000000001b4537	retq
00000000001b4538	nopl	(%rax,%rax)
