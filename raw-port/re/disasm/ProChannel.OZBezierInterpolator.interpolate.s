__ZN20OZBezierInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
00000000000407e6	pushq	%rbp
00000000000407e7	movq	%rsp, %rbp
00000000000407ea	pushq	%r15
00000000000407ec	pushq	%r14
00000000000407ee	pushq	%r13
00000000000407f0	pushq	%r12
00000000000407f2	pushq	%rbx
00000000000407f3	subq	$0x148, %rsp                    ## imm = 0x148
00000000000407fa	movq	%r9, %rbx
00000000000407fd	movq	%rdx, %rax
0000000000040800	movq	%rsi, %r14
0000000000040803	movq	%rdi, %r15
0000000000040806	movq	0x89ecb(%rip), %rdx             ## literal pool symbol address: ___stack_chk_guard
000000000004080d	movq	(%rdx), %rdx
0000000000040810	movq	%rdx, -0x30(%rbp)
0000000000040814	leaq	-0x70(%rbp), %rdx
0000000000040818	movq	%rdx, 0x10(%rsp)
000000000004081d	leaq	-0x50(%rbp), %rdx
0000000000040821	movq	%rdx, 0x8(%rsp)
0000000000040826	leaq	-0x120(%rbp), %r13
000000000004082d	movq	%r13, (%rsp)
0000000000040831	leaq	-0x138(%rbp), %r12
0000000000040838	movq	%rcx, %rdx
000000000004083b	movq	%r8, %rcx
000000000004083e	movq	%rax, %r8
0000000000040841	movq	%r12, %r9
0000000000040844	callq	__ZN20OZBezierInterpolator16getControlPointsER8OZSplinePvS2_RK6CMTimeRS3_S6_PdS7_ ## OZBezierInterpolator::getControlPoints(OZSpline&, void*, void*, CMTime const&, CMTime&, CMTime&, double*, double*)
0000000000040849	movq	0x10(%rbx), %rax
000000000004084d	movq	%rax, -0x90(%rbp)
0000000000040854	movups	(%rbx), %xmm0
0000000000040857	movaps	%xmm0, -0xa0(%rbp)
000000000004085e	movq	0x10(%r12), %rax
0000000000040863	movq	%rax, 0x28(%rsp)
0000000000040868	movups	(%r12), %xmm0
000000000004086d	movups	%xmm0, 0x18(%rsp)
0000000000040872	movq	0x10(%r13), %rax
0000000000040876	movq	%rax, 0x10(%rsp)
000000000004087b	movups	(%r13), %xmm0
0000000000040880	movups	%xmm0, (%rsp)
0000000000040884	leaq	-0xc0(%rbp), %r13
000000000004088b	movq	%r13, %rdi
000000000004088e	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000040893	movq	0x10(%r13), %rax
0000000000040897	movq	%rax, 0x10(%rsp)
000000000004089c	movups	(%r13), %xmm0
00000000000408a1	movups	%xmm0, (%rsp)
00000000000408a5	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
00000000000408aa	movsd	%xmm0, -0x78(%rbp)
00000000000408af	movq	0x10(%r12), %rax
00000000000408b4	movq	%rax, 0x28(%rsp)
00000000000408b9	movups	(%r12), %xmm0
00000000000408be	movups	%xmm0, 0x18(%rsp)
00000000000408c3	movq	-0x90(%rbp), %rax
00000000000408ca	movq	%rax, 0x10(%rsp)
00000000000408cf	movaps	-0xa0(%rbp), %xmm0
00000000000408d6	movups	%xmm0, (%rsp)
00000000000408da	leaq	-0xc0(%rbp), %r12
00000000000408e1	movq	%r12, %rdi
00000000000408e4	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000408e9	movq	0x10(%r12), %rax
00000000000408ee	movq	%rax, 0x10(%rsp)
00000000000408f3	movupd	(%r12), %xmm0
00000000000408f9	movupd	%xmm0, (%rsp)
00000000000408fe	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000040903	cmpb	$0x0, 0x18(%rbp)
0000000000040907	je	0x40ac0
000000000004090d	leaq	-0xd8(%rbp), %r12
0000000000040914	movl	$0x1, %esi
0000000000040919	movq	%r12, %rdi
000000000004091c	movl	$0x3e8, %edx                    ## imm = 0x3E8
0000000000040921	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000040926	movq	0x10(%rbx), %rax
000000000004092a	leaq	-0xc0(%rbp), %r15
0000000000040931	movq	%rax, 0x10(%r15)
0000000000040935	movups	(%rbx), %xmm0
0000000000040938	movaps	%xmm0, (%r15)
000000000004093c	movq	0x10(%r12), %rax
0000000000040941	movq	%rax, 0x28(%rsp)
0000000000040946	movups	(%r12), %xmm0
000000000004094b	movups	%xmm0, 0x18(%rsp)
0000000000040950	movq	0x10(%r15), %rax
0000000000040954	movq	%rax, 0x10(%rsp)
0000000000040959	movaps	(%r15), %xmm0
000000000004095d	movups	%xmm0, (%rsp)
0000000000040961	leaq	-0xf0(%rbp), %rdi
0000000000040968	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000004096d	leaq	-0x108(%rbp), %r13
0000000000040974	movl	$0x1, %esi
0000000000040979	movq	%r13, %rdi
000000000004097c	movl	$0x3e8, %edx                    ## imm = 0x3E8
0000000000040981	callq	0xaca92                         ## symbol stub for: _CMTimeMake
0000000000040986	movq	0x10(%rbx), %rax
000000000004098a	movq	%rax, 0x10(%r15)
000000000004098e	movups	(%rbx), %xmm0
0000000000040991	movaps	%xmm0, (%r15)
0000000000040995	movq	0x10(%r13), %rax
0000000000040999	movq	%rax, 0x28(%rsp)
000000000004099e	movups	(%r13), %xmm0
00000000000409a3	movups	%xmm0, 0x18(%rsp)
00000000000409a8	movq	0x10(%r15), %rax
00000000000409ac	movq	%rax, 0x10(%rsp)
00000000000409b1	movaps	(%r15), %xmm0
00000000000409b5	movups	%xmm0, (%rsp)
00000000000409b9	leaq	-0xd8(%rbp), %r13
00000000000409c0	movq	%r13, %rdi
00000000000409c3	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000409c8	movq	(%r14), %rax
00000000000409cb	movq	0x89aee(%rip), %r12             ## literal pool symbol address: _kCMTimeZero
00000000000409d2	movq	%r14, %rdi
00000000000409d5	leaq	-0xf0(%rbp), %rsi
00000000000409dc	movq	%r12, %rdx
00000000000409df	xorl	%ecx, %ecx
00000000000409e1	callq	*0xf0(%rax)
00000000000409e7	movsd	%xmm0, -0x78(%rbp)
00000000000409ec	movq	(%r14), %rax
00000000000409ef	movq	%r14, %rdi
00000000000409f2	movq	%r13, %rsi
00000000000409f5	movq	%r12, %rdx
00000000000409f8	xorl	%ecx, %ecx
00000000000409fa	callq	*0xf0(%rax)
0000000000040a00	movsd	%xmm0, -0x80(%rbp)
0000000000040a05	movq	%r15, %rdi
0000000000040a08	movq	%r14, %rsi
0000000000040a0b	movq	%r12, %rdx
0000000000040a0e	xorl	%ecx, %ecx
0000000000040a10	callq	__ZN8OZSpline12getMinValueUERK6CMTimeb ## OZSpline::getMinValueU(CMTime const&, bool)
0000000000040a15	movq	0x10(%r15), %rax
0000000000040a19	movq	%rax, 0x28(%rsp)
0000000000040a1e	movups	(%r15), %xmm0
0000000000040a22	movups	%xmm0, 0x18(%rsp)
0000000000040a27	leaq	-0xf0(%rbp), %rcx
0000000000040a2e	movq	0x10(%rcx), %rax
0000000000040a32	movq	%rax, 0x10(%rsp)
0000000000040a37	movupd	(%rcx), %xmm0
0000000000040a3b	movupd	%xmm0, (%rsp)
0000000000040a40	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000040a45	testl	%eax, %eax
0000000000040a47	js	0x40aef
0000000000040a4d	movq	0x89a6c(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000040a54	movq	%r15, %rdi
0000000000040a57	movq	%r14, %rsi
0000000000040a5a	xorl	%ecx, %ecx
0000000000040a5c	callq	__ZN8OZSpline12getMaxValueUERK6CMTimeb ## OZSpline::getMaxValueU(CMTime const&, bool)
0000000000040a61	movq	0x10(%r15), %rax
0000000000040a65	movq	%rax, 0x28(%rsp)
0000000000040a6a	movups	(%r15), %xmm0
0000000000040a6e	movups	%xmm0, 0x18(%rsp)
0000000000040a73	movq	-0xc8(%rbp), %rax
0000000000040a7a	movq	%rax, 0x10(%rsp)
0000000000040a7f	movupd	-0xd8(%rbp), %xmm0
0000000000040a87	movupd	%xmm0, (%rsp)
0000000000040a8c	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000040a91	testl	%eax, %eax
0000000000040a93	jle	0x40b1e
0000000000040a99	movq	(%r14), %rax
0000000000040a9c	movq	0x89a1d(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000040aa3	movq	%r14, %rdi
0000000000040aa6	movq	%rbx, %rsi
0000000000040aa9	xorl	%ecx, %ecx
0000000000040aab	callq	*0xf0(%rax)
0000000000040ab1	subsd	-0x78(%rbp), %xmm0
0000000000040ab6	divsd	0x6fa5a(%rip), %xmm0
0000000000040abe	jmp	0x40b30
0000000000040ac0	movsd	0x6fca8(%rip), %xmm1
0000000000040ac8	maxsd	-0x78(%rbp), %xmm1
0000000000040acd	divsd	%xmm1, %xmm0
0000000000040ad1	cmpb	$0x0, 0x10(%rbp)
0000000000040ad5	jne	0x40ae0
0000000000040ad7	leaq	-0x50(%rbp), %rdi
0000000000040adb	callq	__Z21OZBezierFindParameterPKdd  ## OZBezierFindParameter(double const*, double)
0000000000040ae0	movq	(%r15), %rax
0000000000040ae3	leaq	-0x70(%rbp), %rsi
0000000000040ae7	movq	%r15, %rdi
0000000000040aea	callq	*0x70(%rax)
0000000000040aed	jmp	0x40b30
0000000000040aef	movq	(%r14), %rax
0000000000040af2	movq	0x899c7(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000040af9	movq	%r14, %rdi
0000000000040afc	movq	%rbx, %rsi
0000000000040aff	xorl	%ecx, %ecx
0000000000040b01	callq	*0xf0(%rax)
0000000000040b07	movsd	-0x80(%rbp), %xmm1
0000000000040b0c	subsd	%xmm0, %xmm1
0000000000040b10	divsd	0x6fa00(%rip), %xmm1
0000000000040b18	movapd	%xmm1, %xmm0
0000000000040b1c	jmp	0x40b30
0000000000040b1e	movsd	-0x80(%rbp), %xmm0
0000000000040b23	subsd	-0x78(%rbp), %xmm0
0000000000040b28	divsd	0x6fc48(%rip), %xmm0
0000000000040b30	movq	0x89ba1(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000040b37	movq	(%rax), %rax
0000000000040b3a	cmpq	-0x30(%rbp), %rax
0000000000040b3e	jne	0x40b52
0000000000040b40	addq	$0x148, %rsp                    ## imm = 0x148
0000000000040b47	popq	%rbx
0000000000040b48	popq	%r12
0000000000040b4a	popq	%r13
0000000000040b4c	popq	%r14
0000000000040b4e	popq	%r15
0000000000040b50	popq	%rbp
0000000000040b51	retq
0000000000040b52	callq	0xaceac                         ## symbol stub for: ___stack_chk_fail
0000000000040b57	nop
