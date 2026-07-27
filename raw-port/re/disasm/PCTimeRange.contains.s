__ZNK11PCTimeRange8containsERK6CMTimeS2_:
0000000000132160	pushq	%rbp
0000000000132161	movq	%rsp, %rbp
0000000000132164	pushq	%r15
0000000000132166	pushq	%r14
0000000000132168	pushq	%rbx
0000000000132169	subq	$0x88, %rsp
0000000000132170	movq	%rdx, %r14
0000000000132173	movq	%rsi, %rbx
0000000000132176	movq	%rdi, %r15
0000000000132179	movq	0x10(%rdi), %rax
000000000013217d	movq	%rax, -0x20(%rbp)
0000000000132181	movups	(%rdi), %xmm0
0000000000132184	movaps	%xmm0, -0x30(%rbp)
0000000000132188	movq	0x10(%rsi), %rax
000000000013218c	movq	%rax, -0x40(%rbp)
0000000000132190	movups	(%rsi), %xmm0
0000000000132193	movaps	%xmm0, -0x50(%rbp)
0000000000132197	movq	-0x40(%rbp), %rax
000000000013219b	movq	%rax, 0x28(%rsp)
00000000001321a0	movaps	-0x50(%rbp), %xmm0
00000000001321a4	movups	%xmm0, 0x18(%rsp)
00000000001321a9	movq	-0x20(%rbp), %rax
00000000001321ad	movq	%rax, 0x10(%rsp)
00000000001321b2	movaps	-0x30(%rbp), %xmm0
00000000001321b6	movups	%xmm0, (%rsp)
00000000001321ba	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
00000000001321bf	testl	%eax, %eax
00000000001321c1	jle	0x1321ca
00000000001321c3	xorl	%eax, %eax
00000000001321c5	jmp	0x13228f
00000000001321ca	movq	0x10(%r15), %rax
00000000001321ce	movq	%rax, -0x20(%rbp)
00000000001321d2	movups	(%r15), %xmm0
00000000001321d6	movaps	%xmm0, -0x30(%rbp)
00000000001321da	movq	0x28(%r15), %rax
00000000001321de	movq	%rax, -0x40(%rbp)
00000000001321e2	movups	0x18(%r15), %xmm0
00000000001321e7	movaps	%xmm0, -0x50(%rbp)
00000000001321eb	movq	-0x40(%rbp), %rax
00000000001321ef	movq	%rax, 0x28(%rsp)
00000000001321f4	movaps	-0x50(%rbp), %xmm0
00000000001321f8	movups	%xmm0, 0x18(%rsp)
00000000001321fd	movq	-0x20(%rbp), %rax
0000000000132201	movq	%rax, 0x10(%rsp)
0000000000132206	movaps	-0x30(%rbp), %xmm0
000000000013220a	movups	%xmm0, (%rsp)
000000000013220e	leaq	-0x68(%rbp), %rdi
0000000000132212	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000132217	movq	0x10(%r14), %rax
000000000013221b	movq	%rax, -0x20(%rbp)
000000000013221f	movups	(%r14), %xmm0
0000000000132223	movaps	%xmm0, -0x30(%rbp)
0000000000132227	movq	-0x20(%rbp), %rax
000000000013222b	movq	%rax, 0x28(%rsp)
0000000000132230	movaps	-0x30(%rbp), %xmm0
0000000000132234	movups	%xmm0, 0x18(%rsp)
0000000000132239	movq	-0x58(%rbp), %rax
000000000013223d	movq	%rax, 0x10(%rsp)
0000000000132242	movups	-0x68(%rbp), %xmm0
0000000000132246	movups	%xmm0, (%rsp)
000000000013224a	leaq	-0x50(%rbp), %rdi
000000000013224e	callq	0x6dcf0c                        ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000132253	movq	0x10(%rbx), %rax
0000000000132257	movq	%rax, -0x20(%rbp)
000000000013225b	movups	(%rbx), %xmm0
000000000013225e	movaps	%xmm0, -0x30(%rbp)
0000000000132262	movq	-0x40(%rbp), %rax
0000000000132266	movq	%rax, 0x28(%rsp)
000000000013226b	movups	-0x50(%rbp), %xmm0
000000000013226f	movups	%xmm0, 0x18(%rsp)
0000000000132274	movq	-0x20(%rbp), %rax
0000000000132278	movq	%rax, 0x10(%rsp)
000000000013227d	movaps	-0x30(%rbp), %xmm0
0000000000132281	movups	%xmm0, (%rsp)
0000000000132285	callq	0x6dcab0                        ## symbol stub for: _CMTimeCompare
000000000013228a	testl	%eax, %eax
000000000013228c	setle	%al
000000000013228f	addq	$0x88, %rsp
0000000000132296	popq	%rbx
0000000000132297	popq	%r14
0000000000132299	popq	%r15
000000000013229b	popq	%rbp
000000000013229c	retq
000000000013229d	nopl	(%rax)
