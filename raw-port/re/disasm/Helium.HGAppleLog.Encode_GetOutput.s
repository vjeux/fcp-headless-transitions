===== __ZN10HGAppleLog6Encode9GetOutputEP10HGRenderer =====
__ZN10HGAppleLog6Encode9GetOutputEP10HGRenderer:
0000000000103140	pushq	%rbp
0000000000103141	movq	%rsp, %rbp
0000000000103144	pushq	%r14
0000000000103146	pushq	%rbx
0000000000103147	movq	%rdi, %rbx
000000000010314a	movq	0x198(%rdi), %r14
0000000000103151	movq	%rsi, %rdi
0000000000103154	movq	%rbx, %rsi
0000000000103157	xorl	%edx, %edx
0000000000103159	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000010315e	movq	%rax, %rdx
0000000000103161	testq	%r14, %r14
0000000000103164	je	0x103190
0000000000103166	movq	(%r14), %rax
0000000000103169	movq	%r14, %rdi
000000000010316c	xorl	%esi, %esi
000000000010316e	callq	*0x78(%rax)
0000000000103171	movq	0x198(%rbx), %rdi
0000000000103178	movq	0x1a8(%rbx), %rsi
000000000010317f	movl	$0x1, %edx
0000000000103184	callq	__ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ## HGColorMatrix::LoadMatrix(float vector[4] const*, bool)
0000000000103189	movq	0x198(%rbx), %rdx
0000000000103190	movq	0x1a0(%rbx), %rdi
0000000000103197	movq	(%rdi), %rax
000000000010319a	xorl	%esi, %esi
000000000010319c	callq	*0x78(%rax)
000000000010319f	movq	0x1a0(%rbx), %rdi
00000000001031a6	movq	(%rdi), %rax
00000000001031a9	movss	0x2cde1f(%rip), %xmm0
00000000001031b1	movss	0x2cde1b(%rip), %xmm1
00000000001031b9	movss	0x2cde17(%rip), %xmm2
00000000001031c1	xorps	%xmm3, %xmm3
00000000001031c4	xorl	%esi, %esi
00000000001031c6	callq	*0x60(%rax)
00000000001031c9	movq	0x1a0(%rbx), %rdi
00000000001031d0	movq	(%rdi), %rax
00000000001031d3	movss	0x2cde01(%rip), %xmm0
00000000001031db	movss	0x2cddfd(%rip), %xmm1
00000000001031e3	movss	0x2c84c9(%rip), %xmm2
00000000001031eb	xorps	%xmm3, %xmm3
00000000001031ee	movl	$0x1, %esi
00000000001031f3	callq	*0x60(%rax)
00000000001031f6	movq	0x1a0(%rbx), %rax
00000000001031fd	popq	%rbx
00000000001031fe	popq	%r14
0000000000103200	popq	%rbp
0000000000103201	retq
0000000000103202	nopw	%cs:(%rax,%rax)
