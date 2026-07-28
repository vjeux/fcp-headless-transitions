__ZN10HGDemosaic12SetParameterEiffff:
00000000000dda40	cmpl	$0x8, %esi
00000000000dda43	ja	0xddb41
00000000000dda49	pushq	%rbp
00000000000dda4a	movq	%rsp, %rbp
00000000000dda4d	movq	0x198(%rdi), %rax
00000000000dda54	movl	%esi, %ecx
00000000000dda56	leaq	0xfb(%rip), %rdx
00000000000dda5d	movslq	(%rdx,%rcx,4), %rcx
00000000000dda61	addq	%rdx, %rcx
00000000000dda64	jmpq	*%rcx
00000000000dda66	ucomiss	0xc(%rax), %xmm0
00000000000dda6a	jne	0xdda72
00000000000dda6c	jnp	0xddb3d
00000000000dda72	movss	%xmm0, 0xc(%rax)
00000000000dda77	movl	$0x1, %eax
00000000000dda7c	popq	%rbp
00000000000dda7d	retq
00000000000dda7e	ucomiss	0x20(%rax), %xmm0
00000000000dda82	jne	0xdda8a
00000000000dda84	jnp	0xddb3d
00000000000dda8a	movss	%xmm0, 0x20(%rax)
00000000000dda8f	movl	$0x1, %eax
00000000000dda94	popq	%rbp
00000000000dda95	retq
00000000000dda96	ucomiss	0x14(%rax), %xmm0
00000000000dda9a	jne	0xddaa2
00000000000dda9c	jnp	0xddb3d
00000000000ddaa2	movss	%xmm0, 0x14(%rax)
00000000000ddaa7	movl	$0x1, %eax
00000000000ddaac	popq	%rbp
00000000000ddaad	retq
00000000000ddaae	movsd	0x18(%rax), %xmm2
00000000000ddab3	ucomiss	%xmm2, %xmm0
00000000000ddab6	jne	0xddac5
00000000000ddab8	jp	0xddac5
00000000000ddaba	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
00000000000ddabe	ucomiss	%xmm2, %xmm1
00000000000ddac1	jne	0xddac5
00000000000ddac3	jnp	0xddb3d
00000000000ddac5	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000000ddacb	movlps	%xmm0, 0x18(%rax)
00000000000ddacf	movl	$0x1, %eax
00000000000ddad4	popq	%rbp
00000000000ddad5	retq
00000000000ddad6	ucomiss	0x2c(%rax), %xmm0
00000000000ddada	jne	0xddade
00000000000ddadc	jnp	0xddb3d
00000000000ddade	movss	%xmm0, 0x2c(%rax)
00000000000ddae3	movl	$0x1, %eax
00000000000ddae8	popq	%rbp
00000000000ddae9	retq
00000000000ddaea	ucomiss	0x10(%rax), %xmm0
00000000000ddaee	jne	0xddaf2
00000000000ddaf0	jnp	0xddb3d
00000000000ddaf2	movss	%xmm0, 0x10(%rax)
00000000000ddaf7	movl	$0x1, %eax
00000000000ddafc	popq	%rbp
00000000000ddafd	retq
00000000000ddafe	ucomiss	0x24(%rax), %xmm0
00000000000ddb02	jne	0xddb06
00000000000ddb04	jnp	0xddb3d
00000000000ddb06	movss	%xmm0, 0x24(%rax)
00000000000ddb0b	movl	$0x1, %eax
00000000000ddb10	popq	%rbp
00000000000ddb11	retq
00000000000ddb12	ucomiss	0x28(%rax), %xmm0
00000000000ddb16	jne	0xddb1a
00000000000ddb18	jnp	0xddb3d
00000000000ddb1a	movss	%xmm0, 0x28(%rax)
00000000000ddb1f	movl	$0x1, %eax
00000000000ddb24	popq	%rbp
00000000000ddb25	retq
00000000000ddb26	movsd	0x30(%rax), %xmm2
00000000000ddb2b	ucomiss	%xmm2, %xmm0
00000000000ddb2e	jne	0xddb47
00000000000ddb30	jp	0xddb47
00000000000ddb32	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
00000000000ddb36	ucomiss	%xmm2, %xmm1
00000000000ddb39	jne	0xddb47
00000000000ddb3b	jp	0xddb47
00000000000ddb3d	xorl	%eax, %eax
00000000000ddb3f	popq	%rbp
00000000000ddb40	retq
00000000000ddb41	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000ddb46	retq
00000000000ddb47	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000000ddb4d	movlps	%xmm0, 0x30(%rax)
00000000000ddb51	movl	$0x1, %eax
00000000000ddb56	popq	%rbp
00000000000ddb57	retq
00000000000ddb58	.byte 0x0e #bad opcode
00000000000ddb59	.byte 0xff #bad opcode
00000000000ddb5a	.byte 0xff #bad opcode
00000000000ddb5b	callq	*0x3effffff(%rdx)
00000000000ddb61	.byte 0xff #bad opcode
00000000000ddb62	.byte 0xff #bad opcode
00000000000ddb63	callq	*-0x1(%rsi)
00000000000ddb66	.byte 0xff #bad opcode
00000000000ddb67	jmpq	*(%rsi)
00000000000ddb69	.byte 0xff #bad opcode
00000000000ddb6a	.byte 0xff #bad opcode
00000000000ddb6b	jmpq	*-0x45000001(%rsi)
00000000000ddb71	.byte 0xff #bad opcode
00000000000ddb72	.byte 0xff #bad opcode
00000000000ddb73	.byte 0xff #bad opcode
00000000000ddb74	jle	0xddb75
00000000000ddb76	.byte 0xff #bad opcode
00000000000ddb77	decl	%esi
00000000000ddb79	.byte 0xff #bad opcode
00000000000ddb7a	.byte 0xff #bad opcode
00000000000ddb7b	decl	(%rdi)
00000000000ddb7d	.byte 0x1f #bad opcode
00000000000ddb7e	addb	%dl, 0x48(%rbp)
00000000000ddb82	movl	%esp, %ebp
00000000000ddb84	pushq	%r14
00000000000ddb86	pushq	%rbx
00000000000ddb87	movq	%rsi, %rbx
00000000000ddb8a	movq	%rdi, %r14
00000000000ddb8d	movq	%rsi, %rdi
00000000000ddb90	movq	%r14, %rsi
00000000000ddb93	xorl	%edx, %edx
00000000000ddb95	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000ddb9a	testq	%rax, %rax
00000000000ddb9d	je	0xddbb5
00000000000ddb9f	movq	0x198(%r14), %rdi
00000000000ddba6	movq	%rbx, %rsi
00000000000ddba9	movq	%rax, %rdx
00000000000ddbac	popq	%rbx
00000000000ddbad	popq	%r14
00000000000ddbaf	popq	%rbp
00000000000ddbb0	jmp	__ZN24HGDemosaicImplementation13GenerateGraphEP10HGRendererP6HGNode ## HGDemosaicImplementation::GenerateGraph(HGRenderer*, HGNode*)
00000000000ddbb5	xorl	%eax, %eax
00000000000ddbb7	popq	%rbx
00000000000ddbb8	popq	%r14
00000000000ddbba	popq	%rbp
00000000000ddbbb	retq
00000000000ddbbc	nopl	(%rax)
