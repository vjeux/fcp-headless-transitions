__ZN12HGColorGammaD1Ev:
00000000000f5f40	pushq	%rbp
00000000000f5f41	movq	%rsp, %rbp
00000000000f5f44	pushq	%rbx
00000000000f5f45	pushq	%rax
00000000000f5f46	movq	%rdi, %rbx
00000000000f5f49	leaq	0x91d300(%rip), %rax
00000000000f5f50	movq	%rax, (%rdi)
00000000000f5f53	callq	__ZN12HGColorGamma12ReleaseNodesEv ## HGColorGamma::ReleaseNodes()
00000000000f5f58	movq	%rbx, %rdi
00000000000f5f5b	addq	$0x8, %rsp
00000000000f5f5f	popq	%rbx
00000000000f5f60	popq	%rbp
00000000000f5f61	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f5f66	movq	%rax, %rdi
00000000000f5f69	callq	___clang_call_terminate
00000000000f5f6e	nop
