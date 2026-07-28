__ZNK17PCImageAttributeseqERKS_:
000000000004a9b6	movl	(%rdi), %eax
000000000004a9b8	cmpl	(%rsi), %eax
000000000004a9ba	jne	0x4aa12
000000000004a9bc	pushq	%rbp
000000000004a9bd	movq	%rsp, %rbp
000000000004a9c0	pushq	%r14
000000000004a9c2	pushq	%rbx
000000000004a9c3	movq	%rsi, %rbx
000000000004a9c6	movq	%rdi, %r14
000000000004a9c9	movl	0x4(%rdi), %eax
000000000004a9cc	cmpl	0x4(%rsi), %eax
000000000004a9cf	jne	0x4aa15
000000000004a9d1	movl	0x8(%r14), %eax
000000000004a9d5	cmpl	0x8(%rbx), %eax
000000000004a9d8	jne	0x4aa15
000000000004a9da	movl	0xc(%r14), %eax
000000000004a9de	cmpl	0xc(%rbx), %eax
000000000004a9e1	jne	0x4aa15
000000000004a9e3	movl	0x10(%r14), %eax
000000000004a9e7	cmpl	0x10(%rbx), %eax
000000000004a9ea	jne	0x4aa15
000000000004a9ec	movl	0x14(%r14), %eax
000000000004a9f0	cmpl	0x14(%rbx), %eax
000000000004a9f3	jne	0x4aa15
000000000004a9f5	leaq	0x18(%r14), %rdi
000000000004a9f9	leaq	0x18(%rbx), %rsi
000000000004a9fd	callq	__ZN18PCColorSpaceHandle16isSameColorSpaceERKS_S1_ ## PCColorSpaceHandle::isSameColorSpace(PCColorSpaceHandle const&, PCColorSpaceHandle const&)
000000000004aa02	testb	%al, %al
000000000004aa04	je	0x4aa15
000000000004aa06	movl	0x20(%r14), %eax
000000000004aa0a	cmpl	0x20(%rbx), %eax
000000000004aa0d	sete	%al
000000000004aa10	jmp	0x4aa17
000000000004aa12	xorl	%eax, %eax
000000000004aa14	retq
000000000004aa15	xorl	%eax, %eax
000000000004aa17	popq	%rbx
000000000004aa18	popq	%r14
000000000004aa1a	popq	%rbp
000000000004aa1b	retq
