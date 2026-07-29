__ZN8OZSpline21forceWarpSplineLinearERK6CMTimeS2_:
000000000003cae2	pushq	%rbp
000000000003cae3	movq	%rsp, %rbp
000000000003cae6	pushq	%r15
000000000003cae8	pushq	%r14
000000000003caea	pushq	%r13
000000000003caec	pushq	%r12
000000000003caee	pushq	%rbx
000000000003caef	subq	$0xc8, %rsp
000000000003caf6	movq	%rdx, -0x70(%rbp)
000000000003cafa	movq	%rdi, %rbx
000000000003cafd	movq	0x28(%rdi), %r15
000000000003cb01	movq	0x8d9b8(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000003cb08	movq	0x10(%rax), %rcx
000000000003cb0c	movq	%rcx, -0x80(%rbp)
000000000003cb10	movups	(%rax), %xmm0
000000000003cb13	movaps	%xmm0, -0x90(%rbp)
000000000003cb1a	xorl	%eax, %eax
000000000003cb1c	movq	%rax, -0x30(%rbp)
000000000003cb20	movq	%rax, -0x38(%rbp)
000000000003cb24	movq	0x10(%rsi), %rax
000000000003cb28	movq	%rax, -0x50(%rbp)
000000000003cb2c	movq	%rsi, -0x78(%rbp)
000000000003cb30	movups	(%rsi), %xmm0
000000000003cb33	movaps	%xmm0, -0x60(%rbp)
000000000003cb37	movq	-0x50(%rbp), %rax
000000000003cb3b	movq	%rax, 0x10(%rsp)
000000000003cb40	movaps	-0x60(%rbp), %xmm0
000000000003cb44	movups	%xmm0, (%rsp)
000000000003cb48	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000003cb4d	movsd	%xmm0, -0x48(%rbp)
000000000003cb52	cmpq	%r15, 0x30(%rbx)
000000000003cb56	je	0x3cca1
000000000003cb5c	movq	%rbx, -0x68(%rbp)
000000000003cb60	movq	(%r15), %r13
000000000003cb63	movq	(%r13), %rax
000000000003cb67	movq	%r13, %rdi
000000000003cb6a	callq	*0xa8(%rax)
000000000003cb70	movl	%eax, -0x3c(%rbp)
000000000003cb73	movl	%eax, %esi
000000000003cb75	andl	$-0x3, %esi
000000000003cb78	movq	(%r13), %rax
000000000003cb7c	movq	%r13, %rdi
000000000003cb7f	callq	*0xb0(%rax)
000000000003cb85	movups	0x10(%r13), %xmm0
000000000003cb8a	movq	0x20(%r13), %rax
000000000003cb8e	movq	%rax, -0x80(%rbp)
000000000003cb92	movaps	%xmm0, -0x90(%rbp)
000000000003cb99	movq	(%r13), %rax
000000000003cb9d	movq	%r13, %rdi
000000000003cba0	leaq	-0x30(%rbp), %r12
000000000003cba4	movq	%r12, %rsi
000000000003cba7	leaq	-0x38(%rbp), %r14
000000000003cbab	movq	%r14, %rdx
000000000003cbae	movq	0x8d90b(%rip), %rbx             ## literal pool symbol address: _kCMTimeZero
000000000003cbb5	movq	%rbx, %rcx
000000000003cbb8	callq	*0x38(%rax)
000000000003cbbb	movsd	-0x30(%rbp), %xmm0
000000000003cbc0	mulsd	-0x48(%rbp), %xmm0
000000000003cbc5	movsd	%xmm0, -0x30(%rbp)
000000000003cbca	movsd	-0x38(%rbp), %xmm1
000000000003cbcf	movq	(%r13), %rax
000000000003cbd3	movq	%r13, %rdi
000000000003cbd6	movq	%rbx, %rsi
000000000003cbd9	callq	*0x48(%rax)
000000000003cbdc	movq	(%r13), %rax
000000000003cbe0	movq	%r13, %rdi
000000000003cbe3	movq	%r12, %rsi
000000000003cbe6	movq	%r14, %rdx
000000000003cbe9	movq	%rbx, %rcx
000000000003cbec	callq	*0x40(%rax)
000000000003cbef	movsd	-0x30(%rbp), %xmm0
000000000003cbf4	mulsd	-0x48(%rbp), %xmm0
000000000003cbf9	movsd	%xmm0, -0x30(%rbp)
000000000003cbfe	movsd	-0x38(%rbp), %xmm1
000000000003cc03	movq	(%r13), %rax
000000000003cc07	movq	%r13, %rdi
000000000003cc0a	movq	%rbx, %rsi
000000000003cc0d	callq	*0x50(%rax)
000000000003cc10	leaq	-0xa8(%rbp), %rdi
000000000003cc17	leaq	-0x90(%rbp), %rsi
000000000003cc1e	movq	-0x78(%rbp), %rdx
000000000003cc22	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
000000000003cc27	movq	-0x70(%rbp), %rcx
000000000003cc2b	movq	0x10(%rcx), %rax
000000000003cc2f	movq	%rax, -0x50(%rbp)
000000000003cc33	movups	(%rcx), %xmm0
000000000003cc36	movaps	%xmm0, -0x60(%rbp)
000000000003cc3a	movq	-0x50(%rbp), %rax
000000000003cc3e	movq	%rax, 0x28(%rsp)
000000000003cc43	movaps	-0x60(%rbp), %xmm0
000000000003cc47	movups	%xmm0, 0x18(%rsp)
000000000003cc4c	movq	-0x98(%rbp), %rax
000000000003cc53	movq	%rax, 0x10(%rsp)
000000000003cc58	movups	-0xa8(%rbp), %xmm0
000000000003cc5f	movups	%xmm0, (%rsp)
000000000003cc63	leaq	-0xc0(%rbp), %rbx
000000000003cc6a	movq	%rbx, %rdi
000000000003cc6d	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
000000000003cc72	movq	(%r13), %rax
000000000003cc76	movq	%r13, %rdi
000000000003cc79	movq	%rbx, %rsi
000000000003cc7c	callq	*0x10(%rax)
000000000003cc7f	movq	(%r13), %rax
000000000003cc83	movq	%r13, %rdi
000000000003cc86	movl	-0x3c(%rbp), %esi
000000000003cc89	movq	-0x68(%rbp), %rbx
000000000003cc8d	callq	*0xb0(%rax)
000000000003cc93	addq	$0x8, %r15
000000000003cc97	cmpq	0x30(%rbx), %r15
000000000003cc9b	jne	0x3cb60
000000000003cca1	addq	$0xc8, %rsp
000000000003cca8	popq	%rbx
000000000003cca9	popq	%r12
000000000003ccab	popq	%r13
000000000003ccad	popq	%r14
000000000003ccaf	popq	%r15
000000000003ccb1	popq	%rbp
000000000003ccb2	retq
000000000003ccb3	nop
