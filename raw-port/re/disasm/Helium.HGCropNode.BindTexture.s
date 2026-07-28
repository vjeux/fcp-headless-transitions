__ZN10HGCropNode11BindTextureEP9HGHandleri:
00000000002476a0	pushq	%rbp
00000000002476a1	movq	%rsp, %rbp
00000000002476a4	pushq	%r14
00000000002476a6	pushq	%rbx
00000000002476a7	movl	$0xffffffff, %ebx               ## imm = 0xFFFFFFFF
00000000002476ac	testl	%edx, %edx
00000000002476ae	jne	0x247705
00000000002476b0	movq	%rsi, %r14
00000000002476b3	movq	(%rsi), %rax
00000000002476b6	xorl	%ebx, %ebx
00000000002476b8	movq	%rsi, %rdi
00000000002476bb	xorl	%esi, %esi
00000000002476bd	xorl	%edx, %edx
00000000002476bf	callq	*0x48(%rax)
00000000002476c2	movq	(%r14), %rax
00000000002476c5	movq	%r14, %rdi
00000000002476c8	xorl	%esi, %esi
00000000002476ca	xorl	%edx, %edx
00000000002476cc	callq	*0x30(%rax)
00000000002476cf	movq	%r14, %rdi
00000000002476d2	xorl	%esi, %esi
00000000002476d4	xorl	%edx, %edx
00000000002476d6	xorl	%ecx, %ecx
00000000002476d8	xorl	%r8d, %r8d
00000000002476db	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000002476e0	movq	0x90(%r14), %rdi
00000000002476e7	movq	(%rdi), %rax
00000000002476ea	movl	$0x2e, %esi
00000000002476ef	callq	*0x80(%rax)
00000000002476f5	testl	%eax, %eax
00000000002476f7	jne	0x247705
00000000002476f9	movq	(%r14), %rax
00000000002476fc	movq	%r14, %rdi
00000000002476ff	callq	*0xa8(%rax)
0000000000247705	movl	%ebx, %eax
0000000000247707	popq	%rbx
0000000000247708	popq	%r14
000000000024770a	popq	%rbp
000000000024770b	retq
000000000024770c	nopl	(%rax)
