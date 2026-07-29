__ZN11HGToneCurve10RenderTileEP6HGTile:
0000000000248cb0	pushq	%rbp
0000000000248cb1	movq	%rsp, %rbp
0000000000248cb4	movq	%rsi, %rax
0000000000248cb7	movq	%rdi, %rdx
0000000000248cba	movl	0x1a4(%rdi), %ecx
0000000000248cc0	leaq	__ZL22hgtonecurve_rendertile(%rip), %rsi ## hgtonecurve_rendertile
0000000000248cc7	leaq	__ZL32hgtonecurve_rendertile_unpremult(%rip), %r8 ## hgtonecurve_rendertile_unpremult
0000000000248cce	cmpb	$0x0, 0x1a0(%rdi)
0000000000248cd5	cmovneq	%rsi, %r8
0000000000248cd9	movq	0x1b0(%rdi), %rsi
0000000000248ce0	movq	%rax, %rdi
0000000000248ce3	popq	%rbp
0000000000248ce4	jmpq	*(%r8,%rcx,8)
0000000000248ce8	nopl	(%rax,%rax)
