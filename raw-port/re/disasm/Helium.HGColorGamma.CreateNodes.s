__ZN12HGColorGamma11CreateNodesEv:
00000000000f7780	pushq	%rbp
00000000000f7781	movq	%rsp, %rbp
00000000000f7784	pushq	%r14
00000000000f7786	pushq	%rbx
00000000000f7787	movq	%rdi, %rbx
00000000000f778a	callq	__ZN12HGColorGamma12ReleaseNodesEv ## HGColorGamma::ReleaseNodes()
00000000000f778f	movl	$0x130, %edi                    ## imm = 0x130
00000000000f7794	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000f7799	movq	%rax, %r14
00000000000f779c	movl	$0x130, %esi                    ## imm = 0x130
00000000000f77a1	movq	%rax, %rdi
00000000000f77a4	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f77a9	movq	%r14, 0x198(%rbx)
00000000000f77b0	popq	%rbx
00000000000f77b1	popq	%r14
00000000000f77b3	popq	%rbp
00000000000f77b4	retq
00000000000f77b5	nopw	%cs:(%rax,%rax)
