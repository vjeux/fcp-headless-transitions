__ZN42HgcApply3DLUTTetrahedralUniform_basekernel6GetROIEP10HGRendereri6HGRect:
000000000039aad0	cmpl	$0x1, %edx
000000000039aad3	je	0x39aaee
000000000039aad5	testl	%edx, %edx
000000000039aad7	je	0x39aae7
000000000039aad9	leaq	_HGRectNull(%rip), %rax
000000000039aae0	movq	(%rax), %rcx
000000000039aae3	movq	0x8(%rax), %r8
000000000039aae7	movq	%rcx, %rax
000000000039aaea	movq	%r8, %rdx
000000000039aaed	retq
000000000039aaee	pushq	%rbp
000000000039aaef	movq	%rsp, %rbp
000000000039aaf2	pushq	%rbx
000000000039aaf3	pushq	%rax
000000000039aaf4	movq	%rdi, %rax
000000000039aaf7	movq	%rsi, %rdi
000000000039aafa	movq	%rsi, %rbx
000000000039aafd	movq	%rax, %rsi
000000000039ab00	movl	$0x1, %edx
000000000039ab05	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000039ab0a	movq	%rbx, %rdi
000000000039ab0d	movq	%rax, %rsi
000000000039ab10	addq	$0x8, %rsp
000000000039ab14	popq	%rbx
000000000039ab15	popq	%rbp
000000000039ab16	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000039ab1b	nopl	(%rax,%rax)
