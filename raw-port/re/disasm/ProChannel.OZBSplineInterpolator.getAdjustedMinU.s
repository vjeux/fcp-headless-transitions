__ZN21OZBSplineInterpolator15getAdjustedMinUER8OZSplineRK6CMTimeS4_:
00000000000421ee	pushq	%rbp
00000000000421ef	movq	%rsp, %rbp
00000000000421f2	pushq	%r15
00000000000421f4	pushq	%r14
00000000000421f6	pushq	%r13
00000000000421f8	pushq	%r12
00000000000421fa	pushq	%rbx
00000000000421fb	pushq	%rax
00000000000421fc	movq	%r8, %r15
00000000000421ff	movq	%rcx, %r13
0000000000042202	movq	%rdx, %r12
0000000000042205	movq	%rsi, %r14
0000000000042208	movq	%rdi, %rbx
000000000004220b	movq	0x882ae(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000042212	movq	%rdx, %rdi
0000000000042215	callq	__ZN8OZSpline40getNumberOfValidVerticesWithMultiplicityERK6CMTime ## OZSpline::getNumberOfValidVerticesWithMultiplicity(CMTime const&)
000000000004221a	testl	%eax, %eax
000000000004221c	je	0x42262
000000000004221e	movq	(%r14), %rax
0000000000042221	movq	%r14, %rdi
0000000000042224	movq	%r12, %rsi
0000000000042227	callq	*0x58(%rax)
000000000004222a	testb	%al, %al
000000000004222c	je	0x4223d
000000000004222e	movq	(%r14), %rax
0000000000042231	movq	%r14, %rdi
0000000000042234	movq	%r12, %rsi
0000000000042237	movq	%r13, %rdx
000000000004223a	callq	*0x10(%rax)
000000000004223d	cmpb	$0x1, 0x90(%r12)
0000000000042246	jne	0x42271
0000000000042248	movl	0x70(%r14), %eax
000000000004224c	decl	%eax
000000000004224e	cvtsi2sd	%rax, %xmm0
0000000000042253	movq	%rbx, %rdi
0000000000042256	movl	$0x40000, %esi                  ## imm = 0x40000
000000000004225b	callq	0xacafe                         ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
0000000000042260	jmp	0x42288
0000000000042262	movq	0x10(%r15), %rax
0000000000042266	movq	%rax, 0x10(%rbx)
000000000004226a	movupd	(%r15), %xmm0
000000000004226f	jmp	0x42284
0000000000042271	movq	0x88248(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000042278	movq	0x10(%rcx), %rax
000000000004227c	movq	%rax, 0x10(%rbx)
0000000000042280	movupd	(%rcx), %xmm0
0000000000042284	movupd	%xmm0, (%rbx)
0000000000042288	movq	%rbx, %rax
000000000004228b	addq	$0x8, %rsp
000000000004228f	popq	%rbx
0000000000042290	popq	%r12
0000000000042292	popq	%r13
0000000000042294	popq	%r14
0000000000042296	popq	%r15
0000000000042298	popq	%rbp
0000000000042299	retq
