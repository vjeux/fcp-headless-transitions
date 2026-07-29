__ZN4HGPQ4EOTFD0Ev:
00000000000fdcc0	pushq	%rbp
00000000000fdcc1	movq	%rsp, %rbp
00000000000fdcc4	pushq	%rbx
00000000000fdcc5	pushq	%rax
00000000000fdcc6	movq	%rdi, %rbx
00000000000fdcc9	leaq	0x918030(%rip), %rax
00000000000fdcd0	movq	%rax, (%rdi)
00000000000fdcd3	movq	0x198(%rdi), %rdi
00000000000fdcda	testq	%rdi, %rdi
00000000000fdcdd	je	0xfdce5
00000000000fdcdf	movq	(%rdi), %rax
00000000000fdce2	callq	*0x18(%rax)
00000000000fdce5	movq	%rbx, %rdi
00000000000fdce8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdced	movq	%rbx, %rdi
00000000000fdcf0	addq	$0x8, %rsp
00000000000fdcf4	popq	%rbx
00000000000fdcf5	popq	%rbp
00000000000fdcf6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fdcfb	movq	%rax, %rdi
00000000000fdcfe	callq	___clang_call_terminate
00000000000fdd03	nopw	%cs:(%rax,%rax)
