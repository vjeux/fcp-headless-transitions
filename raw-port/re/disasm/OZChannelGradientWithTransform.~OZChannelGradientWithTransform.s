__ZN30OZChannelGradientWithTransformD0Ev:
0000000000499270	pushq	%rbp
0000000000499271	movq	%rsp, %rbp
0000000000499274	pushq	%rbx
0000000000499275	pushq	%rax
0000000000499276	movq	%rdi, %rbx
0000000000499279	leaq	0x3d3568(%rip), %rax
0000000000499280	movq	%rax, (%rdi)
0000000000499283	leaq	0x3d383e(%rip), %rax
000000000049928a	movq	%rax, 0x10(%rdi)
000000000049928e	addq	$0xba8, %rdi                    ## imm = 0xBA8
0000000000499295	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
000000000049929a	leaq	0xaa8(%rbx), %rdi
00000000004992a1	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004992a6	leaq	0x9a8(%rbx), %rdi
00000000004992ad	callq	0x6dd9d4                        ## symbol stub for: __ZN13OZChannelEnumD1Ev
00000000004992b2	movq	%rbx, %rdi
00000000004992b5	callq	0x6de8d4                        ## symbol stub for: __ZN27OZChannelGradientPositionedD2Ev
00000000004992ba	movq	%rbx, %rdi
00000000004992bd	addq	$0x8, %rsp
00000000004992c1	popq	%rbx
00000000004992c2	popq	%rbp
00000000004992c3	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000004992c8	nopl	(%rax,%rax)
