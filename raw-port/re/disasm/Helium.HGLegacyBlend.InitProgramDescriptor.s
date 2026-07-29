__ZNK13HGLegacyBlend21InitProgramDescriptorEP19HGProgramDescriptor:
0000000000242660	pushq	%rbp
0000000000242661	movq	%rsp, %rbp
0000000000242664	movslq	0x1a8(%rdi), %rax
000000000024266b	cmpq	$0x9, %rax
000000000024266f	jl	0x242677
0000000000242671	popq	%rbp
0000000000242672	jmp	__ZNK6HGNode21InitProgramDescriptorEP19HGProgramDescriptor ## HGNode::InitProgramDescriptor(HGProgramDescriptor*) const
0000000000242677	leaq	__ZL25s_programdesc_blend_table(%rip), %rcx ## s_programdesc_blend_table
000000000024267e	movq	%rsi, %rdi
0000000000242681	popq	%rbp
0000000000242682	jmpq	*(%rcx,%rax,8)
0000000000242685	nopw	%cs:(%rax,%rax)
