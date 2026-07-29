__ZN21OZBSplineInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
00000000000425fc	pushq	%rbp
00000000000425fd	movq	%rsp, %rbp
0000000000042600	pushq	%r15
0000000000042602	pushq	%r14
0000000000042604	pushq	%r12
0000000000042606	pushq	%rbx
0000000000042607	subq	$0x40, %rsp
000000000004260b	movq	%r9, %r15
000000000004260e	movq	%rsi, %r14
0000000000042611	movq	%rdi, %rbx
0000000000042614	movb	0x10(%rbp), %r12b
0000000000042618	callq	__ZN21OZBSplineInterpolator14fillTempArraysER8OZSplineRK6CMTime ## OZBSplineInterpolator::fillTempArrays(OZSpline&, CMTime const&)
000000000004261d	xorpd	%xmm0, %xmm0
0000000000042621	testb	%r12b, %r12b
0000000000042624	je	0x426f7
000000000004262a	movq	0x10(%r15), %rax
000000000004262e	movq	%rax, -0x30(%rbp)
0000000000042632	movups	(%r15), %xmm0
0000000000042636	movaps	%xmm0, -0x40(%rbp)
000000000004263a	movq	-0x30(%rbp), %rax
000000000004263e	movq	%rax, 0x10(%rsp)
0000000000042643	movaps	-0x40(%rbp), %xmm0
0000000000042647	movups	%xmm0, (%rsp)
000000000004264b	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042650	cmpb	$0x1, 0x90(%r14)
0000000000042658	jne	0x4266e
000000000004265a	movq	%rbx, %rdi
000000000004265d	addq	$0x40, %rsp
0000000000042661	popq	%rbx
0000000000042662	popq	%r12
0000000000042664	popq	%r14
0000000000042666	popq	%r15
0000000000042668	popq	%rbp
0000000000042669	jmp	__ZN21OZBSplineInterpolator15evalBSplineNURBER8OZSplined ## OZBSplineInterpolator::evalBSplineNURB(OZSpline&, double)
000000000004266e	movq	0x10(%r15), %rax
0000000000042672	leaq	-0x40(%rbp), %r12
0000000000042676	movq	%rax, 0x10(%r12)
000000000004267b	movups	(%r15), %xmm0
000000000004267f	movaps	%xmm0, (%r12)
0000000000042684	movq	0x10(%r12), %rax
0000000000042689	movq	%rax, 0x10(%rsp)
000000000004268e	movaps	(%r12), %xmm0
0000000000042693	movups	%xmm0, (%rsp)
0000000000042697	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000004269c	movsd	%xmm0, -0x28(%rbp)
00000000000426a1	movq	0x87e18(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000426a8	movq	%r12, %rdi
00000000000426ab	movq	%r14, %rsi
00000000000426ae	xorl	%ecx, %ecx
00000000000426b0	callq	__ZN8OZSpline12getMaxValueUERK6CMTimeb ## OZSpline::getMaxValueU(CMTime const&, bool)
00000000000426b5	movq	0x10(%r12), %rax
00000000000426ba	movq	%rax, 0x10(%rsp)
00000000000426bf	movupd	(%r12), %xmm0
00000000000426c5	movupd	%xmm0, (%rsp)
00000000000426ca	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000426cf	movsd	-0x28(%rbp), %xmm1
00000000000426d4	divsd	%xmm0, %xmm1
00000000000426d8	movl	0x70(%rbx), %eax
00000000000426db	movl	0x20(%rbx), %ecx
00000000000426de	leal	-0x1(%rax,%rcx), %eax
00000000000426e2	movq	0x40(%rbx), %rcx
00000000000426e6	mulsd	(%rcx,%rax,8), %xmm1
00000000000426eb	movapd	%xmm1, %xmm0
00000000000426ef	movq	%rbx, %rdi
00000000000426f2	callq	__ZN21OZBSplineInterpolator15evalBSplineNURBER8OZSplined ## OZBSplineInterpolator::evalBSplineNURB(OZSpline&, double)
00000000000426f7	addq	$0x40, %rsp
00000000000426fb	popq	%rbx
00000000000426fc	popq	%r12
00000000000426fe	popq	%r14
0000000000042700	popq	%r15
0000000000042702	popq	%rbp
0000000000042703	retq
