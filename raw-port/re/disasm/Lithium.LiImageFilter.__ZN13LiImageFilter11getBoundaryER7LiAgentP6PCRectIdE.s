__ZN13LiImageFilter11getBoundaryER7LiAgentP6PCRectIdE:
000000000007e694	pushq	%rbp
000000000007e695	movq	%rsp, %rbp
000000000007e698	pushq	%r15
000000000007e69a	pushq	%r14
000000000007e69c	pushq	%rbx
000000000007e69d	pushq	%rax
000000000007e69e	movq	%rdx, %rbx
000000000007e6a1	movq	%rsi, %r14
000000000007e6a4	movq	%rdi, %r15
000000000007e6a7	movq	0x10(%rdi), %rdi
000000000007e6ab	testq	%rdi, %rdi
000000000007e6ae	jne	0x7e6be
000000000007e6b0	movl	$0x1, %edi
000000000007e6b5	callq	0x1c417a                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000007e6ba	movq	0x10(%r15), %rdi
000000000007e6be	movq	(%rdi), %rax
000000000007e6c1	movq	0x18(%rax), %rax
000000000007e6c5	movq	%r14, %rsi
000000000007e6c8	movq	%rbx, %rdx
000000000007e6cb	addq	$0x8, %rsp
000000000007e6cf	popq	%rbx
000000000007e6d0	popq	%r14
000000000007e6d2	popq	%r15
000000000007e6d4	popq	%rbp
000000000007e6d5	jmpq	*%rax
000000000007e6d7	nop
