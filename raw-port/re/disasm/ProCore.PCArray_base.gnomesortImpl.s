00000000000c4bd5	addb	%dl, 0x48(%rbp)
00000000000c4bd8	movl	%esp, %ebp
00000000000c4bda	pushq	%r15
00000000000c4bdc	pushq	%r14
00000000000c4bde	pushq	%r13
00000000000c4be0	pushq	%r12
00000000000c4be2	pushq	%rbx
00000000000c4be3	subq	$0x28, %rsp
00000000000c4be7	movq	%rcx, -0x50(%rbp)
00000000000c4beb	movq	%rdi, -0x48(%rbp)
00000000000c4bef	movl	%esi, -0x30(%rbp)
00000000000c4bf2	cmpl	$0x2, %esi
00000000000c4bf5	jl	0xc4cc1
00000000000c4bfb	movslq	%edx, %rax
00000000000c4bfe	movq	%rax, -0x40(%rbp)
00000000000c4c02	movl	$0x1, %r12d
00000000000c4c08	xorl	%ebx, %ebx
00000000000c4c0a	movl	%edx, -0x2c(%rbp)
00000000000c4c0d	leal	-0x1(%r12), %r13d
00000000000c4c12	movl	%r13d, %eax
00000000000c4c15	imull	%edx, %eax
00000000000c4c18	movslq	%eax, %r15
00000000000c4c1b	movq	-0x48(%rbp), %rcx
00000000000c4c1f	addq	%rcx, %r15
00000000000c4c22	movl	%r12d, %eax
00000000000c4c25	imull	%edx, %eax
00000000000c4c28	movslq	%eax, %r14
00000000000c4c2b	addq	%rcx, %r14
00000000000c4c2e	movq	%r15, %rdi
00000000000c4c31	movq	%r14, %rsi
00000000000c4c34	callq	*-0x50(%rbp)
00000000000c4c37	testl	%eax, %eax
00000000000c4c39	jle	0xc4c96
00000000000c4c3b	movl	%r13d, -0x34(%rbp)
00000000000c4c3f	testq	%rbx, %rbx
00000000000c4c42	jne	0xc4c50
00000000000c4c44	movq	-0x40(%rbp), %rdi
00000000000c4c48	callq	0xde6c6                         ## symbol stub for: __Znam
00000000000c4c4d	movq	%rax, %rbx
00000000000c4c50	movq	%rbx, %rdi
00000000000c4c53	movq	%r15, %rsi
00000000000c4c56	movq	%rbx, %r13
00000000000c4c59	movq	-0x40(%rbp), %rbx
00000000000c4c5d	movq	%rbx, %rdx
00000000000c4c60	callq	0xde960                         ## symbol stub for: _memcpy
00000000000c4c65	movq	%r14, %rdi
00000000000c4c68	movq	%r15, %rsi
00000000000c4c6b	movq	%rbx, %rdx
00000000000c4c6e	callq	0xde960                         ## symbol stub for: _memcpy
00000000000c4c73	movq	%r15, %rdi
00000000000c4c76	movq	%r13, %rsi
00000000000c4c79	movq	%rbx, %rdx
00000000000c4c7c	movq	%r13, %rbx
00000000000c4c7f	callq	0xde960                         ## symbol stub for: _memcpy
00000000000c4c84	cmpl	$0x2, %r12d
00000000000c4c88	leal	0x1(%r12), %eax
00000000000c4c8d	cmovgel	-0x34(%rbp), %eax
00000000000c4c91	movl	%eax, %r12d
00000000000c4c94	jmp	0xc4c99
00000000000c4c96	incl	%r12d
00000000000c4c99	cmpl	-0x30(%rbp), %r12d
00000000000c4c9d	movl	-0x2c(%rbp), %edx
00000000000c4ca0	jl	0xc4c0d
00000000000c4ca6	testq	%rbx, %rbx
00000000000c4ca9	je	0xc4cc1
00000000000c4cab	movq	%rbx, %rdi
00000000000c4cae	addq	$0x28, %rsp
00000000000c4cb2	popq	%rbx
00000000000c4cb3	popq	%r12
00000000000c4cb5	popq	%r13
00000000000c4cb7	popq	%r14
00000000000c4cb9	popq	%r15
00000000000c4cbb	popq	%rbp
00000000000c4cbc	jmp	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000c4cc1	addq	$0x28, %rsp
00000000000c4cc5	popq	%rbx
00000000000c4cc6	popq	%r12
00000000000c4cc8	popq	%r13
00000000000c4cca	popq	%r14
00000000000c4ccc	popq	%r15
00000000000c4cce	popq	%rbp
00000000000c4ccf	retq
__ZN12PCArray_base8badIndexEv:
00000000000c4cd0	pushq	%rbp
00000000000c4cd1	movq	%rsp, %rbp
00000000000c4cd4	pushq	%r14
