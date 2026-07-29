__ZN4HGPQ11InverseEOTFD0Ev:
00000000000fdfe0	pushq	%rbp
00000000000fdfe1	movq	%rsp, %rbp
00000000000fdfe4	pushq	%rbx
00000000000fdfe5	pushq	%rax
00000000000fdfe6	movq	%rdi, %rbx
00000000000fdfe9	leaq	0x917f50(%rip), %rax
00000000000fdff0	movq	%rax, (%rdi)
00000000000fdff3	movq	0x198(%rdi), %rdi
00000000000fdffa	testq	%rdi, %rdi
00000000000fdffd	je	0xfe005
00000000000fdfff	movq	(%rdi), %rax
00000000000fe002	callq	*0x18(%rax)
00000000000fe005	movq	%rbx, %rdi
00000000000fe008	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe00d	movq	%rbx, %rdi
00000000000fe010	addq	$0x8, %rsp
00000000000fe014	popq	%rbx
00000000000fe015	popq	%rbp
00000000000fe016	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fe01b	movq	%rax, %rdi
00000000000fe01e	callq	___clang_call_terminate
00000000000fe023	nopw	%cs:(%rax,%rax)
