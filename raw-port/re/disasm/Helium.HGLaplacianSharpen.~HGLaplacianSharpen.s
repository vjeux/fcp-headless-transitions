__ZN18HGLaplacianSharpenD0Ev:
0000000000194730	pushq	%rbp
0000000000194731	movq	%rsp, %rbp
0000000000194734	pushq	%rbx
0000000000194735	pushq	%rax
0000000000194736	movq	%rdi, %rbx
0000000000194739	leaq	0x88fba8(%rip), %rax
0000000000194740	movq	%rax, (%rdi)
0000000000194743	movq	0x1a0(%rdi), %rdi
000000000019474a	testq	%rdi, %rdi
000000000019474d	je	0x194755
000000000019474f	movq	(%rdi), %rax
0000000000194752	callq	*0x18(%rax)
0000000000194755	movq	%rbx, %rdi
0000000000194758	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000019475d	movq	%rbx, %rdi
0000000000194760	addq	$0x8, %rsp
0000000000194764	popq	%rbx
0000000000194765	popq	%rbp
0000000000194766	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000019476b	movq	%rax, %rdi
000000000019476e	callq	___clang_call_terminate
0000000000194773	nopw	%cs:(%rax,%rax)
