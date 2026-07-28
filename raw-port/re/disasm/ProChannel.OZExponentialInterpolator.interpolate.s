__ZN25OZExponentialInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb:
0000000000043e6a	pushq	%rbp
0000000000043e6b	movq	%rsp, %rbp
0000000000043e6e	pushq	%r15
0000000000043e70	pushq	%r14
0000000000043e72	pushq	%r12
0000000000043e74	pushq	%rbx
0000000000043e75	subq	$0xf0, %rsp
0000000000043e7c	movq	%r9, %rbx
0000000000043e7f	movq	%r8, %r15
0000000000043e82	movq	%rdx, %r12
0000000000043e85	movq	%rsi, %r14
0000000000043e88	movq	0x20(%rcx), %rax
0000000000043e8c	movq	%rax, -0x30(%rbp)
0000000000043e90	movups	0x10(%rcx), %xmm0
0000000000043e94	movaps	%xmm0, -0x40(%rbp)
0000000000043e98	movq	0x20(%r8), %rax
0000000000043e9c	movq	%rax, -0x60(%rbp)
0000000000043ea0	movups	0x10(%r8), %xmm0
0000000000043ea5	movaps	%xmm0, -0x70(%rbp)
0000000000043ea9	movq	(%rcx), %rax
0000000000043eac	movq	%rcx, %rdi
0000000000043eaf	movq	%rdx, %rsi
0000000000043eb2	callq	*0x18(%rax)
0000000000043eb5	movsd	%xmm0, -0x28(%rbp)
0000000000043eba	movq	(%r15), %rax
0000000000043ebd	movq	%r15, %rdi
0000000000043ec0	movq	%r12, %rsi
0000000000043ec3	callq	*0x18(%rax)
0000000000043ec6	movaps	%xmm0, -0x50(%rbp)
0000000000043eca	movq	-0x60(%rbp), %rax
0000000000043ece	movq	%rax, 0x28(%rsp)
0000000000043ed3	movaps	-0x70(%rbp), %xmm0
0000000000043ed7	movups	%xmm0, 0x18(%rsp)
0000000000043edc	movq	-0x30(%rbp), %rax
0000000000043ee0	movq	%rax, 0x10(%rsp)
0000000000043ee5	movaps	-0x40(%rbp), %xmm0
0000000000043ee9	movups	%xmm0, (%rsp)
0000000000043eed	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043ef2	testl	%eax, %eax
0000000000043ef4	jle	0x43f34
0000000000043ef6	leaq	-0x90(%rbp), %r15
0000000000043efd	movq	%r15, %rdi
0000000000043f00	movq	%r14, %rsi
0000000000043f03	callq	__ZNK8OZSpline14getSmallDeltaUEv ## OZSpline::getSmallDeltaU() const
0000000000043f08	movq	0x10(%r15), %rax
0000000000043f0c	movq	%rax, 0x28(%rsp)
0000000000043f11	movups	(%r15), %xmm0
0000000000043f15	movups	%xmm0, 0x18(%rsp)
0000000000043f1a	movq	-0x30(%rbp), %rax
0000000000043f1e	movq	%rax, 0x10(%rsp)
0000000000043f23	movaps	-0x40(%rbp), %xmm0
0000000000043f27	movups	%xmm0, (%rsp)
0000000000043f2b	leaq	-0x70(%rbp), %rdi
0000000000043f2f	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000043f34	movq	-0x30(%rbp), %rax
0000000000043f38	movq	%rax, 0x28(%rsp)
0000000000043f3d	movaps	-0x40(%rbp), %xmm0
0000000000043f41	movups	%xmm0, 0x18(%rsp)
0000000000043f46	movq	-0x60(%rbp), %rax
0000000000043f4a	movq	%rax, 0x10(%rsp)
0000000000043f4f	movaps	-0x70(%rbp), %xmm0
0000000000043f53	movups	%xmm0, (%rsp)
0000000000043f57	leaq	-0xc8(%rbp), %r14
0000000000043f5e	movq	%r14, %rdi
0000000000043f61	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000043f66	movq	0x86553(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
0000000000043f6d	movq	0x10(%rax), %rcx
0000000000043f71	movq	%rcx, -0x80(%rbp)
0000000000043f75	movups	(%rax), %xmm0
0000000000043f78	movaps	%xmm0, -0x90(%rbp)
0000000000043f7f	movq	-0x80(%rbp), %rax
0000000000043f83	movq	%rax, 0x28(%rsp)
0000000000043f88	movaps	-0x90(%rbp), %xmm0
0000000000043f8f	movups	%xmm0, 0x18(%rsp)
0000000000043f94	movq	0x10(%r14), %rax
0000000000043f98	movq	%rax, 0x10(%rsp)
0000000000043f9d	movups	(%r14), %xmm0
0000000000043fa1	movups	%xmm0, (%rsp)
0000000000043fa5	callq	0xaca80                         ## symbol stub for: _CMTimeCompare
0000000000043faa	testl	%eax, %eax
0000000000043fac	je	0x440d2
0000000000043fb2	movapd	-0x50(%rbp), %xmm0
0000000000043fb7	movapd	%xmm0, %xmm3
0000000000043fbb	movsd	-0x28(%rbp), %xmm1
0000000000043fc0	subsd	%xmm1, %xmm3
0000000000043fc4	movapd	%xmm3, -0xb0(%rbp)
0000000000043fcc	movapd	0x6c66c(%rip), %xmm2
0000000000043fd4	xorpd	%xmm3, %xmm2
0000000000043fd8	cmpltsd	%xmm1, %xmm0
0000000000043fdd	movapd	%xmm3, %xmm1
0000000000043fe1	blendvpd	%xmm0, %xmm2, %xmm1
0000000000043fe6	movapd	%xmm1, %xmm0
0000000000043fea	callq	0xaceee                         ## symbol stub for: _log
0000000000043fef	movsd	%xmm0, -0x50(%rbp)
0000000000043ff4	movq	0x10(%rbx), %rax
0000000000043ff8	leaq	-0x90(%rbp), %r14
0000000000043fff	movq	%rax, 0x10(%r14)
0000000000044003	movups	(%rbx), %xmm0
0000000000044006	movaps	%xmm0, (%r14)
000000000004400a	movq	-0x30(%rbp), %rax
000000000004400e	movq	%rax, 0x28(%rsp)
0000000000044013	movaps	-0x40(%rbp), %xmm0
0000000000044017	movups	%xmm0, 0x18(%rsp)
000000000004401c	movq	0x10(%r14), %rax
0000000000044020	movq	%rax, 0x10(%rsp)
0000000000044025	movaps	(%r14), %xmm0
0000000000044029	movups	%xmm0, (%rsp)
000000000004402d	leaq	-0xe0(%rbp), %rbx
0000000000044034	movq	%rbx, %rdi
0000000000044037	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000004403c	leaq	-0xc8(%rbp), %rdx
0000000000044043	movq	%r14, %rdi
0000000000044046	movq	%rbx, %rsi
0000000000044049	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
000000000004404e	movq	0x10(%r14), %rax
0000000000044052	movq	%rax, 0x10(%rsp)
0000000000044057	movupd	(%r14), %xmm0
000000000004405c	movupd	%xmm0, (%rsp)
0000000000044061	callq	0xaca8c                         ## symbol stub for: _CMTimeGetSeconds
0000000000044066	movsd	-0x50(%rbp), %xmm1
000000000004406b	addsd	0x6c865(%rip), %xmm1
0000000000044073	movsd	%xmm1, -0x50(%rbp)
0000000000044078	mulsd	%xmm1, %xmm0
000000000004407c	addsd	0x6c85c(%rip), %xmm0
0000000000044084	callq	0xacee2                         ## symbol stub for: _exp
0000000000044089	movsd	%xmm0, -0x98(%rbp)
0000000000044091	movsd	-0x50(%rbp), %xmm0
0000000000044096	addsd	0x6c842(%rip), %xmm0
000000000004409e	callq	0xacee2                         ## symbol stub for: _exp
00000000000440a3	movsd	0x6c83d(%rip), %xmm1
00000000000440ab	movsd	-0x98(%rbp), %xmm2
00000000000440b3	addsd	%xmm1, %xmm2
00000000000440b7	mulsd	-0xb0(%rbp), %xmm2
00000000000440bf	addsd	%xmm1, %xmm0
00000000000440c3	divsd	%xmm0, %xmm2
00000000000440c7	movsd	-0x28(%rbp), %xmm0
00000000000440cc	addsd	%xmm2, %xmm0
00000000000440d0	jmp	0x440d7
00000000000440d2	movsd	-0x28(%rbp), %xmm0
00000000000440d7	addq	$0xf0, %rsp
00000000000440de	popq	%rbx
00000000000440df	popq	%r12
00000000000440e1	popq	%r14
00000000000440e3	popq	%r15
00000000000440e5	popq	%rbp
00000000000440e6	retq
00000000000440e7	nop
