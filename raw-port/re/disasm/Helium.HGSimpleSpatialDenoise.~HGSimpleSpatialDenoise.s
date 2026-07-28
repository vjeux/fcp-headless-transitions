__ZN22HGSimpleSpatialDenoiseD0Ev:
00000000001c8310	pushq	%rbp
00000000001c8311	movq	%rsp, %rbp
00000000001c8314	pushq	%rbx
00000000001c8315	pushq	%rax
00000000001c8316	movq	%rdi, %rbx
00000000001c8319	leaq	0x861020(%rip), %rax
00000000001c8320	movq	%rax, (%rdi)
00000000001c8323	movq	0x1a8(%rdi), %rdi
00000000001c832a	testq	%rdi, %rdi
00000000001c832d	je	0x1c8335
00000000001c832f	movq	(%rdi), %rax
00000000001c8332	callq	*0x18(%rax)
00000000001c8335	movq	%rbx, %rdi
00000000001c8338	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001c833d	movq	%rbx, %rdi
00000000001c8340	addq	$0x8, %rsp
00000000001c8344	popq	%rbx
00000000001c8345	popq	%rbp
00000000001c8346	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c834b	movq	%rax, %rdi
00000000001c834e	callq	___clang_call_terminate
00000000001c8353	nopw	%cs:(%rax,%rax)
