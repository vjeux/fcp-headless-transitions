__ZNK31HGNikonNLogLinearizationLUTInfo9duplicateEv:
0000000000115a10	pushq	%rbp
0000000000115a11	movq	%rsp, %rbp
0000000000115a14	pushq	%rbx
0000000000115a15	pushq	%rax
0000000000115a16	movq	%rdi, %rbx
0000000000115a19	movl	$0x28, %edi
0000000000115a1e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115a23	movups	0x8(%rbx), %xmm0
0000000000115a27	movups	0x14(%rbx), %xmm1
0000000000115a2b	movups	%xmm0, 0x8(%rax)
0000000000115a2f	movups	%xmm1, 0x14(%rax)
0000000000115a33	leaq	0x9073ee(%rip), %rcx
0000000000115a3a	movq	%rcx, (%rax)
0000000000115a3d	addq	$0x8, %rsp
0000000000115a41	popq	%rbx
0000000000115a42	popq	%rbp
0000000000115a43	retq
0000000000115a44	nopw	%cs:(%rax,%rax)
