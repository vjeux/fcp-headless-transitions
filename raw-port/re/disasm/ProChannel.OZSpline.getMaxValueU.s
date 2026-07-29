__ZN8OZSpline12getMaxValueUERK6CMTimeb:
000000000002da44	pushq	%rbp
000000000002da45	movq	%rsp, %rbp
000000000002da48	pushq	%r15
000000000002da4a	pushq	%r14
000000000002da4c	pushq	%r13
000000000002da4e	pushq	%r12
000000000002da50	pushq	%rbx
000000000002da51	subq	$0x28, %rsp
000000000002da55	movl	%ecx, %r15d
000000000002da58	movq	%rdx, %r12
000000000002da5b	movq	%rsi, %r14
000000000002da5e	movq	%rdi, %rbx
000000000002da61	movq	$0x0, -0x30(%rbp)
000000000002da69	testl	%ecx, %ecx
000000000002da6b	je	0x2dac4
000000000002da6d	movq	0xa0(%r14), %rax
000000000002da74	testq	%rax, %rax
000000000002da77	je	0x2da82
000000000002da79	movq	0x30(%rax), %rdi
000000000002da7d	testq	%rdi, %rdi
000000000002da80	jne	0x2da86
000000000002da82	leaq	0x8(%r14), %rdi
000000000002da86	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002da8b	leaq	-0x30(%rbp), %rsi
000000000002da8f	movq	%r14, %rdi
000000000002da92	movq	%r12, %rdx
000000000002da95	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
000000000002da9a	testb	%al, %al
000000000002da9c	jne	0x2dad7
000000000002da9e	movq	0xa0(%r14), %rax
000000000002daa5	testq	%rax, %rax
000000000002daa8	je	0x2dab3
000000000002daaa	movq	0x30(%rax), %rdi
000000000002daae	testq	%rdi, %rdi
000000000002dab1	jne	0x2daba
000000000002dab3	addq	$0x8, %r14
000000000002dab7	movq	%r14, %rdi
000000000002daba	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002dabf	jmp	0x2db56
000000000002dac4	leaq	-0x30(%rbp), %rsi
000000000002dac8	movq	%r14, %rdi
000000000002dacb	movq	%r12, %rdx
000000000002dace	callq	__ZN8OZSpline18getLastValidVertexEPPvRK6CMTime ## OZSpline::getLastValidVertex(void**, CMTime const&)
000000000002dad3	testb	%al, %al
000000000002dad5	je	0x2db56
000000000002dad7	movq	-0x30(%rbp), %rdi
000000000002dadb	movq	0x20(%rdi), %rax
000000000002dadf	movq	%rax, 0x10(%rbx)
000000000002dae3	movups	0x10(%rdi), %xmm0
000000000002dae7	movups	%xmm0, (%rbx)
000000000002daea	movq	0x98(%r14), %r13
000000000002daf1	movq	(%rdi), %rax
000000000002daf4	callq	*0xd0(%rax)
000000000002dafa	movq	%r13, %rdi
000000000002dafd	movl	%eax, %esi
000000000002daff	callq	__ZN15OZInterpolators15getInterpolatorEj ## OZInterpolators::getInterpolator(unsigned int)
000000000002db04	movq	(%rax), %r9
000000000002db07	leaq	-0x48(%rbp), %r13
000000000002db0b	movq	%r13, %rdi
000000000002db0e	movq	%rax, %rsi
000000000002db11	movq	%r14, %rdx
000000000002db14	movq	%r12, %rcx
000000000002db17	movq	%rbx, %r8
000000000002db1a	callq	*0x48(%r9)
000000000002db1e	movq	0x10(%r13), %rax
000000000002db22	movq	%rax, 0x10(%rbx)
000000000002db26	movups	(%r13), %xmm0
000000000002db2b	movups	%xmm0, (%rbx)
000000000002db2e	testb	%r15b, %r15b
000000000002db31	je	0x2db6b
000000000002db33	movq	0xa0(%r14), %rax
000000000002db3a	testq	%rax, %rax
000000000002db3d	je	0x2db48
000000000002db3f	movq	0x30(%rax), %rdi
000000000002db43	testq	%rdi, %rdi
000000000002db46	jne	0x2db4f
000000000002db48	addq	$0x8, %r14
000000000002db4c	movq	%r14, %rdi
000000000002db4f	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002db54	jmp	0x2db6b
000000000002db56	movq	0x9c963(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000002db5d	movq	0x10(%rax), %rcx
000000000002db61	movq	%rcx, 0x10(%rbx)
000000000002db65	movups	(%rax), %xmm0
000000000002db68	movups	%xmm0, (%rbx)
000000000002db6b	movq	%rbx, %rax
000000000002db6e	addq	$0x28, %rsp
000000000002db72	popq	%rbx
000000000002db73	popq	%r12
000000000002db75	popq	%r13
000000000002db77	popq	%r14
000000000002db79	popq	%r15
000000000002db7b	popq	%rbp
000000000002db7c	retq
000000000002db7d	nop
