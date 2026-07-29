__ZNK18OZSceneArrangement7ElementgtERKS0_:
0000000000503f30	movsd	0x8(%rdi), %xmm0
0000000000503f35	movsd	0x8(%rsi), %xmm1
0000000000503f3a	movb	$0x1, %al
0000000000503f3c	ucomisd	%xmm1, %xmm0
0000000000503f40	ja	0x503f60
0000000000503f42	ucomisd	%xmm0, %xmm1
0000000000503f46	jbe	0x503f4b
0000000000503f48	xorl	%eax, %eax
0000000000503f4a	retq
0000000000503f4b	pushq	%rbp
0000000000503f4c	movq	%rsp, %rbp
0000000000503f4f	movq	(%rdi), %rdi
0000000000503f52	movq	(%rsi), %rsi
0000000000503f55	callq	__ZL16layerListCompareP11OZSceneNodeS0_ ## layerListCompare(OZSceneNode*, OZSceneNode*)
0000000000503f5a	testl	%eax, %eax
0000000000503f5c	setg	%al
0000000000503f5f	popq	%rbp
0000000000503f60	retq
0000000000503f61	nopw	%cs:(%rax,%rax)
