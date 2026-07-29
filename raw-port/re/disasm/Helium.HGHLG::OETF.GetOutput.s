__ZN5HGHLG4OETF9GetOutputEP10HGRenderer:
00000000000ffc70	pushq	%rbp
00000000000ffc71	movq	%rsp, %rbp
00000000000ffc74	pushq	%r14
00000000000ffc76	pushq	%rbx
00000000000ffc77	movq	%rdi, %rbx
00000000000ffc7a	movq	0x198(%rdi), %r14
00000000000ffc81	movq	%rsi, %rdi
00000000000ffc84	movq	%rbx, %rsi
00000000000ffc87	xorl	%edx, %edx
00000000000ffc89	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000ffc8e	movq	(%r14), %rcx
00000000000ffc91	movq	%r14, %rdi
00000000000ffc94	xorl	%esi, %esi
00000000000ffc96	movq	%rax, %rdx
00000000000ffc99	callq	*0x78(%rcx)
00000000000ffc9c	movq	0x198(%rbx), %rdi
00000000000ffca3	movq	(%rdi), %rax
00000000000ffca6	movss	0x2c8012(%rip), %xmm0
00000000000ffcae	xorps	%xmm1, %xmm1
00000000000ffcb1	xorps	%xmm2, %xmm2
00000000000ffcb4	xorps	%xmm3, %xmm3
00000000000ffcb7	xorl	%esi, %esi
00000000000ffcb9	callq	*0x60(%rax)
00000000000ffcbc	movq	0x198(%rbx), %rdi
00000000000ffcc3	movss	0x1a0(%rbx), %xmm0
00000000000ffccb	movss	0x1a4(%rbx), %xmm1
00000000000ffcd3	movss	0x1a8(%rbx), %xmm3
00000000000ffcdb	movq	(%rdi), %rax
00000000000ffcde	movss	0x2d12ba(%rip), %xmm2
00000000000ffce6	movl	$0x1, %esi
00000000000ffceb	callq	*0x60(%rax)
00000000000ffcee	movq	0x198(%rbx), %rax
00000000000ffcf5	popq	%rbx
00000000000ffcf6	popq	%r14
00000000000ffcf8	popq	%rbp
00000000000ffcf9	retq
00000000000ffcfa	nopw	(%rax,%rax)
