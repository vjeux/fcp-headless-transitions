__ZN34HGCRetimeWithFlowInterpVariableRez6GetROIEP10HGRendereri6HGRect:
00000000000e1500	pushq	%rbp
00000000000e1501	movq	%rsp, %rbp
00000000000e1504	subq	$0x20, %rsp
00000000000e1508	movq	%rcx, %rsi
00000000000e150b	shrq	$0x20, %rsi
00000000000e150f	movq	%r8, %rax
00000000000e1512	shrq	$0x20, %rax
00000000000e1516	cmpl	$0x1, %edx
00000000000e1519	ja	0xe158a
00000000000e151b	movd	%r8d, %xmm0
00000000000e1520	pinsrd	$0x1, %eax, %xmm0
00000000000e1526	movdqa	%xmm0, -0x20(%rbp)
00000000000e152b	movd	%ecx, %xmm0
00000000000e152f	pinsrd	$0x1, %esi, %xmm0
00000000000e1535	movdqa	%xmm0, -0x10(%rbp)
00000000000e153a	movss	0x1a0(%rdi), %xmm2
00000000000e1542	movss	0x1a4(%rdi), %xmm3
00000000000e154a	movss	0x2ed7be(%rip), %xmm1
00000000000e1552	movaps	%xmm1, %xmm0
00000000000e1555	subss	%xmm2, %xmm0
00000000000e1559	subss	%xmm3, %xmm1
00000000000e155d	movss	0x2e9a27(%rip), %xmm4
00000000000e1565	addss	%xmm4, %xmm2
00000000000e1569	addss	%xmm4, %xmm3
00000000000e156d	callq	_HGRectfMake4f
00000000000e1572	cvtdq2ps	-0x10(%rbp), %xmm2
00000000000e1576	addps	%xmm2, %xmm0
00000000000e1579	cvtdq2ps	-0x20(%rbp), %xmm2
00000000000e157d	addps	%xmm2, %xmm1
00000000000e1580	addq	$0x20, %rsp
00000000000e1584	popq	%rbp
00000000000e1585	jmp	_HGRectIntegral
00000000000e158a	cmpl	$0x2, %edx
00000000000e158d	jne	0xe15ee
00000000000e158f	cvtsi2ss	%ecx, %xmm0
00000000000e1593	mulss	0x1a8(%rdi), %xmm0
00000000000e159b	cvtsi2ss	%esi, %xmm1
00000000000e159f	movss	0x2e8b69(%rip), %xmm2
00000000000e15a7	addss	%xmm2, %xmm0
00000000000e15ab	movss	0x1ac(%rdi), %xmm4
00000000000e15b3	mulss	%xmm4, %xmm1
00000000000e15b7	addss	%xmm2, %xmm1
00000000000e15bb	xorps	%xmm2, %xmm2
00000000000e15be	cvtsi2ss	%r8d, %xmm2
00000000000e15c3	mulss	%xmm4, %xmm2
00000000000e15c7	cvtsi2ss	%eax, %xmm3
00000000000e15cb	movss	0x2e66ed(%rip), %xmm5
00000000000e15d3	addss	%xmm5, %xmm2
00000000000e15d7	mulss	%xmm4, %xmm3
00000000000e15db	addss	%xmm5, %xmm3
00000000000e15df	callq	_HGRectfMake4f
00000000000e15e4	addq	$0x20, %rsp
00000000000e15e8	popq	%rbp
00000000000e15e9	jmp	_HGRectIntegral
00000000000e15ee	leaq	_HGRectNull(%rip), %rcx
00000000000e15f5	movq	(%rcx), %rax
00000000000e15f8	movq	0x8(%rcx), %rdx
00000000000e15fc	addq	$0x20, %rsp
00000000000e1600	popq	%rbp
00000000000e1601	retq
00000000000e1602	addb	%al, (%rax)
00000000000e1604	addb	%al, (%rax)
00000000000e1606	addb	%al, (%rax)
00000000000e1608	addb	%al, (%rax)
00000000000e160a	addb	%al, (%rax)
00000000000e160c	addb	%al, (%rax)
00000000000e160e	addb	%al, (%rax)
