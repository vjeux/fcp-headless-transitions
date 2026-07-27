__ZN10PCCurveFit15ComputeMaxErrorERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_mmPdPm:
000000000000c2be	pushq	%rbp
000000000000c2bf	movq	%rsp, %rbp
000000000000c2c2	pushq	%r15
000000000000c2c4	pushq	%r14
000000000000c2c6	pushq	%r13
000000000000c2c8	pushq	%r12
000000000000c2ca	pushq	%rbx
000000000000c2cb	subq	$0x28, %rsp
000000000000c2cf	movq	%rcx, %r15
000000000000c2d2	movq	%rdx, -0x38(%rbp)
000000000000c2d6	movq	0x10(%rbp), %rcx
000000000000c2da	movq	%r8, %rax
000000000000c2dd	subq	%r15, %rax
000000000000c2e0	incq	%rax
000000000000c2e3	shrq	%rax
000000000000c2e6	movq	%rax, (%rcx)
000000000000c2e9	leaq	0x1(%r15), %r12
000000000000c2ed	xorpd	%xmm0, %xmm0
000000000000c2f1	movsd	%xmm0, -0x30(%rbp)
000000000000c2f6	cmpq	%r8, %r12
000000000000c2f9	jae	0xc366
000000000000c2fb	movq	%r9, %rbx
000000000000c2fe	movq	%r8, %r14
000000000000c301	movq	%rsi, %r13
000000000000c304	addq	$0x8, %rbx
000000000000c308	shlq	$0x4, %r15
000000000000c30c	movsd	%xmm0, -0x30(%rbp)
000000000000c311	movsd	(%rbx), %xmm0
000000000000c315	leaq	-0x50(%rbp), %rdi
000000000000c319	movl	$0x3, %edx
000000000000c31e	movq	-0x38(%rbp), %rcx
000000000000c322	callq	__ZN10PCCurveFit6BezierEiRNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEd ## PCCurveFit::Bezier(int, std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, double)
000000000000c327	movapd	-0x50(%rbp), %xmm0
000000000000c32c	movq	(%r13), %rax
000000000000c330	movupd	0x10(%rax,%r15), %xmm1
000000000000c337	subpd	%xmm1, %xmm0
000000000000c33b	mulpd	%xmm0, %xmm0
000000000000c33f	haddpd	%xmm0, %xmm0
000000000000c343	ucomisd	-0x30(%rbp), %xmm0
000000000000c348	jb	0xc356
000000000000c34a	movq	0x10(%rbp), %rax
000000000000c34e	movq	%r12, (%rax)
000000000000c351	movsd	%xmm0, -0x30(%rbp)
000000000000c356	incq	%r12
000000000000c359	addq	$0x8, %rbx
000000000000c35d	addq	$0x10, %r15
000000000000c361	cmpq	%r12, %r14
000000000000c364	jne	0xc311
000000000000c366	movsd	-0x30(%rbp), %xmm0
000000000000c36b	addq	$0x28, %rsp
000000000000c36f	popq	%rbx
000000000000c370	popq	%r12
000000000000c372	popq	%r13
000000000000c374	popq	%r14
000000000000c376	popq	%r15
000000000000c378	popq	%rbp
000000000000c379	retq
