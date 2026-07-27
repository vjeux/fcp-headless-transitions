__ZN17OZChannelPosition17getPositionOnPathERK6CMTimedPdS3_S3_S3_S3_P14PCMatrix44TmplIdE:
000000000007557e	pushq	%rbp
000000000007557f	movq	%rsp, %rbp
0000000000075582	pushq	%r15
0000000000075584	pushq	%r14
0000000000075586	pushq	%r13
0000000000075588	pushq	%r12
000000000007558a	pushq	%rbx
000000000007558b	subq	$0x158, %rsp                    ## imm = 0x158
0000000000075592	movq	%r9, -0x130(%rbp)
0000000000075599	movq	%r8, -0xd8(%rbp)
00000000000755a0	movq	%rcx, -0xc0(%rbp)
00000000000755a7	movq	%rdx, -0xc8(%rbp)
00000000000755ae	movapd	%xmm0, -0x60(%rbp)
00000000000755b3	movq	%rdi, %r13
00000000000755b6	xorl	%ebx, %ebx
00000000000755b8	movl	%ebx, -0xd0(%rbp)
00000000000755be	movl	%ebx, -0xcc(%rbp)
00000000000755c4	leaq	0x88(%rdi), %r14
00000000000755cb	movq	0x88(%rdi), %rax
00000000000755d2	movq	%r14, %rdi
00000000000755d5	callq	*0x340(%rax)
00000000000755db	movl	%eax, %r15d
00000000000755de	leaq	0x120(%r13), %r12
00000000000755e5	movq	0x120(%r13), %rax
00000000000755ec	movq	%r12, %rdi
00000000000755ef	callq	*0x340(%rax)
00000000000755f5	cmpl	%eax, %r15d
00000000000755f8	jne	0x762df
00000000000755fe	movq	(%r14), %rax
0000000000075601	movq	%r14, %rdi
0000000000075604	callq	*0x340(%rax)
000000000007560a	testl	%eax, %eax
000000000007560c	je	0x757a9
0000000000075612	movq	(%r12), %rax
0000000000075616	movq	%r12, %rdi
0000000000075619	callq	*0x340(%rax)
000000000007561f	testl	%eax, %eax
0000000000075621	je	0x757a9
0000000000075627	movq	(%r14), %rax
000000000007562a	movq	%r14, %rdi
000000000007562d	callq	*0xf8(%rax)
0000000000075633	movq	%rax, %r14
0000000000075636	movq	(%r12), %rax
000000000007563a	movq	%r12, %rdi
000000000007563d	callq	*0xf8(%rax)
0000000000075643	movq	%rax, %r15
0000000000075646	movq	(%r14), %rax
0000000000075649	movq	%r14, %rdi
000000000007564c	callq	*0x340(%rax)
0000000000075652	movl	%eax, %r12d
0000000000075655	leaq	-0x148(%rbp), %rdi
000000000007565c	movq	%r14, %rsi
000000000007565f	xorl	%edx, %edx
0000000000075661	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000075666	leaq	-0x128(%rbp), %rdi
000000000007566d	movq	%r15, %rsi
0000000000075670	xorl	%edx, %edx
0000000000075672	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000075677	xorl	%eax, %eax
0000000000075679	movq	%rax, -0x98(%rbp)
0000000000075680	movq	%rax, -0x90(%rbp)
0000000000075687	movq	%rax, -0xb8(%rbp)
000000000007568e	movq	%rax, -0xf8(%rbp)
0000000000075695	leaq	0x2bc(%r13), %rbx
000000000007569c	movq	%rbx, %rdi
000000000007569f	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
00000000000756a4	movq	0x18(%rbp), %rax
00000000000756a8	movq	%rax, (%rsp)
00000000000756ac	leaq	-0xb8(%rbp), %rsi
00000000000756b3	leaq	-0x98(%rbp), %rdx
00000000000756ba	leaq	-0x90(%rbp), %rcx
00000000000756c1	leaq	-0xf8(%rbp), %r8
00000000000756c8	leaq	-0xcc(%rbp), %r9
00000000000756cf	movq	%r13, %rdi
00000000000756d2	callq	__ZN17OZChannelPosition16getCachedVectorsEPPdS1_S1_S1_PiP14PCMatrix44TmplIdE ## OZChannelPosition::getCachedVectors(double**, double**, double**, double**, int*, PCMatrix44Tmpl<double>*)
00000000000756d7	movq	%rbx, %rdi
00000000000756da	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
00000000000756df	movslq	-0xcc(%rbp), %rbx
00000000000756e6	xorpd	%xmm0, %xmm0
00000000000756ea	movapd	%xmm0, -0xb0(%rbp)
00000000000756f2	cmpq	$0x2, %rbx
00000000000756f6	jl	0x7570d
00000000000756f8	movq	-0xf8(%rbp), %rax
00000000000756ff	movsd	-0x8(%rax,%rbx,8), %xmm0
0000000000075705	movapd	%xmm0, -0xb0(%rbp)
000000000007570d	movq	%r14, %rdi
0000000000075710	callq	__ZNK9OZChannel23isParametricCurveClosedEv ## OZChannel::isParametricCurveClosed() const
0000000000075715	movb	%al, -0x29(%rbp)
0000000000075718	movq	%r14, %rdi
000000000007571b	callq	__ZN9OZChannel16getInterpolationEv ## OZChannel::getInterpolation()
0000000000075720	movapd	0x3ac68(%rip), %xmm0
0000000000075728	andpd	-0xb0(%rbp), %xmm0
0000000000075730	movsd	0x3ac78(%rip), %xmm1
0000000000075738	ucomisd	%xmm0, %xmm1
000000000007573c	jbe	0x757b0
000000000007573e	cmpq	$0x0, -0xc8(%rbp)
0000000000075746	je	0x75767
0000000000075748	movq	0x54d71(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000007574f	movq	%r14, %rdi
0000000000075752	movl	$0x1, %edx
0000000000075757	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
000000000007575c	movq	-0xc8(%rbp), %rax
0000000000075763	movsd	%xmm0, (%rax)
0000000000075767	cmpq	$0x0, -0xc0(%rbp)
000000000007576f	je	0x75790
0000000000075771	movq	0x54d48(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
0000000000075778	movq	%r15, %rdi
000000000007577b	movl	$0x1, %edx
0000000000075780	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000075785	movq	-0xc0(%rbp), %rax
000000000007578c	movsd	%xmm0, (%rax)
0000000000075790	movq	0x10(%rbp), %rax
0000000000075794	testq	%rax, %rax
0000000000075797	je	0x76252
000000000007579d	movq	$0x0, (%rax)
00000000000757a4	jmp	0x76252
00000000000757a9	xorl	%ebx, %ebx
00000000000757ab	jmp	0x762df
00000000000757b0	xorpd	%xmm0, %xmm0
00000000000757b4	movapd	-0x60(%rbp), %xmm1
00000000000757b9	ucomisd	%xmm1, %xmm0
00000000000757bd	jbe	0x75851
00000000000757c3	xorl	%ecx, %ecx
00000000000757c5	movq	%rcx, -0x38(%rbp)
00000000000757c9	movq	%rcx, -0x40(%rbp)
00000000000757cd	movq	%rcx, -0x50(%rbp)
00000000000757d1	movq	%rcx, -0x48(%rbp)
00000000000757d5	movq	0x54ce4(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
00000000000757dc	movq	0x10(%rcx), %rdx
00000000000757e0	movq	%rdx, -0x70(%rbp)
00000000000757e4	movupd	(%rcx), %xmm0
00000000000757e8	movapd	%xmm0, -0x80(%rbp)
00000000000757ed	cmpb	$0x0, -0x29(%rbp)
00000000000757f1	je	0x758f5
00000000000757f7	movaps	-0x60(%rbp), %xmm0
00000000000757fb	xorps	0x3ae3e(%rip), %xmm0
0000000000075802	movaps	%xmm0, -0x60(%rbp)
0000000000075806	movapd	0x3ab82(%rip), %xmm0
000000000007580e	movapd	-0x60(%rbp), %xmm2
0000000000075813	movapd	%xmm2, %xmm1
0000000000075817	movapd	-0xb0(%rbp), %xmm3
000000000007581f	ucomisd	%xmm3, %xmm2
0000000000075823	subsd	%xmm3, %xmm2
0000000000075827	movapd	%xmm2, -0x60(%rbp)
000000000007582c	andpd	%xmm0, %xmm2
0000000000075830	ja	0x7580e
0000000000075832	movsd	0x3ab76(%rip), %xmm3
000000000007583a	ucomisd	%xmm2, %xmm3
000000000007583e	ja	0x7580e
0000000000075840	movapd	-0xb0(%rbp), %xmm0
0000000000075848	subsd	%xmm1, %xmm0
000000000007584c	jmp	0x75f9f
0000000000075851	movapd	-0xb0(%rbp), %xmm2
0000000000075859	ucomisd	%xmm2, %xmm1
000000000007585d	ja	0x75882
000000000007585f	movapd	-0x60(%rbp), %xmm0
0000000000075864	subsd	%xmm2, %xmm0
0000000000075868	andpd	0x3ab20(%rip), %xmm0
0000000000075870	movsd	0x3ab38(%rip), %xmm1
0000000000075878	ucomisd	%xmm0, %xmm1
000000000007587c	jbe	0x75fae
0000000000075882	xorl	%ecx, %ecx
0000000000075884	movq	%rcx, -0x38(%rbp)
0000000000075888	movq	%rcx, -0x40(%rbp)
000000000007588c	movq	%rcx, -0x50(%rbp)
0000000000075890	movq	%rcx, -0x48(%rbp)
0000000000075894	movq	0x54c25(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
000000000007589b	movq	0x10(%rcx), %rdx
000000000007589f	movq	%rdx, -0x70(%rbp)
00000000000758a3	movupd	(%rcx), %xmm0
00000000000758a7	movapd	%xmm0, -0x80(%rbp)
00000000000758ac	cmpb	$0x0, -0x29(%rbp)
00000000000758b0	je	0x75a59
00000000000758b6	movapd	0x3aad2(%rip), %xmm1
00000000000758be	movapd	-0x60(%rbp), %xmm2
00000000000758c3	movapd	%xmm2, %xmm0
00000000000758c7	movapd	-0xb0(%rbp), %xmm3
00000000000758cf	ucomisd	%xmm3, %xmm2
00000000000758d3	subsd	%xmm3, %xmm2
00000000000758d7	movapd	%xmm2, -0x60(%rbp)
00000000000758dc	andpd	%xmm1, %xmm2
00000000000758e0	ja	0x758be
00000000000758e2	movsd	0x3aac6(%rip), %xmm3
00000000000758ea	ucomisd	%xmm2, %xmm3
00000000000758ee	ja	0x758be
00000000000758f0	jmp	0x75f9f
00000000000758f5	movq	-0x148(%rbp), %rcx
00000000000758fc	movq	(%rcx), %rsi
00000000000758ff	cmpl	$0x4, %eax
0000000000075902	movq	-0xd8(%rbp), %r12
0000000000075909	jne	0x75bde
000000000007590f	leaq	-0x38(%rbp), %rcx
0000000000075913	movq	%r14, %rdi
0000000000075916	xorl	%edx, %edx
0000000000075918	movl	$0x1, %r8d
000000000007591e	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000075923	movq	-0x128(%rbp), %rax
000000000007592a	movq	(%rax), %rsi
000000000007592d	leaq	-0x40(%rbp), %rcx
0000000000075931	movq	%r15, %rdi
0000000000075934	xorl	%edx, %edx
0000000000075936	movl	$0x1, %r8d
000000000007593c	callq	__ZN9OZChannel25getKeyframeOutputTangentsEPvPdS1_b ## OZChannel::getKeyframeOutputTangents(void*, double*, double*, bool)
0000000000075941	movq	-0x148(%rbp), %rax
0000000000075948	movq	(%rax), %rsi
000000000007594b	leaq	-0x80(%rbp), %rdx
000000000007594f	leaq	-0x50(%rbp), %rcx
0000000000075953	movq	%r14, %rdi
0000000000075956	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000007595b	movq	-0x128(%rbp), %rax
0000000000075962	movq	(%rax), %rsi
0000000000075965	leaq	-0x48(%rbp), %rcx
0000000000075969	movq	%r15, %rdi
000000000007596c	xorl	%edx, %edx
000000000007596e	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075973	leaq	-0xf0(%rbp), %rdi
000000000007597a	movl	$0x1, %esi
000000000007597f	movl	$0x32, %edx
0000000000075984	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000075989	movq	-0xe0(%rbp), %rax
0000000000075990	movq	%rax, 0x28(%rsp)
0000000000075995	movups	-0xf0(%rbp), %xmm0
000000000007599c	movups	%xmm0, 0x18(%rsp)
00000000000759a1	movq	-0x70(%rbp), %rax
00000000000759a5	movq	%rax, 0x10(%rsp)
00000000000759aa	movapd	-0x80(%rbp), %xmm0
00000000000759af	movupd	%xmm0, (%rsp)
00000000000759b4	leaq	-0x110(%rbp), %rdi
00000000000759bb	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000759c0	leaq	-0x110(%rbp), %rsi
00000000000759c7	movq	%r14, %rdi
00000000000759ca	movl	$0x1, %edx
00000000000759cf	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
00000000000759d4	movsd	%xmm0, -0xb0(%rbp)
00000000000759dc	leaq	-0xf0(%rbp), %rdi
00000000000759e3	movl	$0x1, %esi
00000000000759e8	movl	$0x32, %edx
00000000000759ed	callq	0xaca92                         ## symbol stub for: _CMTimeMake
00000000000759f2	movq	-0xe0(%rbp), %rax
00000000000759f9	movq	%rax, 0x28(%rsp)
00000000000759fe	movups	-0xf0(%rbp), %xmm0
0000000000075a05	movups	%xmm0, 0x18(%rsp)
0000000000075a0a	movq	-0x70(%rbp), %rax
0000000000075a0e	movq	%rax, 0x10(%rsp)
0000000000075a13	movapd	-0x80(%rbp), %xmm0
0000000000075a18	movupd	%xmm0, (%rsp)
0000000000075a1d	leaq	-0x110(%rbp), %rdi
0000000000075a24	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000075a29	leaq	-0x110(%rbp), %rsi
0000000000075a30	movq	%r15, %rdi
0000000000075a33	movl	$0x1, %edx
0000000000075a38	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000075a3d	movsd	-0x38(%rbp), %xmm1
0000000000075a42	xorpd	0x3abf6(%rip), %xmm1
0000000000075a4a	movlpd	%xmm1, -0x38(%rbp)
0000000000075a4f	movsd	-0x40(%rbp), %xmm3
0000000000075a54	jmp	0x75c67
0000000000075a59	movq	%r15, -0x88(%rbp)
0000000000075a60	movq	-0x148(%rbp), %rcx
0000000000075a67	movslq	%r12d, %r15
0000000000075a6a	cmpl	$0x4, %eax
0000000000075a6d	jne	0x75db2
0000000000075a73	movq	-0x8(%rcx,%r15,8), %rsi
0000000000075a78	leaq	-0x38(%rbp), %rcx
0000000000075a7c	movq	%r14, %rdi
0000000000075a7f	xorl	%edx, %edx
0000000000075a81	movl	$0x1, %r8d
0000000000075a87	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000075a8c	movq	-0xd8(%rbp), %r12
0000000000075a93	decq	%r15
0000000000075a96	movq	-0x128(%rbp), %rax
0000000000075a9d	movq	(%rax,%r15,8), %rsi
0000000000075aa1	leaq	-0x40(%rbp), %rcx
0000000000075aa5	movq	-0x88(%rbp), %rdi
0000000000075aac	xorl	%edx, %edx
0000000000075aae	movl	$0x1, %r8d
0000000000075ab4	callq	__ZN9OZChannel24getKeyframeInputTangentsEPvPdS1_b ## OZChannel::getKeyframeInputTangents(void*, double*, double*, bool)
0000000000075ab9	movq	-0x148(%rbp), %rax
0000000000075ac0	movq	(%rax,%r15,8), %rsi
0000000000075ac4	leaq	-0x80(%rbp), %rdx
0000000000075ac8	leaq	-0x50(%rbp), %rcx
0000000000075acc	movq	%r14, %rdi
0000000000075acf	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075ad4	movq	-0x128(%rbp), %rax
0000000000075adb	movq	(%rax,%r15,8), %rsi
0000000000075adf	leaq	-0x48(%rbp), %rcx
0000000000075ae3	movq	-0x88(%rbp), %rdi
0000000000075aea	xorl	%edx, %edx
0000000000075aec	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075af1	leaq	-0xf0(%rbp), %rdi
0000000000075af8	movl	$0x1, %esi
0000000000075afd	movl	$0x32, %edx
0000000000075b02	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000075b07	movq	-0xe0(%rbp), %rax
0000000000075b0e	movq	%rax, 0x28(%rsp)
0000000000075b13	movups	-0xf0(%rbp), %xmm0
0000000000075b1a	movups	%xmm0, 0x18(%rsp)
0000000000075b1f	movq	-0x70(%rbp), %rax
0000000000075b23	movq	%rax, 0x10(%rsp)
0000000000075b28	movapd	-0x80(%rbp), %xmm0
0000000000075b2d	movupd	%xmm0, (%rsp)
0000000000075b32	leaq	-0x110(%rbp), %rdi
0000000000075b39	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000075b3e	leaq	-0x110(%rbp), %rsi
0000000000075b45	movq	%r14, %rdi
0000000000075b48	movl	$0x1, %edx
0000000000075b4d	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000075b52	movsd	%xmm0, -0x150(%rbp)
0000000000075b5a	leaq	-0xf0(%rbp), %rdi
0000000000075b61	movl	$0x1, %esi
0000000000075b66	movl	$0x32, %edx
0000000000075b6b	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000075b70	movq	-0x88(%rbp), %r15
0000000000075b77	movq	-0xe0(%rbp), %rax
0000000000075b7e	movq	%rax, 0x28(%rsp)
0000000000075b83	movups	-0xf0(%rbp), %xmm0
0000000000075b8a	movups	%xmm0, 0x18(%rsp)
0000000000075b8f	movq	-0x70(%rbp), %rax
0000000000075b93	movq	%rax, 0x10(%rsp)
0000000000075b98	movapd	-0x80(%rbp), %xmm0
0000000000075b9d	movupd	%xmm0, (%rsp)
0000000000075ba2	leaq	-0x110(%rbp), %rdi
0000000000075ba9	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000075bae	leaq	-0x110(%rbp), %rsi
0000000000075bb5	movq	%r15, %rdi
0000000000075bb8	movl	$0x1, %edx
0000000000075bbd	callq	__ZN9OZChannel13getCurveValueERK6CMTimeb ## OZChannel::getCurveValue(CMTime const&, bool)
0000000000075bc2	movsd	-0x38(%rbp), %xmm1
0000000000075bc7	xorpd	0x3aa71(%rip), %xmm1
0000000000075bcf	movlpd	%xmm1, -0x38(%rbp)
0000000000075bd4	movsd	-0x40(%rbp), %xmm3
0000000000075bd9	jmp	0x75e5d
0000000000075bde	leaq	-0x80(%rbp), %rdx
0000000000075be2	leaq	-0x50(%rbp), %rcx
0000000000075be6	movq	%r14, %rdi
0000000000075be9	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075bee	movq	-0x128(%rbp), %rax
0000000000075bf5	movq	(%rax), %rsi
0000000000075bf8	leaq	-0x48(%rbp), %rcx
0000000000075bfc	movq	%r15, %rdi
0000000000075bff	xorl	%edx, %edx
0000000000075c01	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075c06	movq	-0x148(%rbp), %rax
0000000000075c0d	movq	0x8(%rax), %rsi
0000000000075c11	leaq	-0x80(%rbp), %rdx
0000000000075c15	leaq	-0x38(%rbp), %rcx
0000000000075c19	movq	%r14, %rdi
0000000000075c1c	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075c21	movq	-0x128(%rbp), %rax
0000000000075c28	movq	0x8(%rax), %rsi
0000000000075c2c	leaq	-0x40(%rbp), %rcx
0000000000075c30	movq	%r15, %rdi
0000000000075c33	xorl	%edx, %edx
0000000000075c35	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075c3a	movsd	-0x38(%rbp), %xmm1
0000000000075c3f	subsd	-0x50(%rbp), %xmm1
0000000000075c44	xorpd	0x3a9f4(%rip), %xmm1
0000000000075c4c	movlpd	%xmm1, -0x38(%rbp)
0000000000075c51	movsd	-0x40(%rbp), %xmm3
0000000000075c56	subsd	-0x48(%rbp), %xmm3
0000000000075c5b	xorpd	%xmm0, %xmm0
0000000000075c5f	movsd	%xmm0, -0xb0(%rbp)
0000000000075c67	movapd	0x3a9d1(%rip), %xmm2
0000000000075c6f	xorpd	%xmm3, %xmm2
0000000000075c73	movlpd	%xmm2, -0x40(%rbp)
0000000000075c78	movapd	%xmm1, %xmm4
0000000000075c7c	mulsd	%xmm1, %xmm4
0000000000075c80	mulsd	%xmm3, %xmm3
0000000000075c84	addsd	%xmm4, %xmm3
0000000000075c88	sqrtsd	%xmm3, %xmm5
0000000000075c8c	movsd	0x3ae0c(%rip), %xmm3
0000000000075c94	ucomisd	%xmm5, %xmm3
0000000000075c98	jae	0x75ca0
0000000000075c9a	movapd	%xmm5, %xmm3
0000000000075c9e	jmp	0x75cd8
0000000000075ca0	movsd	-0x50(%rbp), %xmm1
0000000000075ca5	subsd	-0xb0(%rbp), %xmm1
0000000000075cad	movsd	%xmm1, -0x38(%rbp)
0000000000075cb2	movsd	-0x48(%rbp), %xmm2
0000000000075cb7	subsd	%xmm0, %xmm2
0000000000075cbb	movsd	%xmm2, -0x40(%rbp)
0000000000075cc0	movapd	%xmm1, %xmm0
0000000000075cc4	mulsd	%xmm1, %xmm0
0000000000075cc8	movapd	%xmm2, %xmm3
0000000000075ccc	mulsd	%xmm2, %xmm3
0000000000075cd0	addsd	%xmm0, %xmm3
0000000000075cd4	sqrtsd	%xmm3, %xmm3
0000000000075cd8	movapd	-0x60(%rbp), %xmm0
0000000000075cdd	movsd	%xmm3, -0xb0(%rbp)
0000000000075ce5	divsd	%xmm3, %xmm0
0000000000075ce9	movq	-0xc8(%rbp), %rax
0000000000075cf0	testq	%rax, %rax
0000000000075cf3	je	0x75d06
0000000000075cf5	movsd	-0x50(%rbp), %xmm3
0000000000075cfa	mulsd	%xmm0, %xmm1
0000000000075cfe	subsd	%xmm1, %xmm3
0000000000075d02	movsd	%xmm3, (%rax)
0000000000075d06	movq	-0xc0(%rbp), %rax
0000000000075d0d	testq	%rax, %rax
0000000000075d10	je	0x75d23
0000000000075d12	movsd	-0x48(%rbp), %xmm1
0000000000075d17	mulsd	%xmm2, %xmm0
0000000000075d1b	subsd	%xmm0, %xmm1
0000000000075d1f	movsd	%xmm1, (%rax)
0000000000075d23	cmpq	$0x0, 0x10(%rbp)
0000000000075d28	je	0x75d4a
0000000000075d2a	movq	-0x70(%rbp), %rax
0000000000075d2e	movq	%rax, 0x10(%rsp)
0000000000075d33	movapd	-0x80(%rbp), %xmm0
0000000000075d38	movupd	%xmm0, (%rsp)
0000000000075d3d	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000075d42	movq	0x10(%rbp), %rax
0000000000075d46	movsd	%xmm0, (%rax)
0000000000075d4a	testq	%r12, %r12
0000000000075d4d	sete	%al
0000000000075d50	movq	-0x130(%rbp), %rdx
0000000000075d57	testq	%rdx, %rdx
0000000000075d5a	sete	%cl
0000000000075d5d	orb	%al, %cl
0000000000075d5f	jne	0x75fa4
0000000000075d65	movsd	-0x38(%rbp), %xmm0
0000000000075d6a	movapd	0x3a8ce(%rip), %xmm1
0000000000075d72	xorpd	%xmm1, %xmm0
0000000000075d76	movsd	-0xb0(%rbp), %xmm2
0000000000075d7e	divsd	%xmm2, %xmm0
0000000000075d82	movsd	%xmm0, (%r12)
0000000000075d88	movsd	-0x40(%rbp), %xmm0
0000000000075d8d	xorpd	%xmm1, %xmm0
0000000000075d91	divsd	%xmm2, %xmm0
0000000000075d95	movsd	%xmm0, (%rdx)
0000000000075d99	movsd	(%r12), %xmm2
0000000000075d9f	xorpd	%xmm1, %xmm0
0000000000075da3	movlpd	%xmm0, (%r12)
0000000000075da9	movsd	%xmm2, (%rdx)
0000000000075dad	jmp	0x75fa4
0000000000075db2	movq	-0x10(%rcx,%r15,8), %rsi
0000000000075db7	leaq	-0x38(%rbp), %rcx
0000000000075dbb	movq	%r14, %rdi
0000000000075dbe	xorl	%edx, %edx
0000000000075dc0	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075dc5	movq	-0xd8(%rbp), %r12
0000000000075dcc	leaq	-0x2(%r15), %rax
0000000000075dd0	movq	-0x128(%rbp), %rcx
0000000000075dd7	movq	(%rcx,%rax,8), %rsi
0000000000075ddb	leaq	-0x40(%rbp), %rcx
0000000000075ddf	movq	-0x88(%rbp), %rdi
0000000000075de6	xorl	%edx, %edx
0000000000075de8	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075ded	movq	-0x148(%rbp), %rax
0000000000075df4	movq	-0x8(%rax,%r15,8), %rsi
0000000000075df9	leaq	-0x80(%rbp), %rdx
0000000000075dfd	leaq	-0x50(%rbp), %rcx
0000000000075e01	movq	%r14, %rdi
0000000000075e04	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075e09	decq	%r15
0000000000075e0c	movq	-0x128(%rbp), %rax
0000000000075e13	movq	(%rax,%r15,8), %rsi
0000000000075e17	leaq	-0x48(%rbp), %rcx
0000000000075e1b	movq	-0x88(%rbp), %rdi
0000000000075e22	xorl	%edx, %edx
0000000000075e24	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000075e29	movsd	-0x38(%rbp), %xmm1
0000000000075e2e	subsd	-0x50(%rbp), %xmm1
0000000000075e33	xorpd	0x3a805(%rip), %xmm1
0000000000075e3b	movlpd	%xmm1, -0x38(%rbp)
0000000000075e40	movsd	-0x40(%rbp), %xmm3
0000000000075e45	subsd	-0x48(%rbp), %xmm3
0000000000075e4a	xorpd	%xmm0, %xmm0
0000000000075e4e	movsd	%xmm0, -0x150(%rbp)
0000000000075e56	movq	-0x88(%rbp), %r15
0000000000075e5d	movapd	0x3a7db(%rip), %xmm2
0000000000075e65	xorpd	%xmm3, %xmm2
0000000000075e69	movlpd	%xmm2, -0x40(%rbp)
0000000000075e6e	movapd	%xmm1, %xmm4
0000000000075e72	mulsd	%xmm1, %xmm4
0000000000075e76	mulsd	%xmm3, %xmm3
0000000000075e7a	addsd	%xmm4, %xmm3
0000000000075e7e	sqrtsd	%xmm3, %xmm5
0000000000075e82	movsd	0x3ac16(%rip), %xmm3
0000000000075e8a	ucomisd	%xmm5, %xmm3
0000000000075e8e	jae	0x75e96
0000000000075e90	movapd	%xmm5, %xmm3
0000000000075e94	jmp	0x75ece
0000000000075e96	movsd	-0x50(%rbp), %xmm1
0000000000075e9b	subsd	-0x150(%rbp), %xmm1
0000000000075ea3	movsd	%xmm1, -0x38(%rbp)
0000000000075ea8	movsd	-0x48(%rbp), %xmm2
0000000000075ead	subsd	%xmm0, %xmm2
0000000000075eb1	movsd	%xmm2, -0x40(%rbp)
0000000000075eb6	movapd	%xmm1, %xmm0
0000000000075eba	mulsd	%xmm1, %xmm0
0000000000075ebe	movapd	%xmm2, %xmm3
0000000000075ec2	mulsd	%xmm2, %xmm3
0000000000075ec6	addsd	%xmm0, %xmm3
0000000000075eca	sqrtsd	%xmm3, %xmm3
0000000000075ece	movapd	-0x60(%rbp), %xmm0
0000000000075ed3	subsd	-0xb0(%rbp), %xmm0
0000000000075edb	movsd	%xmm3, -0xb0(%rbp)
0000000000075ee3	divsd	%xmm3, %xmm0
0000000000075ee7	movq	-0xc8(%rbp), %rax
0000000000075eee	testq	%rax, %rax
0000000000075ef1	je	0x75f00
0000000000075ef3	mulsd	%xmm0, %xmm1
0000000000075ef7	addsd	-0x50(%rbp), %xmm1
0000000000075efc	movsd	%xmm1, (%rax)
0000000000075f00	movq	-0xc0(%rbp), %rax
0000000000075f07	testq	%rax, %rax
0000000000075f0a	je	0x75f19
0000000000075f0c	mulsd	%xmm2, %xmm0
0000000000075f10	addsd	-0x48(%rbp), %xmm0
0000000000075f15	movsd	%xmm0, (%rax)
0000000000075f19	cmpq	$0x0, 0x10(%rbp)
0000000000075f1e	je	0x75f47
0000000000075f20	movq	-0x70(%rbp), %rax
0000000000075f24	movq	%rax, 0x10(%rsp)
0000000000075f29	movapd	-0x80(%rbp), %xmm0
0000000000075f2e	movupd	%xmm0, (%rsp)
0000000000075f33	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000075f38	movq	0x10(%rbp), %rax
0000000000075f3c	movsd	%xmm0, (%rax)
0000000000075f40	movq	-0x88(%rbp), %r15
0000000000075f47	testq	%r12, %r12
0000000000075f4a	sete	%al
0000000000075f4d	movq	-0x130(%rbp), %rdx
0000000000075f54	testq	%rdx, %rdx
0000000000075f57	sete	%cl
0000000000075f5a	orb	%al, %cl
0000000000075f5c	jne	0x75f9a
0000000000075f5e	movsd	-0x38(%rbp), %xmm0
0000000000075f63	movsd	-0xb0(%rbp), %xmm1
0000000000075f6b	divsd	%xmm1, %xmm0
0000000000075f6f	movsd	%xmm0, (%r12)
0000000000075f75	movsd	-0x40(%rbp), %xmm0
0000000000075f7a	divsd	%xmm1, %xmm0
0000000000075f7e	movsd	%xmm0, (%rdx)
0000000000075f82	xorpd	0x3a6b6(%rip), %xmm0
0000000000075f8a	movsd	(%r12), %xmm1
0000000000075f90	movlpd	%xmm0, (%r12)
0000000000075f96	movsd	%xmm1, (%rdx)
0000000000075f9a	movapd	-0x60(%rbp), %xmm0
0000000000075f9f	movapd	%xmm0, -0x60(%rbp)
0000000000075fa4	cmpb	$0x0, -0x29(%rbp)
0000000000075fa8	je	0x76252
0000000000075fae	movq	-0xf8(%rbp), %r12
0000000000075fb5	leaq	-0xd0(%rbp), %rdx
0000000000075fbc	movq	%r12, %rdi
0000000000075fbf	movl	%ebx, %esi
0000000000075fc1	movapd	-0x60(%rbp), %xmm0
0000000000075fc6	callq	0xacb3a                         ## symbol stub for: __ZN11PCAlgorithm6bisectEPdjdPi
0000000000075fcb	movslq	-0xd0(%rbp), %rax
0000000000075fd2	movsd	(%r12,%rax,8), %xmm2
0000000000075fd8	movapd	-0x60(%rbp), %xmm3
0000000000075fdd	subsd	%xmm2, %xmm3
0000000000075fe1	movapd	0x3a3a7(%rip), %xmm0
0000000000075fe9	andpd	%xmm3, %xmm0
0000000000075fed	movsd	0x3a3bb(%rip), %xmm1
0000000000075ff5	ucomisd	%xmm0, %xmm1
0000000000075ff9	jbe	0x76021
0000000000075ffb	movq	-0xb8(%rbp), %rcx
0000000000076002	movq	-0x98(%rbp), %rdx
0000000000076009	movq	-0x90(%rbp), %rsi
0000000000076010	movsd	(%rsi,%rax,8), %xmm1
0000000000076015	movsd	(%rdx,%rax,8), %xmm0
000000000007601a	movhpd	(%rcx,%rax,8), %xmm0            ## xmm0 = xmm0[0],mem[0]
000000000007601f	jmp	0x76029
0000000000076021	xorpd	%xmm0, %xmm0
0000000000076025	xorpd	%xmm1, %xmm1
0000000000076029	movapd	-0x60(%rbp), %xmm4
000000000007602e	ucomisd	%xmm4, %xmm2
0000000000076032	jbe	0x76062
0000000000076034	movsd	-0x8(%r12,%rax,8), %xmm0
000000000007603b	subsd	%xmm0, %xmm2
000000000007603f	movapd	0x3a349(%rip), %xmm1
0000000000076047	andpd	%xmm2, %xmm1
000000000007604b	movsd	0x3a35d(%rip), %xmm3
0000000000076053	ucomisd	%xmm1, %xmm3
0000000000076057	jbe	0x760be
0000000000076059	movq	-0xb8(%rbp), %rcx
0000000000076060	jmp	0x7609c
0000000000076062	ucomisd	%xmm2, %xmm4
0000000000076066	jbe	0x7617e
000000000007606c	movsd	0x8(%r12,%rax,8), %xmm4
0000000000076073	subsd	%xmm2, %xmm4
0000000000076077	movapd	0x3a311(%rip), %xmm0
000000000007607f	andpd	%xmm4, %xmm0
0000000000076083	movsd	0x3a325(%rip), %xmm1
000000000007608b	ucomisd	%xmm0, %xmm1
000000000007608f	movq	-0xb8(%rbp), %rcx
0000000000076096	jbe	0x76127
000000000007609c	movq	-0x98(%rbp), %rdx
00000000000760a3	movq	-0x90(%rbp), %rsi
00000000000760aa	movsd	(%rsi,%rax,8), %xmm1
00000000000760af	movsd	(%rdx,%rax,8), %xmm0
00000000000760b4	movhpd	(%rcx,%rax,8), %xmm0            ## xmm0 = xmm0[0],mem[0]
00000000000760b9	jmp	0x7617e
00000000000760be	movapd	-0x60(%rbp), %xmm4
00000000000760c3	subsd	%xmm0, %xmm4
00000000000760c7	movq	-0xb8(%rbp), %rcx
00000000000760ce	movq	-0x98(%rbp), %rdx
00000000000760d5	movsd	(%rdx,%rax,8), %xmm1
00000000000760da	movhpd	(%rcx,%rax,8), %xmm1            ## xmm1 = xmm1[0],mem[0]
00000000000760df	movsd	-0x8(%rdx,%rax,8), %xmm3
00000000000760e5	movhpd	-0x8(%rcx,%rax,8), %xmm3        ## xmm3 = xmm3[0],mem[0]
00000000000760eb	subpd	%xmm3, %xmm1
00000000000760ef	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
00000000000760f3	divpd	%xmm0, %xmm1
00000000000760f7	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
00000000000760fb	mulpd	%xmm1, %xmm0
00000000000760ff	addpd	%xmm3, %xmm0
0000000000076103	movq	-0x90(%rbp), %rcx
000000000007610a	movsd	(%rcx,%rax,8), %xmm1
000000000007610f	movsd	-0x8(%rcx,%rax,8), %xmm3
0000000000076115	subsd	%xmm3, %xmm1
0000000000076119	divsd	%xmm2, %xmm1
000000000007611d	mulsd	%xmm4, %xmm1
0000000000076121	addsd	%xmm3, %xmm1
0000000000076125	jmp	0x7617e
0000000000076127	movq	-0x98(%rbp), %rdx
000000000007612e	movsd	0x8(%rdx,%rax,8), %xmm1
0000000000076134	movhpd	0x8(%rcx,%rax,8), %xmm1         ## xmm1 = xmm1[0],mem[0]
000000000007613a	movsd	(%rdx,%rax,8), %xmm2
000000000007613f	movhpd	(%rcx,%rax,8), %xmm2            ## xmm2 = xmm2[0],mem[0]
0000000000076144	subpd	%xmm2, %xmm1
0000000000076148	movddup	%xmm4, %xmm0                    ## xmm0 = xmm4[0,0]
000000000007614c	divpd	%xmm0, %xmm1
0000000000076150	movddup	%xmm3, %xmm0                    ## xmm0 = xmm3[0,0]
0000000000076154	mulpd	%xmm1, %xmm0
0000000000076158	addpd	%xmm2, %xmm0
000000000007615c	movq	-0x90(%rbp), %rcx
0000000000076163	movsd	(%rcx,%rax,8), %xmm2
0000000000076168	movsd	0x8(%rcx,%rax,8), %xmm1
000000000007616e	subsd	%xmm2, %xmm1
0000000000076172	divsd	%xmm4, %xmm1
0000000000076176	mulsd	%xmm3, %xmm1
000000000007617a	addsd	%xmm2, %xmm1
000000000007617e	movq	0x10(%rbp), %rax
0000000000076182	testq	%rax, %rax
0000000000076185	je	0x7618b
0000000000076187	movhpd	%xmm0, (%rax)
000000000007618b	movq	-0xc8(%rbp), %rax
0000000000076192	testq	%rax, %rax
0000000000076195	movq	-0xd8(%rbp), %r12
000000000007619c	je	0x761a2
000000000007619e	movlpd	%xmm0, (%rax)
00000000000761a2	movq	-0xc0(%rbp), %rax
00000000000761a9	testq	%rax, %rax
00000000000761ac	movq	-0x130(%rbp), %rbx
00000000000761b3	je	0x761b9
00000000000761b5	movsd	%xmm1, (%rax)
00000000000761b9	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
00000000000761bd	leaq	-0x110(%rbp), %rdi
00000000000761c4	movl	$0x40000, %esi                  ## imm = 0x40000
00000000000761c9	callq	0xacafe                         ## symbol stub for: __Z26OZFigTimeForChannelSecondsdi
00000000000761ce	movq	0x30(%r13), %rsi
00000000000761d2	testq	%rsi, %rsi
00000000000761d5	je	0x76239
00000000000761d7	movq	(%rsi), %rax
00000000000761da	leaq	-0xf0(%rbp), %rdi
00000000000761e1	callq	*0x140(%rax)
00000000000761e7	movq	-0xe0(%rbp), %rax
00000000000761ee	movq	%rax, 0x28(%rsp)
00000000000761f3	movups	-0xf0(%rbp), %xmm0
00000000000761fa	movups	%xmm0, 0x18(%rsp)
00000000000761ff	movq	-0x100(%rbp), %rax
0000000000076206	movq	%rax, 0x10(%rsp)
000000000007620b	movupd	-0x110(%rbp), %xmm0
0000000000076213	movupd	%xmm0, (%rsp)
0000000000076218	leaq	-0x80(%rbp), %rdi
000000000007621c	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000076221	movq	-0x70(%rbp), %rax
0000000000076225	movq	%rax, -0x100(%rbp)
000000000007622c	movupd	-0x80(%rbp), %xmm0
0000000000076231	movapd	%xmm0, -0x110(%rbp)
0000000000076239	leaq	-0x110(%rbp), %rsi
0000000000076240	movq	%r13, %rdi
0000000000076243	movq	%r12, %rdx
0000000000076246	movq	%rbx, %rcx
0000000000076249	movq	0x18(%rbp), %r8
000000000007624d	callq	__ZN17OZChannelPosition10getNormalsERK6CMTimePdS3_P14PCMatrix44TmplIdE ## OZChannelPosition::getNormals(CMTime const&, double*, double*, PCMatrix44Tmpl<double>*)
0000000000076252	movq	-0x98(%rbp), %rdi
0000000000076259	testq	%rdi, %rdi
000000000007625c	je	0x76263
000000000007625e	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076263	movq	-0x90(%rbp), %rdi
000000000007626a	testq	%rdi, %rdi
000000000007626d	je	0x76274
000000000007626f	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076274	movq	-0xb8(%rbp), %rdi
000000000007627b	testq	%rdi, %rdi
000000000007627e	je	0x76285
0000000000076280	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076285	movq	-0xf8(%rbp), %rdi
000000000007628c	testq	%rdi, %rdi
000000000007628f	je	0x76296
0000000000076291	callq	0xacdfe                         ## symbol stub for: __ZdaPv
0000000000076296	movq	(%r14), %rax
0000000000076299	movq	%r14, %rdi
000000000007629c	callq	*0x8(%rax)
000000000007629f	testq	%r15, %r15
00000000000762a2	je	0x762ad
00000000000762a4	movq	(%r15), %rax
00000000000762a7	movq	%r15, %rdi
00000000000762aa	callq	*0x8(%rax)
00000000000762ad	movq	-0x128(%rbp), %rdi
00000000000762b4	testq	%rdi, %rdi
00000000000762b7	je	0x762c5
00000000000762b9	movq	%rdi, -0x120(%rbp)
00000000000762c0	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000762c5	movq	-0x148(%rbp), %rdi
00000000000762cc	testq	%rdi, %rdi
00000000000762cf	je	0x762dd
00000000000762d1	movq	%rdi, -0x140(%rbp)
00000000000762d8	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000762dd	movb	$0x1, %bl
00000000000762df	movl	%ebx, %eax
00000000000762e1	addq	$0x158, %rsp                    ## imm = 0x158
00000000000762e8	popq	%rbx
00000000000762e9	popq	%r12
00000000000762eb	popq	%r13
00000000000762ed	popq	%r14
00000000000762ef	popq	%r15
00000000000762f1	popq	%rbp
00000000000762f2	retq
00000000000762f3	jmp	0x7630a
00000000000762f5	jmp	0x7630a
00000000000762f7	jmp	0x7630a
00000000000762f9	jmp	0x7630a
00000000000762fb	jmp	0x7630a
00000000000762fd	jmp	0x7630a
00000000000762ff	jmp	0x7630a
0000000000076301	jmp	0x7630a
0000000000076303	movq	%rax, %rbx
0000000000076306	jmp	0x76325
0000000000076308	jmp	0x7630a
000000000007630a	movq	%rax, %rbx
000000000007630d	movq	-0x128(%rbp), %rdi
0000000000076314	testq	%rdi, %rdi
0000000000076317	je	0x76325
0000000000076319	movq	%rdi, -0x120(%rbp)
0000000000076320	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076325	movq	-0x148(%rbp), %rdi
000000000007632c	testq	%rdi, %rdi
000000000007632f	je	0x7633d
0000000000076331	movq	%rdi, -0x140(%rbp)
0000000000076338	callq	0xace04                         ## symbol stub for: __ZdlPv
000000000007633d	movq	%rbx, %rdi
0000000000076340	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000076345	nop
