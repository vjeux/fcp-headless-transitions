__ZN25HgcBT2100_HLG_InverseOETF11BindTextureEP9HGHandleri:
00000000003b1590	pushq	%rbp
00000000003b1591	movq	%rsp, %rbp
00000000003b1594	pushq	%r14
00000000003b1596	pushq	%rbx
00000000003b1597	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000003b159c	testl	%edx, %edx
00000000003b159e	jne	0x3b15f5
00000000003b15a0	movq	%rsi, %r14
00000000003b15a3	movq	(%rsi), %rax
00000000003b15a6	xorl	%ebx, %ebx
00000000003b15a8	movq	%rsi, %rdi
00000000003b15ab	xorl	%esi, %esi
00000000003b15ad	xorl	%edx, %edx
00000000003b15af	callq	*0x48(%rax)
00000000003b15b2	movq	(%r14), %rax
00000000003b15b5	movq	%r14, %rdi
00000000003b15b8	xorl	%esi, %esi
00000000003b15ba	xorl	%edx, %edx
00000000003b15bc	callq	*0x30(%rax)
00000000003b15bf	movq	%r14, %rdi
00000000003b15c2	xorl	%esi, %esi
00000000003b15c4	xorl	%edx, %edx
00000000003b15c6	xorl	%ecx, %ecx
00000000003b15c8	xorl	%r8d, %r8d
00000000003b15cb	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000003b15d0	movq	0x90(%r14), %rdi
00000000003b15d7	movq	(%rdi), %rax
00000000003b15da	movl	$0x2e, %esi
00000000003b15df	callq	*0x80(%rax)
00000000003b15e5	testl	%eax, %eax
00000000003b15e7	jne	0x3b15f5
00000000003b15e9	movq	(%r14), %rax
00000000003b15ec	movq	%r14, %rdi
00000000003b15ef	callq	*0xa8(%rax)
00000000003b15f5	movl	%ebx, %eax
00000000003b15f7	popq	%rbx
00000000003b15f8	popq	%r14
00000000003b15fa	popq	%rbp
00000000003b15fb	retq
00000000003b15fc	nopl	(%rax)
