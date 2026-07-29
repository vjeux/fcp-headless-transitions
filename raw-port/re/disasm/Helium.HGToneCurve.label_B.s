__ZNK11HGToneCurve7label_BEv:
0000000000249830	pushq	%rbp
0000000000249831	movq	%rsp, %rbp
0000000000249834	movl	0x1a4(%rdi), %eax
000000000024983a	leaq	__ZL22hgtonecurve_read_label(%rip), %rcx ## hgtonecurve_read_label
0000000000249841	leaq	__ZL32hgtonecurve_unpremult_read_label(%rip), %rdx ## hgtonecurve_unpremult_read_label
0000000000249848	cmpb	$0x0, 0x1a0(%rdi)
000000000024984f	cmovneq	%rcx, %rdx
0000000000249853	movq	(%rdx,%rax,8), %rax
0000000000249857	popq	%rbp
0000000000249858	retq
0000000000249859	nopl	(%rax)
