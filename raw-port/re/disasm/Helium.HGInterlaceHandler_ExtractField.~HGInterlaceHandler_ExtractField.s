__ZN31HGInterlaceHandler_ExtractFieldD0Ev:
0000000000092f50	pushq	%rbp
0000000000092f51	movq	%rsp, %rbp
0000000000092f54	pushq	%rbx
0000000000092f55	pushq	%rax
0000000000092f56	movq	%rdi, %rbx
0000000000092f59	leaq	0x977af8(%rip), %rax
0000000000092f60	movq	%rax, (%rdi)
0000000000092f63	movq	0x198(%rdi), %rdi
0000000000092f6a	movq	(%rdi), %rax
0000000000092f6d	callq	*0x18(%rax)
0000000000092f70	movq	%rbx, %rdi
0000000000092f73	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000092f78	movq	%rbx, %rdi
0000000000092f7b	addq	$0x8, %rsp
0000000000092f7f	popq	%rbx
0000000000092f80	popq	%rbp
0000000000092f81	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000092f86	movq	%rax, %rdi
0000000000092f89	callq	___clang_call_terminate
0000000000092f8e	nop
