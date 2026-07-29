__ZN21OZBSplineInterpolator14fillTempArraysER8OZSplineRK6CMTime:
000000000004230e	pushq	%rbp
000000000004230f	movq	%rsp, %rbp
0000000000042312	pushq	%r15
0000000000042314	pushq	%r14
0000000000042316	pushq	%r13
0000000000042318	pushq	%r12
000000000004231a	pushq	%rbx
000000000004231b	subq	$0x28, %rsp
000000000004231f	movq	%rdx, %r12
0000000000042322	movq	%rsi, %rbx
0000000000042325	movq	%rdi, %r15
0000000000042328	xorl	%eax, %eax
000000000004232a	movq	%rax, -0x38(%rbp)
000000000004232e	movq	%rax, -0x50(%rbp)
0000000000042332	movq	%rax, -0x30(%rbp)
0000000000042336	leaq	0x8(%rdi), %r14
000000000004233a	movq	0x8(%rdi), %rax
000000000004233e	movq	0x28(%rdi), %rcx
0000000000042342	movq	%rax, 0x10(%rdi)
0000000000042346	leaq	0x28(%rdi), %r13
000000000004234a	movq	%rcx, 0x30(%rdi)
000000000004234e	cmpb	$0x1, 0x90(%rsi)
0000000000042355	movq	%rdi, -0x40(%rbp)
0000000000042359	jne	0x424a1
000000000004235f	movq	0x8815a(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000042366	leaq	-0x38(%rbp), %rsi
000000000004236a	movq	%rbx, %rdi
000000000004236d	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
0000000000042372	leaq	-0x50(%rbp), %rsi
0000000000042376	movq	%rbx, %rdi
0000000000042379	movq	0x88140(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000042380	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
0000000000042385	movl	0x20(%r15), %esi
0000000000042389	movq	%r14, %rdi
000000000004238c	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
0000000000042391	movl	0x20(%r15), %esi
0000000000042395	movq	%r13, %rdi
0000000000042398	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
000000000004239d	leaq	-0x38(%rbp), %rax
00000000000423a1	movq	(%rax), %rdi
00000000000423a4	movq	(%rdi), %rax
00000000000423a7	movq	%r12, %rsi
00000000000423aa	callq	*0x28(%rax)
00000000000423ad	movq	0x28(%r15), %rax
00000000000423b1	movsd	%xmm0, 0x8(%rax)
00000000000423b6	leaq	-0x38(%rbp), %rax
00000000000423ba	movq	(%rax), %rdi
00000000000423bd	movq	(%rdi), %rax
00000000000423c0	movq	%r12, %rsi
00000000000423c3	callq	*0x18(%rax)
00000000000423c6	movq	0x8(%r15), %rax
00000000000423ca	movsd	%xmm0, 0x8(%rax)
00000000000423cf	leaq	-0x38(%rbp), %rax
00000000000423d3	movq	(%rax), %rsi
00000000000423d6	leaq	-0x30(%rbp), %rdx
00000000000423da	movq	%rsi, (%rdx)
00000000000423dd	movq	%rbx, %rdi
00000000000423e0	movq	0x880d9(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000423e7	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
00000000000423ec	movq	%r13, %r15
00000000000423ef	movq	%r14, %r13
00000000000423f2	movl	$0x1, %r14d
00000000000423f8	testb	%al, %al
00000000000423fa	je	0x4244d
00000000000423fc	movl	$0x1, %r14d
0000000000042402	movq	-0x30(%rbp), %rdi
0000000000042406	movq	(%rdi), %rax
0000000000042409	movq	%r12, %rsi
000000000004240c	callq	*0x28(%rax)
000000000004240f	incl	%r14d
0000000000042412	movq	(%r15), %rax
0000000000042415	movsd	%xmm0, (%rax,%r14,8)
000000000004241b	movq	-0x30(%rbp), %rdi
000000000004241f	movq	(%rdi), %rax
0000000000042422	movq	%r12, %rsi
0000000000042425	callq	*0x18(%rax)
0000000000042428	movq	(%r13), %rax
000000000004242c	movsd	%xmm0, (%rax,%r14,8)
0000000000042432	movq	-0x30(%rbp), %rsi
0000000000042436	movq	%rbx, %rdi
0000000000042439	leaq	-0x30(%rbp), %rdx
000000000004243d	movq	0x8807c(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000042444	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
0000000000042449	testb	%al, %al
000000000004244b	jne	0x42402
000000000004244d	leal	0x1(%r14), %eax
0000000000042451	movq	(%r13), %rcx
0000000000042455	movsd	0x8(%rcx), %xmm0
000000000004245a	movsd	%xmm0, (%rcx,%rax,8)
000000000004245f	movq	(%r15), %rdx
0000000000042462	movsd	0x8(%rdx), %xmm0
0000000000042467	movsd	%xmm0, (%rdx,%rax,8)
000000000004246c	movsd	0x10(%rcx), %xmm0
0000000000042471	leal	0x2(%r14), %eax
0000000000042475	movsd	%xmm0, (%rcx,%rax,8)
000000000004247a	movsd	0x10(%rdx), %xmm0
000000000004247f	movsd	%xmm0, (%rdx,%rax,8)
0000000000042484	movl	%r14d, %eax
0000000000042487	movsd	(%rcx,%rax,8), %xmm0
000000000004248c	movsd	%xmm0, (%rcx)
0000000000042490	movsd	(%rdx,%rax,8), %xmm0
0000000000042495	movsd	%xmm0, (%rdx)
0000000000042499	movq	%r15, %r13
000000000004249c	jmp	0x42574
00000000000424a1	movl	0x20(%r15), %esi
00000000000424a5	movq	%r14, %rdi
00000000000424a8	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
00000000000424ad	movl	0x20(%r15), %esi
00000000000424b1	movq	%r13, %rdi
00000000000424b4	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
00000000000424b9	movq	0x88000(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000424c0	movq	%r14, -0x48(%rbp)
00000000000424c4	leaq	-0x38(%rbp), %r14
00000000000424c8	movq	%rbx, %rdi
00000000000424cb	movq	%r14, %rsi
00000000000424ce	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
00000000000424d3	movq	(%r14), %rdi
00000000000424d6	movq	(%rdi), %rax
00000000000424d9	movq	%r12, %rsi
00000000000424dc	callq	*0x28(%rax)
00000000000424df	movq	0x28(%r15), %rax
00000000000424e3	movsd	%xmm0, (%rax)
00000000000424e7	movq	(%r14), %rdi
00000000000424ea	movq	(%rdi), %rax
00000000000424ed	movq	%r12, %rsi
00000000000424f0	callq	*0x18(%rax)
00000000000424f3	movq	0x8(%r15), %rax
00000000000424f7	movsd	%xmm0, (%rax)
00000000000424fb	movq	(%r14), %rsi
00000000000424fe	leaq	-0x30(%rbp), %rdx
0000000000042502	movq	%rsi, (%rdx)
0000000000042505	movq	%rbx, %rdi
0000000000042508	movq	0x87fb1(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000004250f	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
0000000000042514	testb	%al, %al
0000000000042516	je	0x42574
0000000000042518	movl	$0x1, %r14d
000000000004251e	movq	-0x30(%rbp), %rdi
0000000000042522	movq	(%rdi), %rax
0000000000042525	movq	%r12, %rsi
0000000000042528	callq	*0x28(%rax)
000000000004252b	movq	%rbx, %r15
000000000004252e	movl	%r14d, %ebx
0000000000042531	movq	(%r13), %rax
0000000000042535	movsd	%xmm0, (%rax,%rbx,8)
000000000004253a	movq	-0x30(%rbp), %rdi
000000000004253e	movq	(%rdi), %rax
0000000000042541	movq	%r12, %rsi
0000000000042544	callq	*0x18(%rax)
0000000000042547	movq	-0x48(%rbp), %rax
000000000004254b	movq	(%rax), %rax
000000000004254e	movsd	%xmm0, (%rax,%rbx,8)
0000000000042553	movq	%r15, %rbx
0000000000042556	incl	%r14d
0000000000042559	movq	-0x30(%rbp), %rsi
000000000004255d	movq	%r15, %rdi
0000000000042560	leaq	-0x30(%rbp), %rdx
0000000000042564	movq	0x87f55(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000004256b	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
0000000000042570	testb	%al, %al
0000000000042572	jne	0x4251e
0000000000042574	movq	-0x40(%rbp), %rax
0000000000042578	movl	0x20(%rax), %eax
000000000004257b	testq	%rax, %rax
000000000004257e	je	0x425e2
0000000000042580	movq	(%r13), %rcx
0000000000042584	xorl	%edx, %edx
0000000000042586	movsd	0x6e27a(%rip), %xmm1
000000000004258e	movsd	0x6e252(%rip), %xmm2
0000000000042596	movsd	0x6e272(%rip), %xmm3
000000000004259e	movsd	0x6e252(%rip), %xmm4
00000000000425a6	movsd	0x6cf7a(%rip), %xmm5
00000000000425ae	movsd	(%rcx,%rdx,8), %xmm0
00000000000425b3	movapd	%xmm0, %xmm6
00000000000425b7	mulsd	%xmm1, %xmm6
00000000000425bb	addsd	%xmm2, %xmm6
00000000000425bf	movapd	%xmm0, %xmm7
00000000000425c3	mulsd	%xmm3, %xmm7
00000000000425c7	addsd	%xmm4, %xmm7
00000000000425cb	cmpnlesd	%xmm5, %xmm0
00000000000425d0	blendvpd	%xmm0, %xmm7, %xmm6
00000000000425d5	movlpd	%xmm6, (%rcx,%rdx,8)
00000000000425da	incq	%rdx
00000000000425dd	cmpq	%rdx, %rax
00000000000425e0	jne	0x425ae
00000000000425e2	movq	%rbx, %rdi
00000000000425e5	xorl	%esi, %esi
00000000000425e7	callq	__ZN8OZSpline8setDirtyEb        ## OZSpline::setDirty(bool)
00000000000425ec	addq	$0x28, %rsp
00000000000425f0	popq	%rbx
00000000000425f1	popq	%r12
00000000000425f3	popq	%r13
00000000000425f5	popq	%r14
00000000000425f7	popq	%r15
00000000000425f9	popq	%rbp
00000000000425fa	retq
00000000000425fb	nop
