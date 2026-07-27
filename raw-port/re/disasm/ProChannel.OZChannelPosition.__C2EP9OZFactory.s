__ZN17OZChannelPositionC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo:
0000000000073a32	pushq	%rbp
0000000000073a33	movq	%rsp, %rbp
0000000000073a36	pushq	%r15
0000000000073a38	pushq	%r14
0000000000073a3a	pushq	%r13
0000000000073a3c	pushq	%r12
0000000000073a3e	pushq	%rbx
0000000000073a3f	pushq	%rax
0000000000073a40	movl	%r8d, %r14d
0000000000073a43	movl	%ecx, %r15d
0000000000073a46	movq	%rdx, %r12
0000000000073a49	movq	%rsi, %r13
0000000000073a4c	movq	%rdi, %rbx
0000000000073a4f	movq	0x10(%rbp), %rax
0000000000073a53	leaq	0x695ce(%rip), %rcx
0000000000073a5a	movq	%rcx, (%rdi)
0000000000073a5d	leaq	0x6990c(%rip), %rcx
0000000000073a64	movq	%rcx, 0x10(%rdi)
0000000000073a68	testq	%r9, %r9
0000000000073a6b	jne	0x73a79
0000000000073a6d	callq	__ZN17OZChannelPosition27OZChannelPosition_valueImpl11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueImpl::getInstance()
0000000000073a72	movq	%rax, %r9
0000000000073a75	movq	0x10(%rbp), %rax
0000000000073a79	movq	%rax, (%rsp)
0000000000073a7d	movq	%rbx, %rdi
0000000000073a80	movq	%r13, %rsi
0000000000073a83	movq	%r12, %rdx
0000000000073a86	movl	%r15d, %ecx
0000000000073a89	movl	%r14d, %r8d
0000000000073a8c	movq	%rax, %r14
0000000000073a8f	callq	__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo ## OZChannel2D::OZChannel2D(OZFactory*, PCString const&, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000073a94	leaq	0x6958d(%rip), %rax
0000000000073a9b	movq	%rax, (%rbx)
0000000000073a9e	leaq	0x698cb(%rip), %rax
0000000000073aa5	movq	%rax, 0x10(%rbx)
0000000000073aa9	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073ab3	movq	%rax, 0x238(%rbx)
0000000000073aba	movq	%rax, 0x210(%rbx)
0000000000073ac1	movq	%rax, 0x1e8(%rbx)
0000000000073ac8	movq	%rax, 0x1c0(%rbx)
0000000000073acf	xorps	%xmm0, %xmm0
0000000000073ad2	movups	%xmm0, 0x1c8(%rbx)
0000000000073ad9	movups	%xmm0, 0x1d8(%rbx)
0000000000073ae0	movups	%xmm0, 0x1f0(%rbx)
0000000000073ae7	movups	%xmm0, 0x200(%rbx)
0000000000073aee	movups	%xmm0, 0x218(%rbx)
0000000000073af5	movups	%xmm0, 0x228(%rbx)
0000000000073afc	movl	$0x0, 0x2bc(%rbx)
0000000000073b06	movups	%xmm0, 0x240(%rbx)
0000000000073b0d	movups	%xmm0, 0x250(%rbx)
0000000000073b14	movups	%xmm0, 0x260(%rbx)
0000000000073b1b	movups	%xmm0, 0x270(%rbx)
0000000000073b22	movups	%xmm0, 0x280(%rbx)
0000000000073b29	movups	%xmm0, 0x290(%rbx)
0000000000073b30	movups	%xmm0, 0x2a0(%rbx)
0000000000073b37	movq	$0x0, 0x2b0(%rbx)
0000000000073b42	testq	%r14, %r14
0000000000073b45	jne	0x73b7d
0000000000073b47	leaq	0x240(%rbx), %r12
0000000000073b4e	leaq	0x2bc(%rbx), %r15
0000000000073b55	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
0000000000073b5a	leaq	0x88(%rbx), %rdi
0000000000073b61	movq	%rax, %rsi
0000000000073b64	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
0000000000073b69	callq	__ZN17OZChannelPosition27OZChannelPosition_valueInfo11getInstanceEv ## OZChannelPosition::OZChannelPosition_valueInfo::getInstance()
0000000000073b6e	leaq	0x120(%rbx), %rdi
0000000000073b75	movq	%rax, %rsi
0000000000073b78	callq	__ZN9OZChannel11replaceInfoEP13OZChannelInfo ## OZChannel::replaceInfo(OZChannelInfo*)
0000000000073b7d	movb	$0x1, 0x1b8(%rbx)
0000000000073b84	movl	$0x0, 0x2b8(%rbx)
0000000000073b8e	addq	$0x8, %rsp
0000000000073b92	popq	%rbx
0000000000073b93	popq	%r12
0000000000073b95	popq	%r13
0000000000073b97	popq	%r14
0000000000073b99	popq	%r15
0000000000073b9b	popq	%rbp
0000000000073b9c	retq
0000000000073b9d	movq	%rax, %r14
0000000000073ba0	movq	%r15, %rdi
0000000000073ba3	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
0000000000073ba8	movq	0x2a0(%rbx), %rdi
0000000000073baf	testq	%rdi, %rdi
0000000000073bb2	je	0x73bc0
0000000000073bb4	movq	%rdi, 0x2a8(%rbx)
0000000000073bbb	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073bc0	movq	0x288(%rbx), %rdi
0000000000073bc7	testq	%rdi, %rdi
0000000000073bca	je	0x73bd8
0000000000073bcc	movq	%rdi, 0x290(%rbx)
0000000000073bd3	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073bd8	movq	0x270(%rbx), %rdi
0000000000073bdf	testq	%rdi, %rdi
0000000000073be2	je	0x73bf0
0000000000073be4	movq	%rdi, 0x278(%rbx)
0000000000073beb	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073bf0	movq	0x258(%rbx), %rdi
0000000000073bf7	testq	%rdi, %rdi
0000000000073bfa	je	0x73c08
0000000000073bfc	movq	%rdi, 0x260(%rbx)
0000000000073c03	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073c08	movq	(%r12), %rdi
0000000000073c0c	testq	%rdi, %rdi
0000000000073c0f	je	0x73c1d
0000000000073c11	movq	%rdi, 0x248(%rbx)
0000000000073c18	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000073c1d	movq	%rbx, %rdi
0000000000073c20	callq	__ZN11OZChannel2DD2Ev           ## OZChannel2D::~OZChannel2D()
0000000000073c25	movq	%r14, %rdi
0000000000073c28	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000073c2d	nop
