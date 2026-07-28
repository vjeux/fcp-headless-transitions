__ZN42HgcApply3DLUTTetrahedralUniform_basekernel6GetDODEP10HGRendereri6HGRect:
000000000039aaa0	movq	%rcx, %rax
000000000039aaa3	testl	%edx, %edx
000000000039aaa5	je	0x39aac8
000000000039aaa7	pushq	%rbp
000000000039aaa8	movq	%rsp, %rbp
000000000039aaab	cmpl	$0x1, %edx
000000000039aaae	jne	0x39aab9
000000000039aab0	leaq	_HGRectInfinite(%rip), %rcx
000000000039aab7	jmp	0x39aac0
000000000039aab9	leaq	_HGRectNull(%rip), %rcx
000000000039aac0	movq	(%rcx), %rax
000000000039aac3	movq	0x8(%rcx), %r8
000000000039aac7	popq	%rbp
000000000039aac8	movq	%r8, %rdx
000000000039aacb	retq
000000000039aacc	nopl	(%rax)
