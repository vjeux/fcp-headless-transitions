__ZN19FFSerialAudioSignalC1ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership:
0000000001258620	pushq	%rbp
0000000001258621	movq	%rsp, %rbp
0000000001258624	pushq	%r14
0000000001258626	pushq	%rbx
0000000001258627	movq	%rsi, %r14
000000000125862a	movq	%rdi, %rbx
000000000125862d	callq	__ZN22FFContainerAudioSignalC2ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership ## FFContainerAudioSignal::FFContainerAudioSignal(std::__1::vector<FFAudioSignal*, std::__1::allocator<FFAudioSignal*>> const&, FFAudioSignalInputOwnership)
0000000001258632	leaq	0x6c92ff(%rip), %rax
0000000001258639	movq	%rax, (%rbx)
000000000125863c	movq	(%r14), %rax
000000000125863f	movq	0x8(%r14), %rcx
0000000001258643	cmpq	%rcx, %rax
0000000001258646	je	0x12586a9
0000000001258648	xorpd	%xmm0, %xmm0
000000000125864c	movsd	0x31448c(%rip), %xmm1
0000000001258654	movapd	0x314494(%rip), %xmm2
000000000125865c	nopl	(%rax)
0000000001258660	movq	(%rax), %rdx
0000000001258663	movsd	0x8(%rdx), %xmm3
0000000001258668	unpcklps	%xmm1, %xmm3                    ## xmm3 = xmm3[0],xmm1[0],xmm3[1],xmm1[1]
000000000125866b	subpd	%xmm2, %xmm3
000000000125866f	movapd	%xmm3, %xmm4
0000000001258673	unpckhpd	%xmm3, %xmm4                    ## xmm4 = xmm4[1],xmm3[1]
0000000001258677	addsd	%xmm3, %xmm4
000000000125867b	addsd	%xmm4, %xmm0
000000000125867f	addq	$0x8, %rax
0000000001258683	cmpq	%rcx, %rax
0000000001258686	jne	0x1258660
0000000001258688	cvttsd2si	%xmm0, %rcx
000000000125868d	movq	%rcx, %rdx
0000000001258690	sarq	$0x3f, %rdx
0000000001258694	subsd	0x31442c(%rip), %xmm0
000000000125869c	cvttsd2si	%xmm0, %rax
00000000012586a1	andq	%rdx, %rax
00000000012586a4	orq	%rcx, %rax
00000000012586a7	jmp	0x12586ab
00000000012586a9	xorl	%eax, %eax
00000000012586ab	movq	%rax, 0x8(%rbx)
00000000012586af	popq	%rbx
00000000012586b0	popq	%r14
00000000012586b2	popq	%rbp
00000000012586b3	retq
00000000012586b4	nopw	%cs:(%rax,%rax)
