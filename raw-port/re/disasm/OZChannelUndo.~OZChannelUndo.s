__ZN13OZChannelUndoD0Ev:
00000000000fff50	pushq	%rbp
00000000000fff51	movq	%rsp, %rbp
00000000000fff54	pushq	%r14
00000000000fff56	pushq	%rbx
00000000000fff57	movq	%rdi, %rbx
00000000000fff5a	leaq	0x73d5d7(%rip), %rax
00000000000fff61	movq	%rax, (%rdi)
00000000000fff64	movq	0x8(%rdi), %r14
00000000000fff68	testq	%r14, %r14
00000000000fff6b	je	0xfff7d
00000000000fff6d	movq	%r14, %rdi
00000000000fff70	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
00000000000fff75	movq	%r14, %rdi
00000000000fff78	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000fff7d	movq	0x10(%rbx), %rdi
00000000000fff81	testq	%rdi, %rdi
00000000000fff84	je	0xfff8c
00000000000fff86	movq	(%rdi), %rax
00000000000fff89	callq	*0x8(%rax)
00000000000fff8c	movq	%rbx, %rdi
00000000000fff8f	popq	%rbx
00000000000fff90	popq	%r14
00000000000fff92	popq	%rbp
00000000000fff93	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000fff98	nopl	(%rax,%rax)
