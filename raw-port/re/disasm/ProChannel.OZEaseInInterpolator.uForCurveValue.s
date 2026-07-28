__ZN20OZEaseInInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE:
000000000004371c	pushq	%rbp
000000000004371d	movq	%rsp, %rbp
0000000000043720	pushq	%r15
0000000000043722	pushq	%r14
0000000000043724	pushq	%r13
0000000000043726	pushq	%r12
0000000000043728	pushq	%rbx
0000000000043729	subq	$0xe8, %rsp
0000000000043730	movsd	%xmm0, -0x38(%rbp)
0000000000043735	movq	%r9, %rbx
0000000000043738	movq	%rcx, %r15
000000000004373b	movq	%rdx, %r12
000000000004373e	movq	%rsi, %r14
0000000000043741	movq	(%rsi), %rax
0000000000043744	movq	0x86d75(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
000000000004374b	movq	%rsi, %rdi
000000000004374e	movq	%r8, %rsi
0000000000043751	movq	%r13, %rdx
0000000000043754	xorl	%ecx, %ecx
0000000000043756	callq	*0xf0(%rax)
000000000004375c	movsd	%xmm0, -0x30(%rbp)
0000000000043761	movq	(%r14), %rax
0000000000043764	movq	%r14, %rdi
0000000000043767	movq	%rbx, %rsi
000000000004376a	movq	%r13, %rdx
000000000004376d	xorl	%ecx, %ecx
000000000004376f	callq	*0xf0(%rax)
0000000000043775	movapd	%xmm0, %xmm1
0000000000043779	movsd	-0x30(%rbp), %xmm2
000000000004377e	maxsd	%xmm2, %xmm1
0000000000043782	minsd	%xmm2, %xmm0
0000000000043786	movsd	-0x38(%rbp), %xmm3
000000000004378b	movapd	%xmm3, %xmm2
000000000004378f	cmpnltsd	%xmm0, %xmm2
0000000000043794	cmpnltsd	%xmm3, %xmm1
0000000000043799	andpd	%xmm2, %xmm1
000000000004379d	movd	%xmm1, %ebx
00000000000437a1	testb	$0x1, %bl
00000000000437a4	je	0x438c9
00000000000437aa	movq	0x10(%rbp), %r14
00000000000437ae	movq	(%r12), %rax
00000000000437b2	movq	0x86d07(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
00000000000437b9	movq	%r12, %rdi
00000000000437bc	movq	%r13, %rsi
00000000000437bf	callq	*0x18(%rax)
00000000000437c2	movsd	%xmm0, -0x30(%rbp)
00000000000437c7	movq	(%r15), %rax
00000000000437ca	movq	%r15, %rdi
00000000000437cd	movq	%r13, %rsi
00000000000437d0	callq	*0x18(%rax)
00000000000437d3	movsd	%xmm0, -0x40(%rbp)
00000000000437d8	movq	0x20(%r12), %rax
00000000000437dd	movq	%rax, -0x50(%rbp)
00000000000437e1	movups	0x10(%r12), %xmm0
00000000000437e7	movaps	%xmm0, -0x60(%rbp)
00000000000437eb	movq	0x20(%r12), %rax
00000000000437f0	movq	%rax, 0x28(%rsp)
00000000000437f5	movups	0x10(%r12), %xmm0
00000000000437fb	movups	%xmm0, 0x18(%rsp)
0000000000043800	movq	0x20(%r15), %rax
0000000000043804	movq	%rax, 0x10(%rsp)
0000000000043809	movups	0x10(%r15), %xmm0
000000000004380e	movups	%xmm0, (%rsp)
0000000000043812	leaq	-0x90(%rbp), %r15
0000000000043819	movq	%r15, %rdi
000000000004381c	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043821	leaq	-0xa8(%rbp), %r12
0000000000043828	movsd	0x6cdc0(%rip), %xmm0
0000000000043830	movq	%r12, %rdi
0000000000043833	movq	%r15, %rsi
0000000000043836	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
000000000004383b	leaq	-0xc0(%rbp), %r15
0000000000043842	movsd	0x6cb6e(%rip), %xmm0
000000000004384a	movq	%r15, %rdi
000000000004384d	movq	%r12, %rsi
0000000000043850	callq	0xace10                         ## symbol stub for: __ZdvRK6CMTimed
0000000000043855	movsd	-0x30(%rbp), %xmm0
000000000004385a	movsd	-0x40(%rbp), %xmm1
000000000004385f	subsd	%xmm0, %xmm1
0000000000043863	subsd	-0x38(%rbp), %xmm0
0000000000043868	divsd	%xmm1, %xmm0
000000000004386c	addsd	0x6bcb4(%rip), %xmm0
0000000000043874	callq	0xaceb2                         ## symbol stub for: _acos
0000000000043879	leaq	-0x78(%rbp), %r12
000000000004387d	movq	%r12, %rdi
0000000000043880	movq	%r15, %rsi
0000000000043883	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000043888	movq	-0x50(%rbp), %rax
000000000004388c	movq	%rax, 0x28(%rsp)
0000000000043891	movaps	-0x60(%rbp), %xmm0
0000000000043895	movups	%xmm0, 0x18(%rsp)
000000000004389a	movq	0x10(%r12), %rax
000000000004389f	movq	%rax, 0x10(%rsp)
00000000000438a4	movupd	(%r12), %xmm0
00000000000438aa	movupd	%xmm0, (%rsp)
00000000000438af	leaq	-0xd8(%rbp), %r15
00000000000438b6	movq	%r15, %rdi
00000000000438b9	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
00000000000438be	movq	%r14, %rdi
00000000000438c1	movq	%r15, %rsi
00000000000438c4	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
00000000000438c9	andb	$0x1, %bl
00000000000438cc	movl	%ebx, %eax
00000000000438ce	addq	$0xe8, %rsp
00000000000438d5	popq	%rbx
00000000000438d6	popq	%r12
00000000000438d8	popq	%r13
00000000000438da	popq	%r14
00000000000438dc	popq	%r15
00000000000438de	popq	%rbp
00000000000438df	retq
