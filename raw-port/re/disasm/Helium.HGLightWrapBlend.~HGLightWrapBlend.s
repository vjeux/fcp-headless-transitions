__ZN16HGLightWrapBlendD0Ev:
00000000001af990	pushq	%rbp
00000000001af991	movq	%rsp, %rbp
00000000001af994	pushq	%rbx
00000000001af995	pushq	%rax
00000000001af996	movq	%rdi, %rbx
00000000001af999	leaq	0x876e48(%rip), %rax
00000000001af9a0	movq	%rax, (%rdi)
00000000001af9a3	movq	0x1c0(%rdi), %rdi
00000000001af9aa	testq	%rdi, %rdi
00000000001af9ad	je	0x1af9b5
00000000001af9af	movq	(%rdi), %rax
00000000001af9b2	callq	*0x18(%rax)
00000000001af9b5	movq	0x1b8(%rbx), %rdi
00000000001af9bc	testq	%rdi, %rdi
00000000001af9bf	je	0x1af9c7
00000000001af9c1	movq	(%rdi), %rax
00000000001af9c4	callq	*0x18(%rax)
00000000001af9c7	movq	%rbx, %rdi
00000000001af9ca	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001af9cf	movq	%rbx, %rdi
00000000001af9d2	addq	$0x8, %rsp
00000000001af9d6	popq	%rbx
00000000001af9d7	popq	%rbp
00000000001af9d8	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001af9dd	movq	%rax, %rdi
00000000001af9e0	callq	___clang_call_terminate
00000000001af9e5	movq	%rax, %rdi
00000000001af9e8	callq	___clang_call_terminate
00000000001af9ed	nopl	(%rax)
