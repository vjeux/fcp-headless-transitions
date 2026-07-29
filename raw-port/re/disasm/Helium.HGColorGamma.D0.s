__ZN12HGColorGammaD0Ev:
00000000000f5f70	pushq	%rbp
00000000000f5f71	movq	%rsp, %rbp
00000000000f5f74	pushq	%rbx
00000000000f5f75	pushq	%rax
00000000000f5f76	movq	%rdi, %rbx
00000000000f5f79	leaq	0x91d2d0(%rip), %rax
00000000000f5f80	movq	%rax, (%rdi)
00000000000f5f83	callq	__ZN12HGColorGamma12ReleaseNodesEv ## HGColorGamma::ReleaseNodes()
00000000000f5f88	movq	%rbx, %rdi
00000000000f5f8b	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000f5f90	movq	%rbx, %rdi
00000000000f5f93	addq	$0x8, %rsp
00000000000f5f97	popq	%rbx
00000000000f5f98	popq	%rbp
00000000000f5f99	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f5f9e	movq	%rax, %rdi
00000000000f5fa1	callq	___clang_call_terminate
00000000000f5fa6	nopw	%cs:(%rax,%rax)
