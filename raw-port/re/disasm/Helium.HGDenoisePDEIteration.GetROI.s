__ZN21HGDenoisePDEIteration6GetROIEP10HGRendereri6HGRect:
00000000001c2ba0	pushq	%rbp
00000000001c2ba1	movq	%rsp, %rbp
00000000001c2ba4	pushq	%r14
00000000001c2ba6	pushq	%rbx
00000000001c2ba7	movq	%r8, %rbx
00000000001c2baa	movq	%rcx, %r14
00000000001c2bad	cmpl	$0x1, %edx
00000000001c2bb0	jne	0x1c2be0
00000000001c2bb2	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000001c2bb7	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001c2bbc	movl	$0x1, %edx
00000000001c2bc1	movl	$0x1, %ecx
00000000001c2bc6	callq	_HGRectMake4i
00000000001c2bcb	movq	%rdx, %rcx
00000000001c2bce	movq	%r14, %rdi
00000000001c2bd1	movq	%rbx, %rsi
00000000001c2bd4	movq	%rax, %rdx
00000000001c2bd7	popq	%rbx
00000000001c2bd8	popq	%r14
00000000001c2bda	popq	%rbp
00000000001c2bdb	jmp	_HGRectGrow
00000000001c2be0	testl	%edx, %edx
00000000001c2be2	je	0x1c2bf2
00000000001c2be4	leaq	_HGRectNull(%rip), %rax
00000000001c2beb	movq	(%rax), %r14
00000000001c2bee	movq	0x8(%rax), %rbx
00000000001c2bf2	movq	%r14, %rax
00000000001c2bf5	movq	%rbx, %rdx
00000000001c2bf8	popq	%rbx
00000000001c2bf9	popq	%r14
00000000001c2bfb	popq	%rbp
00000000001c2bfc	retq
00000000001c2bfd	nopl	(%rax)
