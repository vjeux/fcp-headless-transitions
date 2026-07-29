__ZN8OZSpline12getMinValueUERK6CMTimeb:
000000000002db7e	pushq	%rbp
000000000002db7f	movq	%rsp, %rbp
000000000002db82	pushq	%r15
000000000002db84	pushq	%r14
000000000002db86	pushq	%r13
000000000002db88	pushq	%r12
000000000002db8a	pushq	%rbx
000000000002db8b	subq	$0x28, %rsp
000000000002db8f	movl	%ecx, %r15d
000000000002db92	movq	%rdx, %r12
000000000002db95	movq	%rsi, %r14
000000000002db98	movq	%rdi, %rbx
000000000002db9b	movq	$0x0, -0x30(%rbp)
000000000002dba3	movq	0x9c916(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
000000000002dbaa	movq	0x10(%rax), %rcx
000000000002dbae	movq	%rcx, 0x10(%rdi)
000000000002dbb2	movups	(%rax), %xmm0
000000000002dbb5	movups	%xmm0, (%rdi)
000000000002dbb8	testl	%r15d, %r15d
000000000002dbbb	je	0x2dbdb
000000000002dbbd	movq	0xa0(%r14), %rax
000000000002dbc4	testq	%rax, %rax
000000000002dbc7	je	0x2dbd2
000000000002dbc9	movq	0x30(%rax), %rdi
000000000002dbcd	testq	%rdi, %rdi
000000000002dbd0	jne	0x2dbd6
000000000002dbd2	leaq	0x8(%r14), %rdi
000000000002dbd6	callq	0xacb16                         ## symbol stub for: __ZN10PCSpinLock4lockEv
000000000002dbdb	leaq	-0x30(%rbp), %rsi
000000000002dbdf	movq	%r14, %rdi
000000000002dbe2	movq	%r12, %rdx
000000000002dbe5	callq	__ZN8OZSpline19getFirstValidVertexEPPvRK6CMTime ## OZSpline::getFirstValidVertex(void**, CMTime const&)
000000000002dbea	testb	%al, %al
000000000002dbec	je	0x2dc45
000000000002dbee	movq	-0x30(%rbp), %rdi
000000000002dbf2	movq	0x20(%rdi), %rax
000000000002dbf6	movq	%rax, 0x10(%rbx)
000000000002dbfa	movups	0x10(%rdi), %xmm0
000000000002dbfe	movups	%xmm0, (%rbx)
000000000002dc01	movq	0x98(%r14), %r13
000000000002dc08	movq	(%rdi), %rax
000000000002dc0b	callq	*0xd0(%rax)
000000000002dc11	movq	%r13, %rdi
000000000002dc14	movl	%eax, %esi
000000000002dc16	callq	__ZN15OZInterpolators15getInterpolatorEj ## OZInterpolators::getInterpolator(unsigned int)
000000000002dc1b	movq	(%rax), %r9
000000000002dc1e	leaq	-0x48(%rbp), %r13
000000000002dc22	movq	%r13, %rdi
000000000002dc25	movq	%rax, %rsi
000000000002dc28	movq	%r14, %rdx
000000000002dc2b	movq	%r12, %rcx
000000000002dc2e	movq	%rbx, %r8
000000000002dc31	callq	*0x50(%r9)
000000000002dc35	movq	0x10(%r13), %rax
000000000002dc39	movq	%rax, 0x10(%rbx)
000000000002dc3d	movups	(%r13), %xmm0
000000000002dc42	movups	%xmm0, (%rbx)
000000000002dc45	testb	%r15b, %r15b
000000000002dc48	je	0x2dc6b
000000000002dc4a	movq	0xa0(%r14), %rax
000000000002dc51	testq	%rax, %rax
000000000002dc54	je	0x2dc5f
000000000002dc56	movq	0x30(%rax), %rdi
000000000002dc5a	testq	%rdi, %rdi
000000000002dc5d	jne	0x2dc66
000000000002dc5f	addq	$0x8, %r14
000000000002dc63	movq	%r14, %rdi
000000000002dc66	callq	0xacb1c                         ## symbol stub for: __ZN10PCSpinLock6unlockEv
000000000002dc6b	movq	%rbx, %rax
000000000002dc6e	addq	$0x28, %rsp
000000000002dc72	popq	%rbx
000000000002dc73	popq	%r12
000000000002dc75	popq	%r13
000000000002dc77	popq	%r14
000000000002dc79	popq	%r15
000000000002dc7b	popq	%rbp
000000000002dc7c	retq
000000000002dc7d	nop
