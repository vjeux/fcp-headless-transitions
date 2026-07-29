__ZN19OZChannelPosition3D10getTangentERK6CMTimedR9PCVector3IdE:
000000000007b3bc	pushq	%rbp
000000000007b3bd	movq	%rsp, %rbp
000000000007b3c0	pushq	%r15
000000000007b3c2	pushq	%r14
000000000007b3c4	pushq	%r13
000000000007b3c6	pushq	%r12
000000000007b3c8	pushq	%rbx
000000000007b3c9	subq	$0x58, %rsp
000000000007b3cd	movq	%rdx, -0x38(%rbp)
000000000007b3d1	movapd	%xmm0, %xmm1
000000000007b3d5	movsd	%xmm0, -0x30(%rbp)
000000000007b3da	movq	%rdi, %r14
000000000007b3dd	xorl	%r12d, %r12d
000000000007b3e0	leaq	-0x50(%rbp), %rdx
000000000007b3e4	movq	%r12, (%rdx)
000000000007b3e7	leaq	-0x48(%rbp), %rcx
000000000007b3eb	movq	%r12, (%rcx)
000000000007b3ee	leaq	-0x68(%rbp), %rbx
000000000007b3f2	movq	%r12, (%rbx)
000000000007b3f5	leaq	-0x40(%rbp), %rax
000000000007b3f9	movq	%r12, (%rax)
000000000007b3fc	leaq	-0x60(%rbp), %r13
000000000007b400	movq	%r12, (%r13)
000000000007b404	leaq	-0x58(%rbp), %r15
000000000007b408	movq	%r12, (%r15)
000000000007b40b	movsd	0x34fb5(%rip), %xmm0
000000000007b413	addsd	%xmm1, %xmm0
000000000007b417	movq	%r12, 0x10(%rsp)
000000000007b41c	xorpd	%xmm1, %xmm1
000000000007b420	movupd	%xmm1, (%rsp)
000000000007b425	movq	%rbx, %r8
000000000007b428	xorl	%r9d, %r9d
000000000007b42b	callq	__ZN19OZChannelPosition3D17getPositionOnPathERK6CMTimedPdS3_S3_S3_S3_S3_S3_ ## OZChannelPosition3D::getPositionOnPath(CMTime const&, double, double*, double*, double*, double*, double*, double*, double*)
000000000007b430	movsd	-0x30(%rbp), %xmm0
000000000007b435	addsd	0x340eb(%rip), %xmm0
000000000007b43d	movq	%r12, 0x10(%rsp)
000000000007b442	xorpd	%xmm1, %xmm1
000000000007b446	movupd	%xmm1, (%rsp)
000000000007b44b	movq	%r14, %rdi
000000000007b44e	leaq	-0x40(%rbp), %r14
000000000007b452	movq	%r14, %rdx
000000000007b455	movq	%r13, %rcx
000000000007b458	movq	%r15, %r8
000000000007b45b	xorl	%r9d, %r9d
000000000007b45e	callq	__ZN19OZChannelPosition3D17getPositionOnPathERK6CMTimedPdS3_S3_S3_S3_S3_S3_ ## OZChannelPosition3D::getPositionOnPath(CMTime const&, double, double*, double*, double*, double*, double*, double*, double*)
000000000007b463	movsd	(%r15), %xmm1
000000000007b468	subsd	(%rbx), %xmm1
000000000007b46c	movapd	%xmm1, %xmm0
000000000007b470	mulsd	%xmm1, %xmm0
000000000007b474	movsd	(%r14), %xmm2
000000000007b479	movhpd	(%r13), %xmm2                   ## xmm2 = xmm2[0],mem[0]
000000000007b47f	leaq	-0x50(%rbp), %rax
000000000007b483	movsd	(%rax), %xmm3
000000000007b487	leaq	-0x48(%rbp), %rax
000000000007b48b	movhpd	(%rax), %xmm3                   ## xmm3 = xmm3[0],mem[0]
000000000007b48f	subpd	%xmm3, %xmm2
000000000007b493	movapd	%xmm2, %xmm3
000000000007b497	mulpd	%xmm2, %xmm3
000000000007b49b	haddpd	%xmm3, %xmm3
000000000007b49f	addsd	%xmm0, %xmm3
000000000007b4a3	sqrtsd	%xmm3, %xmm3
000000000007b4a7	movapd	0x34ee1(%rip), %xmm0
000000000007b4af	andpd	%xmm3, %xmm0
000000000007b4b3	movsd	0x34ef5(%rip), %xmm4
000000000007b4bb	xorl	%eax, %eax
000000000007b4bd	ucomisd	%xmm0, %xmm4
000000000007b4c1	seta	%al
000000000007b4c4	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
000000000007b4c8	movapd	%xmm2, %xmm4
000000000007b4cc	divpd	%xmm0, %xmm4
000000000007b4d0	movd	%eax, %xmm0
000000000007b4d4	pshufd	$0x44, %xmm0, %xmm0             ## xmm0 = xmm0[0,1,0,1]
000000000007b4d9	psllq	$0x3f, %xmm0
000000000007b4de	blendvpd	%xmm0, %xmm2, %xmm4
000000000007b4e3	ja	0x7b4e9
000000000007b4e5	divsd	%xmm3, %xmm1
000000000007b4e9	movq	-0x38(%rbp), %rax
000000000007b4ed	movupd	%xmm4, (%rax)
000000000007b4f1	movsd	%xmm1, 0x10(%rax)
000000000007b4f6	movb	$0x1, %al
000000000007b4f8	addq	$0x58, %rsp
000000000007b4fc	popq	%rbx
000000000007b4fd	popq	%r12
000000000007b4ff	popq	%r13
000000000007b501	popq	%r14
000000000007b503	popq	%r15
000000000007b505	popq	%rbp
000000000007b506	retq
000000000007b507	nop
