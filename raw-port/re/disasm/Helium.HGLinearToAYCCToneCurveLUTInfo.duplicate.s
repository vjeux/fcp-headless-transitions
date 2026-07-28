__ZNK30HGLinearToAYCCToneCurveLUTInfo9duplicateEv:
0000000000115d10	pushq	%rbp
0000000000115d11	movq	%rsp, %rbp
0000000000115d14	pushq	%rbx
0000000000115d15	pushq	%rax
0000000000115d16	movq	%rdi, %rbx
0000000000115d19	movl	$0x28, %edi
0000000000115d1e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115d23	movups	0x8(%rbx), %xmm0
0000000000115d27	movups	0x14(%rbx), %xmm1
0000000000115d2b	movups	%xmm0, 0x8(%rax)
0000000000115d2f	movups	%xmm1, 0x14(%rax)
0000000000115d33	leaq	0x90736e(%rip), %rcx
0000000000115d3a	movq	%rcx, (%rax)
0000000000115d3d	addq	$0x8, %rsp
0000000000115d41	popq	%rbx
0000000000115d42	popq	%rbp
0000000000115d43	retq
0000000000115d44	nopw	%cs:(%rax,%rax)
