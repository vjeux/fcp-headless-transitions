__ZN13OZChannelUndoD2Ev:
00000000000ffeb0	pushq	%rbp
00000000000ffeb1	movq	%rsp, %rbp
00000000000ffeb4	pushq	%r14
00000000000ffeb6	pushq	%rbx
00000000000ffeb7	movq	%rdi, %rbx
00000000000ffeba	leaq	0x73d677(%rip), %rax
00000000000ffec1	movq	%rax, (%rdi)
00000000000ffec4	movq	0x8(%rdi), %r14
00000000000ffec8	testq	%r14, %r14
00000000000ffecb	je	0xffedd
00000000000ffecd	movq	%r14, %rdi
00000000000ffed0	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
00000000000ffed5	movq	%r14, %rdi
00000000000ffed8	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000ffedd	movq	0x10(%rbx), %rdi
00000000000ffee1	testq	%rdi, %rdi
00000000000ffee4	je	0xffef0
00000000000ffee6	movq	(%rdi), %rax
00000000000ffee9	popq	%rbx
00000000000ffeea	popq	%r14
00000000000ffeec	popq	%rbp
00000000000ffeed	jmpq	*0x8(%rax)
00000000000ffef0	popq	%rbx
00000000000ffef1	popq	%r14
00000000000ffef3	popq	%rbp
00000000000ffef4	retq
00000000000ffef5	nopw	%cs:(%rax,%rax)
