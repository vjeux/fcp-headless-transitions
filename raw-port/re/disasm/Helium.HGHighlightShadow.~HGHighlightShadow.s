__ZN17HGHighlightShadowD0Ev:
000000000014d2a0	pushq	%rbp
000000000014d2a1	movq	%rsp, %rbp
000000000014d2a4	pushq	%rbx
000000000014d2a5	pushq	%rax
000000000014d2a6	movq	%rdi, %rbx
000000000014d2a9	leaq	0x8d1d88(%rip), %rax
000000000014d2b0	movq	%rax, (%rdi)
000000000014d2b3	movq	0x198(%rdi), %rdi
000000000014d2ba	movq	(%rdi), %rax
000000000014d2bd	callq	*0x18(%rax)
000000000014d2c0	movq	0x1a0(%rbx), %rdi
000000000014d2c7	movq	(%rdi), %rax
000000000014d2ca	callq	*0x18(%rax)
000000000014d2cd	movq	0x1a8(%rbx), %rdi
000000000014d2d4	movq	(%rdi), %rax
000000000014d2d7	callq	*0x18(%rax)
000000000014d2da	movq	0x1b0(%rbx), %rdi
000000000014d2e1	movq	(%rdi), %rax
000000000014d2e4	callq	*0x18(%rax)
000000000014d2e7	movq	0x1b8(%rbx), %rdi
000000000014d2ee	movq	(%rdi), %rax
000000000014d2f1	callq	*0x18(%rax)
000000000014d2f4	movq	0x1c0(%rbx), %rdi
000000000014d2fb	movq	(%rdi), %rax
000000000014d2fe	callq	*0x18(%rax)
000000000014d301	movq	0x1c8(%rbx), %rdi
000000000014d308	movq	(%rdi), %rax
000000000014d30b	callq	*0x18(%rax)
000000000014d30e	movq	0x1d0(%rbx), %rdi
000000000014d315	movq	(%rdi), %rax
000000000014d318	callq	*0x18(%rax)
000000000014d31b	movq	%rbx, %rdi
000000000014d31e	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000014d323	movq	%rbx, %rdi
000000000014d326	addq	$0x8, %rsp
000000000014d32a	popq	%rbx
000000000014d32b	popq	%rbp
000000000014d32c	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000014d331	movq	%rax, %rdi
000000000014d334	callq	___clang_call_terminate
000000000014d339	nopl	(%rax)
