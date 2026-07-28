__ZN19HGAVAMotionDilationD0Ev:
0000000000216a00	pushq	%rbp
0000000000216a01	movq	%rsp, %rbp
0000000000216a04	pushq	%rbx
0000000000216a05	pushq	%rax
0000000000216a06	movq	%rdi, %rbx
0000000000216a09	leaq	0x819a18(%rip), %rax
0000000000216a10	movq	%rax, (%rdi)
0000000000216a13	movq	0x198(%rdi), %rdi
0000000000216a1a	testq	%rdi, %rdi
0000000000216a1d	je	0x216a25
0000000000216a1f	movq	(%rdi), %rax
0000000000216a22	callq	*0x18(%rax)
0000000000216a25	movq	%rbx, %rdi
0000000000216a28	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216a2d	movq	%rbx, %rdi
0000000000216a30	addq	$0x8, %rsp
0000000000216a34	popq	%rbx
0000000000216a35	popq	%rbp
0000000000216a36	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000216a3b	movq	%rax, %rdi
0000000000216a3e	callq	___clang_call_terminate
0000000000216a43	nopw	%cs:(%rax,%rax)
