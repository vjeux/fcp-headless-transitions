__ZN39HgcApply3DLUTTetrahedralFast_basekernel6GetROIEP10HGRendereri6HGRect:
000000000038bd70	cmpl	$0x1, %edx
000000000038bd73	je	0x38bd8e
000000000038bd75	testl	%edx, %edx
000000000038bd77	je	0x38bd87
000000000038bd79	leaq	_HGRectNull(%rip), %rax
000000000038bd80	movq	(%rax), %rcx
000000000038bd83	movq	0x8(%rax), %r8
000000000038bd87	movq	%rcx, %rax
000000000038bd8a	movq	%r8, %rdx
000000000038bd8d	retq
000000000038bd8e	pushq	%rbp
000000000038bd8f	movq	%rsp, %rbp
000000000038bd92	pushq	%rbx
000000000038bd93	pushq	%rax
000000000038bd94	movq	%rdi, %rax
000000000038bd97	movq	%rsi, %rdi
000000000038bd9a	movq	%rsi, %rbx
000000000038bd9d	movq	%rax, %rsi
000000000038bda0	movl	$0x1, %edx
000000000038bda5	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000038bdaa	movq	%rbx, %rdi
000000000038bdad	movq	%rax, %rsi
000000000038bdb0	addq	$0x8, %rsp
000000000038bdb4	popq	%rbx
000000000038bdb5	popq	%rbp
000000000038bdb6	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000038bdbb	nopl	(%rax,%rax)
