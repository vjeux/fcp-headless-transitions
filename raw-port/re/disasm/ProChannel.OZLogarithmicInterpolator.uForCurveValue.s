__ZN25OZLogarithmicInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE:
000000000004594a	pushq	%rbp
000000000004594b	movq	%rsp, %rbp
000000000004594e	pushq	%r15
0000000000045950	pushq	%r14
0000000000045952	pushq	%r13
0000000000045954	pushq	%r12
0000000000045956	pushq	%rbx
0000000000045957	subq	$0xc8, %rsp
000000000004595e	movsd	%xmm0, -0x38(%rbp)
0000000000045963	movq	%r9, %rbx
0000000000045966	movq	%rcx, %r12
0000000000045969	movq	%rdx, %r15
000000000004596c	movq	%rsi, %r14
000000000004596f	movq	(%rsi), %rax
0000000000045972	movq	0x84b47(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
0000000000045979	movq	%rsi, %rdi
000000000004597c	movq	%r8, %rsi
000000000004597f	movq	%r13, %rdx
0000000000045982	xorl	%ecx, %ecx
0000000000045984	callq	*0xf0(%rax)
000000000004598a	movsd	%xmm0, -0x30(%rbp)
000000000004598f	movq	(%r14), %rax
0000000000045992	movq	%r14, %rdi
0000000000045995	movq	%rbx, %rsi
0000000000045998	movq	%r13, %rdx
000000000004599b	xorl	%ecx, %ecx
000000000004599d	callq	*0xf0(%rax)
00000000000459a3	movsd	-0x30(%rbp), %xmm3
00000000000459a8	movapd	%xmm0, %xmm1
00000000000459ac	maxsd	%xmm3, %xmm1
00000000000459b0	movsd	-0x38(%rbp), %xmm2
00000000000459b5	ucomisd	%xmm1, %xmm2
00000000000459b9	ja	0x45b48
00000000000459bf	minsd	%xmm3, %xmm0
00000000000459c3	ucomisd	%xmm2, %xmm0
00000000000459c7	ja	0x45b48
00000000000459cd	movq	0x10(%rbp), %rbx
00000000000459d1	movq	(%r15), %rax
00000000000459d4	movq	0x84ae5(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
00000000000459db	movq	%r15, %rdi
00000000000459de	movq	%r13, %rsi
00000000000459e1	callq	*0x18(%rax)
00000000000459e4	movsd	%xmm0, -0x30(%rbp)
00000000000459e9	movq	(%r12), %rax
00000000000459ed	movq	%r12, %rdi
00000000000459f0	movq	%r13, %rsi
00000000000459f3	callq	*0x18(%rax)
00000000000459f6	movsd	%xmm0, -0x58(%rbp)
00000000000459fb	movups	0x10(%r15), %xmm0
0000000000045a00	movaps	%xmm0, -0x50(%rbp)
0000000000045a04	movq	0x20(%r15), %rax
0000000000045a08	movq	%rax, -0x40(%rbp)
0000000000045a0c	movq	0x20(%r12), %rax
0000000000045a11	movq	%rax, -0x60(%rbp)
0000000000045a15	movups	0x10(%r12), %xmm0
0000000000045a1b	movaps	%xmm0, -0x70(%rbp)
0000000000045a1f	movq	0x20(%r12), %rax
0000000000045a24	movq	%rax, 0x28(%rsp)
0000000000045a29	movups	0x10(%r12), %xmm0
0000000000045a2f	movups	%xmm0, 0x18(%rsp)
0000000000045a34	movq	0x20(%r15), %rax
0000000000045a38	movq	%rax, 0x10(%rsp)
0000000000045a3d	movups	0x10(%r15), %xmm0
0000000000045a42	movups	%xmm0, (%rsp)
0000000000045a46	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000045a4b	testl	%eax, %eax
0000000000045a4d	jle	0x45a8d
0000000000045a4f	leaq	-0x88(%rbp), %r15
0000000000045a56	movq	%r15, %rdi
0000000000045a59	movq	%r14, %rsi
0000000000045a5c	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
0000000000045a61	movq	0x10(%r15), %rax
0000000000045a65	movq	%rax, 0x28(%rsp)
0000000000045a6a	movups	(%r15), %xmm0
0000000000045a6e	movups	%xmm0, 0x18(%rsp)
0000000000045a73	movq	-0x40(%rbp), %rax
0000000000045a77	movq	%rax, 0x10(%rsp)
0000000000045a7c	movaps	-0x50(%rbp), %xmm0
0000000000045a80	movups	%xmm0, (%rsp)
0000000000045a84	leaq	-0x70(%rbp), %rdi
0000000000045a88	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000045a8d	movq	-0x40(%rbp), %rax
0000000000045a91	movq	%rax, 0x28(%rsp)
0000000000045a96	movaps	-0x50(%rbp), %xmm0
0000000000045a9a	movups	%xmm0, 0x18(%rsp)
0000000000045a9f	movq	-0x60(%rbp), %rax
0000000000045aa3	movq	%rax, 0x10(%rsp)
0000000000045aa8	movaps	-0x70(%rbp), %xmm0
0000000000045aac	movups	%xmm0, (%rsp)
0000000000045ab0	leaq	-0x88(%rbp), %r14
0000000000045ab7	movq	%r14, %rdi
0000000000045aba	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000045abf	movsd	-0x30(%rbp), %xmm1
0000000000045ac4	movsd	-0x58(%rbp), %xmm2
0000000000045ac9	subsd	%xmm1, %xmm2
0000000000045acd	divsd	0x6af63(%rip), %xmm2
0000000000045ad5	movsd	-0x38(%rbp), %xmm0
0000000000045ada	subsd	%xmm1, %xmm0
0000000000045ade	divsd	%xmm2, %xmm0
0000000000045ae2	callq	0xacee2                         ## symbol stub for: _exp
0000000000045ae7	addsd	0x6a8d9(%rip), %xmm0
0000000000045aef	divsd	0x6af49(%rip), %xmm0
0000000000045af7	leaq	-0xa0(%rbp), %r15
0000000000045afe	movq	%r15, %rdi
0000000000045b01	movq	%r14, %rsi
0000000000045b04	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000045b09	movq	-0x40(%rbp), %rax
0000000000045b0d	movq	%rax, 0x28(%rsp)
0000000000045b12	movaps	-0x50(%rbp), %xmm0
0000000000045b16	movups	%xmm0, 0x18(%rsp)
0000000000045b1b	movq	0x10(%r15), %rax
0000000000045b1f	movq	%rax, 0x10(%rsp)
0000000000045b24	movupd	(%r15), %xmm0
0000000000045b29	movupd	%xmm0, (%rsp)
0000000000045b2e	leaq	-0xb8(%rbp), %r14
0000000000045b35	movq	%r14, %rdi
0000000000045b38	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000045b3d	movq	%rbx, %rdi
0000000000045b40	movq	%r14, %rsi
0000000000045b43	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
0000000000045b48	xorl	%eax, %eax
0000000000045b4a	addq	$0xc8, %rsp
0000000000045b51	popq	%rbx
0000000000045b52	popq	%r12
0000000000045b54	popq	%r13
0000000000045b56	popq	%r14
0000000000045b58	popq	%r15
0000000000045b5a	popq	%rbp
0000000000045b5b	retq
