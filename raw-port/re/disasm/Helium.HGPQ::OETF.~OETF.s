__ZN4HGPQ4OETFD0Ev:
00000000000fe840	pushq	%rbp
00000000000fe841	movq	%rsp, %rbp
00000000000fe844	pushq	%rbx
00000000000fe845	pushq	%rax
00000000000fe846	movq	%rdi, %rbx
00000000000fe849	leaq	0x917db0(%rip), %rax
00000000000fe850	movq	%rax, (%rdi)
00000000000fe853	movq	0x198(%rdi), %rdi
00000000000fe85a	testq	%rdi, %rdi
00000000000fe85d	je	0xfe865
00000000000fe85f	movq	(%rdi), %rax
00000000000fe862	callq	*0x18(%rax)
00000000000fe865	movq	%rbx, %rdi
00000000000fe868	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe86d	movq	%rbx, %rdi
00000000000fe870	addq	$0x8, %rsp
00000000000fe874	popq	%rbx
00000000000fe875	popq	%rbp
00000000000fe876	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fe87b	movq	%rax, %rdi
00000000000fe87e	callq	___clang_call_terminate
00000000000fe883	nopw	%cs:(%rax,%rax)
