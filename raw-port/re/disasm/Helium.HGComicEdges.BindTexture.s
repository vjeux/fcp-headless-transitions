__ZN12HGComicEdges11BindTextureEP9HGHandleri:
0000000000006d00	pushq	%rbp
0000000000006d01	movq	%rsp, %rbp
0000000000006d04	pushq	%r14
0000000000006d06	pushq	%rbx
0000000000006d07	movl	%edx, %ebx
0000000000006d09	movq	%rsi, %r14
0000000000006d0c	movq	%rsi, %rdi
0000000000006d0f	movl	%edx, %esi
0000000000006d11	xorl	%edx, %edx
0000000000006d13	xorl	%ecx, %ecx
0000000000006d15	xorl	%r8d, %r8d
0000000000006d18	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
0000000000006d1d	movq	(%r14), %rax
0000000000006d20	movq	%r14, %rdi
0000000000006d23	movl	%ebx, %esi
0000000000006d25	xorl	%edx, %edx
0000000000006d27	callq	*0x48(%rax)
0000000000006d2a	movq	(%r14), %rax
0000000000006d2d	movq	%r14, %rdi
0000000000006d30	xorl	%esi, %esi
0000000000006d32	callq	*0x38(%rax)
0000000000006d35	movq	(%r14), %rax
0000000000006d38	movq	%r14, %rdi
0000000000006d3b	movl	$0x1, %esi
0000000000006d40	movl	$0x1, %edx
0000000000006d45	callq	*0x30(%rax)
0000000000006d48	xorl	%eax, %eax
0000000000006d4a	popq	%rbx
0000000000006d4b	popq	%r14
0000000000006d4d	popq	%rbp
0000000000006d4e	retq
0000000000006d4f	nop
