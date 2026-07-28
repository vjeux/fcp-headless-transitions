__ZN13HGOutputClamp9GetOutputEP10HGRenderer:
00000000001ac900	pushq	%rbp
00000000001ac901	movq	%rsp, %rbp
00000000001ac904	pushq	%r14
00000000001ac906	pushq	%rbx
00000000001ac907	movq	%rdi, %rbx
00000000001ac90a	movq	(%rdi), %rax
00000000001ac90d	movq	0x1a0(%rdi), %r14
00000000001ac914	xorl	%esi, %esi
00000000001ac916	callq	*0x80(%rax)
00000000001ac91c	movq	(%r14), %rcx
00000000001ac91f	movq	%r14, %rdi
00000000001ac922	xorl	%esi, %esi
00000000001ac924	movq	%rax, %rdx
00000000001ac927	callq	*0x78(%rcx)
00000000001ac92a	movq	0x1a0(%rbx), %rax
00000000001ac931	popq	%rbx
00000000001ac932	popq	%r14
00000000001ac934	popq	%rbp
00000000001ac935	retq
00000000001ac936	nopw	%cs:(%rax,%rax)
