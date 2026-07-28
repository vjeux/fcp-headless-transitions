__ZN10HGRGB_EETFD0Ev:
0000000000105a10	pushq	%rbp
0000000000105a11	movq	%rsp, %rbp
0000000000105a14	pushq	%rbx
0000000000105a15	pushq	%rax
0000000000105a16	movq	%rdi, %rbx
0000000000105a19	leaq	0x914d20(%rip), %rax
0000000000105a20	movq	%rax, (%rdi)
0000000000105a23	movq	0x198(%rdi), %rdi
0000000000105a2a	testq	%rdi, %rdi
0000000000105a2d	je	0x105a35
0000000000105a2f	movq	(%rdi), %rax
0000000000105a32	callq	*0x18(%rax)
0000000000105a35	movq	0x1a0(%rbx), %rdi
0000000000105a3c	testq	%rdi, %rdi
0000000000105a3f	je	0x105a47
0000000000105a41	movq	(%rdi), %rax
0000000000105a44	callq	*0x18(%rax)
0000000000105a47	movq	0x1a8(%rbx), %rdi
0000000000105a4e	testq	%rdi, %rdi
0000000000105a51	je	0x105a59
0000000000105a53	movq	(%rdi), %rax
0000000000105a56	callq	*0x18(%rax)
0000000000105a59	movq	%rbx, %rdi
0000000000105a5c	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000105a61	movq	%rbx, %rdi
0000000000105a64	addq	$0x8, %rsp
0000000000105a68	popq	%rbx
0000000000105a69	popq	%rbp
0000000000105a6a	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000105a6f	movq	%rax, %rdi
0000000000105a72	callq	___clang_call_terminate
0000000000105a77	nopw	(%rax,%rax)
