__ZN12HGColorGammaD2Ev:
00000000000f5a90	pushq	%rbp
00000000000f5a91	movq	%rsp, %rbp
00000000000f5a94	pushq	%rbx
00000000000f5a95	pushq	%rax
00000000000f5a96	movq	%rdi, %rbx
00000000000f5a99	leaq	0x91d7b0(%rip), %rax
00000000000f5aa0	movq	%rax, (%rdi)
00000000000f5aa3	callq	__ZN12HGColorGamma12ReleaseNodesEv ## HGColorGamma::ReleaseNodes()
00000000000f5aa8	movq	%rbx, %rdi
00000000000f5aab	addq	$0x8, %rsp
00000000000f5aaf	popq	%rbx
00000000000f5ab0	popq	%rbp
00000000000f5ab1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f5ab6	movq	%rax, %rdi
00000000000f5ab9	callq	___clang_call_terminate
00000000000f5abe	nop
