__ZN18HgcBT2100_HLG_OETF11BindTextureEP9HGHandleri:
00000000003b03e0	pushq	%rbp
00000000003b03e1	movq	%rsp, %rbp
00000000003b03e4	pushq	%r14
00000000003b03e6	pushq	%rbx
00000000003b03e7	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000003b03ec	testl	%edx, %edx
00000000003b03ee	jne	0x3b0445
00000000003b03f0	movq	%rsi, %r14
00000000003b03f3	movq	(%rsi), %rax
00000000003b03f6	xorl	%ebx, %ebx
00000000003b03f8	movq	%rsi, %rdi
00000000003b03fb	xorl	%esi, %esi
00000000003b03fd	xorl	%edx, %edx
00000000003b03ff	callq	*0x48(%rax)
00000000003b0402	movq	(%r14), %rax
00000000003b0405	movq	%r14, %rdi
00000000003b0408	xorl	%esi, %esi
00000000003b040a	xorl	%edx, %edx
00000000003b040c	callq	*0x30(%rax)
00000000003b040f	movq	%r14, %rdi
00000000003b0412	xorl	%esi, %esi
00000000003b0414	xorl	%edx, %edx
00000000003b0416	xorl	%ecx, %ecx
00000000003b0418	xorl	%r8d, %r8d
00000000003b041b	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000003b0420	movq	0x90(%r14), %rdi
00000000003b0427	movq	(%rdi), %rax
00000000003b042a	movl	$0x2e, %esi
00000000003b042f	callq	*0x80(%rax)
00000000003b0435	testl	%eax, %eax
00000000003b0437	jne	0x3b0445
00000000003b0439	movq	(%r14), %rax
00000000003b043c	movq	%r14, %rdi
00000000003b043f	callq	*0xa8(%rax)
00000000003b0445	movl	%ebx, %eax
00000000003b0447	popq	%rbx
00000000003b0448	popq	%r14
00000000003b044a	popq	%rbp
00000000003b044b	retq
00000000003b044c	nopl	(%rax)
