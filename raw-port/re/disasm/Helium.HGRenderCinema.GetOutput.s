__ZN14HGRenderCinema9GetOutputEP10HGRenderer:
00000000000f36c0	pushq	%rbp
00000000000f36c1	movq	%rsp, %rbp
00000000000f36c4	pushq	%r15
00000000000f36c6	pushq	%r14
00000000000f36c8	pushq	%rbx
00000000000f36c9	pushq	%rax
00000000000f36ca	movq	%rsi, %r14
00000000000f36cd	movq	%rdi, %rbx
00000000000f36d0	movq	0x198(%rdi), %r15
00000000000f36d7	movq	%rsi, %rdi
00000000000f36da	movq	%rbx, %rsi
00000000000f36dd	xorl	%edx, %edx
00000000000f36df	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f36e4	movq	(%r15), %rcx
00000000000f36e7	movq	%r15, %rdi
00000000000f36ea	xorl	%esi, %esi
00000000000f36ec	movq	%rax, %rdx
00000000000f36ef	callq	*0x78(%rcx)
00000000000f36f2	cmpl	$0x0, 0x1a0(%rbx)
00000000000f36f9	jne	0xf3723
00000000000f36fb	movq	0x198(%rbx), %r15
00000000000f3702	movq	%r14, %rdi
00000000000f3705	movq	%rbx, %rsi
00000000000f3708	movl	$0x1, %edx
00000000000f370d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000f3712	movq	(%r15), %rcx
00000000000f3715	movq	%r15, %rdi
00000000000f3718	movl	$0x1, %esi
00000000000f371d	movq	%rax, %rdx
00000000000f3720	callq	*0x78(%rcx)
00000000000f3723	movq	0x198(%rbx), %rax
00000000000f372a	addq	$0x8, %rsp
00000000000f372e	popq	%rbx
00000000000f372f	popq	%r14
00000000000f3731	popq	%r15
00000000000f3733	popq	%rbp
00000000000f3734	retq
00000000000f3735	nopw	%cs:(%rax,%rax)
