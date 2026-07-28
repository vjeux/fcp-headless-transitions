__ZN15HGDeinterlaceLAD0Ev:
000000000003e840	pushq	%rbp
000000000003e841	movq	%rsp, %rbp
000000000003e844	pushq	%rbx
000000000003e845	pushq	%rax
000000000003e846	movq	%rdi, %rbx
000000000003e849	leaq	0x9c7da8(%rip), %rax
000000000003e850	movq	%rax, (%rdi)
000000000003e853	movq	0x1a8(%rdi), %rdi
000000000003e85a	movq	(%rdi), %rax
000000000003e85d	callq	*0x18(%rax)
000000000003e860	movq	%rbx, %rdi
000000000003e863	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000003e868	movq	%rbx, %rdi
000000000003e86b	addq	$0x8, %rsp
000000000003e86f	popq	%rbx
000000000003e870	popq	%rbp
000000000003e871	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000003e876	movq	%rax, %rdi
000000000003e879	callq	___clang_call_terminate
000000000003e87e	nop
