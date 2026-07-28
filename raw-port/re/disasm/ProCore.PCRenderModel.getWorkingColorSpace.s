__ZNK13PCRenderModel20getWorkingColorSpaceE19PCWorkingGamutValue:
0000000000051afa	pushq	%rbp
0000000000051afb	movq	%rsp, %rbp
0000000000051afe	testl	%esi, %esi
0000000000051b00	je	0x51b0e
0000000000051b02	cmpl	$0x1, %esi
0000000000051b05	jne	0x51b1c
0000000000051b07	movl	$0x10, %eax
0000000000051b0c	jmp	0x51b13
0000000000051b0e	movl	$0x8, %eax
0000000000051b13	addq	%rax, %rdi
0000000000051b16	popq	%rbp
0000000000051b17	jmp	__ZNK18PCColorSpaceHandle15getCGColorSpaceEv ## PCColorSpaceHandle::getCGColorSpace() const
0000000000051b1c	popq	%rbp
0000000000051b1d	retq
