__ZN39HgcApply3DLUTTetrahedralFast_basekernel6GetDODEP10HGRendereri6HGRect:
000000000038bd40	movq	%rcx, %rax
000000000038bd43	testl	%edx, %edx
000000000038bd45	je	0x38bd68
000000000038bd47	pushq	%rbp
000000000038bd48	movq	%rsp, %rbp
000000000038bd4b	cmpl	$0x1, %edx
000000000038bd4e	jne	0x38bd59
000000000038bd50	leaq	_HGRectInfinite(%rip), %rcx
000000000038bd57	jmp	0x38bd60
000000000038bd59	leaq	_HGRectNull(%rip), %rcx
000000000038bd60	movq	(%rcx), %rax
000000000038bd63	movq	0x8(%rcx), %r8
000000000038bd67	popq	%rbp
000000000038bd68	movq	%r8, %rdx
000000000038bd6b	retq
000000000038bd6c	nopl	(%rax)
