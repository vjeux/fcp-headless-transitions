__ZNK18HGAntiAliasLUTInfo9duplicateEv:
0000000000211a90	pushq	%rbp
0000000000211a91	movq	%rsp, %rbp
0000000000211a94	pushq	%rbx
0000000000211a95	pushq	%rax
0000000000211a96	movq	%rdi, %rbx
0000000000211a99	movl	$0x10, %edi
0000000000211a9e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000211aa3	movl	0x8(%rbx), %ecx
0000000000211aa6	leaq	0x81d6c3(%rip), %rdx
0000000000211aad	movq	%rdx, (%rax)
0000000000211ab0	movl	%ecx, 0x8(%rax)
0000000000211ab3	addq	$0x8, %rsp
0000000000211ab7	popq	%rbx
0000000000211ab8	popq	%rbp
0000000000211ab9	retq
0000000000211aba	nopw	(%rax,%rax)
