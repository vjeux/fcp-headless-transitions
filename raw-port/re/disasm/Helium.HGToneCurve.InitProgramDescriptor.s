__ZNK11HGToneCurve21InitProgramDescriptorEP19HGProgramDescriptor:
0000000000248c80	pushq	%rbp
0000000000248c81	movq	%rsp, %rbp
0000000000248c84	movl	0x1a4(%rdi), %eax
0000000000248c8a	leaq	__ZL27hgtonecurve_initprogramdesc(%rip), %rcx ## hgtonecurve_initprogramdesc
0000000000248c91	cmpb	$0x0, 0x1a0(%rdi)
0000000000248c98	leaq	__ZL37hgtonecurve_initprogramdesc_unpremult(%rip), %rdx ## hgtonecurve_initprogramdesc_unpremult
0000000000248c9f	cmovneq	%rcx, %rdx
0000000000248ca3	movq	%rsi, %rdi
0000000000248ca6	popq	%rbp
0000000000248ca7	jmpq	*(%rdx,%rax,8)
0000000000248caa	nopw	(%rax,%rax)
