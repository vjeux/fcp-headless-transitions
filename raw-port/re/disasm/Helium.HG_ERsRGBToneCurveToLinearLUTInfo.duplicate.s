__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo9duplicateEv:
0000000000115d70	pushq	%rbp
0000000000115d71	movq	%rsp, %rbp
0000000000115d74	pushq	%rbx
0000000000115d75	pushq	%rax
0000000000115d76	movq	%rdi, %rbx
0000000000115d79	movl	$0x28, %edi
0000000000115d7e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115d83	movups	0x8(%rbx), %xmm0
0000000000115d87	movups	0x14(%rbx), %xmm1
0000000000115d8b	movups	%xmm0, 0x8(%rax)
0000000000115d8f	movups	%xmm1, 0x14(%rax)
0000000000115d93	leaq	0x90735e(%rip), %rcx
0000000000115d9a	movq	%rcx, (%rax)
0000000000115d9d	addq	$0x8, %rsp
0000000000115da1	popq	%rbx
0000000000115da2	popq	%rbp
0000000000115da3	retq
0000000000115da4	nopw	%cs:(%rax,%rax)
