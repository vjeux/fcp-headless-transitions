__ZNK9HGStencil21InitProgramDescriptorEP19HGProgramDescriptor:
00000000002d2730	pushq	%rbp
00000000002d2731	movq	%rsp, %rbp
00000000002d2734	movslq	0x1b4(%rdi), %rax
00000000002d273b	leaq	__ZL27s_programdesc_stencil_table(%rip), %rcx ## s_programdesc_stencil_table
00000000002d2742	movq	%rsi, %rdi
00000000002d2745	popq	%rbp
00000000002d2746	jmpq	*(%rcx,%rax,8)
00000000002d2749	nopl	(%rax)
