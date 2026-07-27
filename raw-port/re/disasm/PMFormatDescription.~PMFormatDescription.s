__ZN19PMFormatDescriptionD2Ev:
0000000000398db0	pushq	%rbp
0000000000398db1	movq	%rsp, %rbp
0000000000398db4	pushq	%r15
0000000000398db6	pushq	%r14
0000000000398db8	pushq	%r12
0000000000398dba	pushq	%rbx
0000000000398dbb	movq	%rdi, %rbx
0000000000398dbe	leaq	0x408(%rdi), %r14
0000000000398dc5	movq	0x460(%rdi), %r12
0000000000398dcc	testq	%r12, %r12
0000000000398dcf	je	0x398e04
0000000000398dd1	movq	0x468(%rbx), %r15
0000000000398dd8	movq	%r12, %rdi
0000000000398ddb	cmpq	%r15, %r12
0000000000398dde	je	0x398df8
0000000000398de0	addq	$-0x10, %r15
0000000000398de4	movq	%r15, %rdi
0000000000398de7	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000398dec	cmpq	%r12, %r15
0000000000398def	jne	0x398de0
0000000000398df1	movq	0x460(%rbx), %rdi
0000000000398df8	movq	%r12, 0x468(%rbx)
0000000000398dff	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000398e04	leaq	0x440(%rbx), %rdi
0000000000398e0b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000398e10	movq	%r14, %rdi
0000000000398e13	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000398e18	movq	0x3f0(%rbx), %rdi
0000000000398e1f	testq	%rdi, %rdi
0000000000398e22	je	0x398e29
0000000000398e24	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000398e29	leaq	0x3d8(%rbx), %rdi
0000000000398e30	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000398e35	leaq	0x200(%rbx), %rdi
0000000000398e3c	callq	0x6df522                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000398e41	leaq	0x1f8(%rbx), %rdi
0000000000398e48	callq	0x6df522                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
0000000000398e4d	movq	0x1f0(%rbx), %rdi
0000000000398e54	testq	%rdi, %rdi
0000000000398e57	je	0x398e5e
0000000000398e59	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000398e5e	addq	$0x1d8, %rbx                    ## imm = 0x1D8
0000000000398e65	movq	%rbx, %rdi
0000000000398e68	popq	%rbx
0000000000398e69	popq	%r12
0000000000398e6b	popq	%r14
0000000000398e6d	popq	%r15
0000000000398e6f	popq	%rbp
0000000000398e70	jmp	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
0000000000398e75	movq	%rax, %rdi
0000000000398e78	callq	___clang_call_terminate
0000000000398e7d	movq	%rax, %rdi
0000000000398e80	callq	___clang_call_terminate
0000000000398e85	movq	%rax, %rdi
0000000000398e88	callq	___clang_call_terminate
0000000000398e8d	movq	%rax, %rdi
0000000000398e90	callq	___clang_call_terminate
0000000000398e95	nopw	%cs:(%rax,%rax)
