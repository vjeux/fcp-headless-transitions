__ZN20HGAVATemporalAverageD0Ev:
0000000000212e30	pushq	%rbp
0000000000212e31	movq	%rsp, %rbp
0000000000212e34	pushq	%rbx
0000000000212e35	pushq	%rax
0000000000212e36	movq	%rdi, %rbx
0000000000212e39	leaq	0x81caa8(%rip), %rax
0000000000212e40	movq	%rax, (%rdi)
0000000000212e43	movq	0x198(%rdi), %rdi
0000000000212e4a	testq	%rdi, %rdi
0000000000212e4d	je	0x212e55
0000000000212e4f	movq	(%rdi), %rax
0000000000212e52	callq	*0x18(%rax)
0000000000212e55	movq	%rbx, %rdi
0000000000212e58	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212e5d	movq	%rbx, %rdi
0000000000212e60	addq	$0x8, %rsp
0000000000212e64	popq	%rbx
0000000000212e65	popq	%rbp
0000000000212e66	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000212e6b	movq	%rax, %rdi
0000000000212e6e	callq	___clang_call_terminate
0000000000212e73	nopw	%cs:(%rax,%rax)
