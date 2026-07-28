__ZN21OZFxPlugRenderContextD2Ev:
0000000000619850	pushq	%rbp
0000000000619851	movq	%rsp, %rbp
0000000000619854	pushq	%r15
0000000000619856	pushq	%r14
0000000000619858	pushq	%r12
000000000061985a	pushq	%rbx
000000000061985b	movq	%rdi, %rbx
000000000061985e	leaq	__ZTV21OZFxPlugRenderContext(%rip), %rax ## vtable for OZFxPlugRenderContext
0000000000619865	addq	$0x10, %rax
0000000000619869	movq	%rax, (%rdi)
000000000061986c	movq	0x40(%rdi), %r14
0000000000619870	testq	%r14, %r14
0000000000619873	je	0x619885
0000000000619875	movq	%r14, %rdi
0000000000619878	callq	__ZN14OZRenderParamsD1Ev        ## OZRenderParams::~OZRenderParams()
000000000061987d	movq	%r14, %rdi
0000000000619880	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000619885	movq	$0x0, 0x40(%rbx)
000000000061988d	cmpb	$0x1, 0x30(%rbx)
0000000000619891	jne	0x6198b4
0000000000619893	movq	0x20(%rbx), %r14
0000000000619897	testq	%r14, %r14
000000000061989a	je	0x6198ac
000000000061989c	movq	%r14, %rdi
000000000061989f	callq	__ZN7LiAgentD2Ev                ## LiAgent::~LiAgent()
00000000006198a4	movq	%r14, %rdi
00000000006198a7	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000006198ac	movq	$0x0, 0x20(%rbx)
00000000006198b4	movq	0x28(%rbx), %rdi
00000000006198b8	testq	%rdi, %rdi
00000000006198bb	je	0x6198cb
00000000006198bd	movq	(%rdi), %rax
00000000006198c0	callq	*0x8(%rax)
00000000006198c3	movq	$0x0, 0x28(%rbx)
00000000006198cb	movq	0x150(%rbx), %r14
00000000006198d2	movq	$0x0, 0x150(%rbx)
00000000006198dd	testq	%r14, %r14
00000000006198e0	je	0x6198f2
00000000006198e2	movq	%r14, %rdi
00000000006198e5	callq	0x6de910                        ## symbol stub for: __ZN34PGPerThreadSetCurrentContextSentryD1Ev
00000000006198ea	movq	%r14, %rdi
00000000006198ed	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000006198f2	movq	0x130(%rbx), %r15
00000000006198f9	testq	%r15, %r15
00000000006198fc	je	0x61995b
00000000006198fe	movq	0x138(%rbx), %r12
0000000000619905	movq	%r15, %rdi
0000000000619908	cmpq	%r12, %r15
000000000061990b	jne	0x619919
000000000061990d	jmp	0x61994f
000000000061990f	nop
0000000000619910	addq	$-0x10, %r12
0000000000619914	cmpq	%r15, %r12
0000000000619917	je	0x619948
0000000000619919	movq	-0x8(%r12), %r14
000000000061991e	testq	%r14, %r14
0000000000619921	je	0x619910
0000000000619923	movq	$-0x1, %rax
000000000061992a	lock
000000000061992b	xaddq	%rax, 0x8(%r14)
0000000000619930	testq	%rax, %rax
0000000000619933	jne	0x619910
0000000000619935	movq	(%r14), %rax
0000000000619938	movq	%r14, %rdi
000000000061993b	callq	*0x10(%rax)
000000000061993e	movq	%r14, %rdi
0000000000619941	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
0000000000619946	jmp	0x619910
0000000000619948	movq	0x130(%rbx), %rdi
000000000061994f	movq	%r15, 0x138(%rbx)
0000000000619956	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000061995b	movq	0x128(%rbx), %r14
0000000000619962	testq	%r14, %r14
0000000000619965	je	0x61998a
0000000000619967	movq	$-0x1, %rax
000000000061996e	lock
000000000061996f	xaddq	%rax, 0x8(%r14)
0000000000619974	testq	%rax, %rax
0000000000619977	jne	0x61998a
0000000000619979	movq	(%r14), %rax
000000000061997c	movq	%r14, %rdi
000000000061997f	callq	*0x10(%rax)
0000000000619982	movq	%r14, %rdi
0000000000619985	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
000000000061998a	leaq	0x48(%rbx), %rdi
000000000061998e	callq	__ZN18LiRenderParametersD2Ev    ## LiRenderParameters::~LiRenderParameters()
0000000000619993	addq	$0x18, %rbx
0000000000619997	movq	%rbx, %rdi
000000000061999a	popq	%rbx
000000000061999b	popq	%r12
000000000061999d	popq	%r14
000000000061999f	popq	%r15
00000000006199a1	popq	%rbp
00000000006199a2	jmp	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000006199a7	addb	%al, (%rax)
00000000006199a9	addb	%al, (%rax)
00000000006199ab	addb	%al, (%rax)
00000000006199ad	addb	%al, (%rax)
00000000006199af	addb	%dl, 0x48(%rbp)
00000000006199b2	movl	%esp, %ebp
00000000006199b4	pushq	%r15
00000000006199b6	pushq	%r14
00000000006199b8	pushq	%r13
00000000006199ba	pushq	%r12
00000000006199bc	pushq	%rbx
00000000006199bd	subq	$0x58, %rsp
00000000006199c1	movq	%rdi, %rbx
00000000006199c4	callq	__ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj ## OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
00000000006199c9	leaq	0x26a818(%rip), %rax
00000000006199d0	movq	%rax, (%rbx)
00000000006199d3	leaq	0x26ac56(%rip), %rax
00000000006199da	movq	%rax, 0x10(%rbx)
00000000006199de	leaq	0x26aca3(%rip), %rax
00000000006199e5	movq	%rax, 0x4c8(%rbx)
00000000006199ec	leaq	_theApp(%rip), %r14
00000000006199f3	movq	(%r14), %rax
00000000006199f6	movq	0x48(%rax), %rdx
00000000006199fa	leaq	0x29584f(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
0000000000619a01	leaq	-0x30(%rbp), %rdi
0000000000619a05	xorl	%ecx, %ecx
0000000000619a07	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000619a0c	leaq	0x4d0(%rbx), %rdi
0000000000619a13	xorps	%xmm0, %xmm0
0000000000619a16	movups	%xmm0, (%rsp)
0000000000619a1a	movsd	0xeb9be(%rip), %xmm0
0000000000619a22	leaq	-0x30(%rbp), %rsi
0000000000619a26	movq	%rdi, -0x68(%rbp)
0000000000619a2a	movaps	%xmm0, %xmm1
0000000000619a2d	movq	%rbx, %rdx
