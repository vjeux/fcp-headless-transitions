__ZN12DspLibBiquad15configureBiquadEjfffb15_kFilterTypes_t:
0000000001228d60	pushq	%rbp
0000000001228d61	movq	%rsp, %rbp
0000000001228d64	pushq	%rbx
0000000001228d65	pushq	%rax
0000000001228d66	movq	%rdi, %rbx
0000000001228d69	movq	(%rdi), %rax
0000000001228d6c	movl	%esi, %edi
0000000001228d6e	imulq	$0x38, %rdi, %rdi
0000000001228d72	movl	%ecx, 0x28(%rax,%rdi)
0000000001228d76	movb	%dl, 0x24(%rax,%rdi)
0000000001228d7a	movss	%xmm0, 0x30(%rax,%rdi)
0000000001228d80	movss	%xmm1, 0x2c(%rax,%rdi)
0000000001228d86	movss	%xmm2, 0x34(%rax,%rdi)
0000000001228d8c	movq	%rbx, %rdi
0000000001228d8f	callq	__ZN12DspLibBiquad21calculateCoefficientsEj ## DspLibBiquad::calculateCoefficients(unsigned int)
0000000001228d94	movl	0x1c(%rbx), %edx
0000000001228d97	testq	%rdx, %rdx
0000000001228d9a	je	0x1228e2d
0000000001228da0	movq	(%rbx), %rax
0000000001228da3	movl	%edx, %ecx
0000000001228da5	andl	$0x7, %ecx
0000000001228da8	cmpl	$0x8, %edx
0000000001228dab	jae	0x1228db1
0000000001228dad	xorl	%esi, %esi
0000000001228daf	jmp	0x1228dfe
0000000001228db1	andl	$-0x8, %edx
0000000001228db4	leaq	0x14(%rax), %rdi
0000000001228db8	xorl	%esi, %esi
0000000001228dba	xorps	%xmm0, %xmm0
0000000001228dbd	nopl	(%rax)
0000000001228dc0	movups	%xmm0, (%rdi)
0000000001228dc3	movups	%xmm0, 0x38(%rdi)
0000000001228dc7	movups	%xmm0, 0x70(%rdi)
0000000001228dcb	movups	%xmm0, 0xa8(%rdi)
0000000001228dd2	movups	%xmm0, 0xe0(%rdi)
0000000001228dd9	movups	%xmm0, 0x118(%rdi)
0000000001228de0	movups	%xmm0, 0x150(%rdi)
0000000001228de7	addq	$0x8, %rsi
0000000001228deb	movups	%xmm0, 0x188(%rdi)
0000000001228df2	addq	$0x1c0, %rdi                    ## imm = 0x1C0
0000000001228df9	cmpq	%rsi, %rdx
0000000001228dfc	jne	0x1228dc0
0000000001228dfe	testq	%rcx, %rcx
0000000001228e01	je	0x1228e2d
0000000001228e03	imulq	$0x38, %rsi, %rdx
0000000001228e07	addq	%rdx, %rax
0000000001228e0a	addq	$0x14, %rax
0000000001228e0e	imulq	$0x38, %rcx, %rcx
0000000001228e12	xorl	%edx, %edx
0000000001228e14	xorps	%xmm0, %xmm0
0000000001228e17	nopw	(%rax,%rax)
0000000001228e20	movups	%xmm0, (%rax,%rdx)
0000000001228e24	addq	$0x38, %rdx
0000000001228e28	cmpq	%rdx, %rcx
0000000001228e2b	jne	0x1228e20
0000000001228e2d	addq	$0x8, %rsp
0000000001228e31	popq	%rbx
0000000001228e32	popq	%rbp
0000000001228e33	retq
0000000001228e34	nopw	%cs:(%rax,%rax)
