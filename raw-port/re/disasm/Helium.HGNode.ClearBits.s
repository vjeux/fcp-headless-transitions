__ZN6HGNode9ClearBitsEi:
000000000011f6b0	pushq	%rbp
000000000011f6b1	movq	%rsp, %rbp
000000000011f6b4	pushq	%r14
000000000011f6b6	pushq	%rbx
000000000011f6b7	movl	%esi, %r14d
000000000011f6ba	movq	%rdi, %rbx
000000000011f6bd	cmpl	$0x1, 0x28(%rdi)
000000000011f6c1	jne	0x11f6d1
000000000011f6c3	leaq	0x7c8b06(%rip), %rdi            ## literal pool for: "ClearBits() : called during render\n"
000000000011f6ca	xorl	%eax, %eax
000000000011f6cc	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
000000000011f6d1	movl	0x88(%rbx), %eax
000000000011f6d7	testl	%r14d, %eax
000000000011f6da	je	0x11f6f5
000000000011f6dc	notl	%r14d
000000000011f6df	andl	%r14d, %eax
000000000011f6e2	movl	%eax, 0x88(%rbx)
000000000011f6e8	movq	0x70(%rbx), %r14
000000000011f6ec	addq	$0x78, %rbx
000000000011f6f0	cmpq	%rbx, %r14
000000000011f6f3	jne	0x11f708
000000000011f6f5	popq	%rbx
000000000011f6f6	popq	%r14
000000000011f6f8	popq	%rbp
000000000011f6f9	retq
000000000011f6fa	nopw	(%rax,%rax)
000000000011f700	movq	%rax, %r14
000000000011f703	cmpq	%rbx, %rax
000000000011f706	je	0x11f6f5
000000000011f708	movq	0x20(%r14), %rax
000000000011f70c	movq	(%rax), %rdi
000000000011f70f	movl	$0xff, %esi
000000000011f714	callq	__ZN6HGNode9ClearBitsEi         ## HGNode::ClearBits(int)
000000000011f719	movq	0x8(%r14), %rcx
000000000011f71d	testq	%rcx, %rcx
000000000011f720	je	0x11f740
000000000011f722	nopw	%cs:(%rax,%rax)
000000000011f730	movq	%rcx, %rax
000000000011f733	movq	(%rcx), %rcx
000000000011f736	testq	%rcx, %rcx
000000000011f739	jne	0x11f730
000000000011f73b	jmp	0x11f700
000000000011f73d	nopl	(%rax)
000000000011f740	movq	0x10(%r14), %rax
000000000011f744	cmpq	(%rax), %r14
000000000011f747	movq	%rax, %r14
000000000011f74a	jne	0x11f740
000000000011f74c	jmp	0x11f700
000000000011f74e	nop
