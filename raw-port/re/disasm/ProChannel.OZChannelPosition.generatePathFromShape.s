__ZN17OZChannelPosition21generatePathFromShapeERK6CMTimeR14OZChannelCurveb:
000000000007686e	pushq	%rbp
000000000007686f	movq	%rsp, %rbp
0000000000076872	pushq	%r15
0000000000076874	pushq	%r14
0000000000076876	pushq	%r13
0000000000076878	pushq	%r12
000000000007687a	pushq	%rbx
000000000007687b	subq	$0x88, %rsp
0000000000076882	movq	%rdx, %r15
0000000000076885	movq	%rsi, %r12
0000000000076888	movq	%rdi, %r13
000000000007688b	xorl	%eax, %eax
000000000007688d	movq	%rax, -0x78(%rbp)
0000000000076891	movq	%rax, -0x70(%rbp)
0000000000076895	movq	%rax, -0x68(%rbp)
0000000000076899	movq	%rax, -0x60(%rbp)
000000000007689d	movq	(%rdi), %rax
00000000000768a0	movl	$0x1, %esi
00000000000768a5	callq	*0x1d0(%rax)
00000000000768ab	leaq	0x88(%r13), %rbx
00000000000768b2	movl	$0x120, %r14d                   ## imm = 0x120
00000000000768b8	leaq	(%r15,%r14), %rdx
00000000000768bc	movq	%rbx, %rdi
00000000000768bf	movq	%r12, %rsi
00000000000768c2	callq	__ZN9OZChannel33generateKeyframesFromDynamicCurveERK6CMTimeP14OZDynamicCurve ## OZChannel::generateKeyframesFromDynamicCurve(CMTime const&, OZDynamicCurve*)
00000000000768c7	addq	%r13, %r14
00000000000768ca	addq	$0x208, %r15                    ## imm = 0x208
00000000000768d1	movq	%r14, %rdi
00000000000768d4	movq	%r12, %rsi
00000000000768d7	movq	%r15, %rdx
00000000000768da	callq	__ZN9OZChannel33generateKeyframesFromDynamicCurveERK6CMTimeP14OZDynamicCurve ## OZChannel::generateKeyframesFromDynamicCurve(CMTime const&, OZDynamicCurve*)
00000000000768df	leaq	-0x58(%rbp), %rdi
00000000000768e3	movq	%rbx, %rsi
00000000000768e6	movl	$0x1, %edx
00000000000768eb	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
00000000000768f0	leaq	-0xa8(%rbp), %rdi
00000000000768f7	movq	%r14, %rsi
00000000000768fa	movl	$0x1, %edx
00000000000768ff	callq	__ZN9OZChannel12getKeyframesEb  ## OZChannel::getKeyframes(bool)
0000000000076904	xorpd	%xmm0, %xmm0
0000000000076908	movapd	%xmm0, -0x40(%rbp)
000000000007690d	xorl	%eax, %eax
000000000007690f	movq	%rax, -0x30(%rbp)
0000000000076913	movq	%rax, -0x80(%rbp)
0000000000076917	movapd	%xmm0, -0x90(%rbp)
000000000007691f	movq	-0x58(%rbp), %rax
0000000000076923	cmpq	%rax, -0x50(%rbp)
0000000000076927	je	0x76a74
000000000007692d	movl	$0x1, %r13d
0000000000076933	xorl	%r12d, %r12d
0000000000076936	cmpl	$0x1, %r13d
000000000007693a	je	0x76a08
0000000000076940	leal	-0x2(%r13), %r15d
0000000000076944	movq	(%rax,%r15,8), %rsi
0000000000076948	movq	%rbx, %rdi
000000000007694b	xorl	%edx, %edx
000000000007694d	leaq	-0x68(%rbp), %rcx
0000000000076951	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000076956	movq	-0xa8(%rbp), %rax
000000000007695d	movq	(%rax,%r15,8), %rsi
0000000000076961	movq	%r14, %rdi
0000000000076964	xorl	%edx, %edx
0000000000076966	leaq	-0x60(%rbp), %rcx
000000000007696a	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000007696f	movq	-0x58(%rbp), %rax
0000000000076973	movq	(%rax,%r12,8), %rsi
0000000000076977	movq	%rbx, %rdi
000000000007697a	xorl	%edx, %edx
000000000007697c	leaq	-0x78(%rbp), %rcx
0000000000076980	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
0000000000076985	movq	-0xa8(%rbp), %rax
000000000007698c	movq	(%rax,%r12,8), %rsi
0000000000076990	movq	%r14, %rdi
0000000000076993	xorl	%edx, %edx
0000000000076995	leaq	-0x70(%rbp), %rcx
0000000000076999	callq	__ZN9OZChannel11getKeyframeEPvP6CMTimePd ## OZChannel::getKeyframe(void*, CMTime*, double*)
000000000007699e	movsd	-0x68(%rbp), %xmm0
00000000000769a3	subsd	-0x78(%rbp), %xmm0
00000000000769a8	andpd	0x399e0(%rip), %xmm0
00000000000769b0	movsd	0x399f8(%rip), %xmm1
00000000000769b8	ucomisd	%xmm0, %xmm1
00000000000769bc	jbe	0x76a08
00000000000769be	movsd	-0x60(%rbp), %xmm0
00000000000769c3	subsd	-0x70(%rbp), %xmm0
00000000000769c8	andpd	0x399c0(%rip), %xmm0
00000000000769d0	movsd	0x399d8(%rip), %xmm1
00000000000769d8	ucomisd	%xmm0, %xmm1
00000000000769dc	jbe	0x76a08
00000000000769de	shlq	$0x3, %r12
00000000000769e2	movq	-0x58(%rbp), %rsi
00000000000769e6	addq	%r12, %rsi
00000000000769e9	leaq	-0x40(%rbp), %rdi
00000000000769ed	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<void*, std::__1::allocator<void*>>::push_back[abi:nqe210106](void* const&)
00000000000769f2	addq	-0xa8(%rbp), %r12
00000000000769f9	leaq	-0x90(%rbp), %rdi
0000000000076a00	movq	%r12, %rsi
0000000000076a03	callq	__ZNSt3__16vectorIPvNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<void*, std::__1::allocator<void*>>::push_back[abi:nqe210106](void* const&)
0000000000076a08	movl	%r13d, %r12d
0000000000076a0b	movq	-0x58(%rbp), %rax
0000000000076a0f	movq	-0x50(%rbp), %rcx
0000000000076a13	subq	%rax, %rcx
0000000000076a16	sarq	$0x3, %rcx
0000000000076a1a	incl	%r13d
0000000000076a1d	cmpq	%r12, %rcx
0000000000076a20	ja	0x76936
0000000000076a26	movq	-0x40(%rbp), %rdi
0000000000076a2a	cmpq	%rdi, -0x38(%rbp)
0000000000076a2e	je	0x76a76
0000000000076a30	movl	$0x1, %r15d
0000000000076a36	xorl	%r12d, %r12d
0000000000076a39	movq	(%rdi,%r12,8), %rsi
0000000000076a3d	movq	%rbx, %rdi
0000000000076a40	callq	__ZN9OZChannel14deleteKeyframeEPv ## OZChannel::deleteKeyframe(void*)
0000000000076a45	movq	-0x90(%rbp), %rax
0000000000076a4c	movq	(%rax,%r12,8), %rsi
0000000000076a50	movq	%r14, %rdi
0000000000076a53	callq	__ZN9OZChannel14deleteKeyframeEPv ## OZChannel::deleteKeyframe(void*)
0000000000076a58	movl	%r15d, %r12d
0000000000076a5b	movq	-0x40(%rbp), %rdi
0000000000076a5f	movq	-0x38(%rbp), %rax
0000000000076a63	subq	%rdi, %rax
0000000000076a66	sarq	$0x3, %rax
0000000000076a6a	incl	%r15d
0000000000076a6d	cmpq	%r12, %rax
0000000000076a70	ja	0x76a39
0000000000076a72	jmp	0x76a76
0000000000076a74	xorl	%edi, %edi
0000000000076a76	movq	-0x90(%rbp), %rax
0000000000076a7d	testq	%rax, %rax
0000000000076a80	je	0x76a95
0000000000076a82	movq	%rax, -0x88(%rbp)
0000000000076a89	movq	%rax, %rdi
0000000000076a8c	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076a91	movq	-0x40(%rbp), %rdi
0000000000076a95	testq	%rdi, %rdi
0000000000076a98	je	0x76aa3
0000000000076a9a	movq	%rdi, -0x38(%rbp)
0000000000076a9e	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076aa3	movq	-0xa8(%rbp), %rdi
0000000000076aaa	testq	%rdi, %rdi
0000000000076aad	je	0x76abb
0000000000076aaf	movq	%rdi, -0xa0(%rbp)
0000000000076ab6	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076abb	movq	-0x58(%rbp), %rdi
0000000000076abf	testq	%rdi, %rdi
0000000000076ac2	je	0x76acd
0000000000076ac4	movq	%rdi, -0x50(%rbp)
0000000000076ac8	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076acd	addq	$0x88, %rsp
0000000000076ad4	popq	%rbx
0000000000076ad5	popq	%r12
0000000000076ad7	popq	%r13
0000000000076ad9	popq	%r14
0000000000076adb	popq	%r15
0000000000076add	popq	%rbp
0000000000076ade	retq
0000000000076adf	movq	%rax, %rbx
0000000000076ae2	jmp	0x76b2b
0000000000076ae4	jmp	0x76ae6
0000000000076ae6	movq	%rax, %rbx
0000000000076ae9	movq	-0x90(%rbp), %rdi
0000000000076af0	testq	%rdi, %rdi
0000000000076af3	je	0x76b01
0000000000076af5	movq	%rdi, -0x88(%rbp)
0000000000076afc	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076b01	movq	-0x40(%rbp), %rdi
0000000000076b05	testq	%rdi, %rdi
0000000000076b08	je	0x76b13
0000000000076b0a	movq	%rdi, -0x38(%rbp)
0000000000076b0e	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076b13	movq	-0xa8(%rbp), %rdi
0000000000076b1a	testq	%rdi, %rdi
0000000000076b1d	je	0x76b2b
0000000000076b1f	movq	%rdi, -0xa0(%rbp)
0000000000076b26	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076b2b	movq	-0x58(%rbp), %rdi
0000000000076b2f	testq	%rdi, %rdi
0000000000076b32	je	0x76b3d
0000000000076b34	movq	%rdi, -0x50(%rbp)
0000000000076b38	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000076b3d	movq	%rbx, %rdi
0000000000076b40	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000076b45	nop
