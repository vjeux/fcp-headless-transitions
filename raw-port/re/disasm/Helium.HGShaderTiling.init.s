__ZNK14HGShaderTiling4initEjj:
00000000000c7a20	pushq	%rbp
00000000000c7a21	movq	%rsp, %rbp
00000000000c7a24	movl	0x28(%rdi), %eax
00000000000c7a27	shll	$0x3, %eax
00000000000c7a2a	sarl	$0x1f, %eax
00000000000c7a2d	imull	%edx, %esi
00000000000c7a30	andl	%esi, %eax
00000000000c7a32	addl	0x30(%rdi), %eax
00000000000c7a35	popq	%rbp
00000000000c7a36	retq
00000000000c7a37	nopw	(%rax,%rax)
