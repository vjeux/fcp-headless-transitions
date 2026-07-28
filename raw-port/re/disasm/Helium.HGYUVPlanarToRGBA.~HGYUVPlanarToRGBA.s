__ZN17HGYUVPlanarToRGBAD0Ev:
00000000000e4b30	pushq	%rbp
00000000000e4b31	movq	%rsp, %rbp
00000000000e4b34	pushq	%rbx
00000000000e4b35	pushq	%rax
00000000000e4b36	movq	%rdi, %rbx
00000000000e4b39	leaq	0x929698(%rip), %rax
00000000000e4b40	movq	%rax, (%rdi)
00000000000e4b43	movq	0x198(%rdi), %rdi
00000000000e4b4a	testq	%rdi, %rdi
00000000000e4b4d	je	0xe4b55
00000000000e4b4f	movq	(%rdi), %rax
00000000000e4b52	callq	*0x18(%rax)
00000000000e4b55	movq	%rbx, %rdi
00000000000e4b58	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000e4b5d	movq	%rbx, %rdi
00000000000e4b60	addq	$0x8, %rsp
00000000000e4b64	popq	%rbx
00000000000e4b65	popq	%rbp
00000000000e4b66	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000e4b6b	movq	%rax, %rdi
00000000000e4b6e	callq	___clang_call_terminate
00000000000e4b73	nopw	%cs:(%rax,%rax)
