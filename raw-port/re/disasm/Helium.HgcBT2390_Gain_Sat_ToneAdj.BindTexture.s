__ZN26HgcBT2390_Gain_Sat_ToneAdj11BindTextureEP9HGHandleri:
000000000035e2f0	pushq	%rbp
000000000035e2f1	movq	%rsp, %rbp
000000000035e2f4	pushq	%r14
000000000035e2f6	pushq	%rbx
000000000035e2f7	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
000000000035e2fc	testl	%edx, %edx
000000000035e2fe	jne	0x35e355
000000000035e300	movq	%rsi, %r14
000000000035e303	movq	(%rsi), %rax
000000000035e306	xorl	%ebx, %ebx
000000000035e308	movq	%rsi, %rdi
000000000035e30b	xorl	%esi, %esi
000000000035e30d	xorl	%edx, %edx
000000000035e30f	callq	*0x48(%rax)
000000000035e312	movq	(%r14), %rax
000000000035e315	movq	%r14, %rdi
000000000035e318	xorl	%esi, %esi
000000000035e31a	xorl	%edx, %edx
000000000035e31c	callq	*0x30(%rax)
000000000035e31f	movq	%r14, %rdi
000000000035e322	xorl	%esi, %esi
000000000035e324	xorl	%edx, %edx
000000000035e326	xorl	%ecx, %ecx
000000000035e328	xorl	%r8d, %r8d
000000000035e32b	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000035e330	movq	0x90(%r14), %rdi
000000000035e337	movq	(%rdi), %rax
000000000035e33a	movl	$0x2e, %esi
000000000035e33f	callq	*0x80(%rax)
000000000035e345	testl	%eax, %eax
000000000035e347	jne	0x35e355
000000000035e349	movq	(%r14), %rax
000000000035e34c	movq	%r14, %rdi
000000000035e34f	callq	*0xa8(%rax)
000000000035e355	movl	%ebx, %eax
000000000035e357	popq	%rbx
000000000035e358	popq	%r14
000000000035e35a	popq	%rbp
000000000035e35b	retq
000000000035e35c	nopl	(%rax)
