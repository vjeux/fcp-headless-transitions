__ZN10PCCurveFit14ReparameterizeERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEES7_mmPd:
000000000000c37a	pushq	%rbp
000000000000c37b	movq	%rsp, %rbp
000000000000c37e	pushq	%r15
000000000000c380	pushq	%r14
000000000000c382	pushq	%r13
000000000000c384	pushq	%r12
000000000000c386	pushq	%rbx
000000000000c387	subq	$0x28, %rsp
000000000000c38b	movq	%r9, -0x48(%rbp)
000000000000c38f	movq	%r8, %r14
000000000000c392	movq	%rcx, %r13
000000000000c395	movq	%rdx, -0x40(%rbp)
000000000000c399	movq	%rsi, -0x38(%rbp)
000000000000c39d	movq	%rdi, -0x30(%rbp)
000000000000c3a1	movq	%r8, %rax
000000000000c3a4	subq	%rcx, %rax
000000000000c3a7	leaq	0x1(%rax), %rcx
000000000000c3ab	shrq	$0x3d, %rcx
000000000000c3af	leaq	0x8(,%rax,8), %rax
000000000000c3b7	xorl	%edi, %edi
000000000000c3b9	negq	%rcx
000000000000c3bc	sbbq	%rdi, %rdi
000000000000c3bf	orq	%rax, %rdi
000000000000c3c2	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000c3c7	movq	%rax, %r12
000000000000c3ca	cmpq	%r13, %r14
000000000000c3cd	jb	0xc411
000000000000c3cf	movq	%r13, %r15
000000000000c3d2	shlq	$0x4, %r15
000000000000c3d6	xorl	%ebx, %ebx
000000000000c3d8	movq	-0x38(%rbp), %rax
000000000000c3dc	movq	(%rax), %rdx
000000000000c3df	addq	%r15, %rdx
000000000000c3e2	movq	-0x48(%rbp), %rax
000000000000c3e6	movsd	(%rax,%rbx,8), %xmm0
000000000000c3eb	movq	-0x30(%rbp), %rdi
000000000000c3ef	movq	-0x40(%rbp), %rsi
000000000000c3f3	callq	__ZN10PCCurveFit21NewtonRaphsonRootFindERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEERS3_d ## PCCurveFit::NewtonRaphsonRootFind(std::__1::vector<PCVector2<double>, std::__1::allocator<PCVector2<double>>>&, PCVector2<double>&, double)
000000000000c3f8	movsd	%xmm0, (%r12,%rbx,8)
000000000000c3fe	leaq	(%rbx,%r13), %rax
000000000000c402	incq	%rax
000000000000c405	incq	%rbx
000000000000c408	addq	$0x10, %r15
000000000000c40c	cmpq	%r14, %rax
000000000000c40f	jbe	0xc3d8
000000000000c411	movq	%r12, %rax
000000000000c414	addq	$0x28, %rsp
000000000000c418	popq	%rbx
000000000000c419	popq	%r12
000000000000c41b	popq	%r13
000000000000c41d	popq	%r14
000000000000c41f	popq	%r15
000000000000c421	popq	%rbp
000000000000c422	retq
000000000000c423	nop
