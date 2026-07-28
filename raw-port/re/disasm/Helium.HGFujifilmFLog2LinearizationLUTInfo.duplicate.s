__ZNK35HGFujifilmFLog2LinearizationLUTInfo9duplicateEv:
0000000000115c50	pushq	%rbp
0000000000115c51	movq	%rsp, %rbp
0000000000115c54	pushq	%rbx
0000000000115c55	pushq	%rax
0000000000115c56	movq	%rdi, %rbx
0000000000115c59	movl	$0x28, %edi
0000000000115c5e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115c63	movups	0x8(%rbx), %xmm0
0000000000115c67	movups	0x14(%rbx), %xmm1
0000000000115c6b	movups	%xmm0, 0x8(%rax)
0000000000115c6f	movups	%xmm1, 0x14(%rax)
0000000000115c73	leaq	0x90738e(%rip), %rcx
0000000000115c7a	movq	%rcx, (%rax)
0000000000115c7d	addq	$0x8, %rsp
0000000000115c81	popq	%rbx
0000000000115c82	popq	%rbp
0000000000115c83	retq
0000000000115c84	nopw	%cs:(%rax,%rax)
