__ZN25OZExponentialInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE:
00000000000442a2	pushq	%rbp
00000000000442a3	movq	%rsp, %rbp
00000000000442a6	pushq	%r15
00000000000442a8	pushq	%r14
00000000000442aa	pushq	%r13
00000000000442ac	pushq	%r12
00000000000442ae	pushq	%rbx
00000000000442af	subq	$0xe8, %rsp
00000000000442b6	movsd	%xmm0, -0x38(%rbp)
00000000000442bb	movq	%r9, %r13
00000000000442be	movq	%rcx, %r12
00000000000442c1	movq	%rdx, %r15
00000000000442c4	movq	%rsi, %rbx
00000000000442c7	movq	(%rsi), %rax
00000000000442ca	movq	0x861ef(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000442d1	xorl	%r14d, %r14d
00000000000442d4	movq	%rsi, %rdi
00000000000442d7	movq	%r8, %rsi
00000000000442da	xorl	%ecx, %ecx
00000000000442dc	callq	*0xf0(%rax)
00000000000442e2	movsd	%xmm0, -0x30(%rbp)
00000000000442e7	movq	(%rbx), %rax
00000000000442ea	movq	%rbx, %rdi
00000000000442ed	movq	%r13, %rsi
00000000000442f0	movq	0x861c9(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
00000000000442f7	xorl	%ecx, %ecx
00000000000442f9	callq	*0xf0(%rax)
00000000000442ff	movsd	-0x30(%rbp), %xmm3
0000000000044304	movapd	%xmm0, %xmm1
0000000000044308	maxsd	%xmm3, %xmm1
000000000004430c	movsd	-0x38(%rbp), %xmm2
0000000000044311	ucomisd	%xmm1, %xmm2
0000000000044315	ja	0x44565
000000000004431b	minsd	%xmm3, %xmm0
000000000004431f	ucomisd	%xmm2, %xmm0
0000000000044323	ja	0x44565
0000000000044329	movq	(%r15), %rax
000000000004432c	movq	0x8618d(%rip), %r14             ## literal pool symbol address: _kCMTimeZero
0000000000044333	movq	%r15, %rdi
0000000000044336	movq	%r14, %rsi
0000000000044339	callq	*0x18(%rax)
000000000004433c	movsd	%xmm0, -0x30(%rbp)
0000000000044341	movq	(%r12), %rax
0000000000044345	movq	%r12, %rdi
0000000000044348	movq	%r14, %rsi
000000000004434b	callq	*0x18(%rax)
000000000004434e	movapd	%xmm0, -0x60(%rbp)
0000000000044353	movups	0x10(%r15), %xmm0
0000000000044358	movaps	%xmm0, -0x50(%rbp)
000000000004435c	movq	0x20(%r15), %rax
0000000000044360	movq	%rax, -0x40(%rbp)
0000000000044364	movq	0x20(%r12), %rax
0000000000044369	movq	%rax, -0x90(%rbp)
0000000000044370	movups	0x10(%r12), %xmm0
0000000000044376	movaps	%xmm0, -0xa0(%rbp)
000000000004437d	movq	0x20(%r12), %rax
0000000000044382	movq	%rax, 0x28(%rsp)
0000000000044387	movups	0x10(%r12), %xmm0
000000000004438d	movups	%xmm0, 0x18(%rsp)
0000000000044392	movq	0x20(%r15), %rax
0000000000044396	movq	%rax, 0x10(%rsp)
000000000004439b	movups	0x10(%r15), %xmm0
00000000000443a0	movups	%xmm0, (%rsp)
00000000000443a4	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
00000000000443a9	testl	%eax, %eax
00000000000443ab	jle	0x443eb
00000000000443ad	leaq	-0x80(%rbp), %r15
00000000000443b1	movq	%r15, %rdi
00000000000443b4	movq	%rbx, %rsi
00000000000443b7	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
00000000000443bc	movq	0x10(%r15), %rax
00000000000443c0	movq	%rax, 0x28(%rsp)
00000000000443c5	movups	(%r15), %xmm0
00000000000443c9	movups	%xmm0, 0x18(%rsp)
00000000000443ce	movq	-0x40(%rbp), %rax
00000000000443d2	movq	%rax, 0x10(%rsp)
00000000000443d7	movaps	-0x50(%rbp), %xmm0
00000000000443db	movups	%xmm0, (%rsp)
00000000000443df	leaq	-0xa0(%rbp), %rdi
00000000000443e6	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000443eb	movq	-0x40(%rbp), %rax
00000000000443ef	movq	%rax, 0x28(%rsp)
00000000000443f4	movaps	-0x50(%rbp), %xmm0
00000000000443f8	movups	%xmm0, 0x18(%rsp)
00000000000443fd	movq	-0x90(%rbp), %rax
0000000000044404	movq	%rax, 0x10(%rsp)
0000000000044409	movaps	-0xa0(%rbp), %xmm0
0000000000044410	movups	%xmm0, (%rsp)
0000000000044414	leaq	-0xc8(%rbp), %rbx
000000000004441b	movq	%rbx, %rdi
000000000004441e	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000044423	movq	0x10(%r14), %rax
0000000000044427	movq	%rax, -0x70(%rbp)
000000000004442b	movups	(%r14), %xmm0
000000000004442f	movaps	%xmm0, -0x80(%rbp)
0000000000044433	movq	-0x70(%rbp), %rax
0000000000044437	movq	%rax, 0x28(%rsp)
000000000004443c	movaps	-0x80(%rbp), %xmm0
0000000000044440	movups	%xmm0, 0x18(%rsp)
0000000000044445	movq	0x10(%rbx), %rax
0000000000044449	movq	%rax, 0x10(%rsp)
000000000004444e	movupd	(%rbx), %xmm0
0000000000044452	movupd	%xmm0, (%rsp)
0000000000044457	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
000000000004445c	testl	%eax, %eax
000000000004445e	je	0x4454e
0000000000044464	movq	0x10(%rbp), %rbx
0000000000044468	movapd	-0x60(%rbp), %xmm0
000000000004446d	movapd	%xmm0, %xmm3
0000000000044471	movsd	-0x30(%rbp), %xmm1
0000000000044476	subsd	%xmm1, %xmm3
000000000004447a	movapd	%xmm3, -0xb0(%rbp)
0000000000044482	movapd	0x6c1b6(%rip), %xmm2
000000000004448a	xorpd	%xmm3, %xmm2
000000000004448e	cmpltsd	%xmm1, %xmm0
0000000000044493	movapd	%xmm3, %xmm1
0000000000044497	blendvpd	%xmm0, %xmm2, %xmm1
000000000004449c	movapd	%xmm1, %xmm0
00000000000444a0	callq	0xaceee                         ## symbol stub for: _log
00000000000444a5	movapd	%xmm0, %xmm1
00000000000444a9	addsd	0x6c427(%rip), %xmm1
00000000000444b1	movsd	%xmm1, -0x60(%rbp)
00000000000444b6	movsd	0x6c422(%rip), %xmm0
00000000000444be	addsd	%xmm1, %xmm0
00000000000444c2	callq	0xacee2                         ## symbol stub for: _exp
00000000000444c7	movsd	-0x38(%rbp), %xmm1
00000000000444cc	subsd	-0x30(%rbp), %xmm1
00000000000444d1	addsd	0x6c40f(%rip), %xmm0
00000000000444d9	mulsd	%xmm1, %xmm0
00000000000444dd	divsd	-0xb0(%rbp), %xmm0
00000000000444e5	callq	0xaceee                         ## symbol stub for: _log
00000000000444ea	addsd	0x6c3e6(%rip), %xmm0
00000000000444f2	divsd	-0x60(%rbp), %xmm0
00000000000444f7	leaq	-0xe0(%rbp), %r14
00000000000444fe	leaq	-0xc8(%rbp), %rsi
0000000000044505	movq	%r14, %rdi
0000000000044508	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
000000000004450d	movq	-0x40(%rbp), %rax
0000000000044511	movq	%rax, 0x28(%rsp)
0000000000044516	movaps	-0x50(%rbp), %xmm0
000000000004451a	movups	%xmm0, 0x18(%rsp)
000000000004451f	movq	0x10(%r14), %rax
0000000000044523	movq	%rax, 0x10(%rsp)
0000000000044528	movupd	(%r14), %xmm0
000000000004452d	movupd	%xmm0, (%rsp)
0000000000044532	leaq	-0x80(%rbp), %r14
0000000000044536	movq	%r14, %rdi
0000000000044539	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000004453e	movq	%rbx, %rdi
0000000000044541	movq	%r14, %rsi
0000000000044544	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
0000000000044549	xorl	%r14d, %r14d
000000000004454c	jmp	0x44565
000000000004454e	xorpd	%xmm0, %xmm0
0000000000044552	movsd	-0x30(%rbp), %xmm1
0000000000044557	cmpneqsd	%xmm0, %xmm1
000000000004455c	movq	%xmm1, %r14
0000000000044561	andl	$0x1, %r14d
0000000000044565	movl	%r14d, %eax
0000000000044568	addq	$0xe8, %rsp
000000000004456f	popq	%rbx
0000000000044570	popq	%r12
0000000000044572	popq	%r13
0000000000044574	popq	%r14
0000000000044576	popq	%r15
0000000000044578	popq	%rbp
0000000000044579	retq
