__ZN13HGGradeDeltaED0Ev:
00000000000da340	pushq	%rbp
00000000000da341	movq	%rsp, %rbp
00000000000da344	pushq	%rbx
00000000000da345	pushq	%rax
00000000000da346	movq	%rdi, %rbx
00000000000da349	leaq	0x9325c0(%rip), %rax
00000000000da350	movq	%rax, (%rdi)
00000000000da353	movq	0x1a0(%rdi), %rdi
00000000000da35a	testq	%rdi, %rdi
00000000000da35d	je	0xda365
00000000000da35f	movq	(%rdi), %rax
00000000000da362	callq	*0x18(%rax)
00000000000da365	movq	%rbx, %rdi
00000000000da368	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000da36d	movq	%rbx, %rdi
00000000000da370	addq	$0x8, %rsp
00000000000da374	popq	%rbx
00000000000da375	popq	%rbp
00000000000da376	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000da37b	movq	%rax, %rdi
00000000000da37e	callq	___clang_call_terminate
00000000000da383	nopw	%cs:(%rax,%rax)
