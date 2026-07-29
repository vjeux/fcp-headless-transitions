__ZN13HGLegacyBlendD0Ev:
0000000000241910	pushq	%rbp
0000000000241911	movq	%rsp, %rbp
0000000000241914	pushq	%rbx
0000000000241915	pushq	%rax
0000000000241916	movq	%rdi, %rbx
0000000000241919	leaq	0x7f49c0(%rip), %rax
0000000000241920	movq	%rax, (%rdi)
0000000000241923	movq	0x1b8(%rdi), %rax
000000000024192a	testq	%rax, %rax
000000000024192d	je	0x24193d
000000000024192f	movq	-0x8(%rax), %rdi
0000000000241933	testq	%rdi, %rdi
0000000000241936	je	0x24193d
0000000000241938	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000024193d	movq	0x198(%rbx), %rdi
0000000000241944	testq	%rdi, %rdi
0000000000241947	je	0x24194f
0000000000241949	movq	(%rdi), %rax
000000000024194c	callq	*0x18(%rax)
000000000024194f	movq	%rbx, %rdi
0000000000241952	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000241957	movq	%rbx, %rdi
000000000024195a	addq	$0x8, %rsp
000000000024195e	popq	%rbx
000000000024195f	popq	%rbp
0000000000241960	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000241965	movq	%rax, %rdi
0000000000241968	callq	___clang_call_terminate
000000000024196d	nopl	(%rax)
