__ZNK31HGCanonLog2LinearizationLUTInfo9duplicateEv:
0000000000115830	pushq	%rbp
0000000000115831	movq	%rsp, %rbp
0000000000115834	pushq	%rbx
0000000000115835	pushq	%rax
0000000000115836	movq	%rdi, %rbx
0000000000115839	movl	$0x28, %edi
000000000011583e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115843	movups	0x8(%rbx), %xmm0
0000000000115847	movups	0x14(%rbx), %xmm1
000000000011584b	movups	%xmm0, 0x8(%rax)
000000000011584f	movups	%xmm1, 0x14(%rax)
0000000000115853	leaq	0x90743e(%rip), %rcx
000000000011585a	movq	%rcx, (%rax)
000000000011585d	addq	$0x8, %rsp
0000000000115861	popq	%rbx
0000000000115862	popq	%rbp
0000000000115863	retq
0000000000115864	nopw	%cs:(%rax,%rax)
