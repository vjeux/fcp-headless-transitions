__ZN4HGPQ4OETFD1Ev:
00000000000fe800	pushq	%rbp
00000000000fe801	movq	%rsp, %rbp
00000000000fe804	pushq	%rbx
00000000000fe805	pushq	%rax
00000000000fe806	leaq	0x917df3(%rip), %rax
00000000000fe80d	movq	%rax, (%rdi)
00000000000fe810	movq	0x198(%rdi), %rax
00000000000fe817	testq	%rax, %rax
00000000000fe81a	je	0xfe82b
00000000000fe81c	movq	(%rax), %rcx
00000000000fe81f	movq	%rdi, %rbx
00000000000fe822	movq	%rax, %rdi
00000000000fe825	callq	*0x18(%rcx)
00000000000fe828	movq	%rbx, %rdi
00000000000fe82b	addq	$0x8, %rsp
00000000000fe82f	popq	%rbx
00000000000fe830	popq	%rbp
00000000000fe831	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe836	movq	%rax, %rdi
00000000000fe839	callq	___clang_call_terminate
00000000000fe83e	nop
