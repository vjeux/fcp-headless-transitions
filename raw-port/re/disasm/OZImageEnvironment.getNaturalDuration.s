__ZN18OZImageEnvironment18getNaturalDurationEv:
00000000004d5ba0	pushq	%rbp
00000000004d5ba1	movq	%rsp, %rbp
00000000004d5ba4	pushq	%r14
00000000004d5ba6	pushq	%rbx
00000000004d5ba7	movq	%rsi, %r14
00000000004d5baa	movq	%rdi, %rbx
00000000004d5bad	movq	(%rsi), %rax
00000000004d5bb0	movq	%rsi, %rdi
00000000004d5bb3	callq	*0x110(%rax)
00000000004d5bb9	testq	%rax, %rax
00000000004d5bbc	je	0x4d5bd2
00000000004d5bbe	movq	(%r14), %rax
00000000004d5bc1	movq	%r14, %rdi
00000000004d5bc4	callq	*0x110(%rax)
00000000004d5bca	addq	$0x498, %rax                    ## imm = 0x498
00000000004d5bd0	jmp	0x4d5bd9
00000000004d5bd2	movq	0x34e937(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
00000000004d5bd9	movq	0x10(%rax), %rcx
00000000004d5bdd	movq	%rcx, 0x10(%rbx)
00000000004d5be1	movups	(%rax), %xmm0
00000000004d5be4	movups	%xmm0, (%rbx)
00000000004d5be7	movq	%rbx, %rax
00000000004d5bea	popq	%rbx
00000000004d5beb	popq	%r14
00000000004d5bed	popq	%rbp
00000000004d5bee	retq
00000000004d5bef	nop
