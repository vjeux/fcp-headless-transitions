__ZN21OZEaseOutInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE:
0000000000043c7e	pushq	%rbp
0000000000043c7f	movq	%rsp, %rbp
0000000000043c82	pushq	%r15
0000000000043c84	pushq	%r14
0000000000043c86	pushq	%r13
0000000000043c88	pushq	%r12
0000000000043c8a	pushq	%rbx
0000000000043c8b	subq	$0xe8, %rsp
0000000000043c92	movsd	%xmm0, -0x38(%rbp)
0000000000043c97	movq	%r9, %rbx
0000000000043c9a	movq	%rcx, %r15
0000000000043c9d	movq	%rdx, %r12
0000000000043ca0	movq	%rsi, %r14
0000000000043ca3	movq	(%rsi), %rax
0000000000043ca6	movq	0x86813(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
0000000000043cad	movq	%rsi, %rdi
0000000000043cb0	movq	%r8, %rsi
0000000000043cb3	movq	%r13, %rdx
0000000000043cb6	xorl	%ecx, %ecx
0000000000043cb8	callq	*0xf0(%rax)
0000000000043cbe	movsd	%xmm0, -0x30(%rbp)
0000000000043cc3	movq	(%r14), %rax
0000000000043cc6	movq	%r14, %rdi
0000000000043cc9	movq	%rbx, %rsi
0000000000043ccc	movq	%r13, %rdx
0000000000043ccf	xorl	%ecx, %ecx
0000000000043cd1	callq	*0xf0(%rax)
0000000000043cd7	movapd	%xmm0, %xmm1
0000000000043cdb	movsd	-0x30(%rbp), %xmm2
0000000000043ce0	maxsd	%xmm2, %xmm1
0000000000043ce4	minsd	%xmm2, %xmm0
0000000000043ce8	movsd	-0x38(%rbp), %xmm3
0000000000043ced	movapd	%xmm3, %xmm2
0000000000043cf1	cmpnltsd	%xmm0, %xmm2
0000000000043cf6	cmpnltsd	%xmm3, %xmm1
0000000000043cfb	andpd	%xmm2, %xmm1
0000000000043cff	movd	%xmm1, %ebx
0000000000043d03	testb	$0x1, %bl
0000000000043d06	je	0x43e27
0000000000043d0c	movq	0x10(%rbp), %r14
0000000000043d10	movq	(%r12), %rax
0000000000043d14	movq	0x867a5(%rip), %r13             ## literal pool symbol address: _kCMTimeZero
0000000000043d1b	movq	%r12, %rdi
0000000000043d1e	movq	%r13, %rsi
0000000000043d21	callq	*0x18(%rax)
0000000000043d24	movsd	%xmm0, -0x30(%rbp)
0000000000043d29	movq	(%r15), %rax
0000000000043d2c	movq	%r15, %rdi
0000000000043d2f	movq	%r13, %rsi
0000000000043d32	callq	*0x18(%rax)
0000000000043d35	movsd	%xmm0, -0x40(%rbp)
0000000000043d3a	movq	0x20(%r12), %rax
0000000000043d3f	movq	%rax, -0x50(%rbp)
0000000000043d43	movups	0x10(%r12), %xmm0
0000000000043d49	movaps	%xmm0, -0x60(%rbp)
0000000000043d4d	movq	0x20(%r12), %rax
0000000000043d52	movq	%rax, 0x28(%rsp)
0000000000043d57	movups	0x10(%r12), %xmm0
0000000000043d5d	movups	%xmm0, 0x18(%rsp)
0000000000043d62	movq	0x20(%r15), %rax
0000000000043d66	movq	%rax, 0x10(%rsp)
0000000000043d6b	movups	0x10(%r15), %xmm0
0000000000043d70	movups	%xmm0, (%rsp)
0000000000043d74	leaq	-0x90(%rbp), %r15
0000000000043d7b	movq	%r15, %rdi
0000000000043d7e	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043d83	leaq	-0xa8(%rbp), %r12
0000000000043d8a	movsd	0x6c85e(%rip), %xmm0
0000000000043d92	movq	%r12, %rdi
0000000000043d95	movq	%r15, %rsi
0000000000043d98	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000043d9d	leaq	-0xc0(%rbp), %r15
0000000000043da4	movsd	0x6c60c(%rip), %xmm0
0000000000043dac	movq	%r15, %rdi
0000000000043daf	movq	%r12, %rsi
0000000000043db2	callq	0xace10                         ## symbol stub for: __ZdvRK6CMTimed
0000000000043db7	movsd	-0x38(%rbp), %xmm0
0000000000043dbc	movsd	-0x30(%rbp), %xmm1
0000000000043dc1	subsd	%xmm1, %xmm0
0000000000043dc5	movsd	-0x40(%rbp), %xmm2
0000000000043dca	subsd	%xmm1, %xmm2
0000000000043dce	divsd	%xmm2, %xmm0
0000000000043dd2	callq	0xacebe                         ## symbol stub for: _asin
0000000000043dd7	leaq	-0x78(%rbp), %r12
0000000000043ddb	movq	%r12, %rdi
0000000000043dde	movq	%r15, %rsi
0000000000043de1	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000043de6	movq	-0x50(%rbp), %rax
0000000000043dea	movq	%rax, 0x28(%rsp)
0000000000043def	movaps	-0x60(%rbp), %xmm0
0000000000043df3	movups	%xmm0, 0x18(%rsp)
0000000000043df8	movq	0x10(%r12), %rax
0000000000043dfd	movq	%rax, 0x10(%rsp)
0000000000043e02	movupd	(%r12), %xmm0
0000000000043e08	movupd	%xmm0, (%rsp)
0000000000043e0d	leaq	-0xd8(%rbp), %r15
0000000000043e14	movq	%r15, %rdi
0000000000043e17	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000043e1c	movq	%r14, %rdi
0000000000043e1f	movq	%r15, %rsi
0000000000043e22	callq	__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_ ## std::__1::vector<CMTime, std::__1::allocator<CMTime>>::push_back[abi:nqe210106](CMTime const&)
0000000000043e27	andb	$0x1, %bl
0000000000043e2a	movl	%ebx, %eax
0000000000043e2c	addq	$0xe8, %rsp
0000000000043e33	popq	%rbx
0000000000043e34	popq	%r12
0000000000043e36	popq	%r13
0000000000043e38	popq	%r14
0000000000043e3a	popq	%r15
0000000000043e3c	popq	%rbp
0000000000043e3d	retq
