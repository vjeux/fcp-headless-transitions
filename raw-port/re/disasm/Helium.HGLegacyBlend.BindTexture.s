__ZN13HGLegacyBlend11BindTextureEP9HGHandleri:
0000000000242690	pushq	%rbp
0000000000242691	movq	%rsp, %rbp
0000000000242694	pushq	%rbx
0000000000242695	pushq	%rax
0000000000242696	movq	%rsi, %rbx
0000000000242699	movq	%rsi, %rdi
000000000024269c	movl	%edx, %esi
000000000024269e	xorl	%edx, %edx
00000000002426a0	xorl	%ecx, %ecx
00000000002426a2	xorl	%r8d, %r8d
00000000002426a5	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
00000000002426aa	movq	0x90(%rbx), %rdi
00000000002426b1	movq	(%rdi), %rax
00000000002426b4	movl	$0x2e, %esi
00000000002426b9	callq	*0x80(%rax)
00000000002426bf	testl	%eax, %eax
00000000002426c1	jne	0x2426cf
00000000002426c3	movq	(%rbx), %rax
00000000002426c6	movq	%rbx, %rdi
00000000002426c9	callq	*0xa8(%rax)
00000000002426cf	xorl	%eax, %eax
00000000002426d1	addq	$0x8, %rsp
00000000002426d5	popq	%rbx
00000000002426d6	popq	%rbp
00000000002426d7	retq
00000000002426d8	nopl	(%rax,%rax)
