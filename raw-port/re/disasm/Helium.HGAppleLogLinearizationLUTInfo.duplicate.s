__ZNK30HGAppleLogLinearizationLUTInfo9duplicateEv:
0000000000115b30	pushq	%rbp
0000000000115b31	movq	%rsp, %rbp
0000000000115b34	pushq	%rbx
0000000000115b35	pushq	%rax
0000000000115b36	movq	%rdi, %rbx
0000000000115b39	movl	$0x28, %edi
0000000000115b3e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115b43	movups	0x8(%rbx), %xmm0
0000000000115b47	movups	0x14(%rbx), %xmm1
0000000000115b4b	movups	%xmm0, 0x8(%rax)
0000000000115b4f	movups	%xmm1, 0x14(%rax)
0000000000115b53	leaq	0x9073be(%rip), %rcx
0000000000115b5a	movq	%rcx, (%rax)
0000000000115b5d	addq	$0x8, %rsp
0000000000115b61	popq	%rbx
0000000000115b62	popq	%rbp
0000000000115b63	retq
0000000000115b64	nopw	%cs:(%rax,%rax)
