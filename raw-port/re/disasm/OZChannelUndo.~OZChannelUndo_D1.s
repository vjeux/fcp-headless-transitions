__ZN13OZChannelUndoD1Ev:
00000000000fff00	pushq	%rbp
00000000000fff01	movq	%rsp, %rbp
00000000000fff04	pushq	%r14
00000000000fff06	pushq	%rbx
00000000000fff07	movq	%rdi, %rbx
00000000000fff0a	leaq	0x73d627(%rip), %rax
00000000000fff11	movq	%rax, (%rdi)
00000000000fff14	movq	0x8(%rdi), %r14
00000000000fff18	testq	%r14, %r14
00000000000fff1b	je	0xfff2d
00000000000fff1d	movq	%r14, %rdi
00000000000fff20	callq	0x6dd71c                        ## symbol stub for: __ZN12OZChannelRefD1Ev
00000000000fff25	movq	%r14, %rdi
00000000000fff28	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000000fff2d	movq	0x10(%rbx), %rdi
00000000000fff31	testq	%rdi, %rdi
00000000000fff34	je	0xfff40
00000000000fff36	movq	(%rdi), %rax
00000000000fff39	popq	%rbx
00000000000fff3a	popq	%r14
00000000000fff3c	popq	%rbp
00000000000fff3d	jmpq	*0x8(%rax)
00000000000fff40	popq	%rbx
00000000000fff41	popq	%r14
00000000000fff43	popq	%rbp
00000000000fff44	retq
00000000000fff45	nopw	%cs:(%rax,%rax)
