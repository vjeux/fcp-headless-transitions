__ZN6PCMath3modERK6CMTimeS2_:
000000000003a34e	pushq	%rbp
000000000003a34f	movq	%rsp, %rbp
000000000003a352	pushq	%r15
000000000003a354	pushq	%r14
000000000003a356	pushq	%r12
000000000003a358	pushq	%rbx
000000000003a359	subq	$0xa0, %rsp
000000000003a360	movq	%rdx, %r14
000000000003a363	movq	%rdi, %rbx
000000000003a366	callq	0xace0a                         ## symbol stub for: __ZdvRK6CMTimeS1_
000000000003a36b	leaq	-0x58(%rbp), %r12
000000000003a36f	movl	$0x1, %esi
000000000003a374	movq	%r12, %rdi
000000000003a377	movl	$0x1, %edx
000000000003a37c	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000003a381	movq	0x10(%rbx), %rax
000000000003a385	leaq	-0x40(%rbp), %r15
000000000003a389	movq	%rax, 0x10(%r15)
000000000003a38d	movups	(%rbx), %xmm0
000000000003a390	movaps	%xmm0, (%r15)
000000000003a394	movq	0x10(%r12), %rax
000000000003a399	movq	%rax, 0x28(%rsp)
000000000003a39e	movups	(%r12), %xmm0
000000000003a3a3	movups	%xmm0, 0x18(%rsp)
000000000003a3a8	movq	0x10(%r15), %rax
000000000003a3ac	movq	%rax, 0x10(%rsp)
000000000003a3b1	movaps	(%r15), %xmm0
000000000003a3b5	movups	%xmm0, (%rsp)
000000000003a3b9	leaq	-0x70(%rbp), %r12
000000000003a3bd	movq	%r12, %rdi
000000000003a3c0	callq	0xacace                         ## symbol stub for: _PC_CMTimeFloorToSampleDuration
000000000003a3c5	movq	0x10(%rbx), %rax
000000000003a3c9	movq	%rax, 0x10(%r15)
000000000003a3cd	movups	(%rbx), %xmm0
000000000003a3d0	movaps	%xmm0, (%r15)
000000000003a3d4	movq	0x10(%r12), %rax
000000000003a3d9	movq	%rax, 0x28(%rsp)
000000000003a3de	movups	(%r12), %xmm0
000000000003a3e3	movups	%xmm0, 0x18(%rsp)
000000000003a3e8	movq	0x10(%r15), %rax
000000000003a3ec	movq	%rax, 0x10(%rsp)
000000000003a3f1	movaps	(%r15), %xmm0
000000000003a3f5	movups	%xmm0, (%rsp)
000000000003a3f9	leaq	-0x88(%rbp), %r12
000000000003a400	movq	%r12, %rdi
000000000003a403	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
000000000003a408	movq	%r15, %rdi
000000000003a40b	movq	%r12, %rsi
000000000003a40e	movq	%r14, %rdx
000000000003a411	callq	0xace22                         ## symbol stub for: __ZmlRK6CMTimeS1_
000000000003a416	movq	0x10(%r15), %rax
000000000003a41a	movq	%rax, 0x10(%rbx)
000000000003a41e	movups	(%r15), %xmm0
000000000003a422	movups	%xmm0, (%rbx)
000000000003a425	movq	%rbx, %rax
000000000003a428	addq	$0xa0, %rsp
000000000003a42f	popq	%rbx
000000000003a430	popq	%r12
000000000003a432	popq	%r14
000000000003a434	popq	%r15
000000000003a436	popq	%rbp
000000000003a437	retq
