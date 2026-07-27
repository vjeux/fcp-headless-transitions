__ZN17OZChannelPosition16getCachedVectorsEPPdS1_S1_S1_PiP14PCMatrix44TmplIdE:
00000000000746ec	pushq	%rbp
00000000000746ed	movq	%rsp, %rbp
00000000000746f0	pushq	%r15
00000000000746f2	pushq	%r14
00000000000746f4	pushq	%r13
00000000000746f6	pushq	%r12
00000000000746f8	pushq	%rbx
00000000000746f9	subq	$0x268, %rsp                    ## imm = 0x268
0000000000074700	movq	%r9, %r13
0000000000074703	movq	%r8, -0xc8(%rbp)
000000000007470a	movq	%rcx, -0x78(%rbp)
000000000007470e	movq	%rdx, -0x88(%rbp)
0000000000074715	movq	%rsi, -0x80(%rbp)
0000000000074719	movq	%rdi, %rbx
000000000007471c	leaq	0x88(%rdi), %r14
0000000000074723	movq	0x88(%rdi), %rax
000000000007472a	movq	%r14, %rdi
000000000007472d	callq	*0x340(%rax)
0000000000074733	movl	%eax, %r12d
0000000000074736	leaq	0x120(%rbx), %r15
000000000007473d	movq	0x120(%rbx), %rax
0000000000074744	movq	%r15, %rdi
0000000000074747	callq	*0x340(%rax)
000000000007474d	cmpl	%eax, %r12d
0000000000074750	jne	0x748dd
0000000000074756	cmpq	$0x0, 0x10(%rbp)
000000000007475b	je	0x747c2
000000000007475d	leaq	0x1c0(%rbx), %rax
0000000000074764	xorl	%ecx, %ecx
0000000000074766	movapd	0x3bc22(%rip), %xmm0
000000000007476e	movsd	0x3bc3a(%rip), %xmm1
0000000000074776	movq	0x10(%rbp), %rdx
000000000007477a	xorl	%esi, %esi
000000000007477c	movsd	(%rdx,%rsi,8), %xmm2
0000000000074781	subsd	(%rax,%rsi,8), %xmm2
0000000000074786	andpd	%xmm0, %xmm2
000000000007478a	ucomisd	%xmm2, %xmm1
000000000007478e	jbe	0x748e4
0000000000074794	incq	%rsi
0000000000074797	cmpq	$0x4, %rsi
000000000007479b	jne	0x7477c
000000000007479d	incq	%rcx
00000000000747a0	addq	$0x20, %rax
00000000000747a4	addq	$0x20, %rdx
00000000000747a8	cmpq	$0x4, %rcx
00000000000747ac	jne	0x7477a
00000000000747ae	movq	0x240(%rbx), %rax
00000000000747b5	cmpq	0x248(%rbx), %rax
00000000000747bc	je	0x748e4
00000000000747c2	movl	0x2b8(%rbx), %r12d
00000000000747c9	testq	%r12, %r12
00000000000747cc	je	0x748e4
00000000000747d2	movq	-0x80(%rbp), %r14
00000000000747d6	testq	%r14, %r14
00000000000747d9	je	0x747eb
00000000000747db	leaq	(,%r12,8), %rdi
00000000000747e3	callq	0xace46                         ## symbol stub for: __Znam
00000000000747e8	movq	%rax, (%r14)
00000000000747eb	movq	-0x88(%rbp), %r15
00000000000747f2	testq	%r15, %r15
00000000000747f5	movq	-0xc8(%rbp), %r14
00000000000747fc	je	0x7480e
00000000000747fe	leaq	(,%r12,8), %rdi
0000000000074806	callq	0xace46                         ## symbol stub for: __Znam
000000000007480b	movq	%rax, (%r15)
000000000007480e	movq	-0x78(%rbp), %r15
0000000000074812	testq	%r15, %r15
0000000000074815	je	0x74827
0000000000074817	leaq	(,%r12,8), %rdi
000000000007481f	callq	0xace46                         ## symbol stub for: __Znam
0000000000074824	movq	%rax, (%r15)
0000000000074827	testq	%r14, %r14
000000000007482a	je	0x7483c
000000000007482c	leaq	(,%r12,8), %rdi
0000000000074834	callq	0xace46                         ## symbol stub for: __Znam
0000000000074839	movq	%rax, (%r14)
000000000007483c	cmpq	$0x0, 0x10(%rbp)
0000000000074841	movl	$0x258, %ecx                    ## imm = 0x258
0000000000074846	movl	$0x240, %eax                    ## imm = 0x240
000000000007484b	cmoveq	%rcx, %rax
000000000007484f	xorl	%ecx, %ecx
0000000000074851	movq	-0x80(%rbp), %rsi
0000000000074855	testq	%rsi, %rsi
0000000000074858	je	0x7486e
000000000007485a	movq	0x2a0(%rbx), %rdx
0000000000074861	movsd	(%rdx,%rcx,8), %xmm0
0000000000074866	movq	(%rsi), %rdx
0000000000074869	movsd	%xmm0, (%rdx,%rcx,8)
000000000007486e	movq	-0x88(%rbp), %rsi
0000000000074875	testq	%rsi, %rsi
0000000000074878	je	0x7488e
000000000007487a	movq	0x270(%rbx), %rdx
0000000000074881	movsd	(%rdx,%rcx,8), %xmm0
0000000000074886	movq	(%rsi), %rdx
0000000000074889	movsd	%xmm0, (%rdx,%rcx,8)
000000000007488e	movq	-0x78(%rbp), %rsi
0000000000074892	testq	%rsi, %rsi
0000000000074895	je	0x748ab
0000000000074897	movq	0x288(%rbx), %rdx
000000000007489e	movsd	(%rdx,%rcx,8), %xmm0
00000000000748a3	movq	(%rsi), %rdx
00000000000748a6	movsd	%xmm0, (%rdx,%rcx,8)
00000000000748ab	testq	%r14, %r14
00000000000748ae	je	0x748c1
00000000000748b0	movq	(%rbx,%rax), %rdx
00000000000748b4	movsd	(%rdx,%rcx,8), %xmm0
00000000000748b9	movq	(%r14), %rdx
00000000000748bc	movsd	%xmm0, (%rdx,%rcx,8)
00000000000748c1	incq	%rcx
00000000000748c4	cmpq	%rcx, %r12
00000000000748c7	jne	0x74851
00000000000748c9	movb	$0x1, %bl
00000000000748cb	testq	%r13, %r13
00000000000748ce	je	0x754f0
00000000000748d4	movl	%r12d, (%r13)
00000000000748d8	jmp	0x754f0
00000000000748dd	xorl	%ebx, %ebx
00000000000748df	jmp	0x754f0
00000000000748e4	leaq	0x2b8(%rbx), %rax
00000000000748eb	movq	%rax, -0x48(%rbp)
00000000000748ef	movq	%r13, -0x158(%rbp)
00000000000748f6	movq	0x240(%rbx), %rax
00000000000748fd	movq	0x258(%rbx), %rcx
0000000000074904	movq	%rcx, 0x260(%rbx)
000000000007490b	movq	%rax, 0x248(%rbx)
0000000000074912	movq	0x270(%rbx), %rax
0000000000074919	movq	%rax, 0x278(%rbx)
0000000000074920	movq	0x288(%rbx), %rax
0000000000074927	movq	%rax, 0x290(%rbx)
000000000007492e	movq	0x2a0(%rbx), %rax
0000000000074935	movq	%rax, 0x2a8(%rbx)
000000000007493c	movl	$0x0, 0x2b8(%rbx)
0000000000074946	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000074950	movq	%rax, 0x238(%rbx)
0000000000074957	movq	%rax, 0x210(%rbx)
000000000007495e	movq	%rax, 0x1e8(%rbx)
0000000000074965	movq	%rax, 0x1c0(%rbx)
000000000007496c	xorpd	%xmm0, %xmm0
0000000000074970	movupd	%xmm0, 0x1c8(%rbx)
0000000000074978	movupd	%xmm0, 0x1d8(%rbx)
0000000000074980	movupd	%xmm0, 0x1f0(%rbx)
0000000000074988	movupd	%xmm0, 0x200(%rbx)
0000000000074990	movupd	%xmm0, 0x228(%rbx)
0000000000074998	movupd	%xmm0, 0x218(%rbx)
00000000000749a0	movq	0x88(%rbx), %rax
00000000000749a7	movq	%r14, %rdi
00000000000749aa	callq	*0xf8(%rax)
00000000000749b0	movq	%rax, %r13
00000000000749b3	movq	0x120(%rbx), %rax
00000000000749ba	movq	%r15, %rdi
00000000000749bd	callq	*0xf8(%rax)
00000000000749c3	movq	%rax, -0x38(%rbp)
00000000000749c7	leaq	-0x240(%rbp), %r15
00000000000749ce	movq	%r15, %rdi
00000000000749d1	movq	%r13, %rsi
00000000000749d4	callq	__ZN9OZChannel26getKeyframeParametricRangeEv ## OZChannel::getKeyframeParametricRange()
00000000000749d9	leaq	-0x258(%rbp), %r14
00000000000749e0	movq	%r14, %rdi
00000000000749e3	movq	%r13, %rsi
00000000000749e6	callq	__ZN9OZChannel18getKeyframeMinTimeEv ## OZChannel::getKeyframeMinTime()
00000000000749eb	movq	0x10(%r15), %rax
00000000000749ef	movq	%rax, 0x28(%rsp)
00000000000749f4	movaps	(%r15), %xmm0
00000000000749f8	movups	%xmm0, 0x18(%rsp)
00000000000749fd	movq	0x10(%r14), %rax
0000000000074a01	movq	%rax, 0x10(%rsp)
0000000000074a06	movups	(%r14), %xmm0
0000000000074a0a	movups	%xmm0, (%rsp)
0000000000074a0e	leaq	-0xf0(%rbp), %r12
0000000000074a15	movq	%r12, %rdi
0000000000074a18	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000074a1d	movq	0x10(%r12), %rax
0000000000074a22	movq	%rax, 0x10(%r15)
0000000000074a26	movups	(%r12), %xmm0
0000000000074a2b	movaps	%xmm0, (%r15)
0000000000074a2f	movq	0x10(%r15), %rax
0000000000074a33	movq	%rax, 0x10(%rsp)
0000000000074a38	movaps	(%r15), %xmm0
0000000000074a3c	movups	%xmm0, (%rsp)
0000000000074a40	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000074a45	movsd	%xmm0, -0xb0(%rbp)
0000000000074a4d	movq	0x10(%r14), %rax
0000000000074a51	movq	%rax, 0x10(%rsp)
0000000000074a56	movupd	(%r14), %xmm0
0000000000074a5b	movupd	%xmm0, (%rsp)
0000000000074a60	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000074a65	movsd	%xmm0, -0x68(%rbp)
0000000000074a6a	movq	%r13, %rdi
0000000000074a6d	callq	__ZNK9OZChannel23isParametricCurveClosedEv ## OZChannel::isParametricCurveClosed() const
0000000000074a72	movl	%eax, %r15d
0000000000074a75	movq	%r13, %rdi
0000000000074a78	callq	__ZN9OZChannel16getInterpolationEv ## OZChannel::getInterpolation()
0000000000074a7d	movl	%eax, %r14d
0000000000074a80	leaq	-0x118(%rbp), %rdi
0000000000074a87	movq	%r13, %rsi
0000000000074a8a	movl	$0x1, %edx
0000000000074a8f	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000074a94	leaq	-0x130(%rbp), %rdi
0000000000074a9b	movq	-0x38(%rbp), %rsi
0000000000074a9f	movl	$0x1, %edx
0000000000074aa4	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000074aa9	movq	(%r13), %rax
0000000000074aad	movq	%r13, -0x40(%rbp)
0000000000074ab1	movq	%r13, %rdi
0000000000074ab4	callq	*0x340(%rax)
0000000000074aba	movq	-0x78(%rbp), %r12
0000000000074abe	leaq	0x270(%rbx), %rcx
0000000000074ac5	movq	%rcx, -0x60(%rbp)
0000000000074ac9	leaq	0x288(%rbx), %rcx
0000000000074ad0	movq	%rcx, -0x58(%rbp)
0000000000074ad4	leaq	0x2a0(%rbx), %rcx
0000000000074adb	movq	%rcx, -0x70(%rbp)
0000000000074adf	cmpl	$0x2, %eax
0000000000074ae2	jb	0x75164
0000000000074ae8	movq	-0x118(%rbp), %rdx
0000000000074aef	movq	-0x110(%rbp), %rcx
0000000000074af6	subq	%rdx, %rcx
0000000000074af9	cmpq	$0x9, %rcx
0000000000074afd	jb	0x75164
0000000000074b03	movsd	-0xb0(%rbp), %xmm0
0000000000074b0b	subsd	-0x68(%rbp), %xmm0
0000000000074b10	movsd	%xmm0, -0xb0(%rbp)
0000000000074b18	cmpl	$0x9, %r14d
0000000000074b1c	jg	0x7508e
0000000000074b22	cmpl	$0x1, %r14d
0000000000074b26	je	0x75106
0000000000074b2c	cmpl	$0x4, %r14d
0000000000074b30	jne	0x75164
0000000000074b36	movb	%r15b, -0x29(%rbp)
0000000000074b3a	movq	0x8(%rdx), %rax
0000000000074b3e	testq	%rax, %rax
0000000000074b41	je	0x75016
0000000000074b47	movq	-0x8(%rdx,%rcx), %r15
0000000000074b4c	movq	-0x130(%rbp), %rcx
0000000000074b53	movq	(%rcx), %r14
0000000000074b56	movq	0x8(%rcx), %rcx
0000000000074b5a	movq	(%rdx), %rsi
0000000000074b5d	movl	$0x1, %r12d
0000000000074b63	xorpd	%xmm0, %xmm0
0000000000074b67	movhpd	0x3a9b9(%rip), %xmm0            ## xmm0 = xmm0[0],mem[0]
0000000000074b6f	movapd	%xmm0, -0x1f0(%rbp)
0000000000074b77	movq	%rax, -0x50(%rbp)
0000000000074b7b	movq	%rcx, -0xc0(%rbp)
0000000000074b82	movq	-0x40(%rbp), %rdi
0000000000074b86	movq	%rsi, %r13
0000000000074b89	leaq	-0x220(%rbp), %rdx
0000000000074b90	leaq	-0x188(%rbp), %rcx
0000000000074b97	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000074b9c	movq	-0x38(%rbp), %rdi
0000000000074ba0	movq	%r14, %rsi
0000000000074ba3	xorl	%edx, %edx
0000000000074ba5	leaq	-0x180(%rbp), %rcx
0000000000074bac	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000074bb1	movq	-0x40(%rbp), %rdi
0000000000074bb5	movq	-0x50(%rbp), %rsi
0000000000074bb9	leaq	-0x208(%rbp), %rdx
0000000000074bc0	leaq	-0x100(%rbp), %rcx
0000000000074bc7	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000074bcc	movq	-0x38(%rbp), %rdi
0000000000074bd0	movq	-0xc0(%rbp), %rsi
0000000000074bd7	xorl	%edx, %edx
0000000000074bd9	leaq	-0xf8(%rbp), %rcx
0000000000074be0	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000074be5	movq	-0x210(%rbp), %rax
0000000000074bec	movq	%rax, 0x10(%rsp)
0000000000074bf1	movupd	-0x220(%rbp), %xmm0
0000000000074bf9	movupd	%xmm0, (%rsp)
0000000000074bfe	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000074c03	movsd	%xmm0, -0xb8(%rbp)
0000000000074c0b	movq	-0x1f8(%rbp), %rax
0000000000074c12	movq	%rax, 0x10(%rsp)
0000000000074c17	movupd	-0x208(%rbp), %xmm0
0000000000074c1f	movupd	%xmm0, (%rsp)
0000000000074c24	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000074c29	testb	$0x1, -0x29(%rbp)
0000000000074c2d	jne	0x74c39
0000000000074c2f	movsd	%xmm0, -0x98(%rbp)
0000000000074c37	jmp	0x74c4d
0000000000074c39	movapd	%xmm0, %xmm1
0000000000074c3d	addsd	-0xb0(%rbp), %xmm1
0000000000074c45	movsd	%xmm1, -0x98(%rbp)
0000000000074c4d	cmpq	%r15, %r13
0000000000074c50	je	0x74c5a
0000000000074c52	movsd	%xmm0, -0x98(%rbp)
0000000000074c5a	movq	-0x40(%rbp), %rdi
0000000000074c5e	movq	%r13, %rsi
0000000000074c61	xorl	%edx, %edx
0000000000074c63	leaq	-0x178(%rbp), %rcx
0000000000074c6a	movl	$0x1, %r8d
0000000000074c70	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000074c75	movq	-0x38(%rbp), %rdi
0000000000074c79	movq	%r14, %rsi
0000000000074c7c	xorl	%edx, %edx
0000000000074c7e	leaq	-0x170(%rbp), %rcx
0000000000074c85	movl	$0x1, %r8d
0000000000074c8b	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000074c90	movq	-0x40(%rbp), %rdi
0000000000074c94	movq	-0x50(%rbp), %rsi
0000000000074c98	xorl	%edx, %edx
0000000000074c9a	leaq	-0x168(%rbp), %rcx
0000000000074ca1	movl	$0x1, %r8d
0000000000074ca7	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000074cac	movq	-0x38(%rbp), %rdi
0000000000074cb0	movq	-0xc0(%rbp), %rsi
0000000000074cb7	xorl	%edx, %edx
0000000000074cb9	leaq	-0x160(%rbp), %rcx
0000000000074cc0	movl	$0x1, %r8d
0000000000074cc6	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000074ccb	movsd	-0x188(%rbp), %xmm0
0000000000074cd3	movsd	-0x100(%rbp), %xmm1
0000000000074cdb	movapd	%xmm0, %xmm2
0000000000074cdf	subsd	%xmm1, %xmm2
0000000000074ce3	movapd	0x3b6a5(%rip), %xmm3
0000000000074ceb	andpd	%xmm3, %xmm2
0000000000074cef	movsd	0x3b6b9(%rip), %xmm6
0000000000074cf7	ucomisd	%xmm2, %xmm6
0000000000074cfb	movsd	-0x180(%rbp), %xmm5
0000000000074d03	movsd	-0xf8(%rbp), %xmm4
0000000000074d0b	jbe	0x74d45
0000000000074d0d	movapd	%xmm5, %xmm2
0000000000074d11	subsd	%xmm4, %xmm2
0000000000074d15	andpd	%xmm3, %xmm2
0000000000074d19	ucomisd	%xmm2, %xmm6
0000000000074d1d	movq	-0x40(%rbp), %r14
0000000000074d21	jbe	0x74d49
0000000000074d23	movsd	0x3c44d(%rip), %xmm2
0000000000074d2b	addsd	%xmm2, %xmm1
0000000000074d2f	movsd	%xmm1, -0x100(%rbp)
0000000000074d37	addsd	%xmm2, %xmm4
0000000000074d3b	movsd	%xmm4, -0xf8(%rbp)
0000000000074d43	jmp	0x74d49
0000000000074d45	movq	-0x40(%rbp), %r14
0000000000074d49	movsd	%xmm0, -0xf0(%rbp)
0000000000074d51	movsd	%xmm5, -0xe8(%rbp)
0000000000074d59	movaps	-0x1f0(%rbp), %xmm8
0000000000074d61	movups	%xmm8, -0xe0(%rbp)
0000000000074d69	movsd	-0x178(%rbp), %xmm6
0000000000074d71	addsd	%xmm0, %xmm6
0000000000074d75	movsd	%xmm6, -0x150(%rbp)
0000000000074d7d	movups	%xmm8, -0x140(%rbp)
0000000000074d85	movapd	%xmm4, %xmm3
0000000000074d89	movhpd	-0x170(%rbp), %xmm3             ## xmm3 = xmm3[0],mem[0]
0000000000074d91	movsd	-0x168(%rbp), %xmm2
0000000000074d99	addsd	%xmm1, %xmm2
0000000000074d9d	movsd	-0x160(%rbp), %xmm7
0000000000074da5	unpcklpd	%xmm5, %xmm7                    ## xmm7 = xmm7[0],xmm5[0]
0000000000074da9	addpd	%xmm7, %xmm3
0000000000074dad	movhpd	%xmm3, -0x148(%rbp)
0000000000074db5	movsd	%xmm2, -0x1d8(%rbp)
0000000000074dbd	movlpd	%xmm3, -0x1d0(%rbp)
0000000000074dc5	movups	%xmm8, -0x1c8(%rbp)
0000000000074dcd	movsd	%xmm1, -0x1b8(%rbp)
0000000000074dd5	movsd	%xmm4, -0x1b0(%rbp)
0000000000074ddd	movups	%xmm8, -0x1a8(%rbp)
0000000000074de5	movapd	%xmm6, %xmm4
0000000000074de9	subsd	%xmm0, %xmm4
0000000000074ded	movapd	%xmm4, %xmm0
0000000000074df1	movapd	0x3b597(%rip), %xmm1
0000000000074df9	andpd	%xmm1, %xmm0
0000000000074dfd	movsd	0x3b5ab(%rip), %xmm5
0000000000074e05	ucomisd	%xmm0, %xmm5
0000000000074e09	ja	0x74f3d
0000000000074e0f	subsd	%xmm6, %xmm2
0000000000074e13	movapd	%xmm2, %xmm0
0000000000074e17	andpd	%xmm1, %xmm0
0000000000074e1b	movsd	0x3b58d(%rip), %xmm1
0000000000074e23	ucomisd	%xmm0, %xmm1
0000000000074e27	ja	0x74f3d
0000000000074e2d	movhlps	%xmm3, %xmm7                    ## xmm7 = xmm3[1],xmm7[1]
0000000000074e30	subpd	%xmm7, %xmm3
0000000000074e34	movapd	%xmm2, %xmm0
0000000000074e38	unpcklpd	%xmm4, %xmm0                    ## xmm0 = xmm0[0],xmm4[0]
0000000000074e3c	mulpd	%xmm0, %xmm0
0000000000074e40	movapd	%xmm3, %xmm1
0000000000074e44	mulpd	%xmm3, %xmm1
0000000000074e48	addpd	%xmm0, %xmm1
0000000000074e4c	sqrtpd	%xmm1, %xmm1
0000000000074e50	movapd	%xmm1, %xmm0
0000000000074e54	andpd	0x3b534(%rip), %xmm0
0000000000074e5c	cmpnltpd	0x3c35b(%rip), %xmm0
0000000000074e65	blendpd	$0x2, %xmm3, %xmm4              ## xmm4 = xmm4[0],xmm3[1]
0000000000074e6b	movddup	%xmm1, %xmm5                    ## xmm5 = xmm1[0,0]
0000000000074e6f	unpckhpd	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1]
0000000000074e73	movapd	%xmm4, %xmm6
0000000000074e77	divpd	%xmm1, %xmm6
0000000000074e7b	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
0000000000074e7f	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
0000000000074e83	blendvpd	%xmm0, %xmm6, %xmm4
0000000000074e88	unpcklpd	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0]
0000000000074e8c	movapd	%xmm2, %xmm3
0000000000074e90	divpd	%xmm5, %xmm3
0000000000074e94	movapd	%xmm1, %xmm0
0000000000074e98	blendvpd	%xmm0, %xmm3, %xmm2
0000000000074e9d	mulpd	%xmm4, %xmm2
0000000000074ea1	haddpd	%xmm2, %xmm2
0000000000074ea5	addsd	0x3a67b(%rip), %xmm2
0000000000074ead	andpd	0x3b4db(%rip), %xmm2
0000000000074eb5	movsd	0x3b65b(%rip), %xmm0
0000000000074ebd	ucomisd	%xmm2, %xmm0
0000000000074ec1	jbe	0x74f3d
0000000000074ec3	movsd	-0xb8(%rbp), %xmm0
0000000000074ecb	movsd	-0x98(%rbp), %xmm2
0000000000074ed3	subsd	%xmm0, %xmm2
0000000000074ed7	movsd	0x3c2a1(%rip), %xmm1
0000000000074edf	divsd	%xmm1, %xmm2
0000000000074ee3	cvttsd2si	%xmm2, %rax
0000000000074ee8	movl	%eax, -0x8c(%rbp)
0000000000074eee	movq	%r14, %rdi
0000000000074ef1	leaq	-0x8c(%rbp), %rsi
0000000000074ef8	movq	-0x70(%rbp), %rdx
0000000000074efc	movq	-0x60(%rbp), %rcx
0000000000074f00	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
0000000000074f05	testb	%al, %al
0000000000074f07	je	0x75521
0000000000074f0d	movq	-0x38(%rbp), %rdi
0000000000074f11	movsd	-0xb8(%rbp), %xmm0
0000000000074f19	movsd	0x3c25f(%rip), %xmm1
0000000000074f21	leaq	-0x8c(%rbp), %rsi
0000000000074f28	xorl	%edx, %edx
0000000000074f2a	movq	-0x58(%rbp), %rcx
0000000000074f2e	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
0000000000074f33	testb	%al, %al
0000000000074f35	je	0x75521
0000000000074f3b	jmp	0x74f9f
0000000000074f3d	movsd	-0xb8(%rbp), %xmm0
0000000000074f45	movsd	-0x98(%rbp), %xmm1
0000000000074f4d	subsd	%xmm0, %xmm1
0000000000074f51	movq	-0x70(%rbp), %rax
0000000000074f55	movq	%rax, 0x18(%rsp)
0000000000074f5a	movq	-0x58(%rbp), %rax
0000000000074f5e	movq	%rax, 0x8(%rsp)
0000000000074f63	movq	-0x60(%rbp), %rax
0000000000074f67	movq	%rax, (%rsp)
0000000000074f6b	movq	$0x0, 0x10(%rsp)
0000000000074f74	leaq	-0xf0(%rbp), %rdi
0000000000074f7b	leaq	-0x150(%rbp), %rsi
0000000000074f82	leaq	-0x1d8(%rbp), %rdx
0000000000074f89	leaq	-0x1b8(%rbp), %rcx
0000000000074f90	movl	$0x6, %r8d
0000000000074f96	movq	0x10(%rbp), %r9
0000000000074f9a	callq	0xacb28                         ## symbol stub for: __ZN11PCAlgorithm15BezierSubdivideERK9PCVector4IdES3_S3_S3_iddPK14PCMatrix44TmplIdERNSt3__16vectorIdNS8_9allocatorIdEEEESD_PSC_SD_
0000000000074f9f	movsd	-0x1b8(%rbp), %xmm0
0000000000074fa7	movsd	-0x1b0(%rbp), %xmm1
0000000000074faf	movsd	%xmm0, -0x198(%rbp)
0000000000074fb7	movsd	%xmm1, -0x190(%rbp)
0000000000074fbf	cmpq	%r15, %r13
0000000000074fc2	je	0x75016
0000000000074fc4	cmpq	%r15, -0x50(%rbp)
0000000000074fc8	je	0x74fe8
0000000000074fca	incl	%r12d
0000000000074fcd	leaq	(,%r12,8), %rcx
0000000000074fd5	movq	-0x118(%rbp), %rax
0000000000074fdc	addq	%rcx, %rax
0000000000074fdf	addq	-0x130(%rbp), %rcx
0000000000074fe6	jmp	0x74ffc
0000000000074fe8	cmpb	$0x0, -0x29(%rbp)
0000000000074fec	je	0x75016
0000000000074fee	movq	-0x118(%rbp), %rax
0000000000074ff5	movq	-0x130(%rbp), %rcx
0000000000074ffc	movq	(%rcx), %rcx
0000000000074fff	movq	(%rax), %rax
0000000000075002	movq	-0xc0(%rbp), %r14
0000000000075009	movq	-0x50(%rbp), %rsi
000000000007500d	testq	%rax, %rax
0000000000075010	jne	0x74b77
0000000000075016	movq	0x2a8(%rbx), %rax
000000000007501d	movq	%rax, %rcx
0000000000075020	cmpq	0x2a0(%rbx), %rax
0000000000075027	movq	-0x78(%rbp), %r12
000000000007502b	je	0x7507c
000000000007502d	movsd	-0x68(%rbp), %xmm0
0000000000075032	addsd	-0xb0(%rbp), %xmm0
000000000007503a	leaq	-0xf0(%rbp), %rsi
0000000000075041	movsd	%xmm0, (%rsi)
0000000000075045	movq	-0x70(%rbp), %rdi
0000000000075049	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007504e	leaq	-0x198(%rbp), %rsi
0000000000075055	movq	-0x60(%rbp), %rdi
0000000000075059	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007505e	leaq	-0x190(%rbp), %rsi
0000000000075065	movq	-0x58(%rbp), %rdi
0000000000075069	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007506e	movq	0x2a0(%rbx), %rax
0000000000075075	movq	0x2a8(%rbx), %rcx
000000000007507c	subq	%rax, %rcx
000000000007507f	shrq	$0x3, %rcx
0000000000075083	movq	-0x48(%rbp), %rax
0000000000075087	movl	%ecx, (%rax)
0000000000075089	jmp	0x75164
000000000007508e	cmpl	$0xa, %r14d
0000000000075092	je	0x7509e
0000000000075094	cmpl	$0xc, %r14d
0000000000075098	jne	0x75164
000000000007509e	movsd	0x3c0ca(%rip), %xmm1
00000000000750a6	movsd	-0xb0(%rbp), %xmm0
00000000000750ae	divsd	%xmm1, %xmm0
00000000000750b2	cvttsd2si	%xmm0, %eax
00000000000750b6	xorb	$0x1, %r15b
00000000000750ba	movzbl	%r15b, %ecx
00000000000750be	addl	%eax, %ecx
00000000000750c0	movq	-0x48(%rbp), %rsi
00000000000750c4	movl	%ecx, (%rsi)
00000000000750c6	movq	-0x40(%rbp), %rdi
00000000000750ca	movsd	-0x68(%rbp), %xmm0
00000000000750cf	movq	-0x70(%rbp), %rdx
00000000000750d3	movq	-0x60(%rbp), %rcx
00000000000750d7	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
00000000000750dc	testb	%al, %al
00000000000750de	je	0x75504
00000000000750e4	movsd	0x3c084(%rip), %xmm1
00000000000750ec	movq	-0x38(%rbp), %rdi
00000000000750f0	movsd	-0x68(%rbp), %xmm0
00000000000750f5	movq	-0x48(%rbp), %rsi
00000000000750f9	xorl	%edx, %edx
00000000000750fb	movq	-0x58(%rbp), %rcx
00000000000750ff	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
0000000000075104	jmp	0x7515c
0000000000075106	cvttsd2si	-0xb0(%rbp), %eax
000000000007510e	incl	%eax
0000000000075110	movq	-0x48(%rbp), %rsi
0000000000075114	movl	%eax, (%rsi)
0000000000075116	movsd	0x3a40a(%rip), %xmm1
000000000007511e	movq	-0x40(%rbp), %rdi
0000000000075122	movsd	-0x68(%rbp), %xmm0
0000000000075127	movq	-0x70(%rbp), %rdx
000000000007512b	movq	-0x60(%rbp), %rcx
000000000007512f	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
0000000000075134	testb	%al, %al
0000000000075136	je	0x75504
000000000007513c	movsd	0x3a3e4(%rip), %xmm1
0000000000075144	movq	-0x38(%rbp), %rdi
0000000000075148	movsd	-0x68(%rbp), %xmm0
000000000007514d	movq	-0x48(%rbp), %rsi
0000000000075151	xorl	%edx, %edx
0000000000075153	movq	-0x58(%rbp), %rcx
0000000000075157	callq	__ZN9OZChannel10getSamplesEddRjPNSt3__16vectorIdNS1_9allocatorIdEEEES6_ ## OZChannel::getSamples(double, double, unsigned int&, std::__1::vector<double, std::__1::allocator<double>>*, std::__1::vector<double, std::__1::allocator<double>>*)
000000000007515c	testb	%al, %al
000000000007515e	je	0x75504
0000000000075164	leaq	0x258(%rbx), %rdi
000000000007516b	movq	-0x48(%rbp), %rax
000000000007516f	movl	(%rax), %esi
0000000000075171	movq	%rdi, -0x50(%rbp)
0000000000075175	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
000000000007517a	leaq	-0xf0(%rbp), %rsi
0000000000075181	movq	$0x0, (%rsi)
0000000000075188	movq	-0x50(%rbp), %rdi
000000000007518c	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000075191	movq	-0x48(%rbp), %rax
0000000000075195	movl	(%rax), %r13d
0000000000075198	cmpl	$0x2, %r13d
000000000007519c	jb	0x75213
000000000007519e	movl	$0x1, %r14d
00000000000751a4	leaq	-0xf0(%rbp), %r15
00000000000751ab	movq	-0x50(%rbp), %rdi
00000000000751af	movq	(%rdi), %rax
00000000000751b2	movq	-0x60(%rbp), %rcx
00000000000751b6	movq	(%rcx), %rcx
00000000000751b9	movq	-0x58(%rbp), %rdx
00000000000751bd	movq	(%rdx), %rdx
00000000000751c0	movupd	-0x8(%rcx,%r14,8), %xmm0
00000000000751c7	movupd	-0x8(%rdx,%r14,8), %xmm1
00000000000751ce	movapd	%xmm0, %xmm2
00000000000751d2	unpckhpd	%xmm1, %xmm2                    ## xmm2 = xmm2[1],xmm1[1]
00000000000751d6	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000000751da	subpd	%xmm0, %xmm2
00000000000751de	mulpd	%xmm2, %xmm2
00000000000751e2	haddpd	%xmm2, %xmm2
00000000000751e6	xorps	%xmm0, %xmm0
00000000000751e9	sqrtsd	%xmm2, %xmm0
00000000000751ed	addsd	-0x8(%rax,%r14,8), %xmm0
00000000000751f4	movsd	%xmm0, -0xf0(%rbp)
00000000000751fc	movq	%r15, %rsi
00000000000751ff	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000075204	incq	%r14
0000000000075207	movq	-0x48(%rbp), %rax
000000000007520b	movl	(%rax), %r13d
000000000007520e	cmpq	%r13, %r14
0000000000075211	jb	0x751ab
0000000000075213	leaq	0x240(%rbx), %r15
000000000007521a	cmpq	$0x0, 0x10(%rbp)
000000000007521f	je	0x75399
0000000000075225	movq	0x240(%rbx), %rax
000000000007522c	movq	%rax, 0x248(%rbx)
0000000000075233	movl	%r13d, %esi
0000000000075236	movq	%r15, %rdi
0000000000075239	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE7reserveEm ## std::__1::vector<double, std::__1::allocator<double>>::reserve(unsigned long)
000000000007523e	addq	$0x1c0, %rbx                    ## imm = 0x1C0
0000000000075245	movq	0x10(%rbp), %rcx
0000000000075249	cmpq	%rbx, %rcx
000000000007524c	je	0x75276
000000000007524e	xorl	%eax, %eax
0000000000075250	xorl	%edx, %edx
0000000000075252	movsd	(%rcx,%rdx,8), %xmm0
0000000000075257	movsd	%xmm0, (%rbx,%rdx,8)
000000000007525c	incq	%rdx
000000000007525f	cmpq	$0x4, %rdx
0000000000075263	jne	0x75252
0000000000075265	incq	%rax
0000000000075268	addq	$0x20, %rbx
000000000007526c	addq	$0x20, %rcx
0000000000075270	cmpq	$0x4, %rax
0000000000075274	jne	0x75250
0000000000075276	leaq	-0xf0(%rbp), %rsi
000000000007527d	movq	$0x0, (%rsi)
0000000000075284	movq	%r15, %rdi
0000000000075287	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
000000000007528c	movq	-0x48(%rbp), %rax
0000000000075290	movl	(%rax), %r13d
0000000000075293	cmpl	$0x2, %r13d
0000000000075297	jb	0x75399
000000000007529d	xorpd	%xmm0, %xmm0
00000000000752a1	movhpd	0x3a27f(%rip), %xmm0            ## xmm0 = xmm0[0],mem[0]
00000000000752a9	movapd	%xmm0, -0xb0(%rbp)
00000000000752b1	movl	$0x1, %r14d
00000000000752b7	leaq	-0xf0(%rbp), %rbx
00000000000752be	leaq	-0x150(%rbp), %r12
00000000000752c5	movq	-0x60(%rbp), %rax
00000000000752c9	movq	(%rax), %rax
00000000000752cc	movsd	-0x8(%rax,%r14,8), %xmm0
00000000000752d3	movq	-0x58(%rbp), %rcx
00000000000752d7	movq	(%rcx), %rcx
00000000000752da	movsd	-0x8(%rcx,%r14,8), %xmm1
00000000000752e1	movsd	%xmm0, -0xf0(%rbp)
00000000000752e9	movsd	%xmm1, -0xe8(%rbp)
00000000000752f1	movapd	-0xb0(%rbp), %xmm2
00000000000752f9	movapd	%xmm2, -0xe0(%rbp)
0000000000075301	movsd	(%rax,%r14,8), %xmm0
0000000000075307	movsd	(%rcx,%r14,8), %xmm1
000000000007530d	movsd	%xmm0, -0x150(%rbp)
0000000000075315	movsd	%xmm1, -0x148(%rbp)
000000000007531d	movapd	%xmm2, -0x140(%rbp)
0000000000075325	movq	0x10(%rbp), %r13
0000000000075329	movq	%r13, %rdi
000000000007532c	movq	%rbx, %rsi
000000000007532f	movq	%rbx, %rdx
0000000000075332	callq	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector4IT_ERKS4_S5_ ## PCVector4<double>& PCMatrix44Tmpl<double>::transform<double>(PCVector4<double> const&, PCVector4<double>&) const
0000000000075337	movq	%r13, %rdi
000000000007533a	movq	%r12, %rsi
000000000007533d	movq	%r12, %rdx
0000000000075340	callq	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector4IT_ERKS4_S5_ ## PCVector4<double>& PCMatrix44Tmpl<double>::transform<double>(PCVector4<double> const&, PCVector4<double>&) const
0000000000075345	movq	(%r15), %rax
0000000000075348	movapd	-0x150(%rbp), %xmm0
0000000000075350	subpd	-0xf0(%rbp), %xmm0
0000000000075358	mulpd	%xmm0, %xmm0
000000000007535c	haddpd	%xmm0, %xmm0
0000000000075360	sqrtsd	%xmm0, %xmm0
0000000000075364	addsd	-0x8(%rax,%r14,8), %xmm0
000000000007536b	movsd	%xmm0, -0x1d8(%rbp)
0000000000075373	movq	%r15, %rdi
0000000000075376	leaq	-0x1d8(%rbp), %rsi
000000000007537d	callq	__ZNSt3__16vectorIdNS_9allocatorIdEEE9push_backB9nqe210106EOd ## std::__1::vector<double, std::__1::allocator<double>>::push_back[abi:nqe210106](double&&)
0000000000075382	incq	%r14
0000000000075385	movq	-0x48(%rbp), %rax
0000000000075389	movl	(%rax), %r13d
000000000007538c	cmpq	%r13, %r14
000000000007538f	jb	0x752c5
0000000000075395	movq	-0x78(%rbp), %r12
0000000000075399	movl	%r13d, %ebx
000000000007539c	cmpq	$0x0, -0x80(%rbp)
00000000000753a1	je	0x753b7
00000000000753a3	leaq	(,%rbx,8), %rdi
00000000000753ab	callq	0xace46                         ## symbol stub for: __Znam
00000000000753b0	movq	-0x80(%rbp), %rcx
00000000000753b4	movq	%rax, (%rcx)
00000000000753b7	cmpq	$0x0, -0x88(%rbp)
00000000000753bf	je	0x753d8
00000000000753c1	leaq	(,%rbx,8), %rdi
00000000000753c9	callq	0xace46                         ## symbol stub for: __Znam
00000000000753ce	movq	-0x88(%rbp), %rcx
00000000000753d5	movq	%rax, (%rcx)
00000000000753d8	testq	%r12, %r12
00000000000753db	je	0x753ee
00000000000753dd	leaq	(,%rbx,8), %rdi
00000000000753e5	callq	0xace46                         ## symbol stub for: __Znam
00000000000753ea	movq	%rax, (%r12)
00000000000753ee	movq	-0xc8(%rbp), %rdx
00000000000753f5	testq	%rdx, %rdx
00000000000753f8	je	0x75411
00000000000753fa	leaq	(,%rbx,8), %rdi
0000000000075402	callq	0xace46                         ## symbol stub for: __Znam
0000000000075407	movq	-0xc8(%rbp), %rdx
000000000007540e	movq	%rax, (%rdx)
0000000000075411	testl	%r13d, %r13d
0000000000075414	movq	-0x88(%rbp), %rsi
000000000007541b	movq	-0x80(%rbp), %r8
000000000007541f	movq	-0x40(%rbp), %rdi
0000000000075423	je	0x7549a
0000000000075425	cmpq	$0x0, 0x10(%rbp)
000000000007542a	cmoveq	-0x50(%rbp), %r15
000000000007542f	xorl	%eax, %eax
0000000000075431	testq	%r8, %r8
0000000000075434	je	0x7544a
0000000000075436	movq	-0x70(%rbp), %rcx
000000000007543a	movq	(%rcx), %rcx
000000000007543d	movsd	(%rcx,%rax,8), %xmm0
0000000000075442	movq	(%r8), %rcx
0000000000075445	movsd	%xmm0, (%rcx,%rax,8)
000000000007544a	testq	%rsi, %rsi
000000000007544d	je	0x75463
000000000007544f	movq	-0x60(%rbp), %rcx
0000000000075453	movq	(%rcx), %rcx
0000000000075456	movsd	(%rcx,%rax,8), %xmm0
000000000007545b	movq	(%rsi), %rcx
000000000007545e	movsd	%xmm0, (%rcx,%rax,8)
0000000000075463	testq	%r12, %r12
0000000000075466	je	0x7547d
0000000000075468	movq	-0x58(%rbp), %rcx
000000000007546c	movq	(%rcx), %rcx
000000000007546f	movsd	(%rcx,%rax,8), %xmm0
0000000000075474	movq	(%r12), %rcx
0000000000075478	movsd	%xmm0, (%rcx,%rax,8)
000000000007547d	testq	%rdx, %rdx
0000000000075480	je	0x75492
0000000000075482	movq	(%r15), %rcx
0000000000075485	movsd	(%rcx,%rax,8), %xmm0
000000000007548a	movq	(%rdx), %rcx
000000000007548d	movsd	%xmm0, (%rcx,%rax,8)
0000000000075492	incq	%rax
0000000000075495	cmpq	%rax, %rbx
0000000000075498	jne	0x75431
000000000007549a	movq	-0x158(%rbp), %rax
00000000000754a1	testq	%rax, %rax
00000000000754a4	je	0x754a9
00000000000754a6	movl	%r13d, (%rax)
00000000000754a9	movq	(%rdi), %rax
00000000000754ac	callq	*0x8(%rax)
00000000000754af	movb	$0x1, %bl
00000000000754b1	movq	-0x38(%rbp), %rdi
00000000000754b5	testq	%rdi, %rdi
00000000000754b8	je	0x754c0
00000000000754ba	movq	(%rdi), %rax
00000000000754bd	callq	*0x8(%rax)
00000000000754c0	movq	-0x130(%rbp), %rdi
00000000000754c7	testq	%rdi, %rdi
00000000000754ca	je	0x754d8
00000000000754cc	movq	%rdi, -0x128(%rbp)
00000000000754d3	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000754d8	movq	-0x118(%rbp), %rdi
00000000000754df	testq	%rdi, %rdi
00000000000754e2	je	0x754f0
00000000000754e4	movq	%rdi, -0x110(%rbp)
00000000000754eb	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000754f0	movl	%ebx, %eax
00000000000754f2	addq	$0x268, %rsp                    ## imm = 0x268
00000000000754f9	popq	%rbx
00000000000754fa	popq	%r12
00000000000754fc	popq	%r13
00000000000754fe	popq	%r14
0000000000075500	popq	%r15
0000000000075502	popq	%rbp
0000000000075503	retq
0000000000075504	movq	-0x40(%rbp), %rdi
0000000000075508	movq	(%rdi), %rax
000000000007550b	callq	*0x8(%rax)
000000000007550e	movq	-0x38(%rbp), %rdi
0000000000075512	testq	%rdi, %rdi
0000000000075515	je	0x7551d
0000000000075517	movq	(%rdi), %rax
000000000007551a	callq	*0x8(%rax)
000000000007551d	xorl	%ebx, %ebx
000000000007551f	jmp	0x754c0
0000000000075521	movq	(%r14), %rax
0000000000075524	movq	%r14, %rdi
0000000000075527	jmp	0x7550b
0000000000075529	jmp	0x75542
000000000007552b	jmp	0x75542
000000000007552d	jmp	0x75542
000000000007552f	jmp	0x75542
0000000000075531	jmp	0x75542
0000000000075533	jmp	0x75542
0000000000075535	movq	%rax, %rbx
0000000000075538	jmp	0x7555d
000000000007553a	jmp	0x75542
000000000007553c	jmp	0x75542
000000000007553e	jmp	0x75542
0000000000075540	jmp	0x75542
0000000000075542	movq	%rax, %rbx
0000000000075545	movq	-0x130(%rbp), %rdi
000000000007554c	testq	%rdi, %rdi
000000000007554f	je	0x7555d
0000000000075551	movq	%rdi, -0x128(%rbp)
0000000000075558	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000007555d	movq	-0x118(%rbp), %rdi
0000000000075564	testq	%rdi, %rdi
0000000000075567	je	0x75575
0000000000075569	movq	%rdi, -0x110(%rbp)
0000000000075570	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000075575	movq	%rbx, %rdi
0000000000075578	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000007557d	nop
