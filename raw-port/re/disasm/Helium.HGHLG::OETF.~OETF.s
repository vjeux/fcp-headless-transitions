__ZN5HGHLG4OETFD0Ev:
00000000000ffc20	pushq	%rbp
00000000000ffc21	movq	%rsp, %rbp
00000000000ffc24	pushq	%rbx
00000000000ffc25	pushq	%rax
00000000000ffc26	movq	%rdi, %rbx
00000000000ffc29	leaq	0x9172d0(%rip), %rax
00000000000ffc30	movq	%rax, (%rdi)
00000000000ffc33	movq	0x198(%rdi), %rdi
00000000000ffc3a	testq	%rdi, %rdi
00000000000ffc3d	je	0xffc45
00000000000ffc3f	movq	(%rdi), %rax
00000000000ffc42	callq	*0x18(%rax)
00000000000ffc45	movq	%rbx, %rdi
00000000000ffc48	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000ffc4d	movq	%rbx, %rdi
00000000000ffc50	addq	$0x8, %rsp
00000000000ffc54	popq	%rbx
00000000000ffc55	popq	%rbp
00000000000ffc56	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000ffc5b	movq	%rax, %rdi
00000000000ffc5e	callq	___clang_call_terminate
00000000000ffc63	nopw	%cs:(%rax,%rax)
