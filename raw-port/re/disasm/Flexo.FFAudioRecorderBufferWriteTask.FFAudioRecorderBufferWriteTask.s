__ZN30FFAudioRecorderBufferWriteTaskC1EP15FFAudioRecorderRK27AudioStreamBasicDescriptiony:
0000000000d30c30	pushq	%rbp
0000000000d30c31	movq	%rsp, %rbp
0000000000d30c34	pushq	%r15
0000000000d30c36	pushq	%r14
0000000000d30c38	pushq	%r12
0000000000d30c3a	pushq	%rbx
0000000000d30c3b	movq	%rcx, %r14
0000000000d30c3e	movq	%rdx, %r12
0000000000d30c41	movq	%rdi, %rbx
0000000000d30c44	leaq	0xbe1d75(%rip), %rax
0000000000d30c4b	movq	%rax, (%rdi)
0000000000d30c4e	movq	%rsi, 0x10(%rdi)
0000000000d30c52	movq	$0x0, 0x18(%rdi)
0000000000d30c5a	movl	$0x78, %edi
0000000000d30c5f	callq	0x1497452                       ## symbol stub for: __Znwm
0000000000d30c64	movq	%rax, %r15
0000000000d30c67	movq	0xbb8682(%rip), %rcx            ## literal pool symbol address: _kCMTimeInvalid
0000000000d30c6e	movq	%rax, %rdi
0000000000d30c71	movq	%r12, %rsi
0000000000d30c74	movq	%r14, %rdx
0000000000d30c77	xorl	%r8d, %r8d
0000000000d30c7a	callq	__ZN17FFAudioBufferListC1ERK27AudioStreamBasicDescriptionyRK6CMTimeNS_14ZeroBufferTypeE ## FFAudioBufferList::FFAudioBufferList(AudioStreamBasicDescription const&, unsigned long long, CMTime const&, FFAudioBufferList::ZeroBufferType)
0000000000d30c7f	movq	0x18(%rbx), %rdi
0000000000d30c83	movq	%r15, 0x18(%rbx)
0000000000d30c87	testq	%rdi, %rdi
0000000000d30c8a	je	0xd30c9a
0000000000d30c8c	movq	(%rdi), %rax
0000000000d30c8f	popq	%rbx
0000000000d30c90	popq	%r12
0000000000d30c92	popq	%r14
0000000000d30c94	popq	%r15
0000000000d30c96	popq	%rbp
0000000000d30c97	jmpq	*0x8(%rax)
0000000000d30c9a	popq	%rbx
0000000000d30c9b	popq	%r12
0000000000d30c9d	popq	%r14
0000000000d30c9f	popq	%r15
0000000000d30ca1	popq	%rbp
0000000000d30ca2	retq
0000000000d30ca3	movq	%rax, %r14
0000000000d30ca6	movq	%r15, %rdi
0000000000d30ca9	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d30cae	movq	0x18(%rbx), %rdi
0000000000d30cb2	movq	$0x0, 0x18(%rbx)
0000000000d30cba	testq	%rdi, %rdi
0000000000d30cbd	je	0xd30cc5
0000000000d30cbf	movq	(%rdi), %rax
0000000000d30cc2	callq	*0x8(%rax)
0000000000d30cc5	movq	%r14, %rdi
0000000000d30cc8	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d30ccd	movq	$0x0, 0x18(%rbx)
0000000000d30cd5	movq	%rax, %rdi
0000000000d30cd8	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d30cdd	nopl	(%rax)
