__ZNK18OZSceneArrangement7ElementltERKS0_:
0000000000503c90	movsd	0x8(%rdi), %xmm0
0000000000503c95	movsd	0x8(%rsi), %xmm1
0000000000503c9a	movb	$0x1, %al
0000000000503c9c	ucomisd	%xmm0, %xmm1
0000000000503ca0	ja	0x503cbe
0000000000503ca2	ucomisd	%xmm1, %xmm0
0000000000503ca6	jbe	0x503cab
0000000000503ca8	xorl	%eax, %eax
0000000000503caa	retq
0000000000503cab	pushq	%rbp
0000000000503cac	movq	%rsp, %rbp
0000000000503caf	movq	(%rdi), %rdi
0000000000503cb2	movq	(%rsi), %rsi
0000000000503cb5	callq	__ZL16layerListCompareP11OZSceneNodeS0_ ## layerListCompare(OZSceneNode*, OZSceneNode*)
0000000000503cba	shrl	$0x1f, %eax
0000000000503cbd	popq	%rbp
0000000000503cbe	retq
0000000000503cbf	nop
