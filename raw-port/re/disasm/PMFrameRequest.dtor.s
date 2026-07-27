__ZN14PMFrameRequestD2Ev:
00000000000837d0	pushq	%rbp
00000000000837d1	movq	%rsp, %rbp
00000000000837d4	pushq	%rbx
00000000000837d5	pushq	%rax
00000000000837d6	movq	%rdi, %rbx
00000000000837d9	addq	$0x140, %rdi                    ## imm = 0x140
00000000000837e0	callq	0x6df522                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000000837e5	leaq	0x138(%rbx), %rdi
00000000000837ec	callq	0x6df522                        ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000000837f1	movq	0x118(%rbx), %rdi
00000000000837f8	testq	%rdi, %rdi
00000000000837fb	je	0x83802
00000000000837fd	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000083802	movq	0x110(%rbx), %rdi
0000000000083809	testq	%rdi, %rdi
000000000008380c	je	0x83813
000000000008380e	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000083813	movq	0x88(%rbx), %rdi
000000000008381a	testq	%rdi, %rdi
000000000008381d	je	0x83824
000000000008381f	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
0000000000083824	addq	$0x8, %rsp
0000000000083828	popq	%rbx
0000000000083829	popq	%rbp
000000000008382a	retq
000000000008382b	movq	%rax, %rdi
000000000008382e	callq	___clang_call_terminate
0000000000083833	movq	%rax, %rdi
0000000000083836	callq	___clang_call_terminate
000000000008383b	movq	%rax, %rdi
000000000008383e	callq	___clang_call_terminate
0000000000083843	movq	%rax, %rdi
0000000000083846	callq	___clang_call_terminate
000000000008384b	movq	%rax, %rdi
000000000008384e	callq	___clang_call_terminate
0000000000083853	nopw	%cs:(%rax,%rax)
