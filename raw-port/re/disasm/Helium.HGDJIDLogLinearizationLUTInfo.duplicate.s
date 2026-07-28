__ZNK29HGDJIDLogLinearizationLUTInfo9duplicateEv:
0000000000115b90	pushq	%rbp
0000000000115b91	movq	%rsp, %rbp
0000000000115b94	pushq	%rbx
0000000000115b95	pushq	%rax
0000000000115b96	movq	%rdi, %rbx
0000000000115b99	movl	$0x28, %edi
0000000000115b9e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115ba3	movups	0x8(%rbx), %xmm0
0000000000115ba7	movups	0x14(%rbx), %xmm1
0000000000115bab	movups	%xmm0, 0x8(%rax)
0000000000115baf	movups	%xmm1, 0x14(%rax)
0000000000115bb3	leaq	0x9073ae(%rip), %rcx
0000000000115bba	movq	%rcx, (%rax)
0000000000115bbd	addq	$0x8, %rsp
0000000000115bc1	popq	%rbx
0000000000115bc2	popq	%rbp
0000000000115bc3	retq
0000000000115bc4	nopw	%cs:(%rax,%rax)
