__ZNK28OZ3DEngineApplyForceBehavior9isImpulseERK6CMTime:
0000000000266c50	pushq	%rbp
0000000000266c51	movq	%rsp, %rbp
0000000000266c54	addq	$0x698, %rdi                    ## imm = 0x698
0000000000266c5b	xorps	%xmm0, %xmm0
0000000000266c5e	callq	0x6dfa80                        ## symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000266c63	testl	%eax, %eax
0000000000266c65	setne	%al
0000000000266c68	popq	%rbp
0000000000266c69	retq
0000000000266c6a	nopw	(%rax,%rax)
