_PC_CMTimeSaferSubtract:
000000000008f9f1	pushq	%rbp
000000000008f9f2	movq	%rsp, %rbp
000000000008f9f5	pushq	%r15
000000000008f9f7	pushq	%r14
000000000008f9f9	pushq	%r12
000000000008f9fb	pushq	%rbx
000000000008f9fc	subq	$0x50, %rsp
000000000008fa00	movq	%rdi, %rbx
000000000008fa03	movq	0x38(%rbp), %rax
000000000008fa07	movq	%rax, 0x28(%rsp)
000000000008fa0c	movups	0x28(%rbp), %xmm0
000000000008fa10	movups	%xmm0, 0x18(%rsp)
000000000008fa15	movq	0x20(%rbp), %rax
000000000008fa19	movq	%rax, 0x10(%rsp)
000000000008fa1e	movaps	0x10(%rbp), %xmm0
000000000008fa22	movups	%xmm0, (%rsp)
000000000008fa26	callq	0xde3f0                         ## symbol stub for: _CMTimeSubtract
000000000008fa2b	movl	0xc(%rbx), %eax
000000000008fa2e	andl	$0x1f, %eax
000000000008fa31	cmpl	$0x3, %eax
000000000008fa34	jne	0x8faa2
000000000008fa36	leaq	0x28(%rbp), %r15
000000000008fa3a	leaq	0x10(%rbp), %r14
000000000008fa3e	movl	0xc(%r15), %eax
000000000008fa42	orl	0xc(%r14), %eax
000000000008fa46	testb	$0x2, %al
000000000008fa48	jne	0x8faa2
000000000008fa4a	movq	%r14, %rdi
000000000008fa4d	callq	__ZL10SimpCMTimeP6CMTime        ## SimpCMTime(CMTime*)
000000000008fa52	movl	%eax, %r12d
000000000008fa55	movq	%r15, %rdi
000000000008fa58	callq	__ZL10SimpCMTimeP6CMTime        ## SimpCMTime(CMTime*)
000000000008fa5d	orb	%r12b, %al
000000000008fa60	cmpb	$0x1, %al
000000000008fa62	jne	0x8faa2
000000000008fa64	movq	0x10(%r15), %rax
000000000008fa68	movq	%rax, 0x28(%rsp)
000000000008fa6d	movups	(%r15), %xmm0
000000000008fa71	movups	%xmm0, 0x18(%rsp)
000000000008fa76	movq	0x10(%r14), %rax
000000000008fa7a	movq	%rax, 0x10(%rsp)
000000000008fa7f	movups	(%r14), %xmm0
000000000008fa83	movups	%xmm0, (%rsp)
000000000008fa87	leaq	-0x38(%rbp), %r14
000000000008fa8b	movq	%r14, %rdi
000000000008fa8e	callq	0xde3f0                         ## symbol stub for: _CMTimeSubtract
000000000008fa93	movq	0x10(%r14), %rax
000000000008fa97	movq	%rax, 0x10(%rbx)
000000000008fa9b	movups	(%r14), %xmm0
000000000008fa9f	movups	%xmm0, (%rbx)
000000000008faa2	movq	%rbx, %rax
000000000008faa5	addq	$0x50, %rsp
000000000008faa9	popq	%rbx
000000000008faaa	popq	%r12
000000000008faac	popq	%r14
000000000008faae	popq	%r15
000000000008fab0	popq	%rbp
000000000008fab1	retq
