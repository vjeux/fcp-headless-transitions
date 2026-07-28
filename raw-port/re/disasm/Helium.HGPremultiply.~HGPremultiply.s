__ZN13HGPremultiplyD0Ev:
0000000000157bf0	pushq	%rbp
0000000000157bf1	movq	%rsp, %rbp
0000000000157bf4	pushq	%rbx
0000000000157bf5	pushq	%rax
0000000000157bf6	movq	%rdi, %rbx
0000000000157bf9	leaq	0x8c8588(%rip), %rax
0000000000157c00	movq	%rax, (%rdi)
0000000000157c03	movq	0x198(%rdi), %rdi
0000000000157c0a	movq	(%rdi), %rax
0000000000157c0d	callq	*0x18(%rax)
0000000000157c10	movq	%rbx, %rdi
0000000000157c13	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157c18	movq	%rbx, %rdi
0000000000157c1b	addq	$0x8, %rsp
0000000000157c1f	popq	%rbx
0000000000157c20	popq	%rbp
0000000000157c21	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000157c26	movq	%rax, %rdi
0000000000157c29	callq	___clang_call_terminate
0000000000157c2e	nop
