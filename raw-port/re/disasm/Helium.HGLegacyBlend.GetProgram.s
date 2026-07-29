__ZN13HGLegacyBlend10GetProgramEP10HGRenderer:
0000000000242640	pushq	%rbp
0000000000242641	movq	%rsp, %rbp
0000000000242644	movslq	0x1a8(%rdi), %rax
000000000024264b	leaq	__ZL17s_arb_blend_table(%rip), %rcx ## s_arb_blend_table
0000000000242652	movq	%rsi, %rdi
0000000000242655	popq	%rbp
0000000000242656	jmpq	*(%rcx,%rax,8)
0000000000242659	nopl	(%rax)
