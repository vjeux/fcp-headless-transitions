__ZNK34HGFujifilmFLogLinearizationLUTInfo9duplicateEv:
0000000000115bf0	pushq	%rbp
0000000000115bf1	movq	%rsp, %rbp
0000000000115bf4	pushq	%rbx
0000000000115bf5	pushq	%rax
0000000000115bf6	movq	%rdi, %rbx
0000000000115bf9	movl	$0x28, %edi
0000000000115bfe	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115c03	movups	0x8(%rbx), %xmm0
0000000000115c07	movups	0x14(%rbx), %xmm1
0000000000115c0b	movups	%xmm0, 0x8(%rax)
0000000000115c0f	movups	%xmm1, 0x14(%rax)
0000000000115c13	leaq	0x90739e(%rip), %rcx
0000000000115c1a	movq	%rcx, (%rax)
0000000000115c1d	addq	$0x8, %rsp
0000000000115c21	popq	%rbx
0000000000115c22	popq	%rbp
0000000000115c23	retq
0000000000115c24	nopw	%cs:(%rax,%rax)
