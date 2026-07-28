__ZN18FFEllipseMaskUtils36resetSuperEllipseShapeFolderCallbackEP13OZChannelBasePv:
0000000000613e90	testq	%rsi, %rsi
0000000000613e93	je	0x613f71
0000000000613e99	pushq	%rbp
0000000000613e9a	movq	%rsp, %rbp
0000000000613e9d	pushq	%rbx
0000000000613e9e	pushq	%rax
0000000000613e9f	leaq	0x2fc0(%rsi), %rdi
0000000000613ea6	movq	0x2fc0(%rsi), %rax
0000000000613ead	movq	%rsi, %rbx
0000000000613eb0	xorl	%esi, %esi
0000000000613eb2	callq	*0x120(%rax)
0000000000613eb8	leaq	0x2f28(%rbx), %rdi
0000000000613ebf	movq	0x2f28(%rbx), %rax
0000000000613ec6	xorl	%esi, %esi
0000000000613ec8	callq	*0x120(%rax)
0000000000613ece	leaq	0x1050(%rbx), %rdi
0000000000613ed5	movq	0x1050(%rbx), %rax
0000000000613edc	xorl	%esi, %esi
0000000000613ede	callq	*0x120(%rax)
0000000000613ee4	leaq	0x33d0(%rbx), %rdi
0000000000613eeb	movq	0x33d0(%rbx), %rax
0000000000613ef2	xorl	%esi, %esi
0000000000613ef4	callq	*0x120(%rax)
0000000000613efa	leaq	0x2cf8(%rbx), %rdi
0000000000613f01	movq	0x2cf8(%rbx), %rax
0000000000613f08	xorl	%esi, %esi
0000000000613f0a	callq	*0x120(%rax)
0000000000613f10	leaq	0x2d90(%rbx), %rdi
0000000000613f17	movq	0x2d90(%rbx), %rax
0000000000613f1e	xorl	%esi, %esi
0000000000613f20	callq	*0x120(%rax)
0000000000613f26	leaq	0x4930(%rbx), %rdi
0000000000613f2d	movq	0x4930(%rbx), %rax
0000000000613f34	xorl	%esi, %esi
0000000000613f36	callq	*0x120(%rax)
0000000000613f3c	leaq	0x5688(%rbx), %rdi
0000000000613f43	movq	0x5688(%rbx), %rax
0000000000613f4a	xorl	%esi, %esi
0000000000613f4c	callq	*0x120(%rax)
0000000000613f52	movq	(%rbx), %rax
0000000000613f55	movq	0x90(%rax), %rax
0000000000613f5c	movq	%rbx, %rdi
0000000000613f5f	movl	$0x1, %esi
0000000000613f64	movl	$0x1, %edx
0000000000613f69	addq	$0x8, %rsp
0000000000613f6d	popq	%rbx
0000000000613f6e	popq	%rbp
0000000000613f6f	jmpq	*%rax
0000000000613f71	retq
0000000000613f72	nopw	%cs:(%rax,%rax)
__ZN18FFEllipseMaskUtils21defaultShapeDimensionEP13FFEffectStack:
0000000000613f80	pushq	%rbp
0000000000613f81	movq	%rsp, %rbp
0000000000613f84	subq	$0x60, %rsp
0000000000613f88	movq	0x12d5389(%rip), %rax           ## literal pool symbol address: _kCMTimeZero
0000000000613f8f	movq	0x10(%rax), %rcx
0000000000613f93	movq	%rcx, -0x10(%rbp)
0000000000613f97	movups	(%rax), %xmm0
0000000000613f9a	movaps	%xmm0, -0x20(%rbp)
0000000000613f9e	testq	%rdi, %rdi
