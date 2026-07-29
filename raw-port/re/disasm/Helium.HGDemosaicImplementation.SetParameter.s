__ZN24HGDemosaicImplementation12SetParameterEiffff:
00000000000dd420	pushq	%rbp
00000000000dd421	movq	%rsp, %rbp
00000000000dd424	cmpl	$0x8, %esi
00000000000dd427	ja	0xdd51a
00000000000dd42d	movl	%esi, %eax
00000000000dd42f	leaq	0xfe(%rip), %rcx
00000000000dd436	movslq	(%rcx,%rax,4), %rax
00000000000dd43a	addq	%rcx, %rax
00000000000dd43d	jmpq	*%rax
00000000000dd43f	ucomiss	0xc(%rdi), %xmm0
00000000000dd443	jne	0xdd44b
00000000000dd445	jnp	0xdd516
00000000000dd44b	movss	%xmm0, 0xc(%rdi)
00000000000dd450	movl	$0x1, %eax
00000000000dd455	popq	%rbp
00000000000dd456	retq
00000000000dd457	ucomiss	0x20(%rdi), %xmm0
00000000000dd45b	jne	0xdd463
00000000000dd45d	jnp	0xdd516
00000000000dd463	movss	%xmm0, 0x20(%rdi)
00000000000dd468	movl	$0x1, %eax
00000000000dd46d	popq	%rbp
00000000000dd46e	retq
00000000000dd46f	ucomiss	0x14(%rdi), %xmm0
00000000000dd473	jne	0xdd47b
00000000000dd475	jnp	0xdd516
00000000000dd47b	movss	%xmm0, 0x14(%rdi)
00000000000dd480	movl	$0x1, %eax
00000000000dd485	popq	%rbp
00000000000dd486	retq
00000000000dd487	movsd	0x18(%rdi), %xmm2
00000000000dd48c	ucomiss	%xmm2, %xmm0
00000000000dd48f	jne	0xdd49e
00000000000dd491	jp	0xdd49e
00000000000dd493	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
00000000000dd497	ucomiss	%xmm2, %xmm1
00000000000dd49a	jne	0xdd49e
00000000000dd49c	jnp	0xdd516
00000000000dd49e	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000000dd4a4	movlps	%xmm0, 0x18(%rdi)
00000000000dd4a8	movl	$0x1, %eax
00000000000dd4ad	popq	%rbp
00000000000dd4ae	retq
00000000000dd4af	ucomiss	0x2c(%rdi), %xmm0
00000000000dd4b3	jne	0xdd4b7
00000000000dd4b5	jnp	0xdd516
00000000000dd4b7	movss	%xmm0, 0x2c(%rdi)
00000000000dd4bc	movl	$0x1, %eax
00000000000dd4c1	popq	%rbp
00000000000dd4c2	retq
00000000000dd4c3	ucomiss	0x10(%rdi), %xmm0
00000000000dd4c7	jne	0xdd4cb
00000000000dd4c9	jnp	0xdd516
00000000000dd4cb	movss	%xmm0, 0x10(%rdi)
00000000000dd4d0	movl	$0x1, %eax
00000000000dd4d5	popq	%rbp
00000000000dd4d6	retq
00000000000dd4d7	ucomiss	0x24(%rdi), %xmm0
00000000000dd4db	jne	0xdd4df
00000000000dd4dd	jnp	0xdd516
00000000000dd4df	movss	%xmm0, 0x24(%rdi)
00000000000dd4e4	movl	$0x1, %eax
00000000000dd4e9	popq	%rbp
00000000000dd4ea	retq
00000000000dd4eb	ucomiss	0x28(%rdi), %xmm0
00000000000dd4ef	jne	0xdd4f3
00000000000dd4f1	jnp	0xdd516
00000000000dd4f3	movss	%xmm0, 0x28(%rdi)
00000000000dd4f8	movl	$0x1, %eax
00000000000dd4fd	popq	%rbp
00000000000dd4fe	retq
00000000000dd4ff	movsd	0x30(%rdi), %xmm2
00000000000dd504	ucomiss	%xmm2, %xmm0
00000000000dd507	jne	0xdd521
00000000000dd509	jp	0xdd521
00000000000dd50b	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
00000000000dd50f	ucomiss	%xmm2, %xmm1
00000000000dd512	jne	0xdd521
00000000000dd514	jp	0xdd521
00000000000dd516	xorl	%eax, %eax
00000000000dd518	popq	%rbp
00000000000dd519	retq
00000000000dd51a	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000dd51f	popq	%rbp
00000000000dd520	retq
00000000000dd521	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000000dd527	movlps	%xmm0, 0x30(%rdi)
00000000000dd52b	movl	$0x1, %eax
00000000000dd530	popq	%rbp
00000000000dd531	retq
00000000000dd532	nop
00000000000dd534	orl	%edi, %edi
00000000000dd536	.byte 0xff #bad opcode
00000000000dd537	decl	0x3bffffff(%rdi)
00000000000dd53d	.byte 0xff #bad opcode
00000000000dd53e	.byte 0xff #bad opcode
00000000000dd53f	callq	*-0x1(%rbx)
00000000000dd542	.byte 0xff #bad opcode
00000000000dd543	jmpq	*(%rbx)
00000000000dd545	.byte 0xff #bad opcode
00000000000dd546	.byte 0xff #bad opcode
00000000000dd547	jmpq	*-0x48000001(%rbx)
00000000000dd54d	.byte 0xff #bad opcode
00000000000dd54e	.byte 0xff #bad opcode
00000000000dd54f	.byte 0xff #bad opcode
00000000000dd550	jnp	0xdd551
00000000000dd552	.byte 0xff #bad opcode
00000000000dd553	decl	%ebx
00000000000dd555	.byte 0xff #bad opcode
00000000000dd556	.byte 0xff #bad opcode
00000000000dd557	decl	(%rdi)
00000000000dd559	.byte 0x1f #bad opcode
00000000000dd55a	testb	%al, (%rax)
00000000000dd55c	addb	%al, (%rax)
00000000000dd55e	addb	%al, (%rax)
