__ZN22OZConstantInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE:
0000000000043340	pushq	%rbp
0000000000043341	movq	%rsp, %rbp
0000000000043344	pushq	%rbx
0000000000043345	subq	$0x18, %rsp
0000000000043349	movsd	%xmm0, -0x10(%rbp)
000000000004334e	movq	%r8, %rbx
0000000000043351	movq	%rdx, %rdi
0000000000043354	movq	(%rdx), %rax
0000000000043357	movq	0x87162(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
000000000004335e	callq	*0x18(%rax)
0000000000043361	movsd	-0x10(%rbp), %xmm1
0000000000043366	ucomisd	%xmm0, %xmm1
000000000004336a	jne	0x43384
000000000004336c	jp	0x43384
000000000004336e	movq	0x10(%rbp), %rdi
0000000000043372	movq	%rbx, %rsi
0000000000043375	movsd	%xmm0, -0x18(%rbp)
000000000004337a	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
000000000004337f	movsd	-0x18(%rbp), %xmm0
0000000000043384	movsd	-0x10(%rbp), %xmm1
0000000000043389	cmpeqsd	%xmm0, %xmm1
000000000004338e	movq	%xmm1, %rax
0000000000043393	andl	$0x1, %eax
0000000000043396	addq	$0x18, %rsp
000000000004339a	popq	%rbx
000000000004339b	popq	%rbp
000000000004339c	retq
000000000004339d	nop
