__ZN24HgcBT2100_PQ_InverseOETF12SetParameterEiffff:
00000000003ae710	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000003ae715	cmpl	$0x2, %esi
00000000003ae718	ja	0x3ae783
00000000003ae71a	movq	0x198(%rdi), %rcx
00000000003ae721	movl	%esi, %edx
00000000003ae723	shlq	$0x5, %rdx
00000000003ae727	leaq	(%rcx,%rdx), %rax
00000000003ae72b	movss	(%rcx,%rdx), %xmm4
00000000003ae730	ucomiss	%xmm0, %xmm4
00000000003ae733	jne	0x3ae75b
00000000003ae735	jp	0x3ae75b
00000000003ae737	movss	0x4(%rax), %xmm4
00000000003ae73c	ucomiss	%xmm1, %xmm4
00000000003ae73f	jne	0x3ae75b
00000000003ae741	jp	0x3ae75b
00000000003ae743	movss	0x8(%rax), %xmm4
00000000003ae748	ucomiss	%xmm2, %xmm4
00000000003ae74b	jne	0x3ae75b
00000000003ae74d	jp	0x3ae75b
00000000003ae74f	movss	0xc(%rax), %xmm4
00000000003ae754	ucomiss	%xmm3, %xmm4
00000000003ae757	jne	0x3ae75b
00000000003ae759	jnp	0x3ae784
00000000003ae75b	pushq	%rbp
00000000003ae75c	movq	%rsp, %rbp
00000000003ae75f	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000003ae765	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
00000000003ae76b	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
00000000003ae771	movups	%xmm0, 0x10(%rax)
00000000003ae775	movups	%xmm0, (%rax)
00000000003ae778	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000003ae77d	movl	$0x1, %eax
00000000003ae782	popq	%rbp
00000000003ae783	retq
00000000003ae784	xorl	%eax, %eax
00000000003ae786	retq
00000000003ae787	nopw	(%rax,%rax)
