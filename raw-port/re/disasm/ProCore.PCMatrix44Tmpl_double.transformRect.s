__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_:
0000000000050c5a	pushq	%rbp
0000000000050c5b	movq	%rsp, %rbp
0000000000050c5e	pushq	%r15
0000000000050c60	pushq	%r14
0000000000050c62	pushq	%r13
0000000000050c64	pushq	%r12
0000000000050c66	pushq	%rbx
0000000000050c67	subq	$0x98, %rsp
0000000000050c6e	movq	%rdi, -0x80(%rbp)
0000000000050c72	movq	0xf75a7(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000050c79	movq	(%rax), %rax
0000000000050c7c	movq	%rax, -0x30(%rbp)
0000000000050c80	movupd	0x10(%rsi), %xmm0
0000000000050c85	xorpd	%xmm1, %xmm1
0000000000050c89	ucomisd	%xmm0, %xmm1
0000000000050c8d	ja	0x50db7
0000000000050c93	ucomisd	0x18(%rsi), %xmm1
0000000000050c98	ja	0x50db7
0000000000050c9e	movq	%rdx, -0x78(%rbp)
0000000000050ca2	movupd	(%rsi), %xmm1
0000000000050ca6	movsd	0x8(%rsi), %xmm2
0000000000050cab	movlpd	%xmm1, -0x70(%rbp)
0000000000050cb0	addpd	%xmm1, %xmm0
0000000000050cb4	shufpd	$0x1, %xmm0, %xmm0              ## xmm0 = xmm0[1,0]
0000000000050cb9	movupd	%xmm0, -0x68(%rbp)
0000000000050cbe	movupd	%xmm0, -0x58(%rbp)
0000000000050cc3	movsd	%xmm2, -0x48(%rbp)
0000000000050cc8	movapd	%xmm1, -0x40(%rbp)
0000000000050ccd	xorpd	%xmm0, %xmm0
0000000000050cd1	leaq	-0xc0(%rbp), %rax
0000000000050cd8	movapd	%xmm0, (%rax)
0000000000050cdc	movapd	0xd1e6c(%rip), %xmm0
0000000000050ce4	movapd	%xmm0, 0x10(%rax)
0000000000050ce9	xorl	%ebx, %ebx
0000000000050ceb	xorl	%r12d, %r12d
0000000000050cee	xorl	%r14d, %r14d
0000000000050cf1	leaq	(%rbx,%rbp), %r13
0000000000050cf5	addq	$-0x70, %r13
0000000000050cf9	xorpd	%xmm0, %xmm0
0000000000050cfd	movapd	%xmm0, -0x90(%rbp)
0000000000050d05	movapd	%xmm0, -0xa0(%rbp)
0000000000050d0d	movq	-0x80(%rbp), %rdi
0000000000050d11	movq	%r13, %rsi
0000000000050d14	leaq	-0xa0(%rbp), %rdx
0000000000050d1b	callq	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector4IT_ERK9PCVector2IS3_ES5_ ## PCVector4<double>& PCMatrix44Tmpl<double>::transform<double>(PCVector2<double> const&, PCVector4<double>&) const
0000000000050d20	movsd	-0x88(%rbp), %xmm0
0000000000050d28	xorpd	%xmm1, %xmm1
0000000000050d2c	ucomisd	%xmm1, %xmm0
0000000000050d30	seta	%r15b
0000000000050d34	jbe	0x50d42
0000000000050d36	testb	$0x1, %r12b
0000000000050d3a	jne	0x50dc8
0000000000050d40	jmp	0x50d52
0000000000050d42	ucomisd	%xmm0, %xmm1
0000000000050d46	setbe	%al
0000000000050d49	orb	%al, %r14b
0000000000050d4c	testb	$0x1, %r14b
0000000000050d50	jne	0x50dc8
0000000000050d52	ucomisd	%xmm1, %xmm0
0000000000050d56	setbe	%r12b
0000000000050d5a	movsd	0xd17ce(%rip), %xmm1
0000000000050d62	divsd	%xmm0, %xmm1
0000000000050d66	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
0000000000050d6a	mulpd	-0xa0(%rbp), %xmm0
0000000000050d72	movapd	%xmm0, -0x70(%rbp,%rbx)
0000000000050d78	leaq	-0xc0(%rbp), %rdi
0000000000050d7f	movq	%r13, %rsi
0000000000050d82	callq	__ZN6PCRectIdEoRERK9PCVector2IdE ## PCRect<double>::operator|=(PCVector2<double> const&)
0000000000050d87	addq	$0x10, %rbx
0000000000050d8b	movl	%r15d, %r14d
0000000000050d8e	cmpq	$0x40, %rbx
0000000000050d92	jne	0x50cf1
0000000000050d98	movapd	-0xc0(%rbp), %xmm0
0000000000050da0	movapd	-0xb0(%rbp), %xmm1
0000000000050da8	movq	-0x78(%rbp), %rax
0000000000050dac	movupd	%xmm1, 0x10(%rax)
0000000000050db1	movupd	%xmm0, (%rax)
0000000000050db5	jmp	0x50dc4
0000000000050db7	movapd	0xd1d91(%rip), %xmm0
0000000000050dbf	movupd	%xmm0, 0x10(%rdx)
0000000000050dc4	movb	$0x1, %al
0000000000050dc6	jmp	0x50dca
0000000000050dc8	xorl	%eax, %eax
0000000000050dca	movq	0xf744f(%rip), %rcx             ## literal pool symbol address: ___stack_chk_guard
0000000000050dd1	movq	(%rcx), %rcx
0000000000050dd4	cmpq	-0x30(%rbp), %rcx
0000000000050dd8	jne	0x50dec
0000000000050dda	addq	$0x98, %rsp
0000000000050de1	popq	%rbx
0000000000050de2	popq	%r12
0000000000050de4	popq	%r13
0000000000050de6	popq	%r14
0000000000050de8	popq	%r15
0000000000050dea	popq	%rbp
0000000000050deb	retq
0000000000050dec	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
0000000000050df1	movq	%rax, %rdi
0000000000050df4	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
0000000000050df9	nop
