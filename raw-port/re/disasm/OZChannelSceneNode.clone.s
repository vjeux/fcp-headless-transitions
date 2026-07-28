__ZNK18OZChannelSceneNode5cloneEv:
0000000000213bc0	pushq	%rbp
0000000000213bc1	movq	%rsp, %rbp
0000000000213bc4	pushq	%r14
0000000000213bc6	pushq	%rbx
0000000000213bc7	movq	%rdi, %r14
0000000000213bca	movl	$0x108, %edi                    ## imm = 0x108
0000000000213bcf	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000213bd4	movq	%rax, %rbx
0000000000213bd7	movq	%rax, %rdi
0000000000213bda	movq	%r14, %rsi
0000000000213bdd	xorl	%edx, %edx
0000000000213bdf	callq	__ZN19OZChannelObjectRootC2ERKS_P15OZChannelFolder ## OZChannelObjectRoot::OZChannelObjectRoot(OZChannelObjectRoot const&, OZChannelFolder*)
0000000000213be4	leaq	0x633c35(%rip), %rax
0000000000213beb	movq	%rax, (%rbx)
0000000000213bee	leaq	0x633fcb(%rip), %rax
0000000000213bf5	movq	%rax, 0x10(%rbx)
0000000000213bf9	movq	$0x0, 0x100(%rbx)
0000000000213c04	movq	%rbx, %rax
0000000000213c07	popq	%rbx
0000000000213c08	popq	%r14
0000000000213c0a	popq	%rbp
0000000000213c0b	retq
0000000000213c0c	movq	%rax, %r14
0000000000213c0f	movq	%rbx, %rdi
0000000000213c12	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000213c17	movq	%r14, %rdi
0000000000213c1a	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000213c1f	nop
