__ZN22OZCardinalInterpolator15computeTangentsER8OZSplinePvS2_RK6CMTimePdS6_S6_S6_:
0000000000042ae2	pushq	%rbp
0000000000042ae3	movq	%rsp, %rbp
0000000000042ae6	pushq	%r15
0000000000042ae8	pushq	%r14
0000000000042aea	pushq	%r13
0000000000042aec	pushq	%r12
0000000000042aee	pushq	%rbx
0000000000042aef	subq	$0xf8, %rsp
0000000000042af6	movq	%r9, -0x98(%rbp)
0000000000042afd	movq	%r8, %r15
0000000000042b00	movq	%rcx, %r13
0000000000042b03	movq	%rdx, %r14
0000000000042b06	movq	%rsi, %r12
0000000000042b09	xorl	%eax, %eax
0000000000042b0b	leaq	-0xb0(%rbp), %rdx
0000000000042b12	movq	%rax, (%rdx)
0000000000042b15	movq	%rax, -0x50(%rbp)
0000000000042b19	movq	%rax, -0xa8(%rbp)
0000000000042b20	movsd	0x6ca00(%rip), %xmm0
0000000000042b28	subsd	0x10(%rdi), %xmm0
0000000000042b2d	mulsd	0x6d88b(%rip), %xmm0
0000000000042b35	movsd	%xmm0, -0x40(%rbp)
0000000000042b3a	movq	0x8797f(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000042b41	movq	%rsi, %rdi
0000000000042b44	movq	%r14, %rsi
0000000000042b47	callq	__ZN8OZSpline22getPreviousValidVertexEPvPS0_RK6CMTime ## OZSpline::getPreviousValidVertex(void*, void**, CMTime const&)
0000000000042b4c	testb	%al, %al
0000000000042b4e	je	0x42bde
0000000000042b54	movq	-0xb0(%rbp), %rax
0000000000042b5b	movq	0x20(%rax), %rcx
0000000000042b5f	movq	%rcx, 0x28(%rsp)
0000000000042b64	movups	0x10(%rax), %xmm0
0000000000042b68	movups	%xmm0, 0x18(%rsp)
0000000000042b6d	movq	0x20(%r13), %rax
0000000000042b71	movq	%rax, 0x10(%rsp)
0000000000042b76	movups	0x10(%r13), %xmm0
0000000000042b7b	movups	%xmm0, (%rsp)
0000000000042b7f	leaq	-0x90(%rbp), %rbx
0000000000042b86	movq	%rbx, %rdi
0000000000042b89	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042b8e	movq	0x10(%rbx), %rax
0000000000042b92	movq	%rax, 0x10(%rsp)
0000000000042b97	movupd	(%rbx), %xmm0
0000000000042b9b	movupd	%xmm0, (%rsp)
0000000000042ba0	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042ba5	movsd	%xmm0, -0x48(%rbp)
0000000000042baa	movq	(%r13), %rax
0000000000042bae	movq	%r13, %rdi
0000000000042bb1	movq	%r15, %rsi
0000000000042bb4	callq	*0x18(%rax)
0000000000042bb7	movsd	%xmm0, -0x38(%rbp)
0000000000042bbc	movq	-0xb0(%rbp), %rdi
0000000000042bc3	movq	(%rdi), %rax
0000000000042bc6	movq	%r15, %rsi
0000000000042bc9	callq	*0x18(%rax)
0000000000042bcc	movsd	-0x38(%rbp), %xmm1
0000000000042bd1	subsd	%xmm0, %xmm1
0000000000042bd5	movapd	%xmm1, %xmm0
0000000000042bd9	jmp	0x42ce1
0000000000042bde	movq	%r15, -0x30(%rbp)
0000000000042be2	cmpb	$0x1, 0x90(%r12)
0000000000042beb	jne	0x42ceb
0000000000042bf1	movq	0x20(%r14), %rax
0000000000042bf5	leaq	-0x90(%rbp), %rbx
0000000000042bfc	movq	%rax, 0x10(%rbx)
0000000000042c00	movups	0x10(%r14), %xmm0
0000000000042c05	movaps	%xmm0, (%rbx)
0000000000042c08	leaq	-0xd0(%rbp), %r15
0000000000042c0f	movq	%r15, %rdi
0000000000042c12	movq	%r12, %rsi
0000000000042c15	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
0000000000042c1a	movq	0x10(%r15), %rax
0000000000042c1e	movq	%rax, 0x28(%rsp)
0000000000042c23	movups	(%r15), %xmm0
0000000000042c27	movups	%xmm0, 0x18(%rsp)
0000000000042c2c	movq	0x10(%rbx), %rax
0000000000042c30	movq	%rax, 0x10(%rsp)
0000000000042c35	movaps	(%rbx), %xmm0
0000000000042c38	movups	%xmm0, (%rsp)
0000000000042c3c	leaq	-0x70(%rbp), %r15
0000000000042c40	movq	%r15, %rdi
0000000000042c43	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042c48	movq	0x10(%r15), %rax
0000000000042c4c	movq	%rax, 0x28(%rsp)
0000000000042c51	movups	(%r15), %xmm0
0000000000042c55	movups	%xmm0, 0x18(%rsp)
0000000000042c5a	movq	0x20(%r13), %rax
0000000000042c5e	movq	%rax, 0x10(%rsp)
0000000000042c63	movups	0x10(%r13), %xmm0
0000000000042c68	movups	%xmm0, (%rsp)
0000000000042c6c	movq	%rbx, %rdi
0000000000042c6f	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042c74	movq	0x10(%rbx), %rax
0000000000042c78	movq	%rax, 0x10(%rsp)
0000000000042c7d	movupd	(%rbx), %xmm0
0000000000042c81	movupd	%xmm0, (%rsp)
0000000000042c86	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042c8b	movsd	%xmm0, -0x48(%rbp)
0000000000042c90	movq	0x87829(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000042c97	leaq	-0xa8(%rbp), %rbx
0000000000042c9e	movq	%r12, %rdi
0000000000042ca1	movq	%rbx, %rsi
0000000000042ca4	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
0000000000042ca9	movq	(%rbx), %rsi
0000000000042cac	movq	(%r12), %rax
0000000000042cb0	leaq	-0xa0(%rbp), %r15
0000000000042cb7	movq	%r12, %rdi
0000000000042cba	xorl	%edx, %edx
0000000000042cbc	movq	%r15, %rcx
0000000000042cbf	movq	-0x30(%rbp), %rbx
0000000000042cc3	movq	%rbx, %r8
0000000000042cc6	callq	*0x108(%rax)
0000000000042ccc	movq	(%r13), %rax
0000000000042cd0	movq	%r13, %rdi
0000000000042cd3	movq	%rbx, %rsi
0000000000042cd6	callq	*0x18(%rax)
0000000000042cd9	subsd	(%r15), %xmm0
0000000000042cde	movq	%rbx, %r15
0000000000042ce1	mulsd	-0x40(%rbp), %xmm0
0000000000042ce6	jmp	0x42d9b
0000000000042ceb	movq	0x20(%r14), %rax
0000000000042cef	leaq	-0xd0(%rbp), %rdx
0000000000042cf6	movq	%rax, 0x10(%rdx)
0000000000042cfa	movups	0x10(%r14), %xmm0
0000000000042cff	movaps	%xmm0, (%rdx)
0000000000042d02	leaq	-0x90(%rbp), %rbx
0000000000042d09	movq	%rbx, %rdi
0000000000042d0c	movl	$0x2, %esi
0000000000042d11	callq	0xace40                         ## symbol stub for: __ZmliRK6CMTime
0000000000042d16	movq	0x20(%r13), %rax
0000000000042d1a	movq	%rax, 0x28(%rsp)
0000000000042d1f	movups	0x10(%r13), %xmm0
0000000000042d24	movups	%xmm0, 0x18(%rsp)
0000000000042d29	movq	0x10(%rbx), %rax
0000000000042d2d	movq	%rax, 0x10(%rsp)
0000000000042d32	movups	(%rbx), %xmm0
0000000000042d35	movups	%xmm0, (%rsp)
0000000000042d39	leaq	-0x70(%rbp), %rbx
0000000000042d3d	movq	%rbx, %rdi
0000000000042d40	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042d45	movq	0x10(%rbx), %rax
0000000000042d49	movq	%rax, 0x28(%rsp)
0000000000042d4e	movups	(%rbx), %xmm0
0000000000042d51	movups	%xmm0, 0x18(%rsp)
0000000000042d56	movq	0x20(%r13), %rax
0000000000042d5a	movq	%rax, 0x10(%rsp)
0000000000042d5f	movups	0x10(%r13), %xmm0
0000000000042d64	movups	%xmm0, (%rsp)
0000000000042d68	leaq	-0x90(%rbp), %rbx
0000000000042d6f	movq	%rbx, %rdi
0000000000042d72	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042d77	movq	0x10(%rbx), %rax
0000000000042d7b	movq	%rax, 0x10(%rsp)
0000000000042d80	movupd	(%rbx), %xmm0
0000000000042d84	movupd	%xmm0, (%rsp)
0000000000042d89	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042d8e	movsd	%xmm0, -0x48(%rbp)
0000000000042d93	xorpd	%xmm0, %xmm0
0000000000042d97	movq	-0x30(%rbp), %r15
0000000000042d9b	movsd	%xmm0, -0xa0(%rbp)
0000000000042da3	movq	0x87716(%rip), %rcx             ## literal pool symbol address: _kCMTimeZero
0000000000042daa	leaq	-0x50(%rbp), %rdx
0000000000042dae	movq	%r12, %rdi
0000000000042db1	movq	%r13, %rsi
0000000000042db4	callq	__ZN8OZSpline18getNextValidVertexEPvPS0_RK6CMTime ## OZSpline::getNextValidVertex(void*, void**, CMTime const&)
0000000000042db9	testb	%al, %al
0000000000042dbb	je	0x42e3c
0000000000042dbd	movq	-0x50(%rbp), %rax
0000000000042dc1	movq	0x20(%rax), %rcx
0000000000042dc5	movq	%rcx, 0x28(%rsp)
0000000000042dca	movups	0x10(%rax), %xmm0
0000000000042dce	movups	%xmm0, 0x18(%rsp)
0000000000042dd3	movq	0x20(%r14), %rax
0000000000042dd7	movq	%rax, 0x10(%rsp)
0000000000042ddc	movups	0x10(%r14), %xmm0
0000000000042de1	movups	%xmm0, (%rsp)
0000000000042de5	leaq	-0x90(%rbp), %rbx
0000000000042dec	movq	%rbx, %rdi
0000000000042def	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042df4	movq	0x10(%rbx), %rax
0000000000042df8	movq	%rax, 0x10(%rsp)
0000000000042dfd	movupd	(%rbx), %xmm0
0000000000042e01	movupd	%xmm0, (%rsp)
0000000000042e06	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042e0b	movsd	%xmm0, -0x38(%rbp)
0000000000042e10	movq	(%r14), %rax
0000000000042e13	movq	%r14, %rdi
0000000000042e16	movq	%r15, %rsi
0000000000042e19	callq	*0x18(%rax)
0000000000042e1c	movsd	%xmm0, -0x30(%rbp)
0000000000042e21	movq	-0x50(%rbp), %rdi
0000000000042e25	movq	(%rdi), %rax
0000000000042e28	movq	%r15, %rsi
0000000000042e2b	callq	*0x18(%rax)
0000000000042e2e	movsd	-0x30(%rbp), %xmm2
0000000000042e33	subsd	%xmm0, %xmm2
0000000000042e37	jmp	0x42f51
0000000000042e3c	cmpb	$0x1, 0x90(%r12)
0000000000042e45	jne	0x42f5f
0000000000042e4b	movq	0x20(%r13), %rax
0000000000042e4f	movq	%r15, -0x30(%rbp)
0000000000042e53	leaq	-0x90(%rbp), %rbx
0000000000042e5a	movq	%rax, 0x10(%rbx)
0000000000042e5e	movups	0x10(%r13), %xmm0
0000000000042e63	movaps	%xmm0, (%rbx)
0000000000042e66	leaq	-0xf0(%rbp), %r15
0000000000042e6d	movq	%r15, %rdi
0000000000042e70	movq	%r12, %rsi
0000000000042e73	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
0000000000042e78	movq	0x10(%r15), %rax
0000000000042e7c	movq	%rax, 0x28(%rsp)
0000000000042e81	movups	(%r15), %xmm0
0000000000042e85	movups	%xmm0, 0x18(%rsp)
0000000000042e8a	movq	0x10(%rbx), %rax
0000000000042e8e	movq	%rax, 0x10(%rsp)
0000000000042e93	movaps	(%rbx), %xmm0
0000000000042e96	movups	%xmm0, (%rsp)
0000000000042e9a	leaq	-0xd0(%rbp), %r15
0000000000042ea1	movq	%r15, %rdi
0000000000042ea4	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000042ea9	movups	(%r15), %xmm0
0000000000042ead	movaps	%xmm0, -0x70(%rbp)
0000000000042eb1	movq	0x10(%r15), %rax
0000000000042eb5	movq	%rax, -0x60(%rbp)
0000000000042eb9	movq	-0x60(%rbp), %rax
0000000000042ebd	movq	%rax, 0x28(%rsp)
0000000000042ec2	movaps	-0x70(%rbp), %xmm0
0000000000042ec6	movups	%xmm0, 0x18(%rsp)
0000000000042ecb	movq	0x20(%r14), %rax
0000000000042ecf	movq	%rax, 0x10(%rsp)
0000000000042ed4	movups	0x10(%r14), %xmm0
0000000000042ed9	movups	%xmm0, (%rsp)
0000000000042edd	movq	%rbx, %rdi
0000000000042ee0	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042ee5	movq	0x10(%rbx), %rax
0000000000042ee9	movq	%rax, 0x10(%rsp)
0000000000042eee	movupd	(%rbx), %xmm0
0000000000042ef2	movupd	%xmm0, (%rsp)
0000000000042ef7	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000042efc	movsd	%xmm0, -0x38(%rbp)
0000000000042f01	movq	0x875b8(%rip), %rdx             ## literal pool symbol address: _kCMTimeZero
0000000000042f08	leaq	-0xa8(%rbp), %rbx
0000000000042f0f	movq	%r12, %rdi
0000000000042f12	movq	%rbx, %rsi
0000000000042f15	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
0000000000042f1a	movq	(%rbx), %rsi
0000000000042f1d	movq	(%r12), %rax
0000000000042f21	leaq	-0x90(%rbp), %rbx
0000000000042f28	movq	%r12, %rdi
0000000000042f2b	xorl	%edx, %edx
0000000000042f2d	movq	%rbx, %rcx
0000000000042f30	movq	-0x30(%rbp), %r15
0000000000042f34	movq	%r15, %r8
0000000000042f37	callq	*0x108(%rax)
0000000000042f3d	movq	(%r14), %rax
0000000000042f40	movq	%r14, %rdi
0000000000042f43	movq	%r15, %rsi
0000000000042f46	callq	*0x18(%rax)
0000000000042f49	movapd	%xmm0, %xmm2
0000000000042f4d	subsd	(%rbx), %xmm2
0000000000042f51	movsd	-0x40(%rbp), %xmm1
0000000000042f56	mulsd	%xmm1, %xmm2
0000000000042f5a	jmp	0x4301c
0000000000042f5f	movq	0x20(%r13), %rax
0000000000042f63	leaq	-0xf0(%rbp), %rdx
0000000000042f6a	movq	%rax, 0x10(%rdx)
0000000000042f6e	movups	0x10(%r13), %xmm0
0000000000042f73	movaps	%xmm0, (%rdx)
0000000000042f76	leaq	-0xd0(%rbp), %rbx
0000000000042f7d	movq	%rbx, %rdi
0000000000042f80	movl	$0x2, %esi
0000000000042f85	callq	0xace40                         ## symbol stub for: __ZmliRK6CMTime
0000000000042f8a	movq	0x20(%r14), %rax
0000000000042f8e	movq	%rax, 0x28(%rsp)
0000000000042f93	movups	0x10(%r14), %xmm0
0000000000042f98	movups	%xmm0, 0x18(%rsp)
0000000000042f9d	movq	0x10(%rbx), %rax
0000000000042fa1	movq	%rax, 0x10(%rsp)
0000000000042fa6	movups	(%rbx), %xmm0
0000000000042fa9	movups	%xmm0, (%rsp)
0000000000042fad	leaq	-0x90(%rbp), %rbx
0000000000042fb4	movq	%rbx, %rdi
0000000000042fb7	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042fbc	movq	0x10(%rbx), %rax
0000000000042fc0	movq	%rax, -0x60(%rbp)
0000000000042fc4	movups	(%rbx), %xmm0
0000000000042fc7	movaps	%xmm0, -0x70(%rbp)
0000000000042fcb	movq	-0x60(%rbp), %rax
0000000000042fcf	movq	%rax, 0x28(%rsp)
0000000000042fd4	movaps	-0x70(%rbp), %xmm0
0000000000042fd8	movups	%xmm0, 0x18(%rsp)
0000000000042fdd	movq	0x20(%r14), %rax
0000000000042fe1	movq	%rax, 0x10(%rsp)
0000000000042fe6	movups	0x10(%r14), %xmm0
0000000000042feb	movups	%xmm0, (%rsp)
0000000000042fef	movq	%rbx, %rdi
0000000000042ff2	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000042ff7	movq	0x10(%rbx), %rax
0000000000042ffb	movq	%rax, 0x10(%rsp)
0000000000043000	movupd	(%rbx), %xmm0
0000000000043004	movupd	%xmm0, (%rsp)
0000000000043009	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
000000000004300e	movsd	%xmm0, -0x38(%rbp)
0000000000043013	xorpd	%xmm2, %xmm2
0000000000043017	movsd	-0x40(%rbp), %xmm1
000000000004301c	movq	0x10(%rbp), %rax
0000000000043020	cmpq	$0x0, -0x98(%rbp)
0000000000043028	je	0x4303e
000000000004302a	movsd	-0x48(%rbp), %xmm0
000000000004302f	mulsd	%xmm1, %xmm0
0000000000043033	movq	-0x98(%rbp), %rcx
000000000004303a	movsd	%xmm0, (%rcx)
000000000004303e	movq	0x18(%rbp), %rcx
0000000000043042	testq	%rax, %rax
0000000000043045	je	0x43053
0000000000043047	movsd	-0xa0(%rbp), %xmm0
000000000004304f	movsd	%xmm0, (%rax)
0000000000043053	movq	0x20(%rbp), %rax
0000000000043057	testq	%rcx, %rcx
000000000004305a	je	0x43065
000000000004305c	mulsd	-0x38(%rbp), %xmm1
0000000000043061	movsd	%xmm1, (%rcx)
0000000000043065	testq	%rax, %rax
0000000000043068	je	0x4306e
000000000004306a	movsd	%xmm2, (%rax)
000000000004306e	addq	$0xf8, %rsp
0000000000043075	popq	%rbx
0000000000043076	popq	%r12
0000000000043078	popq	%r13
000000000004307a	popq	%r14
000000000004307c	popq	%r15
000000000004307e	popq	%rbp
000000000004307f	retq
