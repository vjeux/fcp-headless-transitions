__ZN13HGLensDistortD0Ev:
0000000000229e10	pushq	%rbp
0000000000229e11	movq	%rsp, %rbp
0000000000229e14	pushq	%rbx
0000000000229e15	pushq	%rax
0000000000229e16	movq	%rdi, %rbx
0000000000229e19	leaq	0x808e80(%rip), %rax
0000000000229e20	movq	%rax, (%rdi)
0000000000229e23	movq	0x198(%rdi), %rdi
0000000000229e2a	testq	%rdi, %rdi
0000000000229e2d	je	0x229e35
0000000000229e2f	movq	(%rdi), %rax
0000000000229e32	callq	*0x18(%rax)
0000000000229e35	movq	0x1a0(%rbx), %rdi
0000000000229e3c	testq	%rdi, %rdi
0000000000229e3f	je	0x229e47
0000000000229e41	movq	(%rdi), %rax
0000000000229e44	callq	*0x18(%rax)
0000000000229e47	movq	%rbx, %rdi
0000000000229e4a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000229e4f	movq	%rbx, %rdi
0000000000229e52	addq	$0x8, %rsp
0000000000229e56	popq	%rbx
0000000000229e57	popq	%rbp
0000000000229e58	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000229e5d	movq	%rax, %rdi
0000000000229e60	callq	___clang_call_terminate
0000000000229e65	nopw	%cs:(%rax,%rax)
