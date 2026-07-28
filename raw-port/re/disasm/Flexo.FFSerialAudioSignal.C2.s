__ZN19FFSerialAudioSignalC2ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership:
0000000001258580	pushq	%rbp
0000000001258581	movq	%rsp, %rbp
0000000001258584	pushq	%r14
0000000001258586	pushq	%rbx
0000000001258587	movq	%rsi, %r14
000000000125858a	movq	%rdi, %rbx
000000000125858d	callq	__ZN22FFContainerAudioSignalC2ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership ## FFContainerAudioSignal::FFContainerAudioSignal(std::__1::vector<FFAudioSignal*, std::__1::allocator<FFAudioSignal*>> const&, FFAudioSignalInputOwnership)
0000000001258592	leaq	0x6c939f(%rip), %rax
0000000001258599	movq	%rax, (%rbx)
000000000125859c	movq	(%r14), %rax
000000000125859f	movq	0x8(%r14), %rcx
00000000012585a3	cmpq	%rcx, %rax
00000000012585a6	je	0x1258609
00000000012585a8	xorpd	%xmm0, %xmm0
00000000012585ac	movsd	0x31452c(%rip), %xmm1
00000000012585b4	movapd	0x314534(%rip), %xmm2
00000000012585bc	nopl	(%rax)
00000000012585c0	movq	(%rax), %rdx
00000000012585c3	movsd	0x8(%rdx), %xmm3
00000000012585c8	unpcklps	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0],xmm3[1],xmm1[1]
00000000012585cb	subpd	%xmm2, %xmm3
00000000012585cf	movapd	%xmm3, %xmm4
00000000012585d3	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
00000000012585d7	addsd	%xmm3, %xmm4
00000000012585db	addsd	%xmm4, %xmm0
00000000012585df	addq	$0x8, %rax
00000000012585e3	cmpq	%rcx, %rax
00000000012585e6	jne	0x12585c0
00000000012585e8	cvttsd2si	%xmm0, %rcx
00000000012585ed	movq	%rcx, %rdx
00000000012585f0	sarq	$0x3f, %rdx
00000000012585f4	subsd	0x3144cc(%rip), %xmm0
00000000012585fc	cvttsd2si	%xmm0, %rax
0000000001258601	andq	%rdx, %rax
0000000001258604	orq	%rcx, %rax
0000000001258607	jmp	0x125860b
0000000001258609	xorl	%eax, %eax
000000000125860b	movq	%rax, 0x8(%rbx)
000000000125860f	popq	%rbx
0000000001258610	popq	%r14
0000000001258612	popq	%rbp
0000000001258613	retq
0000000001258614	nopw	%cs:(%rax,%rax)
__ZN19FFSerialAudioSignalC1ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership:
