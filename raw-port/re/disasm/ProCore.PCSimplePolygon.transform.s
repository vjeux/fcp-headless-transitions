__ZN15PCSimplePolygon9transformERK14PCMatrix44TmplIdE:
00000000000c3eb2	pushq	%rbp
00000000000c3eb3	movq	%rsp, %rbp
00000000000c3eb6	pushq	%r15
00000000000c3eb8	pushq	%r14
00000000000c3eba	pushq	%r13
00000000000c3ebc	pushq	%r12
00000000000c3ebe	pushq	%rbx
00000000000c3ebf	subq	$0x18, %rsp
00000000000c3ec3	movq	%rsi, %r14
00000000000c3ec6	movq	0x8(%rdi), %rsi
00000000000c3eca	cmpq	%rsi, 0x10(%rdi)
00000000000c3ece	je	0xc3fd4
00000000000c3ed4	movq	%rdi, %rbx
00000000000c3ed7	xorl	%r12d, %r12d
00000000000c3eda	leaq	-0x40(%rbp), %r15
00000000000c3ede	xorl	%r13d, %r13d
00000000000c3ee1	addq	%r12, %rsi
00000000000c3ee4	xorps	%xmm0, %xmm0
00000000000c3ee7	movaps	%xmm0, -0x40(%rbp)
00000000000c3eeb	movq	%r14, %rdi
00000000000c3eee	movq	%r15, %rdx
00000000000c3ef1	callq	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector2IT_ERKS4_S5_ ## PCVector2<double>& PCMatrix44Tmpl<double>::transform<double>(PCVector2<double> const&, PCVector2<double>&) const
00000000000c3ef6	movq	0x8(%rbx), %rax
00000000000c3efa	movapd	-0x40(%rbp), %xmm0
00000000000c3eff	movupd	%xmm0, (%rax,%r12)
00000000000c3f05	incq	%r13
00000000000c3f08	movq	0x8(%rbx), %rsi
00000000000c3f0c	movq	0x10(%rbx), %rax
00000000000c3f10	subq	%rsi, %rax
00000000000c3f13	sarq	$0x4, %rax
00000000000c3f17	addq	$0x10, %r12
00000000000c3f1b	cmpq	%r13, %rax
00000000000c3f1e	ja	0xc3ee1
00000000000c3f20	cmpq	$0x1, %rax
00000000000c3f24	jbe	0xc3fd4
00000000000c3f2a	movupd	(%rsi), %xmm2
00000000000c3f2e	movupd	%xmm2, 0x20(%rbx)
00000000000c3f33	subpd	%xmm2, %xmm2
00000000000c3f37	movupd	%xmm2, 0x30(%rbx)
00000000000c3f3c	movsd	0x20(%rbx), %xmm1
00000000000c3f41	movsd	0x28(%rbx), %xmm0
00000000000c3f46	unpckhpd	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1]
00000000000c3f4a	movapd	%xmm2, %xmm4
00000000000c3f4e	addsd	%xmm0, %xmm4
00000000000c3f52	movsd	0x30(%rbx), %xmm5
00000000000c3f57	movapd	%xmm1, %xmm3
00000000000c3f5b	addsd	%xmm5, %xmm3
00000000000c3f5f	addq	$0x18, %rsi
00000000000c3f63	decq	%rax
00000000000c3f66	movsd	-0x8(%rsi), %xmm6
00000000000c3f6b	ucomisd	%xmm6, %xmm1
00000000000c3f6f	jbe	0xc3f77
00000000000c3f71	movapd	%xmm6, %xmm1
00000000000c3f75	jmp	0xc3f85
00000000000c3f77	addsd	%xmm1, %xmm5
00000000000c3f7b	ucomisd	%xmm5, %xmm6
00000000000c3f7f	jbe	0xc3f85
00000000000c3f81	movapd	%xmm6, %xmm3
00000000000c3f85	movsd	(%rsi), %xmm6
00000000000c3f89	ucomisd	%xmm6, %xmm0
00000000000c3f8d	jbe	0xc3f95
00000000000c3f8f	movapd	%xmm6, %xmm0
00000000000c3f93	jmp	0xc3f9f
00000000000c3f95	addsd	%xmm0, %xmm2
00000000000c3f99	ucomisd	%xmm2, %xmm6
00000000000c3f9d	ja	0xc3fa3
00000000000c3f9f	movapd	%xmm4, %xmm6
00000000000c3fa3	movapd	%xmm3, %xmm5
00000000000c3fa7	subsd	%xmm1, %xmm5
00000000000c3fab	movapd	%xmm6, %xmm2
00000000000c3faf	subsd	%xmm0, %xmm2
00000000000c3fb3	addq	$0x10, %rsi
00000000000c3fb7	movapd	%xmm6, %xmm4
00000000000c3fbb	decq	%rax
00000000000c3fbe	jne	0xc3f66
00000000000c3fc0	movsd	%xmm1, 0x20(%rbx)
00000000000c3fc5	movsd	%xmm5, 0x30(%rbx)
00000000000c3fca	movsd	%xmm0, 0x28(%rbx)
00000000000c3fcf	movsd	%xmm2, 0x38(%rbx)
00000000000c3fd4	addq	$0x18, %rsp
00000000000c3fd8	popq	%rbx
00000000000c3fd9	popq	%r12
00000000000c3fdb	popq	%r13
00000000000c3fdd	popq	%r14
00000000000c3fdf	popq	%r15
00000000000c3fe1	popq	%rbp
00000000000c3fe2	retq
00000000000c3fe3	nop
