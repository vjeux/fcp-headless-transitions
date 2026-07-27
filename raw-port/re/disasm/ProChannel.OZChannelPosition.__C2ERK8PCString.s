__ZN17OZChannelPositionC2ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
00000000000735d6	pushq	%rbp
00000000000735d7	movq	%rsp, %rbp
00000000000735da	pushq	%r15
00000000000735dc	pushq	%r14
00000000000735de	pushq	%r13
00000000000735e0	pushq	%r12
00000000000735e2	pushq	%rbx
00000000000735e3	subq	$0x28, %rsp
00000000000735e7	movl	%r9d, %r13d
00000000000735ea	movl	%r8d, -0x30(%rbp)
00000000000735ee	movl	%ecx, -0x2c(%rbp)
00000000000735f1	movq	%rdx, -0x38(%rbp)
00000000000735f5	movq	%rsi, %r14
00000000000735f8	movq	%rdi, %rbx
00000000000735fb	movq	0x10(%rbp), %r15
00000000000735ff	leaq	0x69a22(%rip), %rax
0000000000073606	movq	%rax, (%rdi)
0000000000073609	leaq	0x69d60(%rip), %rax
0000000000073610	movq	%rax, 0x10(%rdi)
0000000000073614	callq	__ZN25OZChannelPosition_Factory11getInstanceEv ## OZChannelPosition_Factory::getInstance()
0000000000073619	movq	%rax, %r12
000000000007361c	testq	%r15, %r15
000000000007361f	jne	0x73629
0000000000073621	callq	__ZN17OZChannelPosition27OZChannelPosition_valueImpl11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueImpl::getInstance()
0000000000073626	movq	%rax, %r15
0000000000073629	movq	0x18(%rbp), %rax
000000000007362d	movq	%rax, 0x10(%rsp)
0000000000073632	movq	%r15, 0x8(%rsp)
0000000000073637	movl	%r13d, (%rsp)
000000000007363b	movq	%rbx, %rdi
000000000007363e	movq	%r12, %rsi
0000000000073641	movq	%r14, %rdx
0000000000073644	movq	-0x38(%rbp), %rcx
0000000000073648	movl	-0x2c(%rbp), %r8d
000000000007364c	movl	-0x30(%rbp), %r9d
0000000000073650	callq	__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000073655	leaq	0x699cc(%rip), %rax
000000000007365c	movq	%rax, (%rbx)
000000000007365f	leaq	0x69d0a(%rip), %rax
0000000000073666	movq	%rax, 0x10(%rbx)
000000000007366a	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073674	movq	%rax, 0x238(%rbx)
000000000007367b	movq	%rax, 0x210(%rbx)
0000000000073682	movq	%rax, 0x1e8(%rbx)
0000000000073689	movq	%rax, 0x1c0(%rbx)
0000000000073690	xorps	%xmm0, %xmm0
0000000000073693	movups	%xmm0, 0x1c8(%rbx)
000000000007369a	movups	%xmm0, 0x1d8(%rbx)
00000000000736a1	movups	%xmm0, 0x1f0(%rbx)
00000000000736a8	movups	%xmm0, 0x200(%rbx)
00000000000736af	movups	%xmm0, 0x218(%rbx)
00000000000736b6	movups	%xmm0, 0x228(%rbx)
00000000000736bd	movl	$0x0, 0x2bc(%rbx)
00000000000736c7	movups	%xmm0, 0x240(%rbx)
00000000000736ce	movups	%xmm0, 0x250(%rbx)
00000000000736d5	movups	%xmm0, 0x260(%rbx)
00000000000736dc	movups	%xmm0, 0x270(%rbx)
00000000000736e3	movups	%xmm0, 0x280(%rbx)
00000000000736ea	movups	%xmm0, 0x290(%rbx)
00000000000736f1	movups	%xmm0, 0x2a0(%rbx)
00000000000736f8	movq	$0x0, 0x2b0(%rbx)
0000000000073703	cmpq	$0x0, 0x18(%rbp)
0000000000073708	jne	0x73740
000000000007370a	leaq	0x240(%rbx), %r12
0000000000073711	leaq	0x2bc(%rbx), %r15
0000000000073718	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
000000000007371d	leaq	0x88(%rbx), %rdi
0000000000073724	movq	%rax, %rsi
0000000000073727	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
000000000007372c	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
0000000000073731	leaq	0x120(%rbx), %rdi
0000000000073738	movq	%rax, %rsi
000000000007373b	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
0000000000073740	movb	$0x1, 0x1b8(%rbx)
0000000000073747	movl	$0x0, 0x2b8(%rbx)
0000000000073751	addq	$0x28, %rsp
0000000000073755	popq	%rbx
0000000000073756	popq	%r12
0000000000073758	popq	%r13
000000000007375a	popq	%r14
000000000007375c	popq	%r15
000000000007375e	popq	%rbp
000000000007375f	retq
0000000000073760	movq	%rax, %r14
0000000000073763	movq	%r15, %rdi
0000000000073766	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
000000000007376b	movq	0x2a0(%rbx), %rdi
0000000000073772	testq	%rdi, %rdi
0000000000073775	je	0x73783
0000000000073777	movq	%rdi, 0x2a8(%rbx)
000000000007377e	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073783	movq	0x288(%rbx), %rdi
000000000007378a	testq	%rdi, %rdi
000000000007378d	je	0x7379b
000000000007378f	movq	%rdi, 0x290(%rbx)
0000000000073796	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000007379b	movq	0x270(%rbx), %rdi
00000000000737a2	testq	%rdi, %rdi
00000000000737a5	je	0x737b3
00000000000737a7	movq	%rdi, 0x278(%rbx)
00000000000737ae	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000737b3	movq	0x258(%rbx), %rdi
00000000000737ba	testq	%rdi, %rdi
00000000000737bd	je	0x737cb
00000000000737bf	movq	%rdi, 0x260(%rbx)
00000000000737c6	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000737cb	movq	(%r12), %rdi
00000000000737cf	testq	%rdi, %rdi
00000000000737d2	je	0x737e0
00000000000737d4	movq	%rdi, 0x248(%rbx)
00000000000737db	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000737e0	movq	%rbx, %rdi
00000000000737e3	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
00000000000737e8	movq	%r14, %rdi
00000000000737eb	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
