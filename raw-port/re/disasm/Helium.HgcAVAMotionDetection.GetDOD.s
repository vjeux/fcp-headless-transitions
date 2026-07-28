__ZN21HgcAVAMotionDetection6GetDODEP10HGRendereri6HGRect:
0000000000213f80	pushq	%rbp
0000000000213f81	movq	%rsp, %rbp
0000000000213f84	pushq	%r14
0000000000213f86	pushq	%rbx
0000000000213f87	movq	%r8, %rbx
0000000000213f8a	movq	%rcx, %r14
0000000000213f8d	cmpl	$0x1, %edx
0000000000213f90	je	0x213f96
0000000000213f92	testl	%edx, %edx
0000000000213f94	jne	0x213fbe
0000000000213f96	movl	$0xfffffffe, %edi               ## imm = 0xFFFFFFFE
0000000000213f9b	xorl	%esi, %esi
0000000000213f9d	movl	$0x2, %edx
0000000000213fa2	xorl	%ecx, %ecx
0000000000213fa4	callq	_HGRectMake4i
0000000000213fa9	movq	%rdx, %rcx
0000000000213fac	movq	%r14, %rdi
0000000000213faf	movq	%rbx, %rsi
0000000000213fb2	movq	%rax, %rdx
0000000000213fb5	popq	%rbx
0000000000213fb6	popq	%r14
0000000000213fb8	popq	%rbp
0000000000213fb9	jmp	_HGRectGrow
0000000000213fbe	leaq	_HGRectNull(%rip), %rcx
0000000000213fc5	movq	(%rcx), %rax
0000000000213fc8	movq	0x8(%rcx), %rdx
0000000000213fcc	popq	%rbx
0000000000213fcd	popq	%r14
0000000000213fcf	popq	%rbp
0000000000213fd0	retq
0000000000213fd1	nopw	%cs:(%rax,%rax)
