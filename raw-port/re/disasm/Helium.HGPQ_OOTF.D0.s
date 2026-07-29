__ZN4HGPQ4OOTFD0Ev:
00000000000fe2c0	pushq	%rbp
00000000000fe2c1	movq	%rsp, %rbp
00000000000fe2c4	pushq	%rbx
00000000000fe2c5	pushq	%rax
00000000000fe2c6	movq	%rdi, %rbx
00000000000fe2c9	leaq	0x917eb0(%rip), %rax
00000000000fe2d0	movq	%rax, (%rdi)
00000000000fe2d3	movq	0x198(%rdi), %rdi
00000000000fe2da	testq	%rdi, %rdi
00000000000fe2dd	je	0xfe2e5
00000000000fe2df	movq	(%rdi), %rax
00000000000fe2e2	callq	*0x18(%rax)
00000000000fe2e5	movq	%rbx, %rdi
00000000000fe2e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe2ed	movq	%rbx, %rdi
00000000000fe2f0	addq	$0x8, %rsp
00000000000fe2f4	popq	%rbx
00000000000fe2f5	popq	%rbp
00000000000fe2f6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fe2fb	movq	%rax, %rdi
00000000000fe2fe	callq	___clang_call_terminate
00000000000fe303	nopw	%cs:(%rax,%rax)
