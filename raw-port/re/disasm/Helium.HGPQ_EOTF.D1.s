__ZN4HGPQ4EOTFD1Ev:
00000000000fdc80	pushq	%rbp
00000000000fdc81	movq	%rsp, %rbp
00000000000fdc84	pushq	%rbx
00000000000fdc85	pushq	%rax
00000000000fdc86	leaq	0x918073(%rip), %rax
00000000000fdc8d	movq	%rax, (%rdi)
00000000000fdc90	movq	0x198(%rdi), %rax
00000000000fdc97	testq	%rax, %rax
00000000000fdc9a	je	0xfdcab
00000000000fdc9c	movq	(%rax), %rcx
00000000000fdc9f	movq	%rdi, %rbx
00000000000fdca2	movq	%rax, %rdi
00000000000fdca5	callq	*0x18(%rcx)
00000000000fdca8	movq	%rbx, %rdi
00000000000fdcab	addq	$0x8, %rsp
00000000000fdcaf	popq	%rbx
00000000000fdcb0	popq	%rbp
00000000000fdcb1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdcb6	movq	%rax, %rdi
00000000000fdcb9	callq	___clang_call_terminate
00000000000fdcbe	nop
