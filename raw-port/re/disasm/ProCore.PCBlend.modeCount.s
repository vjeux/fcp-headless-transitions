__ZN7PCBlend9modeCountEb:
0000000000017a2e	pushq	%rbp
0000000000017a2f	movq	%rsp, %rbp
0000000000017a32	pushq	%rbx
0000000000017a33	pushq	%rax
0000000000017a34	movl	%edi, %ebx
0000000000017a36	callq	__ZN7PCBlendL17getModeNameVectorEv ## PCBlend::getModeNameVector()
0000000000017a3b	movq	0x1438b6(%rip), %rax
0000000000017a42	movq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %rcx ## PCBlend::getModeNameVector()::modeNameVector
0000000000017a49	cmpq	%rcx, %rax
0000000000017a4c	jne	0x17a61
0000000000017a4e	callq	__ZN7PCBlendL24initializeModeNameVectorEv ## PCBlend::initializeModeNameVector()
0000000000017a53	movq	0x14389e(%rip), %rax
0000000000017a5a	movq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %rcx ## PCBlend::getModeNameVector()::modeNameVector
0000000000017a61	subq	%rcx, %rax
0000000000017a64	sarq	$0x3, %rax
0000000000017a68	movzbl	%bl, %ecx
0000000000017a6b	leaq	(%rax,%rcx,2), %rax
0000000000017a6f	addq	$-0x2, %rax
0000000000017a73	addq	$0x8, %rsp
0000000000017a77	popq	%rbx
0000000000017a78	popq	%rbp
0000000000017a79	retq
