__ZNK19OZMaterialLayerBase9findTokenERK9PCHash128:
00000000004ac7a0	pushq	%rbp
00000000004ac7a1	movq	%rsp, %rbp
00000000004ac7a4	pushq	%r15
00000000004ac7a6	pushq	%r14
00000000004ac7a8	pushq	%r13
00000000004ac7aa	pushq	%r12
00000000004ac7ac	pushq	%rbx
00000000004ac7ad	pushq	%rax
00000000004ac7ae	movq	%rdi, %rbx
00000000004ac7b1	movq	0x4b0(%rsi), %r13
00000000004ac7b8	testq	%r13, %r13
00000000004ac7bb	je	0x4ac805
00000000004ac7bd	movq	%rdx, %r14
00000000004ac7c0	movq	%rsi, %r15
00000000004ac7c3	addq	$0x4b0, %r15                    ## imm = 0x4B0
00000000004ac7ca	movq	%r15, %r12
00000000004ac7cd	nopl	(%rax)
00000000004ac7d0	leaq	0x20(%r13), %rdi
00000000004ac7d4	movq	%r14, %rsi
00000000004ac7d7	callq	0x6dfc60                        ## symbol stub for: __ZltRK9PCHash128S1_
00000000004ac7dc	movzbl	%al, %eax
00000000004ac7df	testb	%al, %al
00000000004ac7e1	cmoveq	%r13, %r12
00000000004ac7e5	movq	(%r13,%rax,8), %r13
00000000004ac7ea	testq	%r13, %r13
00000000004ac7ed	jne	0x4ac7d0
00000000004ac7ef	cmpq	%r15, %r12
00000000004ac7f2	je	0x4ac805
00000000004ac7f4	leaq	0x20(%r12), %rsi
00000000004ac7f9	movq	%r14, %rdi
00000000004ac7fc	callq	0x6dfc60                        ## symbol stub for: __ZltRK9PCHash128S1_
00000000004ac801	testb	%al, %al
00000000004ac803	je	0x4ac81d
00000000004ac805	xorps	%xmm0, %xmm0
00000000004ac808	movups	%xmm0, (%rbx)
00000000004ac80b	movq	%rbx, %rax
00000000004ac80e	addq	$0x8, %rsp
00000000004ac812	popq	%rbx
00000000004ac813	popq	%r12
00000000004ac815	popq	%r13
00000000004ac817	popq	%r14
00000000004ac819	popq	%r15
00000000004ac81b	popq	%rbp
00000000004ac81c	retq
00000000004ac81d	movq	0x38(%r12), %rax
00000000004ac822	movups	0x30(%r12), %xmm0
00000000004ac828	movups	%xmm0, (%rbx)
00000000004ac82b	testq	%rax, %rax
00000000004ac82e	je	0x4ac80b
00000000004ac830	lock
00000000004ac831	incq	0x8(%rax)
00000000004ac835	jmp	0x4ac80b
00000000004ac837	nopw	(%rax,%rax)
