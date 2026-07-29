__ZN4HGPQ4OETFD2Ev:
00000000000fe7c0	pushq	%rbp
00000000000fe7c1	movq	%rsp, %rbp
00000000000fe7c4	pushq	%rbx
00000000000fe7c5	pushq	%rax
00000000000fe7c6	leaq	0x917e33(%rip), %rax
00000000000fe7cd	movq	%rax, (%rdi)
00000000000fe7d0	movq	0x198(%rdi), %rax
00000000000fe7d7	testq	%rax, %rax
00000000000fe7da	je	0xfe7eb
00000000000fe7dc	movq	(%rax), %rcx
00000000000fe7df	movq	%rdi, %rbx
00000000000fe7e2	movq	%rax, %rdi
00000000000fe7e5	callq	*0x18(%rcx)
00000000000fe7e8	movq	%rbx, %rdi
00000000000fe7eb	addq	$0x8, %rsp
00000000000fe7ef	popq	%rbx
00000000000fe7f0	popq	%rbp
00000000000fe7f1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe7f6	movq	%rax, %rdi
00000000000fe7f9	callq	___clang_call_terminate
00000000000fe7fe	nop
