__ZN18PMVideoDescriptionD1Ev:
00000000000575d0	pushq	%rbp
00000000000575d1	movq	%rsp, %rbp
00000000000575d4	pushq	%rbx
00000000000575d5	pushq	%rax
00000000000575d6	movq	%rdi, %rbx
00000000000575d9	movq	0x1e8(%rdi), %rdi
00000000000575e0	testq	%rdi, %rdi
00000000000575e3	je	0x575ea
00000000000575e5	callq	0x6dda9a                        ## symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000000575ea	addq	$0x1d0, %rbx                    ## imm = 0x1D0
00000000000575f1	movq	%rbx, %rdi
00000000000575f4	addq	$0x8, %rsp
00000000000575f8	popq	%rbx
00000000000575f9	popq	%rbp
00000000000575fa	jmp	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000575ff	movq	%rax, %rdi
0000000000057602	callq	___clang_call_terminate
0000000000057607	nopw	(%rax,%rax)
