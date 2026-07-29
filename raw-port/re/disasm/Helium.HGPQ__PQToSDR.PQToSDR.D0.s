__ZN4HGPQ7PQToSDRD0Ev:
00000000000ff0c0	pushq	%rbp
00000000000ff0c1	movq	%rsp, %rbp
00000000000ff0c4	pushq	%rbx
00000000000ff0c5	pushq	%rax
00000000000ff0c6	movq	%rdi, %rbx
00000000000ff0c9	leaq	0x9179b0(%rip), %rax
00000000000ff0d0	movq	%rax, (%rdi)
00000000000ff0d3	movq	0x198(%rdi), %rdi
00000000000ff0da	testq	%rdi, %rdi
00000000000ff0dd	je	0xff0e5
00000000000ff0df	movq	(%rdi), %rax
00000000000ff0e2	callq	*0x18(%rax)
00000000000ff0e5	movq	0x1c0(%rbx), %rdi
00000000000ff0ec	testq	%rdi, %rdi
00000000000ff0ef	je	0xff0f7
00000000000ff0f1	movq	(%rdi), %rax
00000000000ff0f4	callq	*0x18(%rax)
00000000000ff0f7	movq	0x1c8(%rbx), %rdi
00000000000ff0fe	testq	%rdi, %rdi
00000000000ff101	je	0xff109
00000000000ff103	movq	(%rdi), %rax
00000000000ff106	callq	*0x18(%rax)
00000000000ff109	movq	%rbx, %rdi
00000000000ff10c	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000ff111	movq	%rbx, %rdi
00000000000ff114	addq	$0x8, %rsp
00000000000ff118	popq	%rbx
00000000000ff119	popq	%rbp
00000000000ff11a	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ff11f	movq	%rax, %rdi
00000000000ff122	callq	___clang_call_terminate
00000000000ff127	nopw	(%rax,%rax)
