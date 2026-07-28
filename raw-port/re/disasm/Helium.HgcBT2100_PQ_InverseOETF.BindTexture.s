__ZN24HgcBT2100_PQ_InverseOETF11BindTextureEP9HGHandleri:
00000000003aca70	pushq	%rbp
00000000003aca71	movq	%rsp, %rbp
00000000003aca74	pushq	%r14
00000000003aca76	pushq	%rbx
00000000003aca77	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000003aca7c	testl	%edx, %edx
00000000003aca7e	jne	0x3acad5
00000000003aca80	movq	%rsi, %r14
00000000003aca83	movq	(%rsi), %rax
00000000003aca86	xorl	%ebx, %ebx
00000000003aca88	movq	%rsi, %rdi
00000000003aca8b	xorl	%esi, %esi
00000000003aca8d	xorl	%edx, %edx
00000000003aca8f	callq	*0x48(%rax)
00000000003aca92	movq	(%r14), %rax
00000000003aca95	movq	%r14, %rdi
00000000003aca98	xorl	%esi, %esi
00000000003aca9a	xorl	%edx, %edx
00000000003aca9c	callq	*0x30(%rax)
00000000003aca9f	movq	%r14, %rdi
00000000003acaa2	xorl	%esi, %esi
00000000003acaa4	xorl	%edx, %edx
00000000003acaa6	xorl	%ecx, %ecx
00000000003acaa8	xorl	%r8d, %r8d
00000000003acaab	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000003acab0	movq	0x90(%r14), %rdi
00000000003acab7	movq	(%rdi), %rax
00000000003acaba	movl	$0x2e, %esi
00000000003acabf	callq	*0x80(%rax)
00000000003acac5	testl	%eax, %eax
00000000003acac7	jne	0x3acad5
00000000003acac9	movq	(%r14), %rax
00000000003acacc	movq	%r14, %rdi
00000000003acacf	callq	*0xa8(%rax)
00000000003acad5	movl	%ebx, %eax
00000000003acad7	popq	%rbx
00000000003acad8	popq	%r14
00000000003acada	popq	%rbp
00000000003acadb	retq
00000000003acadc	nopl	(%rax)
