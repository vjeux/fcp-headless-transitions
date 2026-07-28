__ZN17HgcColorIsolation11BindTextureEP9HGHandleri:
000000000145b2a0	pushq	%rbp
000000000145b2a1	movq	%rsp, %rbp
000000000145b2a4	pushq	%r14
000000000145b2a6	pushq	%rbx
000000000145b2a7	movq	%rsi, %rbx
000000000145b2aa	cmpl	$0x1, %edx
000000000145b2ad	je	0x145b312
000000000145b2af	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
000000000145b2b5	testl	%edx, %edx
000000000145b2b7	jne	0x145b375
000000000145b2bd	movq	(%rbx), %rax
000000000145b2c0	xorl	%r14d, %r14d
000000000145b2c3	movq	%rbx, %rdi
000000000145b2c6	xorl	%esi, %esi
000000000145b2c8	xorl	%edx, %edx
000000000145b2ca	callq	*0x48(%rax)
000000000145b2cd	movq	(%rbx), %rax
000000000145b2d0	movq	%rbx, %rdi
000000000145b2d3	xorl	%esi, %esi
000000000145b2d5	xorl	%edx, %edx
000000000145b2d7	callq	*0x30(%rax)
000000000145b2da	movq	%rbx, %rdi
000000000145b2dd	xorl	%esi, %esi
000000000145b2df	xorl	%edx, %edx
000000000145b2e1	xorl	%ecx, %ecx
000000000145b2e3	xorl	%r8d, %r8d
000000000145b2e6	callq	0x1496df2                       ## symbol stub for: __ZN9HGHandler8TexCoordEiiiPKd
000000000145b2eb	movq	0x90(%rbx), %rdi
000000000145b2f2	movq	(%rdi), %rax
000000000145b2f5	movl	$0x2e, %esi
000000000145b2fa	callq	*0x80(%rax)
000000000145b300	testl	%eax, %eax
000000000145b302	jne	0x145b375
000000000145b304	movq	(%rbx), %rax
000000000145b307	movq	%rbx, %rdi
000000000145b30a	callq	*0xa8(%rax)
000000000145b310	jmp	0x145b375
000000000145b312	movq	0x90(%rbx), %rdi
000000000145b319	movq	(%rdi), %rax
000000000145b31c	movl	$0x2b, %esi
000000000145b321	callq	*0x80(%rax)
000000000145b327	cmpl	$0x1, %eax
000000000145b32a	jne	0x145b347
000000000145b32c	movq	(%rbx), %rax
000000000145b32f	movq	%rbx, %rdi
000000000145b332	movl	$0x1, %esi
000000000145b337	xorl	%edx, %edx
000000000145b339	callq	*0x48(%rax)
000000000145b33c	movq	(%rbx), %rax
000000000145b33f	movq	%rbx, %rdi
000000000145b342	xorl	%esi, %esi
000000000145b344	callq	*0x38(%rax)
000000000145b347	movl	0xc4(%rbx), %eax
000000000145b34d	subl	0xbc(%rbx), %eax
000000000145b353	cvtsi2ss	%rax, %xmm0
000000000145b358	movq	(%rbx), %rax
000000000145b35b	xorps	%xmm1, %xmm1
000000000145b35e	xorps	%xmm2, %xmm2
000000000145b361	xorps	%xmm3, %xmm3
000000000145b364	movq	%rbx, %rdi
000000000145b367	movl	$0x9, %esi
000000000145b36c	callq	*0x88(%rax)
000000000145b372	xorl	%r14d, %r14d
000000000145b375	movl	%r14d, %eax
000000000145b378	popq	%rbx
000000000145b379	popq	%r14
000000000145b37b	popq	%rbp
000000000145b37c	retq
000000000145b37d	nopl	(%rax)
